import { useMemo } from "react";
import { IMAGEKIT_STORE_PRODUCTS } from "@/data/imagekitProducts";
import { track } from "@/lib/track";

const PRODUCT_URL = (slug: string) => `/product/${slug}`;

type CardProps = { title: string; items: typeof IMAGEKIT_STORE_PRODUCTS };

function ProductRail({ title, items }: CardProps) {
  return (
    <section className="border-t border-border/40 py-10" aria-label={title}>
      <div className="container">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-bold md:text-2xl">{title}</h2>
          <a href="#products" className="text-[10px] uppercase tracking-[0.2em] text-gold">Shop all</a>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((p) => (
            <a key={p.sku} href={PRODUCT_URL(p.handle)} onClick={() => track("discovery_product_click", { sku: p.sku, handle: p.handle, module: title })} className="glass-panel min-w-[220px] max-w-[250px] shrink-0 snap-start overflow-hidden transition hover:-translate-y-1 hover:border-gold/50">
              <img src={p.image} alt={p.name} width={469} height={384} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <div className="line-clamp-2 text-sm font-semibold">{p.name}</div>
                <div className="mt-2 text-sm font-bold text-gold">{p.priceLabel}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StoreDiscovery() {
  const products = IMAGEKIT_STORE_PRODUCTS;
  const featured = useMemo(() => products.filter(p => p.popular).slice(0, 8), [products]);
  const recommended = useMemo(() => products.slice(0, 8), [products]);
  const frequentlyBought = useMemo(() => products.filter((_, i) => i % 3 !== 1).slice(0, 8), [products]);
  const recentlyBought = useMemo(() => [...products].reverse().slice(0, 8), [products]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => map.set(p.category || "Fitness", (map.get(p.category || "Fitness") || 0) + 1));
    return [...map.entries()];
  }, [products]);

  return (
    <>
      <div id="featured"><ProductRail title="Featured now" items={featured.length ? featured : products.slice(0, 8)} /></div>
      <ProductRail title="Frequently bought" items={frequentlyBought} />
      <ProductRail title="Recommended for you" items={recommended} />
      <ProductRail title="Recently added" items={recentlyBought} />
      <section className="border-t border-border/40 py-10" aria-label="Product categories">
        <div className="container">
          <h2 className="font-display text-xl font-bold md:text-2xl">Shop by category</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map(([category, count]) => (
              <a key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="glass-panel p-4 transition hover:border-gold/50">
                <div className="text-sm font-semibold">{category}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-foreground/45">{count} products</div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-border/40 py-10" aria-label="Community and referrals">
        <div className="container grid gap-4 md:grid-cols-3">
          <div className="glass-panel p-6"><div className="text-[10px] uppercase tracking-[0.25em] text-gold">Community</div><h2 className="mt-2 font-display text-xl font-bold">Train. Share. Grow.</h2><p className="mt-2 text-sm text-foreground/60">Join the ResoFlex community and share your progress.</p><a href="/chatb2k" className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.15em] text-gold">Meet ChatB2K →</a></div>
          <div className="glass-panel p-6"><div className="text-[10px] uppercase tracking-[0.25em] text-gold">Refer & Earn</div><h2 className="mt-2 font-display text-xl font-bold">Earn from your network.</h2><p className="mt-2 text-sm text-foreground/60">Recommend products you believe in and participate in the reseller program.</p><a href="#reseller" className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.15em] text-gold">Become a reseller →</a></div>
          <div className="glass-panel p-6"><div className="text-[10px] uppercase tracking-[0.25em] text-gold">Testimonials</div><h2 className="mt-2 font-display text-xl font-bold">Real people. Real journeys.</h2><p className="mt-2 text-sm text-foreground/60">See social proof, customer stories and verified purchase signals below.</p><a href="#social-proof" className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.15em] text-gold">See proof →</a></div>
        </div>
      </section>
    </>
  );
}
