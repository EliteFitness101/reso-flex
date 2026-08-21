import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "invalid_json" }); }

  const sku = String(body?.sku || "").trim().slice(0, 128);
  const email = String(body?.email || "").trim().slice(0, 255);
  const name = String(body?.name || "").trim().slice(0, 120);
  const phone = String(body?.phone || "").trim().slice(0, 32);
  const address = String(body?.address || "").trim().slice(0, 255);

  if (!sku || !email || !name || !phone || !address) return json(400, { error: "missing_checkout_fields" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: "invalid_email" });

  // The browser never supplies the amount. Resolve the published price server-side.
  const { data: product, error: productErr } = await admin
    .from("products")
    .select("sku,name,price_ngn,status")
    .eq("sku", sku)
    .eq("status", "published")
    .maybeSingle();

  if (productErr) return json(500, { error: "catalog_lookup_failed" });
  if (!product) return json(404, { error: "product_not_found" });

  const amountNgn = Number(product.price_ngn);
  if (!Number.isFinite(amountNgn) || amountNgn <= 0) return json(409, { error: "product_not_sellable" });

  const reference = `RF-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const callback = "https://dashboard.resofit.fit/payment/callback";
  const metadata = {
    sku,
    variant_sku: sku,
    product_name: product.name,
    phone,
    delivery_address: address,
    funnel_origin: "resoflex_shop",
    checkout_channel: "paystack_direct",
    custom_fields: [
      { display_name: "SKU", variable_name: "variant_sku", value: sku },
      { display_name: "Phone", variable_name: "phone", value: phone },
      { display_name: "Delivery", variable_name: "delivery_address", value: address },
    ],
  };

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amountNgn * 100),
      currency: "NGN",
      reference,
      callback_url: callback,
      metadata,
      channels: ["card", "bank", "ussd", "bank_transfer", "mobile_money"],
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.status || !payload?.data?.authorization_url) {
    console.error("paystack initialize failed", payload);
    return json(502, { error: "payment_initialization_failed" });
  }

  return json(200, {
    reference,
    authorization_url: payload.data.authorization_url,
    amount_ngn: amountNgn,
    sku,
  });
});
