// Verified order lookup for the /order/:reference page.
// - By reference alone → returns minimal safe status (status, amount, currency, paid_at, fulfillment_status)
// - With ?token=<access_token> → returns full order (customer info, items, download links, coach)
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim();
  const token = url.searchParams.get("token")?.trim() || null;
  if (!reference || reference.length < 4 || reference.length > 128) {
    return json(400, { error: "invalid_reference" });
  }

  const { data: order, error } = await admin
    .from("orders")
    .select(
      "reference, status, amount, currency, paid_at, fulfillment_status, next_steps, created_at, access_token, customer_email, customer_name, items, download_links, coach_contact"
    )
    .eq("reference", reference)
    .maybeSingle();

  if (error) {
    console.error("verify-order db error", error);
    return json(500, { error: "server_error" });
  }
  if (!order) {
    // Payment might have happened but webhook not yet processed. Return pending shape.
    return json(200, {
      status: "pending",
      reference,
      message: "Payment received. We're verifying your transaction. This usually takes a few moments.",
    });
  }

  const publicView = {
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
