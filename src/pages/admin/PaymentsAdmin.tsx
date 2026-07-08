import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/admin/ui";
import { exportCsv, ngn } from "@/admin/exports";

type Row = {
  id: string; order_id: string; paystack_reference: string; paystack_event_id: string | null;
  amount: number; currency: string; status: string; created_at: string;
};

export default function PaymentsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    let query = supabase.from("payments").select("id, order_id, paystack_reference, paystack_event_id, amount, currency, status, created_at")
      .order("created_at", { ascending: false }).limit(200);
    if (q) query = query.ilike("paystack_reference", `%${q}%`);
    query.then(({ data }) => setRows((data as any) || []));
  }, [q]);

  // detect duplicates by reference
  const seen: Record<string, number> = {};
  rows.forEach(r => { seen[r.paystack_reference] = (seen[r.paystack_reference] || 0) + 1; });

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl">Payments</h1>
        <div className="flex gap-2">
          <button onClick={() => exportCsv("payments", rows as any)} className="border border-border/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] hover:border-gold">CSV</button>
          <button onClick={() => exportXlsx("payments", rows, { columns: PAYMENTS_COLUMNS, sheetName: "Payments", title: "ResoFlex Payments" })} className="border border-border/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] hover:border-gold">Excel</button>
        </div>

      </header>
      <input placeholder="Search reference" value={q} onChange={e => setQ(e.target.value)}
        className="bg-noir-900 border border-border/40 px-3 py-1 text-sm w-full max-w-md" />
      <div className="border border-border/40 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-noir-900/80 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            <tr>
              <th className="text-left px-3 py-2">Reference</th><th className="text-left px-3 py-2">Event ID</th>
              <th className="text-left px-3 py-2">Status</th><th className="text-right px-3 py-2">Amount</th>
              <th className="text-left px-3 py-2">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-border/20">
                <td className="px-3 py-2 font-mono text-xs">{r.paystack_reference}{seen[r.paystack_reference] > 1 && <span className="ml-2"><Badge tone="amber">dup</Badge></span>}</td>
                <td className="px-3 py-2 font-mono text-[10px]">{r.paystack_event_id || "—"}</td>
                <td className="px-3 py-2"><Badge tone={r.status === "success" ? "green" : "red"}>{r.status}</Badge></td>
                <td className="px-3 py-2 text-right">{ngn(r.amount)}</td>
                <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-xs text-foreground/50">No payments</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
