// ============================================================
// PRODUCTION CATALOG FALLBACK (Phase 4)
// Runtime priority: Supabase → catalog cache → THIS FILE.
// This module NEVER becomes the primary catalog. It is a pure,
// dependency-free projection over the existing production
// registries (src/data/products.ts + src/data/bundles.ts) so the
// storefront keeps working when the DB/cache is unavailable.
// ============================================================

import { PRODUCTS as STATIC_PRODUCTS, type Product as StaticProduct } from "@/data/products";
import { BUNDLES, suggestBundlesFor, type Bundle } from "@/data/bundles";

export type Product = {
  id: string;
  sku: string;
  slug: string;
  handle: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  priceLabel: string;
  currency: "NGN";
  category: string;
  collections: string[];
  image: string | null;
  gallery: string[];
  variants: { sku: string; title: string; price: number }[];
  features: string[];
  free: boolean;
  featured: boolean;
  /** Metadata carried into checkout / sync / assistant / SEO. */
  shopify: { productId: string | null; handle: string };
  paystack: { variant_sku: string; amountMinor: number; checkoutUrl: string | null };
  chatb2k: { enabled: boolean; priority: number; goals: string[] };
  seo: { title: string; description: string; image: string | null; path: string };
};

function fromStatic(p: StaticProduct): Product {
  const path = `/product/${p.handle}`;
  return {
    id: p.id,
    sku: p.sku,
    slug: p.handle,
    handle: p.handle,
    name: p.name,
    tagline: p.tagline,
    description: p.tagline,
    price: p.now,
    compareAtPrice: p.was !== p.now ? p.was : undefined,
    priceLabel: p.priceLabel,
    currency: "NGN",
    category: p.sku.startsWith("B2K") ? "digital-program" : "equipment",
    collections: [
      p.popular ? "BEST_SELLERS" : null,
      p.sku.startsWith("B2K") ? "DIGITAL_PROGRAMS" : "HOME_GYM_ESSENTIALS",
      "CHATB2K_RECOMMENDED",
    ].filter(Boolean) as string[],
    image: p.image ?? null,
    gallery: p.image ? [p.image] : [],
    variants: [{ sku: p.sku, title: p.name, price: p.now }],
    features: p.features,
    free: Boolean(p.free) || p.now === 0,
    featured: Boolean(p.popular),
    shopify: { productId: null, handle: p.handle },
    paystack: { variant_sku: p.sku, amountMinor: Math.round(p.now * 100), checkoutUrl: null },
    chatb2k: { enabled: true, priority: p.popular ? 10 : 5, goals: [] },
    seo: { title: `${p.name} — ResoFlex`, description: p.tagline, image: p.image ?? null, path },
  };
}

function fromBundle(b: Bundle): Product {
  const path = `/product/${b.id}`;
  return {
    id: b.id,
    sku: b.sku,
    slug: b.id,
    handle: b.id,
    name: b.name,
    tagline: b.tagline,
    description: b.tagline,
    price: b.now,
    compareAtPrice: b.was,
    priceLabel: b.priceLabel,
    currency: "NGN",
    category: b.category,
    collections: [b.category === "meal" ? "MEAL_PLANS" : "VIP_BUNDLES", b.popular ? "BEST_SELLERS" : null].filter(
      Boolean,
    ) as string[],
    image: null,
    gallery: [],
    variants: [{ sku: b.sku, title: b.name, price: b.now }],
    features: b.features,
    free: false,
    featured: Boolean(b.popular),
    shopify: { productId: null, handle: b.id },
    paystack: { variant_sku: b.sku, amountMinor: Math.round(b.now * 100), checkoutUrl: b.paystackUrl ?? null },
    chatb2k: { enabled: true, priority: b.popular ? 8 : 4, goals: [] },
    seo: { title: `${b.name} — ResoFlex`, description: b.tagline, image: null, path },
  };
}

export const PRODUCTS: Product[] = [...STATIC_PRODUCTS.map(fromStatic), ...BUNDLES.map(fromBundle)];

export const productBySku: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.sku, p]));
export const productBySlug: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));

export const getProduct = (key: string): Product | undefined =>
  productBySku[key] ?? productBySlug[key] ?? PRODUCTS.find((p) => p.id === key);

export const getProductsByCollection = (code: string): Product[] =>
  PRODUCTS.filter((p) => p.collections.includes(code));

export const getProductsByCategory = (category: string): Product[] =>
  PRODUCTS.filter((p) => p.category === category);

export const getFeaturedProducts = (): Product[] => PRODUCTS.filter((p) => p.featured);

export const getTrendingProducts = (limit = 4): Product[] =>
  [...PRODUCTS].sort((a, b) => b.chatb2k.priority - a.chatb2k.priority).slice(0, limit);

export const getRecommendedProducts = (sku?: string, limit = 3): Product[] =>
  PRODUCTS.filter((p) => p.sku !== sku)
    .sort((a, b) => b.chatb2k.priority - a.chatb2k.priority)
    .slice(0, limit);

export const getFrequentlyBoughtTogether = (sku: string, limit = 3): Product[] => {
  const bundles = suggestBundlesFor(sku).map(fromBundle);
  if (bundles.length) return bundles.slice(0, limit);
  return getRecommendedProducts(sku, limit);
};

export const searchProducts = (query: string): Product[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) =>
    [p.name, p.sku, p.tagline, p.category, ...p.features].join(" ").toLowerCase().includes(q),
  );
};
