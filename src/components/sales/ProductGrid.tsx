import { useEffect, useRef } from "react";
import { NGN, PRODUCTS, type Product } from "@/data/products";
import { waUrl } from "@/lib/waScript";
import { bumpIntent, lockFunnel, setLastProduct } from "@/lib/funnelLock";
import { track } from "@/lib/track";

type Props = { onBuy: (p: Product) => void };

export const ProductGrid = ({ onBuy }: Props) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const sku = el.dataset.sku;
          const handle = el.dataset.handle;
          if (!sku || seen.has(sku)) continue;
          seen.add(sku);
          track("product_view", { sku, handle });
        }
      },
      { threshold: 0.4 }
    );
    root.querySelectorAll<HTMLElement>("[data-sku]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);


  return (
    <section id="products" className="relative py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-gold">// The Collection</div>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
            ELITE <span className="gold-text">FITNESS INFRASTRUCTURE</span>
          </h2>
          <p className="mt-5 text-sm text-foreground/65">
            Static catalog · NGN pricing · SKU-mapped to live payment rails.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {PRODUCTS.map((p) => {
            const discount = p.was > p.now ? Math.round((1 - p.now / p.was) * 100) : 0;
            return (
              <article
                key={p.id}
                data-handle={p.handle}
                data-sku={p.sku}
                className={`relative flex flex-col overflow-hidden transition duration-500 hover:-translate-y-1 ${
                  p.popular
                    ? "gold-border-glow bg-gradient-to-b from-noir-800 to-noir-900 animate-glow-pulse"
                    : "glass-panel hover:border-gold/60"
                }`}
              >
                {p.popular && (
                  <span className="absolute top-3 left-1/2 z-20 -translate-x-1/2 bg-gradient-gold px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-noir-900 shadow-gold">
                    ★ Most Popular
                  </span>
                )}
                {p.free && (
                  <span className="absolute top-3 right-3 z-20 border border-gold/60 bg-noir-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                    Bonus
                  </span>
                )}

                <div className="relative aspect-[4/3] overflow-hidden bg-noir-900">
                  <img
                    src={p.image}
                    alt={p.name}
                    width={1024}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-noir-900/20 to-transparent" />
                  {/* Laser-etched brand overlay */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-2 right-3 select-none font-display text-2xl font-black uppercase tracking-[0.2em] text-foreground/[0.07] mix-blend-overlay"
                    style={{ WebkitTextStroke: "0.5px hsl(var(--gold) / 0.3)" }}
                  >
                    Reso22
                  </span>
                  {discount > 0 && (
                    <span className="absolute bottom-3 right-3 border border-destructive/50 bg-noir-950/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive backdrop-blur">
                      -{discount}%
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/45">
                    SKU · {p.sku}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold leading-tight">{p.name}</h3>
                  <p className="mt-1.5 text-xs text-foreground/55">{p.tagline}</p>

                  <ul className="mt-4 space-y-1.5 text-xs text-foreground/75">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 bg-gold" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-5">
                    <div className="flex items-end gap-3">
                      <div className="font-display text-xl font-bold gold-text">{p.priceLabel}</div>
                      {discount > 0 && (
                        <div className="mb-1 text-xs text-foreground/40 line-through">{NGN(p.was)}</div>
                      )}
                    </div>

                    {p.free ? (
                      <div className="mt-5 border border-gold/40 px-4 py-3 text-center text-[11px] uppercase tracking-[0.25em] text-gold/90">
                        Auto-unlocked at checkout
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setLastProduct(p.sku);
                            bumpIntent(15, `buy_${p.sku}`);
                            lockFunnel("offer", `buy_${p.sku}`, "medium");
                            onBuy(p);
                          }}
                          className="luxury-button mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-[11px]"
                        >
                          <i className="fa-solid fa-lock" /> Secure Checkout
                        </button>
                        <a
                          href={waUrl({ source: `pg_${p.sku}`, override: `Hi ResoFlex — I want to order ${p.name} (${p.sku}). Please confirm stock and delivery.` })}
                          target="_blank" rel="noreferrer"
                          onClick={() => { setLastProduct(p.sku); bumpIntent(8, `wa_${p.sku}`); lockFunnel("whatsapp", `pg_${p.sku}`, "soft"); }}
                          className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-gold/30 px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-gold hover:bg-noir-700"
                        >
                          <i className="fa-brands fa-whatsapp" /> WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
