import { useEffect, useRef } from "react";
import { IMAGEKIT_STORE_PRODUCTS } from "@/data/imagekitProducts";
import { type Product } from "@/data/products";
import { waUrl } from "@/lib/waScript";
import { bumpIntent, lockFunnel, setLastProduct } from "@/lib/funnelLock";
import { track } from "@/lib/track";

type Props = { onBuy: (p: Product) => void };

export const ImageKitProductGrid = ({ onBuy }: Props) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const seen = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const sku = el.dataset.sku;
        if (!sku || seen.has(sku)) continue;
        seen.add(sku);
        track("product_view", { sku, handle: el.dataset.handle, source: "imagekit_catalog" });
      }
    }, { threshold: 0.35 });
    root.querySelectorAll<HTMLElement>("[data-sku]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="imagekit-catalog" className="relative border-t border-border/40 py-24">
      <div className="container" ref={rootRef}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-gold">// Verified Production Catalog</div>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
            RESOFLEX <span className="gold-text">IMAGEKIT COLLECTION</span>
          </h2>
          <p className="mt-5 text-sm text-foreground/65">Master-catalog pricing and SKU metadata paired with verified ImageKit production media.</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {IMAGEKIT_STORE_PRODUCTS.map((p) => (
            <article key={p.sku} data-sku={p.sku} data-handle={p.handle} className="glass-panel flex flex-col overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-gold/60">
              <div className="relative aspect-[4/3] overflow-hidden bg-noir-900">
                <img src={p.image} alt={`${p.name} — ${p.sku}`} width={512} height={512} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 border border-gold/40 bg-noir-950/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold">ImageKit Verified</span>
                {p.popular && <span className="absolute right-3 top-3 bg-gradient-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-noir-900">Featured</span>}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/45">SKU · {p.sku}</div>
                <h3 className="mt-2 font-display text-base font-bold leading-tight">{p.name}</h3>
                <p className="mt-1.5 text-xs text-foreground/55">{p.tagline}</p>
                <ul className="mt-4 space-y-1.5 text-[11px] text-foreground/70">
                  {p.features.slice(0, 4).map((feature) => <li key={feature} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 bg-gold" /><span>{feature}</span></li>)}
                </ul>

                <div className="mt-auto pt-5">
                  <div className="font-display text-xl font-bold gold-text">{p.priceLabel}</div>
                  <button onClick={() => { setLastProduct(p.sku); bumpIntent(15, `buy_${p.sku}`); lockFunnel("offer", `buy_${p.sku}`, "medium"); track("checkout_start", { sku: p.sku, handle: p.handle, name: p.name, price: p.now, source: "imagekit_catalog" }); onBuy(p); }} className="luxury-button mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-[11px]"><i className="fa-solid fa-lock" /> Secure Checkout</button>
                  <a href={waUrl({ source: `ik_${p.sku}`, override: `Hi ResoFlex — I want to order ${p.name} (${p.sku}). Please confirm stock and delivery.` })} target="_blank" rel="noreferrer" onClick={() => { setLastProduct(p.sku); bumpIntent(8, `wa_${p.sku}`); lockFunnel("whatsapp", `ik_${p.sku}`, "soft"); }} className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-gold/30 px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-gold hover:bg-noir-700"><i className="fa-brands fa-whatsapp" /> WhatsApp</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
