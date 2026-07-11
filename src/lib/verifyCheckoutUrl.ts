// verifyCheckoutUrl — single shared validator for outbound checkout redirects.
// Whitelists Paystack production domains only. Rejects everything else.

const CHECKOUT_HOSTS = [
  "paystack.com",
  "checkout.paystack.com",
  "paystack.shop",
];

export function verifyCheckoutUrl(input?: string | null): string | null {
  if (!input) return null;
  try {
    const u = new URL(input);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    const ok = CHECKOUT_HOSTS.some((h) => host === h || host.endsWith("." + h));
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

export const CHECKOUT_ALLOWED_HOSTS = CHECKOUT_HOSTS;
