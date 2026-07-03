import { type Product } from "@/data/products";
import { track } from "@/lib/track";
import { waUrl } from "@/lib/waScript";

type Props = {
  product: Product;
  onClose: () => void;
  onPaid: (p: Product) => void;
};

// NOTE: Payment confirmation MUST come from a verified Paystack webhook
// (server-side). This modal only initiates an order handoff to the sales
// team via WhatsApp — it never marks an order as paid on the client.
export const CheckoutModal = ({ product, onClose }: Props) => {
  const handleOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // honeypot

    const name = String(fd.get("name") || "").slice(0, 120);
    const email = String(fd.get("email") || "").slice(0, 255);
    const phone = String(fd.get("phone") || "").slice(0, 20);
    const address = String(fd.get("address") || "").slice(0, 255);

    track("checkout_start", {
      sku: product.sku,
      handle: product.handle,
      name: product.name,
      value: product.now,
      currency: "NGN",
      source: "checkout_modal",
    });

    const message =
      `Hi ResoFlex — I'd like to order ${product.name} (${product.priceLabel}).\n\n` +
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDelivery: ${address}\n` +
      `SKU: ${product.sku}\n\nPlease send the secure Paystack link to complete payment.`;

    const url = waUrl({ override: message, source: `checkout_${product.sku}` });
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-noir-950/85 p-4 backdrop-blur-md sm:items-center" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md border-gold/60 p-7 shadow-elevated animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Request Secure Checkout</div>
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

          <input required name="name" placeholder="Full name" maxLength={120}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required type="email" name="email" placeholder="Email" maxLength={255}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required name="phone" placeholder="WhatsApp / phone" maxLength={20}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required name="address" placeholder="Delivery address" maxLength={255}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />

          <button type="submit" className="luxury-button w-full py-3.5 text-[11px]">
            <i className="fa-brands fa-whatsapp mr-2" /> Get Secure Paystack Link
          </button>
          <p className="flex items-center justify-center gap-3 pt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            <i className="fa-solid fa-shield-halved" /> Order confirmed only after payment
          </p>
        </form>
      </div>
    </div>
  );
};
