// Lightweight, vendor-agnostic event tracking.
// Pipes to window.dataLayer (GTM), gtag, fbq, plausible, posthog — whichever exists.
// Always logs to console in dev for debugging.

type Props = Record<string, string | number | boolean | undefined | null>;

/**
 * Supported event types:
 * - assessment_complete: User completed assessment/funnel step
 * - paystack_checkout: User initiated Paystack payment
 * - whatsapp_click: User clicked WhatsApp CTA
 * - chatb2k_launch: User launched B2K chat interface
 * - utm_tracking: UTM parameters captured at session start
 */
export type TrackingEventType =
  | 'assessment_complete'
  | 'paystack_checkout'
  | 'whatsapp_click'
  | 'chatb2k_launch'
  | 'utm_tracking'
  | string;

export function track(event: TrackingEventType, props: Props = {}) {
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

    // gtag
    try {
      // @ts-expect-error optional global
      if (typeof window.gtag === "function")
        window.gtag("event", event, props);
    } catch {}

    // Meta Pixel
    try {
      // @ts-expect-error optional global
      if (typeof window.fbq === "function")
        window.fbq("trackCustom", event, props);
    } catch {}

    // Plausible
    try {
      // @ts-expect-error optional global
      if (typeof window.plausible === "function")
        window.plausible(event, { props });
    } catch {}

    // PostHog
    try {
      // @ts-expect-error optional global
      if (window.posthog?.capture)
        window.posthog.capture(event, props);
    } catch {}

    if (import.meta.env.DEV) {
      console.debug("[track]", event, props);
    }
  } catch {
    // never break app flow
  }
}
