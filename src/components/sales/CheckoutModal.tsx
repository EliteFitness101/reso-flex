import { type Product } from "@/data/products";
import { track } from "@/lib/track";
import { getAttribution } from "@/lib/attribution";

type Props = {
  product: Product;
  onClose: () => void;
  onPaid: (p: Product) => void;
};

export const CheckoutModal = ({ product, onClose, onPaid }: Props) => {
  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // honeypot

    // Build payment payload with custom metadata for live rails mapping
    const payload = {
      amount: product.now * 100, // kobo
      currency: "NGN",
      email: fd.get("email"),
      metadata: {
        handle: product.handle,
        sku: product.sku,
        product_name: product.name,
        custom_fields: [
          {
            display_name: "Variant SKU",
            variable_name: "variant_sku",
            value: product.sku,
          },
          {
            display_name: "Product Handle",
            variable_name: "product_handle",
            value: product.handle,
          },
        ],
      },
    };

    // TODO: Initialize Paystack with payload above (variant_sku passes through to webhook)
    (window as any).dataLayer?.push({
      event: "purchase",
      value: product.now,
      currency: "NGN",
      item: product.name,
      sku: product.sku,
      handle: product.handle,
    });
    console.info("[Checkout] payload", payload);
    setTimeout(() => onPaid(product), 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-noir-950/85 p-4 backdrop-blur-md sm:items-center" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md border-gold/60 p-7 shadow-elevated animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Secure Checkout</div>
            <h3 className="mt-2 font-display text-lg font-bold leading-tight">{product.name}</h3>
            <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-foreground/45">SKU · {product.sku}</div>
          </div>
          <button onClick={onClose} className="text-foreground/50 hover:text-gold"><i className="fa-solid fa-xmark text-xl" /></button>
        </div>

        <div className="mt-5 flex items-end justify-between border border-gold/40 bg-noir-900/70 p-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">Total</span>
          <span className="font-display text-xl font-bold gold-text">{product.priceLabel}</span>
        </div>

        <form onSubmit={handlePay} className="mt-5 space-y-3">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0" />
          <input type="hidden" name="variant_sku" value={product.sku} />
          <input type="hidden" name="product_handle" value={product.handle} />

          <input required name="name" placeholder="Full name" maxLength={120}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required type="email" name="email" placeholder="Email" maxLength={255}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required name="phone" placeholder="WhatsApp / phone" maxLength={20}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />
          <input required name="address" placeholder="Delivery address" maxLength={255}
            className="w-full border border-border bg-noir-900/70 px-4 py-3 text-sm outline-none focus:border-gold/70" />

          <button type="submit" className="luxury-button w-full py-3.5 text-[11px]">
            <i className="fa-solid fa-lock mr-2" /> Pay with Paystack
          </button>
          <p className="flex items-center justify-center gap-3 pt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
            <i className="fa-solid fa-shield-halved" /> 256-bit SSL · Variant SKU mapped
          </p>
        </form>
      </div>
    </div>
  );
};
