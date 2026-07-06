// Paystack webhook — HMAC verify + idempotency ledger + atomic RPC.
// All order/payment/referral/audit side-effects run inside
// public.process_paystack_success(payload) as a single transaction.
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const MAKE_WEBHOOK_URL =
  "https://hook.eu1.make.com/p0c26asklninfrxhp2sw6nkdjjb19a89";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function ack(status = 200, body: Record<string, unknown> = { received: true }) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyPaystack(reference: string) {
  const r = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
  );
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  return j?.data ?? null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return ack(405, { error: "method_not_allowed" });

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  const expected = createHmac("sha512", PAYSTACK_SECRET_KEY).update(raw).digest("hex");
  if (!signature || signature !== expected) return ack(401, { error: "invalid_signature" });

  let event: any;
  try { event = JSON.parse(raw); } catch { return ack(400, { error: "invalid_json" }); }

  const eventType: string = event?.event || "unknown";
  const data = event?.data || {};
  const reference: string | undefined = data?.reference;
  const eventId: string =
    event?.id?.toString() ||
    data?.id?.toString() ||
    `${eventType}:${reference}:${data?.status || ""}:${data?.paid_at || ""}`;

  // Idempotency ledger — unique(provider,event_id) blocks replays.
  const { error: insErr } = await admin.from("webhook_events").insert({
    provider: "paystack",
    event_id: eventId,
    event_type: eventType,
    reference: reference ?? null,
    payload: event,
  });
  if (insErr) {
    if ((insErr as any).code === "23505") return ack(200, { duplicate: true });
    console.error("webhook_events insert error", insErr);
    return ack(500, { error: "ledger_error" });
  }

  if (eventType !== "charge.success" || !reference) return ack(200, { logged: true });

  const verified = await verifyPaystack(reference);
  if (!verified || verified.status !== "success") return ack(200, { verified: false });

  const meta = verified.metadata || data.metadata || {};
  const customFields: any[] = Array.isArray(meta?.custom_fields) ? meta.custom_fields : [];
  const skuField = customFields.find((f) => f?.variable_name === "variant_sku");
  const sku: string | null = skuField?.value ?? meta?.variant_sku ?? null;
  const email: string | null = verified.customer?.email ?? null;
  const name: string | null =
    [verified.customer?.first_name, verified.customer?.last_name].filter(Boolean).join(" ") || null;

  const attribution = {
    rsid: meta?.rsid ?? null,
    utm_source: meta?.utm_source ?? null,
    utm_medium: meta?.utm_medium ?? null,
    utm_campaign: meta?.utm_campaign ?? null,
    utm_term: meta?.utm_term ?? null,
    utm_content: meta?.utm_content ?? null,
    funnel_origin: meta?.funnel_origin ?? null,
    session_id: meta?.session_id ?? null,
    campaign: meta?.campaign ?? meta?.utm_campaign ?? null,
  };

  // Atomic RPC — order + payment + referral + campaign_event + audit in ONE tx.
  const { data: result, error: rpcErr } = await admin.rpc("process_paystack_success", {
    payload: {
      reference,
      event_id: eventId,
      amount: verified.amount,
      currency: verified.currency ?? "NGN",
      email,
      name,
      phone: meta?.phone ?? null,
      sku,
      paid_at: verified.paid_at,
      attribution,
      raw: verified,
    },
  });

  if (rpcErr) {
    console.error("process_paystack_success error", rpcErr);
    return ack(500, { error: "rpc_error" });
  }

  // Emit funnel row for reporting (already inside RPC as campaign_event, but keep funnel too)
  await admin.from("funnel_events").insert({
    event_type: "payment_success",
    session_id: attribution.session_id,
    rsid: attribution.rsid,
    funnel_origin: attribution.funnel_origin,
    campaign: attribution.campaign,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_term: attribution.utm_term,
    utm_content: attribution.utm_content,
    order_reference: reference,
    amount: verified.amount,
    currency: verified.currency ?? "NGN",
    props: { sku, email },
  });

  // Forward to Make once (duplicates already rejected by ledger above).
  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "payment_success",
        reference,
        amount: verified.amount,
        currency: verified.currency ?? "NGN",
        email, sku, attribution,
        order_id: (result as any)?.order_id,
        ts: new Date().toISOString(),
      }),
    });
  } catch (e) { console.error("make forward failed", e); }

  return ack(200, { ok: true, reference, ...(result as any) });
});
