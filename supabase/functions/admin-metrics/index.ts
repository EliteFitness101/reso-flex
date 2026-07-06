// Admin metrics — JWT-gated (admin role). Returns dashboard aggregates for a date range.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json(401, { error: "unauthorized" });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: claims } = await userClient.auth.getClaims(auth.slice(7));
  const uid = (claims as any)?.claims?.sub;
  if (!uid) return json(401, { error: "unauthorized" });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: uid, _role: "admin" });
  if (!isAdmin) return json(403, { error: "forbidden" });

  const url = new URL(req.url);
  const from = url.searchParams.get("from") || new Date(Date.now() - 30 * 864e5).toISOString();
  const to = url.searchParams.get("to") || new Date().toISOString();

  const [ordersRes, funnelRes, campaignsRes] = await Promise.all([
    admin.from("orders").select("id,status,amount,currency,created_at,paid_at,attribution,items")
      .gte("created_at", from).lte("created_at", to),
    admin.from("funnel_events").select("event_type,amount,campaign,order_reference,created_at")
      .gte("created_at", from).lte("created_at", to),
    admin.from("campaign_events").select("campaign,amount,order_reference,created_at")
      .gte("created_at", from).lte("created_at", to).eq("event_type", "payment_success"),
  ]);

  const orders = ordersRes.data ?? [];
  const events = funnelRes.data ?? [];
  const campaigns = campaignsRes.data ?? [];

  const paid = orders.filter(o => o.status === "paid");
  const pending = orders.filter(o => o.status === "pending");
  const failed = orders.filter(o => ["failed","cancelled"].includes(o.status));
  const revenue = paid.reduce((s, o) => s + (Number(o.amount) || 0), 0);

  const counts = (t: string) => events.filter(e => e.event_type === t).length;
  const wa = counts("whatsapp_click");
  const assess = counts("assessment_started");
  const cko = counts("checkout_started");
  const paidCount = paid.length;

  const byCampaign: Record<string, { revenue: number; orders: number }> = {};
  for (const c of campaigns) {
    const k = c.campaign || "(none)";
    byCampaign[k] = byCampaign[k] || { revenue: 0, orders: 0 };
    byCampaign[k].revenue += Number(c.amount) || 0;
    byCampaign[k].orders += 1;
  }
  const topCampaign = Object.entries(byCampaign).sort((a, b) => b[1].revenue - a[1].revenue)[0]?.[0] || null;

  const bySku: Record<string, number> = {};
  for (const o of paid) {
    const items = Array.isArray(o.items) ? (o.items as any[]) : [];
    for (const it of items) if (it?.sku) bySku[it.sku] = (bySku[it.sku] || 0) + 1;
  }
  const topProduct = Object.entries(bySku).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return json(200, {
    range: { from, to },
    revenue_kobo: revenue,
    paid_orders: paidCount,
    pending_orders: pending.length,
    failed_orders: failed.length,
    aov_kobo: paidCount ? Math.round(revenue / paidCount) : 0,
    whatsapp_clicks: wa,
    assessment_starts: assess,
    checkout_starts: cko,
    conversion_rate: wa ? paidCount / wa : 0,
    revenue_by_campaign: byCampaign,
    top_campaign: topCampaign,
    top_product: topProduct,
    generated_at: new Date().toISOString(),
  });
});
