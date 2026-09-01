// Lightweight, vendor-agnostic event tracking.
// Pipes to window.dataLayer (GTM), gtag, fbq, ttq, plausible, posthog — whichever exists.
// Also forwards a curated set of ecommerce events to the Make.com webhook.
// Always logs to console in dev for debugging.

import { sendWebhook } from "./webhook";
import { getAttribution } from "./attribution";
import { logFunnel } from "./funnelLog";

type Props = Record<string, string | number | boolean | undefined | null>;

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

    if (typeof window !== "undefined") {
      (window as any).__rf_session_id =
        (window as any).__rf_session_id ||
        crypto?.randomUUID?.() ||
        String(Date.now());
    }

    try {
      // @ts-expect-error optional global
      window.dataLayer = window.dataLayer || [];
      // @ts-expect-error optional global
      window.dataLayer.push(payload);
    } catch {}

    const w = window as any;

    try {
      if (typeof w.gtag === "function") w.gtag("event", event, props);
    } catch {}

    try {
      if (typeof w.fbq === "function") w.fbq("trackCustom", event, props);
    } catch {}

    // TikTok Pixel
    try {
      if (typeof w.ttq?.track === "function") w.ttq.track(event, props);
    } catch {}

    try {
      if (typeof w.plausible === "function") w.plausible(event, { props });
    } catch {}

    try {
      if (w.posthog?.capture) w.posthog.capture(event, props);
    } catch {}

    if (WEBHOOK_EVENTS.has(event)) {
      sendWebhook(event, { ...props, attribution: getAttribution() });
    }

    logFunnel(event, props as Record<string, unknown>);

    if (import.meta.env.DEV) {
      console.debug("[track]", event, props);
    }
  } catch {
    // never break app flow
  }
}
