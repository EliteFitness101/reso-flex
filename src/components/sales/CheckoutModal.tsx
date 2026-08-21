import { useState } from "react";
import { type Product } from "@/data/products";
import { track } from "@/lib/track";

type Props = {
  product: Product;
  onClose: () => void;
  onPaid: (p: Product) => void;
};

// Production checkout is pinned to the verified live Supabase project.
// These are public client credentials; the Paystack secret remains server-side.
const SUPABASE_URL = "https://vbqjvmnhdtdhmeeudqnn.supabase.co";
const SUPABASE_KEY = "sb_publishable_fu_Y3KQipfuomFQyd3zNtA_rG9XpOfG";

export const CheckoutModal = ({ product, onClose }: Props) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return;

    const name = String(fd.get("name") || "").slice(0, 120);
    const email = String(fd.get("email") || "").slice(0, 255);
    const phone = String(fd.get("phone") || "").slice(0, 32);
    const address = String(fd.get("address") || "").slice(0, 255);

    track("checkout_start", {
      sku: product.sku,
      handle: product.handle,
      name: product.name,
      value: product.now,
      currency: "NGN",
      source: "checkout_modal_paystack",
    });

    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/paystack-init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          sku: product.sku,
          name,
          email,
          phone,
          address,
          origin: window.location.origin,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.authorization_url) {
        throw new Error(payload?.error || "payment_initialization_failed");
      }

      window.location.assign(payload.authorization_url);
    } catch (err) {
      console.error("Paystack checkout", err);
      setBusy(false);
      setError("Secure checkout could not be started. Please try again or use WhatsApp support.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-noir-950/85 p-4 backdrop-blur-md sm:items-center" onClick={onClose}>
      <div className="glass-panel w-full max-w-md border-gold/60 p-7 shadow-elevated animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Secure Paystack Checkout</div>
            <h3 className="mt-2 font-display text-lg font-bold leading-tight">{product.name}</h3>
            <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-foreground/45">SKU · {product.sku}</div>
          </div>
          <button onClick={onClose} className="text-foreground/50 hover:text-gold"><i className="fa-solid fa-xmark text-xl" /></button>
        </div>

        <div className="mt-5 flex items-end justify-between border border-gold/40 bg-noir-900/70 p-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">Total</span>
          <span className="font-display text-xl font-bold gold-text">{product.priceLabel}</span>
        </div>

        <form onSubmit={handleOrder} className="mt-5 space-y-3">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0" />
          <input required name="name" placeholder="Full name" maxLength={120} className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required type="email" name="email" placeholder="Email" maxLength={255} className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required name="phone" placeholder="WhatsApp / phone" maxLength={32} className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required name="address" placeholder="Delivery address" maxLength={255} className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />

          {error && <div className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

          <button disabled={busy} type="submit" className="luxury-button w-full py-3.5 text-[11px] disabled:cursor-wait disabled:opacity-60">
            <i className="fa-solid fa-lock mr-2" /> {busy ? "Opening Secure Checkout…" : "Pay Securely with Paystack"}
          </button>
          <p className="flex items-center justify-center gap-3 pt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            <i className="fa-solid fa-shield-halved" /> Payment verified server-side
          </p>
        </form>
      </div>
    </div>
  );
};
