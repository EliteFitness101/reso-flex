import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/admin/ui";
import { exportCsv, exportXlsx, ngn } from "@/admin/exports";
import { RESELLERS_COLUMNS } from "@/admin/exportColumns";


type Row = {
  id: string; lead_name: string | null; lead_email: string | null; lead_phone: string | null;
  campaign: string | null; recruiter_id: string | null; funnel_stage: string;
  conversion_status: string; commission_status: string; revenue_generated: number; created_at: string;
};

export default function ResellersAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    supabase.from("reseller_leads").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setRows((data as any) || []));
  }, []);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Reseller Leads</h1>
        <button onClick={() => exportCsv("resellers", rows as any)} className="border border-border/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] hover:border-gold">CSV</button>
      </header>
      <div className="border border-border/40 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-noir-900/80 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            <tr>
              <th className="text-left px-3 py-2">Lead</th><th className="text-left px-3 py-2">Campaign</th>
              <th className="text-left px-3 py-2">Stage</th><th className="text-left px-3 py-2">Conversion</th>
              <th className="text-left px-3 py-2">Commission</th><th className="text-right px-3 py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-border/20">
                <td className="px-3 py-2">{r.lead_name || r.lead_email || r.lead_phone || "—"}</td>
                <td className="px-3 py-2">{r.campaign || "—"}</td>
                <td className="px-3 py-2"><Badge>{r.funnel_stage}</Badge></td>
                <td className="px-3 py-2">{r.conversion_status}</td>
                <td className="px-3 py-2">{r.commission_status}</td>
                <td className="px-3 py-2 text-right">{ngn(r.revenue_generated)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-xs text-foreground/50">No leads yet</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
