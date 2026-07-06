import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRange, RangeSelector } from "@/admin/useRange";
import { Card, Skeleton } from "@/admin/ui";
import { ngn } from "@/admin/exports";

type Metrics = {
  revenue_kobo: number;
  paid_orders: number;
  pending_orders: number;
  failed_orders: number;
  aov_kobo: number;
  whatsapp_clicks: number;
  assessment_starts: number;
  checkout_starts: number;
  conversion_rate: number;
  revenue_by_campaign: Record<string, { revenue: number; orders: number }>;
  top_campaign: string | null;
  top_product: string | null;
};

export default function RevenueDashboard() {
  const r = useRange("30d");
  const [m, setM] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setErr(null);
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      try {
        const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-metrics`);
        url.searchParams.set("from", r.from); url.searchParams.set("to", r.to);
        const res = await fetch(url.toString(), {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`http_${res.status}`);
        const j = await res.json();
        if (!cancelled) setM(j);
      } catch (e: any) { if (!cancelled) setErr(e?.message || "error"); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [r.from, r.to]);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Revenue OS</h1>
        <RangeSelector {...r} />
      </header>

      {err && <div className="text-xs text-red-400">Error: {err}</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {loading || !m ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <Card label="Revenue" value={ngn(m.revenue_kobo)} />
            <Card label="Paid Orders" value={m.paid_orders} />
            <Card label="Pending" value={m.pending_orders} />
            <Card label="Failed" value={m.failed_orders} />
            <Card label="AOV" value={ngn(m.aov_kobo)} />
            <Card label="WhatsApp Clicks" value={m.whatsapp_clicks} />
            <Card label="Assessment Starts" value={m.assessment_starts} />
            <Card label="Checkout Starts" value={m.checkout_starts} />
            <Card label="Conversion" value={`${(m.conversion_rate * 100).toFixed(1)}%`} sub="paid ÷ WhatsApp clicks" />
            <Card label="Top Campaign" value={m.top_campaign ?? "—"} />
            <Card label="Top Product" value={m.top_product ?? "—"} />
          </>
        )}
      </div>

      <div className="border border-border/40 bg-noir-900/60 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">Revenue by Campaign</div>
        <div className="mt-3">
          {m && Object.keys(m.revenue_by_campaign).length ? (
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                <tr><th className="text-left py-1">Campaign</th><th className="text-right py-1">Orders</th><th className="text-right py-1">Revenue</th></tr>
              </thead>
              <tbody>
                {Object.entries(m.revenue_by_campaign)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .map(([name, v]) => (
                    <tr key={name} className="border-t border-border/20">
                      <td className="py-2">{name}</td>
                      <td className="py-2 text-right">{v.orders}</td>
                      <td className="py-2 text-right">{ngn(v.revenue)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="text-xs text-foreground/50">No campaign revenue in this range.</div>
          )}
        </div>
      </div>
    </section>
  );
}
