// WhatsApp / funnel conversion report — token-gated aggregates.
// Requires header: x-admin-token: <ADMIN_DASHBOARD_TOKEN>
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_TOKEN = Deno.env.get("ADMIN_DASHBOARD_TOKEN")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const token = req.headers.get("x-admin-token") || new URL(req.url).searchParams.get("token") || "";
  if (!token || token !== ADMIN_TOKEN) return json(401, { error: "unauthorized" });

  const url = new URL(req.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") || 30)));
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const { data: events, error } = await admin
    .from("funnel_events")
    .select("event_type, campaign, utm_campaign, utm_source, amount, currency, created_at")
    .gte("created_at", since)
    .limit(50000);
  if (error) return json(500, { error: "server_error" });

  const counts: Record<string, number> = {
    whatsapp_click: 0,
    assessment_started: 0,
    checkout_started: 0,
    payment_success: 0,
  };
  let revenueKobo = 0;
  let paidCount = 0;
  const byCampaign: Record<string, { clicks: number; paid: number; revenue: number }> = {};

  for (const e of events || []) {
    if (e.event_type in counts) counts[e.event_type]++;
    if (e.event_type === "payment_success") {
      revenueKobo += Number(e.amount || 0);
      paidCount++;
    }
    const camp = (e.utm_campaign || e.campaign || "direct") as string;
    byCampaign[camp] ||= { clicks: 0, paid: 0, revenue: 0 };
    if (e.event_type === "whatsapp_click") byCampaign[camp].clicks++;
    if (e.event_type === "payment_success") {
      byCampaign[camp].paid++;
      byCampaign[camp].revenue += Number(e.amount || 0);
    }
  }

  const wa = counts.whatsapp_click;
  const conv = {
    click_to_assessment: wa ? counts.assessment_started / wa : 0,
    assessment_to_checkout: counts.assessment_started
      ? counts.checkout_started / counts.assessment_started
      : 0,
    checkout_to_paid: counts.checkout_started
      ? counts.payment_success / counts.checkout_started
      : 0,
    click_to_paid: wa ? counts.payment_success / wa : 0,
  };
  const aov = paidCount ? revenueKobo / paidCount : 0;

  const topCampaigns = Object.entries(byCampaign)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return json(200, {
    days,
    counts,
    conversions: conv,
    revenue_kobo: revenueKobo,
    revenue_ngn: revenueKobo / 100,
    paid_orders: paidCount,
    aov_kobo: aov,
    aov_ngn: aov / 100,
    top_campaigns: topCampaigns,
    generated_at: new Date().toISOString(),
  });
});
