import { NGN, PRODUCTS, type Product } from "@/data/products";

type Props = { onBuy: (p: Product) => void };

export const ProductGrid = ({ onBuy }: Props) => {
  return (
    <section id="products" className="relative py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.35em] text-gold">The Collection</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Elite <span className="gold-text">Fitness Infrastructure</span>
          </h2>
          <p className="mt-4 text-foreground/65">
            Every unit ships with launch discount automatically applied. Use code{" "}
            <span className="font-mono text-gold">RESO22</span> at checkout.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => {
            const discount = Math.round((1 - p.now / p.was) * 100);
            return (
              <article
                key={p.id}
                className={`relative flex flex-col rounded-2xl p-7 transition duration-500 hover:-translate-y-2 ${
                  p.popular
                    ? "gold-border-glow bg-gradient-to-b from-noir-800 to-noir-900 animate-glow-pulse"
                    : "glass-panel hover:border-gold/60"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-gold px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-noir-900 shadow-gold">
                    <i className="fa-solid fa-crown mr-1.5" /> Most Popular
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-noir-700 text-gold border border-gold/30">
                    <i className={`fa-solid ${p.icon} text-lg`} />
                  </span>
                  <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                    -{discount}% Off
                  </span>
                </div>

                <h3 className="mt-5 font-display text-xl font-bold leading-tight">{p.name}</h3>
                <p className="mt-1.5 text-sm text-foreground/55">{p.tagline}</p>

                <ul className="mt-5 space-y-2 text-sm text-foreground/75">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <i className="fa-solid fa-check mt-1 text-gold text-xs" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-end gap-3">
                  <div className="font-display text-3xl font-bold gold-text">{NGN(p.now)}</div>
                  <div className="mb-1 text-sm text-foreground/40 line-through">{NGN(p.was)}</div>
                </div>

                <button
                  onClick={() => onBuy(p)}
                  className="luxury-button mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm"
                >
                  <i className="fa-solid fa-lock" /> Secure Checkout
                </button>
                <a
                  href={`https://wa.me/2348000000000?text=I%20want%20to%20order%20${encodeURIComponent(p.name)}`}
                  target="_blank" rel="noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 px-5 py-3 text-sm text-gold hover:bg-noir-700"
                >
                  <i className="fa-brands fa-whatsapp" /> Order via WhatsApp
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
