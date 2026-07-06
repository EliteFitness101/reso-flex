// Verified order lookup for /order/:reference and /order-status/:orderId.
// Accepts `reference` OR `orderId` (uuid). Public view = safe fields only.
// Token param unlocks full order.
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
      "id, reference, status, amount, currency, paid_at, fulfillment_status, next_steps, created_at, access_token, customer_email, customer_name, items, download_links, coach_contact",
    );
  query = orderId ? query.eq("id", orderId) : query.eq("reference", reference!);

  const { data: order, error } = await query.maybeSingle();
  if (error) { console.error(error); return json(500, { error: "server_error" }); }

  if (!order) {
    return json(200, {
      status: "pending",
      reference: reference ?? undefined,
      orderId: orderId ?? undefined,
      message: "Payment received. We're verifying your transaction. This usually takes a few moments.",
    });
  }

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
