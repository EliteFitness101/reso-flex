// Lightweight, vendor-agnostic event tracking.
// Pipes to window.dataLayer (GTM), gtag, fbq, plausible, posthog — whichever exists.
// Always logs to console in dev for debugging.

type Props = Record<string, string | number | boolean | undefined>;

export function track(event: string, props: Props = {}) {
  try {
    const payload = { event, ...props, ts: Date.now() };

    // GTM / dataLayer
    // @ts-expect-error optional global
    (window.dataLayer ||= []).push(payload);

    // gtag
    // @ts-expect-error optional global
    if (typeof window.gtag === "function") window.gtag("event", event, props);

    // Meta Pixel
    // @ts-expect-error optional global
    if (typeof window.fbq === "function") window.fbq("trackCustom", event, props);

    // Plausible
    // @ts-expect-error optional global
    if (typeof window.plausible === "function") window.plausible(event, { props });

    // PostHog
    // @ts-expect-error optional global
    if (window.posthog?.capture) window.posthog.capture(event, props);

    if (import.meta.env.DEV) console.debug("[track]", event, props);
  } catch {
    /* never throw from analytics */
  }
}
