import { NGN, type Product } from "@/data/products";

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
    // TODO: Initialize Paystack
    // Uses import.meta.env.VITE_PAYSTACK_PUBLIC_KEY (placeholder)
    // const handler = (window as any).PaystackPop?.setup({ ... })
    // handler.openIframe()
    // For now: simulate success + trigger conversion event
    (window as any).dataLayer?.push({ event: "purchase", value: product.now, currency: "NGN", item: product.name });
    setTimeout(() => onPaid(product), 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-noir-950/80 p-4 backdrop-blur-md sm:items-center" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md rounded-2xl border-gold/50 p-7 shadow-elevated animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Secure Checkout</div>
            <h3 className="mt-1 font-display text-xl font-bold leading-tight">{product.name}</h3>
          </div>
          <button onClick={onClose} className="text-foreground/50 hover:text-gold"><i className="fa-solid fa-xmark text-xl" /></button>
        </div>
        <div className="mt-4 flex items-end justify-between rounded-xl border border-gold/30 bg-noir-900/60 p-4">
          <span className="text-xs text-foreground/60">Total (RESO22 applied)</span>
          <span className="font-display text-2xl font-bold gold-text">{NGN(product.now)}</span>
        </div>

        <form onSubmit={handlePay} className="mt-5 space-y-3">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0" />
          <input required name="name" placeholder="Full name" maxLength={120}
            className="w-full rounded-xl border border-border bg-noir-900/60 px-4 py-3 text-sm outline-none focus:border-gold/60" />
          <input required type="email" name="email" placeholder="Email" maxLength={255}
            className="w-full rounded-xl border border-border bg-noir-900/60 px-4 py-3 text-sm outline-none focus:border-gold/60" />
          <input required name="phone" placeholder="WhatsApp / phone" maxLength={20}
            className="w-full rounded-xl border border-border bg-noir-900/60 px-4 py-3 text-sm outline-none focus:border-gold/60" />
          <input required name="address" placeholder="Delivery address" maxLength={255}
            className="w-full rounded-xl border border-border bg-noir-900/60 px-4 py-3 text-sm outline-none focus:border-gold/60" />

          <button type="submit" className="luxury-button w-full rounded-xl py-3.5 text-sm">
            <i className="fa-solid fa-lock mr-2" /> Pay with Paystack
          </button>
          <p className="flex items-center justify-center gap-3 pt-1 text-[11px] text-foreground/50">
            <i className="fa-solid fa-shield-halved" /> 256-bit SSL · Verified by Paystack
          </p>
        </form>
      </div>
    </div>
  );
};
