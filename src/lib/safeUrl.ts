// safeExternalUrl: validate outbound CTA URLs to prevent broken-link/404 crashes.
// Returns a sanitized https URL or the project-wide fallback.

const FALLBACK = "https://reso-fit.lovable.app";

const ALLOWED_HOSTS = [
  "nownowgym.lovable.app",
  "reso-fit.lovable.app",
  "reso-flex-treadmill.lovable.app",
  "redzone-recruit.lovable.app",
  "resofit.fit",
  "wa.me",
  "api.whatsapp.com",
  "paystack.com",
  "checkout.paystack.com",
];

export function safeExternalUrl(input?: string | null, fallback: string = FALLBACK): string {
  if (!input) return fallback;
  try {
    const u = new URL(input, fallback);
    if (u.protocol !== "https:" && u.protocol !== "http:" && u.protocol !== "mailto:" && u.protocol !== "tel:") {
      return fallback;
    }
    if (u.protocol === "mailto:" || u.protocol === "tel:") return u.toString();
    const host = u.hostname.toLowerCase();
    const ok = ALLOWED_HOSTS.some((h) => host === h || host.endsWith("." + h));
    return ok ? u.toString() : fallback;
  } catch {
    return fallback;
  }
}

export const FALLBACK_URL = FALLBACK;
