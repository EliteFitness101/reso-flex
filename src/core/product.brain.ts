import { Product, PRODUCTS } from "@/data/products";

/**
 * Product Brain = Intelligence Layer over products.ts
 */

export const getProductBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.handle === slug);

export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);

export const getFeaturedProducts = (): Product[] =>
  PRODUCTS.filter((p) => p.popular);

export const getFreeProducts = (): Product[] =>
  PRODUCTS.filter((p) => p.free);

export const getPaidProducts = (): Product[] =>
  PRODUCTS.filter((p) => !p.free && p.now > 0);

/**
 * PRICING TIERS
 */
export const isHighTicket = (p: Product) => p.now >= 25000;
export const isMidTicket = (p: Product) => p.now >= 10000 && p.now < 25000;
export const isLowTicket = (p: Product) => p.now > 0 && p.now < 10000;

export const isPopular = (p: Product) => Boolean(p.popular);
export const isFreeProduct = (p: Product) => Boolean(p.free) || p.now === 0;

/**
 * UPSELL TIERING
 */
export const getNextUpsellTier = (product: Product): Product[] => {
  const price = product.now;
  if (price < 10000) return PRODUCTS.filter((p) => p.now >= 10000 && p.now < 25000);
  if (price < 25000) return PRODUCTS.filter((p) => p.now >= 25000 && p.id !== product.id);
  return PRODUCTS.filter((p) => p.popular && p.id !== product.id);
};

/**
 * SEARCH
 */
export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.handle.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
  );
};

export const validateProductBrain = (): void => {
  const handles = PRODUCTS.map((p) => p.handle);
  const dup = handles.filter((h, i) => handles.indexOf(h) !== i);
  if (dup.length > 0) {
    throw new Error(`Duplicate product handles detected: ${dup.join(", ")}`);
  }
};
