import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Skeleton } from "@/admin/ui";
import { usePermissions } from "@/admin/usePermissions";
import { formatMinor } from "@/core/commerce/currency.service";

type Variant = {
  id: string;
  product_sku: string;
  variant_sku: string;
  title: string;
  price: number;
  currency: string;
  inventory_qty: number;
  is_active: boolean;
};

type LedgerRow = {
  id: string;
  variant_sku: string;
  change_qty: number;
  reason: string;
  created_at: string;
};

export default function InventoryAdmin() {
  const { can, loading: permLoading } = usePermissions();
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const [v, l] = await Promise.all([
      supabase
        .from("product_variants")
        .select("id, product_sku, variant_sku, title, price, currency, inventory_qty, is_active")
        .order("product_sku"),
      supabase
        .from("inventory_ledger")
        .select("id, variant_sku, change_qty, reason, created_at")
        .order("created_at", { ascending: false })
        .limit(25),
    ]);
    if (v.error) setErr(v.error.message);
    setVariants((v.data ?? []) as Variant[]);
    setLedger((l.data ?? []) as LedgerRow[]);
  }

  useEffect(() => { load(); }, []);

  async function adjust(variantSku: string, delta: number) {
    setBusy(variantSku);
    const { error } = await supabase.from("inventory_ledger").insert({
      variant_sku: variantSku,
      change_qty: delta,
      reason: delta > 0 ? "restock" : "manual_adjustment",
    });
    if (error) setErr(error.message);
    else {
      const current = variants?.find((v) => v.variant_sku === variantSku);
      if (current) {
        await supabase
          .from("product_variants")
          .update({ inventory_qty: Math.max(0, current.inventory_qty + delta) })
          .eq("id", current.id);
      }
      await load();
    }
    setBusy(null);
  }

  const lowStock = useMemo(
    () => (variants ?? []).filter((v) => v.is_active && v.inventory_qty <= 3).length,
    [variants],
  );

  const editable = !permLoading && can("inventory.manage");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl text-foreground">Inventory</h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">
            Variant stock · ledger movements
          </p>
        </div>
        {lowStock > 0 && <Badge tone="amber">{lowStock} low stock</Badge>}
      </div>

      {err && <div className="border border-red-400/40 p-3 text-xs text-red-400">{err}</div>}

      {!variants ? (
        <Skeleton className="h-48 w-full" />
      ) : variants.length === 0 ? (
        <div className="border border-border/40 bg-noir-900/60 p-6 text-xs text-foreground/60">
          No variants defined yet. Add variants to track stock per SKU.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/40">
          <table className="w-full text-xs">
            <thead className="bg-noir-900/80 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              <tr>
                <th className="px-3 py-2 text-left">Variant</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Stock</th>
                <th className="px-3 py-2 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-t border-border/20">
                  <td className="px-3 py-2 text-foreground">{v.title}<div className="text-foreground/40">{v.variant_sku}</div></td>
                  <td className="px-3 py-2 text-foreground/70">{v.product_sku}</td>
                  <td className="px-3 py-2 text-right text-foreground/80">{formatMinor(v.price, v.currency)}</td>
                  <td className="px-3 py-2 text-right">
                    {v.inventory_qty <= 3 ? <Badge tone="amber">{v.inventory_qty}</Badge> : v.inventory_qty}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        disabled={!editable || busy === v.variant_sku}
                        onClick={() => adjust(v.variant_sku, -1)}
                        className="border border-border/40 px-2 py-0.5 hover:border-red-400/60 disabled:opacity-30"
                      >−</button>
                      <button
                        disabled={!editable || busy === v.variant_sku}
                        onClick={() => adjust(v.variant_sku, 1)}
                        className="border border-border/40 px-2 py-0.5 hover:border-gold/60 disabled:opacity-30"
                      >+</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!editable && !permLoading && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
          Read-only — requires inventory.manage
        </p>
      )}

      <div>
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-foreground/50">Recent movements</h2>
        {ledger.length === 0 ? (
          <div className="border border-border/40 bg-noir-900/60 p-4 text-xs text-foreground/50">No movements recorded.</div>
        ) : (
          <div className="divide-y divide-border/20 border border-border/40">
            {ledger.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-3 py-2 text-xs">
                <span className="text-foreground/80">{l.variant_sku}</span>
                <span className="text-foreground/50">{l.reason}</span>
                <span className={l.change_qty < 0 ? "text-red-400" : "text-emerald-400"}>
                  {l.change_qty > 0 ? "+" : ""}{l.change_qty}
                </span>
                <span className="text-foreground/40">{new Date(l.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
