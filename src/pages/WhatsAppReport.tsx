import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type Report = {
  days: number;
  counts: Record<string, number>;
  conversions: Record<string, number>;
  revenue_ngn: number;
  paid_orders: number;
  aov_ngn: number;
  top_campaigns: Array<{ name: string; clicks: number; paid: number; revenue: number }>;
  generated_at: string;
};

export default function WhatsAppReport() {
  const [search, setSearch] = useSearchParams();
  const initialToken = search.get("token") || "";
  const [token, setToken] = useState(initialToken);
  const [days, setDays] = useState(Number(search.get("days") || 30));
  const [data, setData] = useState<Report | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-report`);
      url.searchParams.set("days", String(days));
      const r = await fetch(url.toString(), {
        headers: {
          "x-admin-token": token,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      if (r.status === 401) throw new Error("Unauthorized");
      if (!r.ok) throw new Error(`http_${r.status}`);
      setData(await r.json());
      setSearch({ token, days: String(days) }, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialToken) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = (n: number) => (n * 100).toFixed(1) + "%";
  const ngn = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);

  return (
    <main className="min-h-screen bg-noir-950 px-4 py-10 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Revenue OS · WhatsApp Report</div>
        <h1 className="mt-2 font-display text-2xl font-bold">Conversion Funnel</h1>

        <div className="mt-6 flex flex-wrap items-end gap-3 border border-border/50 bg-noir-900/60 p-4">
          <label className="flex-1 min-w-[220px]">
            <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">Admin Token</div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1 w-full border border-border bg-noir-950 px-3 py-2 text-sm outline-none focus:border-gold/70"
            />
          </label>
          <label>
            <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">Range (days)</div>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-1 border border-border bg-noir-950 px-3 py-2 text-sm"
            >
              {[7, 14, 30, 60, 90].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <button onClick={load} className="luxury-button px-5 py-2 text-[11px]">
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {err && <div className="mt-4 text-xs text-red-400">{err}</div>}

        {data && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="WhatsApp Clicks" value={data.counts.whatsapp_click ?? 0} />
              <Stat label="Assessments" value={data.counts.assessment_started ?? 0} />
              <Stat label="Checkouts" value={data.counts.checkout_started ?? 0} />
              <Stat label="Paid Orders" value={data.paid_orders} />
              <Stat label="Revenue" value={ngn(data.revenue_ngn)} />
              <Stat label="AOV" value={ngn(data.aov_ngn)} />
              <Stat label="Click → Paid" value={pct(data.conversions.click_to_paid ?? 0)} />
              <Stat label="Checkout → Paid" value={pct(data.conversions.checkout_to_paid ?? 0)} />
            </div>

            <div className="mt-8">
              <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">Top Campaigns</div>
              <div className="mt-2 overflow-x-auto border border-border/50">
                <table className="w-full text-sm">
                  <thead className="bg-noir-900/70 text-[10px] uppercase tracking-[0.25em] text-foreground/60">
                    <tr>
                      <th className="px-3 py-2 text-left">Campaign</th>
                      <th className="px-3 py-2 text-right">Clicks</th>
                      <th className="px-3 py-2 text-right">Paid</th>
                      <th className="px-3 py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_campaigns.map((c) => (
                      <tr key={c.name} className="border-t border-border/40">
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-right">{c.clicks}</td>
                        <td className="px-3 py-2 text-right">{c.paid}</td>
                        <td className="px-3 py-2 text-right">{ngn(c.revenue / 100)}</td>
                      </tr>
                    ))}
                    {data.top_campaigns.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-foreground/50">No data yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                Generated {new Date(data.generated_at).toLocaleString()}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-gold/30 bg-noir-900/60 p-4">
      <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">{label}</div>
      <div className="mt-2 font-display text-lg font-bold gold-text">{value}</div>
    </div>
  );
}
