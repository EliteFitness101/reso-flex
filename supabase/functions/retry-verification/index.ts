// Admin action — re-verify a Paystack reference and re-run the atomic RPC.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

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

  const body = await req.json().catch(() => ({}));
  const reference: string | undefined = body?.reference;
  if (!reference) return json(400, { error: "missing_reference" });

  const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  });
  const j = await r.json().catch(() => null);
  const v = j?.data;
  if (!v || v.status !== "success") {
    await admin.from("audit_logs").insert({
      actor_id: uid, action: "retry_verification", resource_type: "order", resource_id: reference,
      result: "not_success", meta: { paystack: v ?? null },
    });
    return json(200, { verified: false });
  }

  const meta = v.metadata || {};
  const { data: result, error } = await admin.rpc("process_paystack_success", {
    payload: {
      reference,
      event_id: `retry:${reference}:${v.paid_at}`,
      amount: v.amount, currency: v.currency ?? "NGN",
      email: v.customer?.email ?? null,
      name: [v.customer?.first_name, v.customer?.last_name].filter(Boolean).join(" ") || null,
      phone: meta?.phone ?? null,
      sku: meta?.variant_sku ?? null,
      paid_at: v.paid_at,
      attribution: meta,
      raw: v,
    },
  });
  await admin.from("audit_logs").insert({
    actor_id: uid, action: "retry_verification", resource_type: "order",
    resource_id: (result as any)?.order_id ?? reference,
    result: error ? "error" : "ok", meta: { error: error?.message },
  });
  if (error) return json(500, { error: error.message });
  return json(200, { ok: true, ...(result as any) });
});
