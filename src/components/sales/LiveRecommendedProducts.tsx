import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import { getLiveProducts } from "@/lib/liveCatalog";
import { withAttribution } from "@/lib/attribution";
import { track } from "@/lib/track";

const RECOMMENDED_HANDLES = [
  "25-steel-boned-latex-waist-shaper",
  "res-dig-reset",
  "fitness-evolution",
];

export function LiveRecommendedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getLiveProducts(250)
      .then((catalog) => {
        if (!active) return;
        const byHandle = new Map(catalog.map((product) => [product.handle, product]));
        const selected = RECOMMENDED_HANDLES
          .map((handle) => byHandle.get(handle))
          .filter((product): product is Product =>
            Boolean(product && product.now > 0 && product.features.includes("Available now")),
          );
        setProducts(selected);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <section id="live-recommendations" className="border-y border-gold/20 bg-noir-900/70 py-16" aria-label="Live recommended ResoFlex products">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">Live catalogue · Paystack checkout</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">RECOMMENDED <span className="gold-text">FOR YOUR NEXT MOVE</span></h2>
          <p className="mt-3 text-sm leading-6 text-foreground/60">Published ResoFit products with live catalogue pricing and a verified checkout route.</p>
        </div>

        {loading ? (
          <div className="mt-10 rounded-2xl border border-gold/20 p-8 text-center text-sm text-foreground/50">Loading live recommendations…</div>
        ) : products.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {products.map((product) => {
              const href = withAttribution(`/product/${product.handle}`);
              return (
                <article key={product.handle} data-testid="live-recommended-product" data-sku={product.sku} className="glass-panel flex flex-col overflow-hidden border border-gold/20">
                  <a href={href} onClick={() => track("discovery_product_click", { sku: product.sku, handle: product.handle, module: "live_recommendations" })} className="block aspect-[4/3] overflow-hidden bg-noir-950">
                    <img src={product.image} alt={product.name} width={900} height={675} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  </a>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-gold/70">SKU · {product.sku}</p>
                    <h3 className="mt-2 font-display text-lg font-bold leading-tight">{product.name}</h3>
                    <p className="mt-2 text-xs leading-5 text-foreground/55">{product.tagline}</p>
                    <p className="mt-auto pt-5 text-xl font-bold gold-text">{product.priceLabel}</p>
                    <a href={href} onClick={() => track("product_detail_click", { sku: product.sku, handle: product.handle, module: "live_recommendations" })} className="luxury-button mt-4 inline-flex w-full items-center justify-center px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">View product & secure checkout</a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-gold/20 p-8 text-center text-sm text-foreground/55">
            Live recommendations are temporarily unavailable. Browse the published catalogue or contact the ResoFlex advisor.
            <a href="/shop" className="mt-3 inline-block text-gold underline">Browse the shop</a>
          </div>
        )}
      </div>
    </section>
  );
}
