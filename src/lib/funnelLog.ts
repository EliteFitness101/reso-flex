// WhatsApp / journey attribution — extends existing track() by persisting
// funnel events to the database for the Revenue OS WhatsApp report.
// Fire-and-forget; never blocks UI.

import { supabase } from "@/integrations/supabase/client";
import { getAttribution, getDeviceContext } from "./attribution";

const JOURNEY_EVENTS = new Set([
  "landing_page_view",
  "whatsapp_click",
  "assessment_started",
  "assessment_click",
  "assessment_completed",
  "checkout_started",
  "checkout_start",
  "product_view",
  "bundle_view",
  "payment_pending",
  "payment_success",
  "welcome_completed",
  "upsell_accepted",
  "referral_joined",
]);

function sessionId(): string {
  if (typeof window === "undefined") return "server";
  const w = window as any;
  if (!w.__rf_session_id) {
    w.__rf_session_id =
      crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2);
  }
  return w.__rf_session_id;
}

/** Dev-only in-memory subscribers for QA harness. */
type QAListener = (evt: { event: string; row: any; ts: number }) => void;
const qaListeners: QAListener[] = [];
export function __devSubscribeFunnel(fn: QAListener) {
  if (!import.meta.env.DEV) return () => {};
  qaListeners.push(fn);
  return () => { const i = qaListeners.indexOf(fn); if (i >= 0) qaListeners.splice(i, 1); };
}
export function __devGetSessionId() { return sessionId(); }

export function logFunnel(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!JOURNEY_EVENTS.has(event)) return;
  const attr = getAttribution();
  const normalized =
    event === "checkout_start" ? "checkout_started" :
    event === "assessment_click" ? "assessment_started" : event;

  const dev = getDeviceContext();
  const row = {
    event_type: normalized,
    session_id: sessionId(),
    rsid: attr.rsid ?? null,
    funnel_origin: (attr.landing_page as string) ?? null,
    campaign: (attr.utm_campaign as string) ?? null,
    utm_source: attr.utm_source ?? null,
    utm_medium: attr.utm_medium ?? null,
    utm_campaign: attr.utm_campaign ?? null,
    utm_term: attr.utm_term ?? null,
    utm_content: attr.utm_content ?? null,
    order_reference: (props.reference as string) ?? null,
    amount: typeof props.value === "number" ? Math.round(props.value * 100) : null,
    currency: (props.currency as string) ?? "NGN",
    props: {
      ...props,
      device: dev.device,
      browser: dev.browser,
      language: dev.lang,
      referrer: (attr.referrer as string) ?? null,
      landing_page: (attr.landing_page as string) ?? null,
      order_id: (props.order_id as string) ?? null,
      sku: (props.sku as string) ?? null,
      ts: new Date().toISOString(),
    },
  };

  if (import.meta.env.DEV && qaListeners.length) {
    for (const fn of qaListeners) { try { fn({ event: normalized, row, ts: Date.now() }); } catch {} }
  }

  // fire-and-forget
  supabase.from("funnel_events").insert(row as any).then(({ error }) => {
    if (error && import.meta.env.DEV) console.debug("[funnel insert]", error.message);
  });
}

