// WhatsApp / journey attribution — extends existing track() by persisting
// funnel events to the database for the Revenue OS WhatsApp report.
// Fire-and-forget; never blocks UI.

import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "./attribution";

const JOURNEY_EVENTS = new Set([
  "whatsapp_click",
  "assessment_started",
  "assessment_click",
  "checkout_started",
  "checkout_start",
  "product_view",
  "bundle_view",
  "payment_success",
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

export function logFunnel(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!JOURNEY_EVENTS.has(event)) return;
  const attr = getAttribution();
  const normalized =
    event === "checkout_start" ? "checkout_started" :
    event === "assessment_click" ? "assessment_started" : event;

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
    props,
  };

  // fire-and-forget
  supabase.from("funnel_events").insert(row as any).then(({ error }) => {
    if (error && import.meta.env.DEV) console.debug("[funnel insert]", error.message);
  });
}
