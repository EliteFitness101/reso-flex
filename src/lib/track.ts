// Lightweight, vendor-agnostic event tracking.
// Pipes to window.dataLayer (GTM), gtag, fbq, plausible, posthog — whichever exists.
// Also forwards a curated set of ecommerce events to the Make.com webhook.
// Always logs to console in dev for debugging.

import { sendWebhook } from "./webhook";
import { getAttribution } from "./attribution";

type Props = Record<string, string | number | boolean | undefined | null>;

// Events forwarded to the central webhook
const WEBHOOK_EVENTS = new Set([
  "product_view",
  "bundle_view",
  "checkout_start",
  "payment_success",
]);



export function track(event: string, props: Props = {}) {
  try {
    const payload = {
      event,
      ...props,
      ts: Date.now(),
      session_id:
        props.session_id ||
        (typeof window !== "undefined"
          ? (window as any).__rf_session_id
          : undefined),
    };

    // Ensure session exists
    if (typeof window !== "undefined") {
      (window as any).__rf_session_id =
        (window as any).__rf_session_id ||
        crypto?.randomUUID?.() ||
        String(Date.now());
    }

    // GTM / dataLayer
    try {
      // @ts-expect-error optional global
      window.dataLayer = window.dataLayer || [];
      // @ts-expect-error optional global
      window.dataLayer.push(payload);
    } catch {}

    const w = window as any;

    // gtag
    try {
      if (typeof w.gtag === "function") w.gtag("event", event, props);
    } catch {}

    // Meta Pixel
    try {
      if (typeof w.fbq === "function") w.fbq("trackCustom", event, props);
    } catch {}

    // Plausible
    try {
      if (typeof w.plausible === "function") w.plausible(event, { props });
    } catch {}

    // PostHog
    try {
      if (w.posthog?.capture) w.posthog.capture(event, props);
    } catch {}

    // Central webhook (Make.com) — only ecommerce lifecycle events
    if (WEBHOOK_EVENTS.has(event)) {
      sendWebhook(event, { ...props, attribution: getAttribution() });
    }

    if (import.meta.env.DEV) {
      console.debug("[track]", event, props);
    }

  } catch {
    // never break app flow
  }
}
