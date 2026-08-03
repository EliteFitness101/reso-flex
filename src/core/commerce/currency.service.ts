// ============================================================
// CURRENCY ENGINE — Visitor → Country → Region → Currency →
// Payment Provider → Fulfillment Hub.
// NGN remains the primary production currency; every unknown
// visitor falls back to the Nigeria route so nothing regresses.
// ============================================================

import { supabase } from "@/integrations/supabase/client";

export type CurrencyRoute = {
  country_iso2: string;
  region_code: string | null;
  currency: string;
  gateway_code: string;
  fulfillment_hub: string | null;
};

export const DEFAULT_ROUTE: CurrencyRoute = {
  country_iso2: "NG",
  region_code: "WAF",
  currency: "NGN",
  gateway_code: "paystack",
  fulfillment_hub: "Lagos",
};

const CACHE_KEY = "rf_currency_route_v1";

/** Best-effort country detection with zero extra network cost. */
export function detectCountry(): string {
  if (typeof window === "undefined") return DEFAULT_ROUTE.country_iso2;
  try {
    const url = new URL(window.location.href);
    const forced = url.searchParams.get("country");
    if (forced && /^[A-Za-z]{2}$/.test(forced)) return forced.toUpperCase();
  } catch {}
  try {
    const locale = navigator.language || "";
    const region = new Intl.Locale(locale).maximize().region;
    if (region) return region.toUpperCase();
  } catch {}
  return DEFAULT_ROUTE.country_iso2;
}

function readCache(): CurrencyRoute | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CurrencyRoute) : null;
  } catch {
    return null;
  }
}

/** Synchronous route (cache or NGN default) — safe for first paint. */
export function getRouteSync(): CurrencyRoute {
  return readCache() ?? DEFAULT_ROUTE;
}

/** Resolves the full route from the backend routing table. */
export async function resolveRoute(iso2?: string): Promise<CurrencyRoute> {
  const country = (iso2 || detectCountry()).toUpperCase();
  const cached = readCache();
  if (cached && cached.country_iso2 === country) return cached;

  const { data, error } = await supabase
    .from("currency_routes")
    .select("country_iso2, region_code, currency, gateway_code, fulfillment_hub")
    .eq("country_iso2", country)
    .eq("is_active", true)
    .maybeSingle();

  const route: CurrencyRoute = !error && data ? (data as CurrencyRoute) : DEFAULT_ROUTE;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(route));
  } catch {}
  return route;
}

const SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  CAD: "CA$",
  GBP: "£",
  EUR: "€",
};

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? `${currency} `;
}

/** Formats a minor-unit amount (kobo/cents) in the given currency. */
export function formatMinor(minor: number, currency = "NGN"): string {
  const major = (minor || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${currencySymbol(currency)}${major.toLocaleString()}`;
  }
}
