import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Card, Skeleton } from "@/admin/ui";
import {
  CATALOG_IMPORT_FILES,
  importCatalogCsv,
  type CatalogEntity,
  type ImportResult,
} from "@/lib/catalog-import";
import { COLLECTION_CODES, COLLECTION_LABELS } from "@/core/commerce/catalog.engine";

type Row = {
  sku: string;
  name: string;
  category: string | null;
  price_ngn: number;
  status: string;
  digital_product: boolean;
  recommendation_priority: number;
};

export default function CatalogAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState<CatalogEntity>("products");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState<any[]>([]);

  const load = async () => {
    const [{ data }, { data: a }] = await Promise.all([
      supabase
        .from("products")
        .select("sku, name, category, price_ngn, status, digital_product, recommendation_priority")
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("catalog_sync_audit")
        .select("entity, action, rows_processed, rows_failed, result, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    setRows((data ?? []) as Row[]);
    setAudit(a ?? []);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () =>
      (rows ?? []).filter((r) =>
        [r.sku, r.name, r.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, q],
  );

  const onFile = async (file: File) => {
    setBusy(true);
    setResult(null);
    try {
      const res = await importCatalogCsv(entity, await file.text(), { source: file.name });
      setResult(res);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl uppercase tracking-[0.25em] text-gold">Catalog Management</h1>
        <p className="mt-1 text-xs text-foreground/50">SKU-based upsert. Duplicates are rejected, every import is audited.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Products" value={rows?.length ?? "—"} />
        <Card label="Published" value={rows ? rows.filter((r) => r.status === "published").length : "—"} />
        <Card label="Collections" value={COLLECTION_CODES.length} />
      </div>

      {/* CSV IMPORT */}
      <section className="border border-border/40 bg-noir-900/60 p-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">CSV Import</div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value as CatalogEntity)}
            className="border border-border/50 bg-noir-950 px-3 py-2 text-xs text-foreground"
          >
            {CATALOG_IMPORT_FILES.map((f) => (
              <option key={f.entity} value={f.entity}>{f.file}</option>
            ))}
          </select>
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            className="text-xs text-foreground/70 file:mr-3 file:border file:border-gold/50 file:bg-transparent file:px-3 file:py-1.5 file:text-[11px] file:uppercase file:tracking-wider file:text-gold"
          />
          {busy && <span className="text-[11px] text-foreground/50">Importing…</span>}
        </div>

        {result && (
          <div className="mt-3 space-y-1 border border-border/40 bg-noir-950/60 p-3 text-[11px]">
            <div className="flex gap-2">
              <Badge tone={result.failed ? "red" : "green"}>{result.rolledBack ? "rolled back" : result.failed ? "rejected" : "ok"}</Badge>
              <span className="text-foreground/70">{result.processed} imported · {result.failed} failed</span>
            </div>
            {result.errors.map((e, i) => (
              <div key={i} className="text-red-400/80">{e}</div>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCTS */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search SKU, name, category…"
            className="w-full max-w-sm border border-border/50 bg-noir-950 px-3 py-2 text-xs text-foreground placeholder:text-foreground/40"
          />
        </div>
        {!rows ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="overflow-x-auto border border-border/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-noir-900/80 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                <tr>
                  <th className="p-3">SKU</th><th className="p-3">Name</th><th className="p-3">Category</th>
                  <th className="p-3">Price</th><th className="p-3">Type</th><th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.sku} className="border-t border-border/20">
                    <td className="p-3 font-mono text-gold">{r.sku}</td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3 text-foreground/60">{r.category ?? "—"}</td>
                    <td className="p-3">₦{r.price_ngn.toLocaleString("en-NG")}</td>
                    <td className="p-3 text-foreground/60">{r.digital_product ? "digital" : "physical"}</td>
                    <td className="p-3"><Badge tone={r.status === "published" ? "green" : "amber"}>{r.status}</Badge></td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} className="p-6 text-center text-foreground/40">No products yet — import 02_products_master.csv.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* COLLECTIONS */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Collections</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {COLLECTION_CODES.map((c) => (
            <span key={c} className="border border-gold/30 px-2.5 py-1 text-[11px] text-foreground/80">
              {COLLECTION_LABELS[c]}
            </span>
          ))}
        </div>
      </section>

      {/* AUDIT */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Recent imports</div>
        <div className="mt-3 space-y-1 text-[11px] text-foreground/60">
          {audit.map((a, i) => (
            <div key={i}>
              {new Date(a.created_at).toLocaleString()} · {a.entity} · {a.rows_processed} ok / {a.rows_failed} failed · {a.result}
            </div>
          ))}
          {!audit.length && <div className="text-foreground/40">No imports recorded.</div>}
        </div>
      </section>
    </div>
  );
}
