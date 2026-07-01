// Attribution: preserve rsid + utm_* across navigation and outbound links.
// Captured once on first load (from URL), stored in sessionStorage,
// and appended to any external checkout URL via withAttribution().

const KEY = "rf_attribution_v1";
const TRACKED_KEYS = [
  "rsid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ttclid",
];

export type AttributionMap = Record<string, string>;

function readStored(): AttributionMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStored(map: AttributionMap) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(map));
  } catch {}
}

/** Capture params from current URL — safe to call repeatedly. */
export function captureAttribution(): AttributionMap {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const stored = readStored();
  let changed = false;
  for (const k of TRACKED_KEYS) {
    const v = url.searchParams.get(k);
    if (v && !stored[k]) {
      stored[k] = v;
      changed = true;
    }
  }
  // First-touch landing page (only set once)
  if (!stored.landing_page) {
    stored.landing_page = url.pathname + url.search;
    changed = true;
  }
  if (changed) writeStored(stored);
  return stored;
}

export function getAttribution(): AttributionMap {
  return readStored();
}

/** Append attribution params to any URL (external or internal). */
export function withAttribution(rawUrl: string): string {
  try {
    const attr = getAttribution();
    if (!Object.keys(attr).length) return rawUrl;
    const isAbsolute = /^https?:\/\//i.test(rawUrl);
    const u = new URL(rawUrl, isAbsolute ? undefined : window.location.origin);
    for (const [k, v] of Object.entries(attr)) {
      if (k === "landing_page") continue;
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return isAbsolute ? u.toString() : u.pathname + u.search + u.hash;
  } catch {
    return rawUrl;
  }
}
