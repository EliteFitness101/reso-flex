// ============================================================
// PAYMENT ROUTER — Checkout → Router → Provider Adapter →
// Verification → Payment Ledger.
// Paystack remains the live production adapter. All other
// adapters are registered but inactive until their gateway row
// is flipped to is_active in the database.
// ============================================================

import { supabase } from "@/integrations/supabase/client";
import { getRouteSync, resolveRoute } from "./currency.service";

export type GatewayCode = "paystack" | "flutterwave" | "stripe" | "paypal" | "crypto";

export type CheckoutIntent = {
  reference: string;
  amountMinor: number;
  currency: string;
  sku?: string;
  variantSku?: string;
  email?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
};

export type AdapterResult =
  | { kind: "redirect"; url: string }
  | { kind: "handoff"; channel: "whatsapp"; message: string }
  | { kind: "unavailable"; reason: string };

export interface PaymentAdapter {
  code: GatewayCode;
  /** Whether the adapter has a live implementation in this build. */
  live: boolean;
  supports(currency: string): boolean;
  createCheckout(intent: CheckoutIntent): Promise<AdapterResult>;
}

/** Existing production path: WhatsApp handoff → server-issued Paystack link. */
const paystack: PaymentAdapter = {
  code: "paystack",
  live: true,
  supports: (c) => ["NGN", "GHS", "ZAR", "USD"].includes(c),
  async createCheckout(intent) {
    const lines = [
      "ResoFlex order request",
      `Ref: ${intent.reference}`,
      intent.variantSku ? `Variant: ${intent.variantSku}` : intent.sku ? `SKU: ${intent.sku}` : "",
      `Amount: ${intent.currency} ${(intent.amountMinor / 100).toLocaleString()}`,
      intent.name ? `Name: ${intent.name}` : "",
      intent.email ? `Email: ${intent.email}` : "",
      intent.phone ? `Phone: ${intent.phone}` : "",
    ].filter(Boolean);
    return { kind: "handoff", channel: "whatsapp", message: lines.join("\n") };
  },
};

function stub(code: GatewayCode, currencies: string[]): PaymentAdapter {
  return {
    code,
    live: false,
    supports: (c) => currencies.includes(c),
    async createCheckout() {
      return { kind: "unavailable", reason: `${code} adapter is registered but not yet enabled` };
    },
  };
}

export const ADAPTERS: Record<GatewayCode, PaymentAdapter> = {
  paystack,
  flutterwave: stub("flutterwave", ["NGN", "USD", "GBP", "EUR"]),
  stripe: stub("stripe", ["USD", "CAD", "GBP", "EUR"]),
  paypal: stub("paypal", ["USD", "GBP", "EUR", "CAD"]),
  crypto: stub("crypto", ["USDT", "USDC"]),
};

/** Picks the gateway for the visitor's route, falling back to Paystack. */
export async function selectGateway(currency?: string): Promise<PaymentAdapter> {
  const route = currency ? { ...getRouteSync(), currency } : await resolveRoute();
  const preferred = ADAPTERS[route.gateway_code as GatewayCode];
  if (preferred?.live && preferred.supports(route.currency)) return preferred;
  return paystack;
}

/** Deterministic idempotency key — reference + gateway + intent shape. */
export function idempotencyKey(intent: CheckoutIntent, gateway: GatewayCode): string {
  return `${gateway}:${intent.reference}:${intent.amountMinor}:${intent.currency}`;
}

/** Records a checkout attempt in the payment ledger. Fire-and-forget. */
export function recordPaymentEvent(row: {
  gateway_code: string;
  event_type: string;
  reference?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string;
  payload?: Record<string, unknown>;
}) {
  if (typeof window === "undefined") return;
  supabase
    .from("payment_events")
    .insert({
      gateway_code: row.gateway_code,
      event_type: row.event_type,
      reference: row.reference ?? null,
      amount: row.amount ?? null,
      currency: row.currency ?? "NGN",
      status: row.status ?? "received",
      payload: (row.payload ?? {}) as never,
    })
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.debug("[payment_events]", error.message);
    });
}

/** Entry point used by checkout surfaces. Never throws. */
export async function routeCheckout(intent: CheckoutIntent): Promise<AdapterResult & { gateway: GatewayCode }> {
  const adapter = await selectGateway(intent.currency);
  try {
    const result = await adapter.createCheckout(intent);
    return { ...result, gateway: adapter.code };
  } catch (e) {
    return {
      kind: "unavailable",
      reason: e instanceof Error ? e.message : "checkout routing failed",
      gateway: adapter.code,
    };
  }
}
