import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PRODUCTS, type Product } from "@/data/products";
import WishlistButton from "@/components/commerce/WishlistButton";
import { getRecentlyBought, getWishlist } from "@/lib/wishlist";
import { getLiveProducts } from "@/lib/liveCatalog";

const COLLECTIONS: Record<string, { title: string; description: string; match: (p: Product) => boolean }> = {
  digital: { title: "Digital", description: "Instant programs, plans, coaching and downloadable wellness intelligence.", match: p => /digital|coaching|blueprint|meal|workout|program|ebook|course|membership|reset/i.test(`${p.name} ${p.tagline} ${p.sku}`) },
  physical: { title: "Physical", description: "Premium physical products built for training, recovery and everyday performance.", match: p => !/digital|coaching|blueprint|meal|workout|program|ebook|course|membership/i.test(`${p.name} ${p.tagline} ${p.sku}`) },
  "digital-plus-physical": { title: "Digital + Physical", description: "Complete systems pairing physical products with digital guidance.", match: p => /bundle|kit|system|duo|complete/i.test(`${p.name} ${p.tagline}`) },
  bundles: { title: "Bundles", description: "Curated combinations designed to increase value and reduce decision fatigue.", match: p => /bundle|duo|complete|system|kit|package/i.test(`${p.name} ${p.tagline}`) },
  students: { title: "Student Packages", description: "Accessible fitness, wellness and learning packages for students and young professionals.", match: p => /student|starter|entry|campus|young professional/i.test(`${p.name} ${p.tagline} ${p.sku}`) },
  corporate: { title: "Corporate", description: "Workplace wellness, team performance and scalable employee packages.", match: p => /corporate|office|workplace|team|company|employee|enterprise/i.test(`${p.name} ${p.tagline}`) },
  "body-enhancement": { title: "Body Enhancement", description: "Goal-led body-shaping, curve, mobility and performance collections.", match: p => /curve|glute|sculpt|lift|body|shape|metabolic|enhancement/i.test(`${p.name} ${p.tagline}`) },
  men: { title: "Men's Collection", description: "Training, strength, recovery and performance selections for men.", match: p => /men|male|gentleman|for him/i.test(`${p.name} ${p.tagline}`) },
  apparel: { title: "Apparel", description: "ResoFlex training and lifestyle apparel.", match: p => /apparel|shirt|short|legging|wear|hoodie|top|bra|jogger|clothing/i.test(`${p.name} ${p.tagline} ${p.sku}`) },
  supplements: { title: "Supplements", description: "Nutrition-support products and wellness essentials.", match: p => /supplement|protein|creatine|vitamin|nutrition|collagen|powder/i.test(`${p.name} ${p.tagline} ${p.sku}`) },
  equipment: { title: "Equipment", description: "Training equipment for home, studio and professional use.", match: p => /equipment|dumbbell|barbell|rack|bike|bench|plate|kettlebell|resistance|machine/i.test(`${p.name} ${p.tagline} ${p.sku}`) },
  "heavy-equipment": { title: "Heavy Equipment", description: "Commercial-grade infrastructure for gyms, hotels and high-volume facilities.", match: p => /treadmill|elliptical|smith|cable|rack|commercial|heavy|station|bike|multi gym/i.test(`${p.name} ${p.tagline}`) },
  featured: { title: "Featured", description: "Products carrying the strongest current merchandising signal.", match: p => Boolean(p.popular) || /elite|pro|premium|signature/i.test(p.name) },
  "frequently-bought": { title: "Frequently Bought", description: "High-intent products surfaced for complementary purchasing and bundles.", match: p => Boolean(p.popular) || /duo|kit|bundle|core|pro|elite/i.test(p.name) },
  "recently-bought": { title: "Recently Bought", description: "Your recently purchased items, when available on this device.", match: p => getRecentlyBought().some(x => x.sku === p.sku) },
};

function Card({ p }: { p: Product }) {
  return <article className="relative overflow-hidden rounded-2xl border border-gold/15 bg-noir-900/70 shadow-xl transition hover:-translate-y-1 hover:border-gold/50">
    <div className="relative aspect-[4/3] overflow-hidden bg-noir-950"><img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" decoding="async" onError={e => { e.currentTarget.style.opacity = "0"; }} /><div className="absolute inset-0 bg-gradient-to-t from-noir-950/90 to-transparent" /><div className="absolute right-3 top-3"><WishlistButton sku={p.sku} handle={p.handle} name={p.name} image={p.image} price={p.now} /></div></div>
    <div className="p-5"><div className="text-[9px] uppercase tracking-[.24em] text-gold/60">{p.sku}</div><h2 className="mt-2 font-display text-lg font-bold">{p.name}</h2><p className="mt-2 line-clamp-2 text-xs text-foreground/55">{p.tagline}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="font-display text-lg font-bold text-gold">{p.priceLabel}</span><Link to={`/product/${p.handle}`} className="rounded-full border border-gold/35 px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-gold hover:bg-gold hover:text-noir-950">View</Link></div></div>
  </article>;
}

export default function CollectionsPage() {
  const { collection = "featured" } = useParams();
  const [refresh, setRefresh] = useState(0);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  useEffect(() => { getLiveProducts(250).then(setLiveProducts).catch(() => setLiveProducts([])); const f = () => setRefresh(x => x + 1); window.addEventListener("resoflex:commerce-state", f); return () => window.removeEventListener("resoflex:commerce-state", f); }, []);
  const config = COLLECTIONS[collection] || COLLECTIONS.featured;
  const catalog = useMemo(() => { const merged = new Map<string, Product>(); [...PRODUCTS, ...liveProducts].forEach(p => merged.set(p.sku, p)); return [...merged.values()]; }, [liveProducts]);
  const products = useMemo(() => catalog.filter(config.match), [catalog, config, refresh]);
  const wishlist = getWishlist();
  const wishlistProducts = wishlist.map(w => catalog.find(p => p.sku === w.sku)).filter(Boolean) as Product[];
  const isWishlist = collection === "wishlist";
  const visible = isWishlist ? wishlistProducts : products;
  const title = isWishlist ? "Wishlist" : config.title;
  const description = isWishlist ? "Your private saved collection. Tap the heart on any product to save it here." : config.description;
  return <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 md:py-16"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-6"><div><div className="text-[10px] uppercase tracking-[.35em] text-gold">ResoFlex Signature Commerce</div><h1 className="mt-3 font-display text-4xl font-bold md:text-6xl">{title}</h1><p className="mt-4 max-w-2xl text-sm text-foreground/60">{description}</p></div><Link to="/shop" className="rounded-full border border-gold/30 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-gold">All Collections</Link></div>
    <div className="mt-10 flex flex-wrap gap-2">{Object.entries(COLLECTIONS).map(([key, value]) => <Link key={key} to={`/collections/${key}`} className={`rounded-full border px-3 py-2 text-[9px] uppercase tracking-[.16em] ${key === collection ? "border-gold bg-gold text-noir-950" : "border-gold/20 text-foreground/60 hover:border-gold/50 hover:text-gold"}`}>{value.title}</Link>)}<Link to="/wishlist" className="rounded-full border border-gold/30 px-3 py-2 text-[9px] uppercase tracking-[.16em] text-gold">♡ Wishlist {wishlist.length ? `(${wishlist.length})` : ""}</Link></div>
    {visible.length ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map(p => <Card key={p.sku} p={p} />)}</div> : <div className="mt-12 rounded-3xl border border-gold/15 bg-noir-900/60 p-12 text-center"><div className="text-3xl">♡</div><h2 className="mt-4 font-display text-2xl font-bold">Nothing here yet</h2><p className="mx-auto mt-2 max-w-md text-sm text-foreground/55">ChatB2K™ can source the closest legitimate match when a direct catalog match is unavailable.</p><Link to="/chatb2k" className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[.16em] text-noir-950">Ask ChatB2K™</Link></div>}
  </div></main>;
}
