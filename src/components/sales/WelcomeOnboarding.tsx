import { NGN, type Product } from "@/data/products";

const UPSELLS = [
  { id: "support", name: "Premium White-Glove Support", price: 45000, icon: "fa-headset", d: "24/7 priority technician hotline." },
  { id: "warranty", name: "Extended 4-Year Warranty", price: 89000, icon: "fa-shield-halved", d: "Double your coverage. Total peace of mind." },
  { id: "accessories", name: "Elite Accessory Bundle", price: 35000, icon: "fa-box", d: "Heart-rate strap, mat, towel, water bottle." },
  { id: "plans", name: "Digital Coach Fitness Plans", price: 25000, icon: "fa-dumbbell", d: "12-week transformation programs." },
];

type Props = { product: Product; onClose: () => void };

export const WelcomeOnboarding = ({ product, onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-noir-950/85 p-4 backdrop-blur-md sm:items-center">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border-gold/60 p-8 shadow-elevated animate-fade-up">
        <div className="text-center">
          <span className="grid mx-auto h-16 w-16 place-items-center rounded-full bg-gradient-gold text-noir-900 shadow-gold-strong">
            <i className="fa-solid fa-check text-2xl" />
          </span>
          <div className="mt-5 text-[10px] uppercase tracking-[0.35em] text-gold">Welcome to the Elite Circle</div>
          <h3 className="mt-2 font-display text-3xl font-bold">Your Order is Confirmed</h3>
          <p className="mt-2 text-sm text-foreground/65">
            {product.name} — {product.priceLabel}. A welcome email is on its way with delivery & onboarding details.
          </p>
        </div>

        <div className="luxury-divider my-7" />

        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Exclusive Member Upgrades</div>
          <h4 className="mt-2 font-display text-xl font-bold">One-Time Offer — Add to Your Order</h4>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {UPSELLS.map((u) => (
            <button key={u.id}
              className="glass-panel flex items-start gap-3 rounded-xl p-4 text-left transition hover:border-gold/60">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-noir-700 text-gold border border-gold/30">
                <i className={`fa-solid ${u.icon}`} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm">{u.name}</div>
                <div className="text-xs text-foreground/55">{u.d}</div>
                <div className="mt-1.5 text-sm font-bold gold-text">+ {NGN(u.price)}</div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={onClose} className="luxury-button mt-6 w-full rounded-xl py-3.5 text-sm">
          Complete Onboarding <i className="fa-solid fa-arrow-right ml-2" />
        </button>
      </div>
    </div>
  );
};
