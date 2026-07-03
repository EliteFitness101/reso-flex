// Paystack webhook — strict HMAC verification + idempotency ledger.
// Every event is stored once in webhook_events (unique event_id). Duplicates
// are acknowledged with 200 and do NOT re-run any side effects.
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYSTACK_WEBHOOK_SECRET = Deno.env.get("PAYSTACK_WEBHOOK_SECRET")!;
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

async function verifyPaystackAmount(reference: string) {
  // Server-side verify against Paystack API to defend against forged payloads.
  const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  return j?.data ?? null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return ack(405, { error: "method_not_allowed" });

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  // 1) HMAC verify (use secret key per Paystack docs — signature is HMAC-SHA512 of body with SK)
  const expected = createHmac("sha512", PAYSTACK_SECRET_KEY).update(raw).digest("hex");
  if (!signature || signature !== expected) {
    return ack(401, { error: "invalid_signature" });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return ack(400, { error: "invalid_json" });
  }

  const eventType: string = event?.event || "unknown";
  const data = event?.data || {};
  const reference: string | undefined = data?.reference;
  // Paystack does not always send a top-level event id — derive a deterministic idempotency key.
  const eventId: string =
    event?.id?.toString() ||
    data?.id?.toString() ||
    `${eventType}:${reference}:${data?.status || ""}:${data?.paid_at || ""}`;

  // 2) Idempotency insert — unique(provider, event_id) guarantees single processing
  const { error: insErr } = await admin.from("webhook_events").insert({
    provider: "paystack",
    event_id: eventId,
    event_type: eventType,
    reference: reference ?? null,
    payload: event,
  });
  if (insErr) {
    // 23505 = unique violation → duplicate replay. ACK success, no side effects.
    if ((insErr as any).code === "23505") return ack(200, { duplicate: true });
    console.error("webhook_events insert error", insErr);
    return ack(500, { error: "ledger_error" });
  }

  // 3) Only act on successful charges. Everything else is logged & acked.
  if (eventType !== "charge.success" || !reference) return ack(200, { logged: true });

  // 4) Independently verify against Paystack API
  const verified = await verifyPaystackAmount(reference);
  if (!verified || verified.status !== "success") {
    return ack(200, { verified: false });
  }

  const amount: number = verified.amount ?? data.amount ?? 0;
  const currency: string = verified.currency ?? data.currency ?? "NGN";
  const email: string | null = verified.customer?.email ?? data.customer?.email ?? null;
  const customerName: string | null =
    [verified.customer?.first_name, verified.customer?.last_name].filter(Boolean).join(" ") || null;
  const meta = verified.metadata || data.metadata || {};
  const customFields: any[] = Array.isArray(meta?.custom_fields) ? meta.custom_fields : [];
  const skuField = customFields.find((f) => f?.variable_name === "variant_sku");
  const sku: string | null = skuField?.value ?? meta?.variant_sku ?? null;
  const phone: string | null = meta?.phone ?? null;

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
    source: meta?.source ?? meta?.utm_source ?? null,
    medium: meta?.medium ?? meta?.utm_medium ?? null,
  };

  // 5) Upsert order by reference (idempotent by unique constraint)
  const { data: orderRow, error: orderErr } = await admin
    .from("orders")
    .upsert(
      {
        reference,
        status: "paid",
        amount,
        currency,
        customer_email: email,
        customer_name: customerName,
        customer_phone: phone,
        items: sku ? [{ sku, amount, currency }] : [],
        attribution,
        fulfillment_status: "processing",
        paid_at: verified.paid_at ?? new Date().toISOString(),
      },
      { onConflict: "reference" }
    )
    .select("id, reference, access_token")
    .single();

  if (orderErr) {
    console.error("orders upsert error", orderErr);
    return ack(500, { error: "order_error" });
  }

  // 6) Payment row (idempotent via ledger; duplicate webhook already returned above)
  await admin.from("payments").insert({
    order_id: orderRow.id,
    paystack_reference: reference,
    paystack_event_id: eventId,
    amount,
    currency,
    status: "success",
    raw: verified,
  });

  // 7) Emit funnel event
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
    amount,
    currency,
    props: { sku, email },
  });

  // 8) Forward to Make (fire and forget). Duplicates blocked by ledger above.
  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "payment_success",
        reference,
        amount,
        currency,
        email,
        sku,
        attribution,
        order_id: orderRow.id,
        ts: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error("make webhook forward failed", e);
  }

  return ack(200, { ok: true, reference });
});
