import { useEffect, useRef } from "react";
import { BUNDLES, type Bundle } from "@/data/bundles";
import { withAttribution } from "@/lib/attribution";
import { track } from "@/lib/track";

const CATS: { key: Bundle["category"]; label: string }[] = [
  { key: "meal", label: "Meal Plans" },
  { key: "supplement", label: "Supplements" },
  { key: "training", label: "Training Packs" },
];

function BundleCard({ b }: { b: Bundle }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            track("bundle_view", { sku: b.sku, name: b.name, category: b.category, price: b.now });
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [b.sku, b.name, b.category, b.now]);

  const onBuy = () => {
    track("checkout_start", { sku: b.sku, name: b.name, category: b.category, price: b.now, source: "bundle_grid" });
  };

  return (
    <article
      ref={ref}
      className="group relative flex flex-col border border-border/70 bg-noir-900/70 p-5 shadow-elevated transition hover:border-gold/60"
    >
      {b.popular && (
        <div className="absolute -top-2 right-4 bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-noir-950">
          Popular
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border border-gold/40 bg-noir-950 text-gold">
          <i className={`fa-solid ${b.icon}`} />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-sm font-bold leading-tight">{b.name}</h3>
          <p className="mt-0.5 text-[11px] text-foreground/60">{b.tagline}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-[11px] text-foreground/70">
        {b.features.map((f) => (
          <li key={f} className="flex gap-2">
            <i className="fa-solid fa-check mt-0.5 text-gold/80" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-3">
        <div>
          {b.was && (
            <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/45 line-through">
              {"NGN " + b.was.toLocaleString("en-NG")}
            </div>
          )}
          <div className="font-display text-base font-bold gold-text">{b.priceLabel}</div>
        </div>
        <a
          href={withAttribution(b.paystackUrl)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onBuy}
          className="luxury-button px-4 py-2 text-[10px]"
        >
          <i className="fa-solid fa-lock mr-1.5" /> Buy
        </a>
      </div>
      <div className="mt-2 text-[9px] uppercase tracking-[0.25em] text-foreground/40">SKU · {b.sku}</div>
    </article>
  );
}

export const BundleGrid = () => {
  return (
    <section id="bundles" className="relative py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <div className="text-[10px] uppercase tracking-[0.35em] text-gold">// Store · Bundles</div>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Meal Plans · Supplements · Training</h2>
          <p className="mt-3 text-sm text-foreground/60">
            Curated bundles engineered to accelerate outcomes. Pay via Paystack — escrow & delivery included.
          </p>
        </div>

        {CATS.map((c) => (
          <div key={c.key} className="mb-12 last:mb-0">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gold/20" />
              <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">{c.label}</div>
              <div className="h-px flex-1 bg-gold/20" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BUNDLES.filter((b) => b.category === c.key).map((b) => (
                <BundleCard key={b.id} b={b} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
