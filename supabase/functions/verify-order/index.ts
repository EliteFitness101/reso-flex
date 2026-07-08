// Verified order lookup for /order/:reference and /order-status/:orderId.
// Accepts `reference` OR `orderId` (uuid). Public view = safe fields only.
// Token param unlocks full order. Response also includes a `timeline` array
// derived purely from verified backend state.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type TimelineStep = { key: string; label: string; at: string | null };

async function buildTimeline(order: any): Promise<TimelineStep[]> {
  const steps: TimelineStep[] = [];
  const push = (key: string, label: string, at: string | null | undefined) => {
    if (at) steps.push({ key, label, at: new Date(at).toISOString() });
  };

  push("order_created", "Order Created", order.created_at);

  // funnel events tied to this order
  const [{ data: fEvents }, { data: wEvents }, { data: pRows }] = await Promise.all([
    admin.from("funnel_events")
      .select("event_type, created_at")
      .eq("order_reference", order.reference)
      .in("event_type", ["checkout_started", "payment_pending", "welcome_completed", "referral_joined"])
      .order("created_at", { ascending: true }),
    admin.from("webhook_events")
      .select("received_at, signature_valid, processed_at")
      .eq("provider", "paystack")
      .eq("resource_reference", order.reference)
      .order("received_at", { ascending: true }),
    admin.from("payments")
      .select("status, created_at")
      .eq("order_id", order.id)
      .eq("status", "success")
      .order("created_at", { ascending: true })
      .limit(1),
  ]);

  const firstOf = (t: string) => fEvents?.find((e: any) => e.event_type === t)?.created_at ?? null;
  push("checkout_started", "Checkout Started", firstOf("checkout_started"));
  push("payment_submitted", "Payment Submitted", firstOf("payment_pending"));

  const firstWebhook = wEvents?.[0];
  push("webhook_received", "Webhook Received", firstWebhook?.received_at);
  const validSig = wEvents?.find((e: any) => e.signature_valid === true);
  push("signature_verified", "Signature Verified", validSig?.received_at ?? null);

  push("payment_verified", "Payment Verified", pRows?.[0]?.created_at ?? null);
  push("order_marked_paid", "Order Marked Paid", order.paid_at);
  push("referral_processed", "Referral Processed", order.referral_processed_at);
  push("welcome_completed", "Welcome Completed", order.welcome_sent_at);

  if (order.fulfillment_status === "processing" || order.fulfillment_status === "fulfilled") {
    // processing timestamp not tracked; use paid_at as best-effort start
    push("ready_for_fulfillment", "Ready for Fulfillment", order.paid_at);
  }
  if (order.fulfillment_status === "fulfilled") {
    push("fulfilled", "Fulfilled", order.updated_at ?? order.paid_at);
  }

  return steps;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim() || null;
  const orderId = url.searchParams.get("orderId")?.trim() || null;
  const token = url.searchParams.get("token")?.trim() || null;

  if (!reference && !orderId) return json(400, { error: "missing_identifier" });
  if (orderId && !UUID_RE.test(orderId)) return json(400, { error: "invalid_order_id" });
  if (reference && (reference.length < 4 || reference.length > 128)) return json(400, { error: "invalid_reference" });

  let query = admin
    .from("orders")
    .select(
      "id, reference, status, amount, currency, paid_at, fulfillment_status, next_steps, created_at, updated_at, access_token, customer_email, customer_name, items, download_links, coach_contact, referral_processed_at, welcome_sent_at",
    );
  query = orderId ? query.eq("id", orderId) : query.eq("reference", reference!);

  const { data: order, error } = await query.maybeSingle();
  if (error) { console.error(error); return json(500, { error: "server_error" }); }

  if (!order) {
    return json(200, {
      status: "pending",
      reference: reference ?? undefined,
      orderId: orderId ?? undefined,
      timeline: [],
      message: "Payment received. We're verifying your transaction. This usually takes a few moments.",
    });
  }

  let timeline: TimelineStep[] = [];
  try { timeline = await buildTimeline(order); } catch (e) { console.error("timeline", e); }

  const publicView = {
    id: order.id,
    reference: order.reference,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    paid_at: order.paid_at,
    fulfillment_status: order.fulfillment_status,
    next_steps: order.next_steps,
    created_at: order.created_at,
    timeline,
  };

  const authorized = token && order.access_token && token === order.access_token;
  if (!authorized) return json(200, publicView);

  return json(200, {
    ...publicView,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    items: order.items,
    download_links: order.download_links,
    coach_contact: order.coach_contact,
  });
});
