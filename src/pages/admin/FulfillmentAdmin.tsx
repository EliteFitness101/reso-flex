import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Card, Skeleton } from "@/admin/ui";
import { usePermissions } from "@/admin/usePermissions";
import { formatMinor } from "@/core/commerce/currency.service";

type Order = {
  id: string;
  reference: string;
  customer_name: string | null;
  customer_phone: string | null;
  amount: number;
  currency: string;
  status: string;
  fulfillment_status: string;
  created_at: string;
};

const STAGES = ["processing", "packed", "dispatched", "delivered"] as const;

export default function FulfillmentAdmin() {
  const { can, loading: permLoading } = usePermissions();
  const [rows, setRows] = useState<Order[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("orders")
      .select("id, reference, customer_name, customer_phone, amount, currency, status, fulfillment_status, created_at")
      .eq("status", "paid")
      .neq("fulfillment_status", "delivered")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setErr(error.message);
    setRows((data ?? []) as Order[]);
  }

  useEffect(() => { load(); }, []);

  async function advance(o: Order) {
    const idx = STAGES.indexOf(o.fulfillment_status as (typeof STAGES)[number]);
    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)] ?? "packed";
    setBusy(o.id);
    const { error } = await supabase.from("orders").update({ fulfillment_status: next }).eq("id", o.id);
    if (error) setErr(error.message);
    else await load();
    setBusy(null);
  }

  const editable = !permLoading && can("fulfillment.manage");
  const queue = rows ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl text-foreground">Fulfillment</h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">Paid orders awaiting delivery</p>
      </div>

      {err && <div className="border border-red-400/40 p-3 text-xs text-red-400">{err}</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STAGES.map((s) => (
          <Card key={s} label={s} value={queue.filter((o) => o.fulfillment_status === s).length} />
        ))}
      </div>

      {!rows ? (
        <Skeleton className="h-48 w-full" />
      ) : queue.length === 0 ? (
        <div className="border border-border/40 bg-noir-900/60 p-6 text-xs text-foreground/60">Queue is clear.</div>
      ) : (
        <div className="overflow-x-auto border border-border/40">
          <table className="w-full text-xs">
            <thead className="bg-noir-900/80 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              <tr>
                <th className="px-3 py-2 text-left">Reference</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-left">Stage</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((o) => (
                <tr key={o.id} className="border-t border-border/20">
                  <td className="px-3 py-2 text-foreground">{o.reference}</td>
                  <td className="px-3 py-2 text-foreground/70">
                    {o.customer_name ?? "—"}
                    <div className="text-foreground/40">{o.customer_phone ?? ""}</div>
                  </td>
                  <td className="px-3 py-2 text-right text-foreground/80">{formatMinor(o.amount, o.currency)}</td>
                  <td className="px-3 py-2"><Badge tone={o.fulfillment_status === "dispatched" ? "green" : "default"}>{o.fulfillment_status}</Badge></td>
                  <td className="px-3 py-2 text-right">
                    <button
                      disabled={!editable || busy === o.id}
                      onClick={() => advance(o)}
                      className="border border-gold/50 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gold hover:bg-gold/10 disabled:opacity-30"
                    >
                      Advance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!editable && !permLoading && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">Read-only — requires fulfillment.manage</p>
      )}
    </div>
  );
}
