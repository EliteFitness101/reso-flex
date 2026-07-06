import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/admin/ui";
import { exportCsv, exportXlsx, ngn } from "@/admin/exports";

type Row = {
  id: string; reference: string; status: string; fulfillment_status: string;
  amount: number; currency: string; customer_email: string | null;
  customer_name: string | null; paid_at: string | null; created_at: string;
  attribution: any; items: any;
};

export default function OrdersAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const pageSize = 25;

  async function load() {
    let query = supabase.from("orders").select(
      "id, reference, status, fulfillment_status, amount, currency, customer_email, customer_name, paid_at, created_at, attribution, items",
      { count: "exact" },
    ).order("created_at", { ascending: false }).range(page * pageSize, page * pageSize + pageSize - 1);
    if (status !== "all") query = query.eq("status", status);
    if (q) query = query.or(`reference.ilike.%${q}%,customer_email.ilike.%${q}%,customer_name.ilike.%${q}%`);
    const { data, count } = await query;
    setRows((data as any) || []); setTotal(count || 0);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, status, q]);

  const tone = (s: string): any =>
    s === "paid" ? "green" : s === "pending" ? "amber" : s === "failed" || s === "cancelled" ? "red" : "default";

  async function retry(ref: string) {
    setBusy(true);
    const { data: sess } = await supabase.auth.getSession();
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/retry-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        Authorization: `Bearer ${sess.session?.access_token}`,
      },
      body: JSON.stringify({ reference: ref }),
    });
    setBusy(false); load();
  }

  const csvRows = useMemo(() => rows.map(r => ({
    reference: r.reference, status: r.status, amount_ngn: (r.amount || 0) / 100,
    currency: r.currency, customer_email: r.customer_email, customer_name: r.customer_name,
    paid_at: r.paid_at, created_at: r.created_at,
    campaign: r.attribution?.utm_campaign ?? r.attribution?.campaign ?? "",
  })), [rows]);

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl">Orders</h1>
        <div className="flex gap-2">
          <button onClick={() => exportCsv("orders", csvRows)} className="border border-border/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] hover:border-gold">CSV</button>
          <button onClick={() => exportXlsx("orders", csvRows)} className="border border-border/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] hover:border-gold">Excel</button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <input placeholder="Search ref / email / name" value={q} onChange={e => { setPage(0); setQ(e.target.value); }}
          className="bg-noir-900 border border-border/40 px-3 py-1 text-sm flex-1 min-w-[200px]" />
        <select value={status} onChange={e => { setPage(0); setStatus(e.target.value); }} className="bg-noir-900 border border-border/40 px-2 py-1 text-sm">
          <option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option>
          <option value="failed">Failed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="border border-border/40 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-noir-900/80 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            <tr>
              <th className="text-left px-3 py-2">Reference</th><th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Amount</th><th className="text-left px-3 py-2">Customer</th>
              <th className="text-left px-3 py-2">Created</th><th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-border/20 hover:bg-noir-900/40">
                <td className="px-3 py-2 font-mono text-xs">{r.reference}</td>
                <td className="px-3 py-2"><Badge tone={tone(r.status)}>{r.status}</Badge></td>
                <td className="px-3 py-2 text-right">{ngn(r.amount)}</td>
                <td className="px-3 py-2">{r.customer_email || r.customer_name || "—"}</td>
                <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button onClick={() => setSelected(r)} className="text-[10px] uppercase tracking-[0.2em] text-gold hover:underline">View</button>
                  {r.status !== "paid" && (
                    <button disabled={busy} onClick={() => retry(r.reference)} className="text-[10px] uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground disabled:opacity-40">Retry</button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-xs text-foreground/50">No orders</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-foreground/60">
        <span>{total} total</span>
        <div className="flex gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="border border-border/40 px-2 py-1 disabled:opacity-40">Prev</button>
          <button disabled={(page + 1) * pageSize >= total} onClick={() => setPage(p => p + 1)} className="border border-border/40 px-2 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setSelected(null)}>
          <div className="max-w-lg w-full bg-noir-900 border border-gold/40 p-6 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-display text-lg">Order {selected.reference}</div>
              <button onClick={() => setSelected(null)} className="text-foreground/50">✕</button>
            </div>
            <div className="text-xs space-y-1">
              <div><Badge tone={tone(selected.status)}>{selected.status}</Badge> · {selected.fulfillment_status}</div>
              <div>Amount: {ngn(selected.amount)}</div>
              <div>Customer: {selected.customer_email || "—"}</div>
              <div>Campaign: {selected.attribution?.utm_campaign || selected.attribution?.campaign || "—"}</div>
              <div>RSID: <span className="font-mono">{selected.attribution?.rsid || "—"}</span></div>
              <div>Paid at: {selected.paid_at ? new Date(selected.paid_at).toLocaleString() : "—"}</div>
              <div>Created: {new Date(selected.created_at).toLocaleString()}</div>
              <pre className="mt-2 max-h-40 overflow-auto bg-noir-950 border border-border/30 p-2 text-[10px]">{JSON.stringify(selected.items, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
