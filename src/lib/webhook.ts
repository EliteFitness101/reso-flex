// Fire-and-forget webhook to Make.com for centralized event capture.
// Uses navigator.sendBeacon when available; falls back to fetch(keepalive).

import { getAttribution } from "./attribution";

const WEBHOOK_URL =
  "https://hook.eu1.make.com/p0c26asklninfrxhp2sw6nkdjjb19a89";

export function sendWebhook(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    event,
    ts: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer || null,
    attribution: getAttribution(),
    props,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon(WEBHOOK_URL, blob);
      if (ok) return;
    }
  } catch {}

  try {
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      mode: "no-cors",
    }).catch(() => {});
  } catch {}
}
