import { Product, PRODUCTS } from "@/data/products";

/**
 * Product Brain = Intelligence Layer
 * NOT a database (IMPORTANT)
 * It reads from products.ts and adds logic on top
 */

export type ProductCategory =
  | "digital"
  | "physical"
  | "bundle"
  | "membership";

/**
 * CORE LOOKUP
 */
export const getProductBySlug = (slug: string): Product | undefined => {
  return PRODUCTS.find((p) => p.slug === slug);
};

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find((p) => p.id === id);
};

/**
 * FUNNEL SEGMENTATION
 */
export const getFeaturedProducts = (): Product[] => {
  return PRODUCTS.filter((p) => p.featured);
};

export const getDigitalProducts = (): Product[] => {
  return PRODUCTS.filter((p) => p.category === "digital");
};

export const getBundles = (): Product[] => {
  return PRODUCTS.filter((p) => p.category === "bundle");
};

export const getMemberships = (): Product[] => {
  return PRODUCTS.filter((p) => p.category === "membership");
};

/**
 * PRICING INTELLIGENCE
 */
export const isHighTicket = (product: Product): boolean => {
  return product.price >= 25000;
};

export const isMidTicket = (product: Product): boolean => {
  return product.price >= 10000 && product.price < 25000;
};

export const isLowTicket = (product: Product): boolean => {
  return product.price < 10000;
};

/**
 * CONVERSION SIGNALS
 */
export const isPopular = (product: Product): boolean => {
  return Boolean(product.featured);
};

export const isFreeProduct = (product: Product): boolean => {
  return product.price === 0;
};

/**
 * CHECKOUT INTELLIGENCE
 */
export const getCheckoutUrl = (product: Product): string | null => {
  if (isFreeProduct(product)) return null;
  return product.paystackUrl || null;
};

/**
 * FUNNEL ROUTING HELPERS
 */
export const getNextUpsellTier = (product: Product): Product[] => {
  const price = product.price;

  // Simple tier-based upsell logic
  if (price < 10000) {
    return PRODUCTS.filter((p) => p.price >= 10000 && p.price < 25000);
  }

  if (price < 25000) {
    return PRODUCTS.filter((p) => p.price >= 25000);
  }

  return PRODUCTS.filter((p) => p.category === "bundle");
};

/**
 * SEARCH / CHATB2K SUPPORT
 */
export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase();

  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
};

/**
 * SAFETY VALIDATION (DEV ONLY)
 */
export const validateProductBrain = (): void => {
  const slugs = PRODUCTS.map((p) => p.slug);
  const duplicateSlugs = slugs.filter(
    (slug, i) => slugs.indexOf(slug) !== i
  );

  if (duplicateSlugs.length > 0) {
    throw new Error(
      `Duplicate product slugs detected: ${duplicateSlugs.join(", ")}`
    );
  }

  const missingPaystack = PRODUCTS.filter(
    (p) => !p.paystackUrl && p.price > 0
  );

  if (missingPaystack.length > 0) {
    console.warn("Products missing Paystack URLs:", missingPaystack);
  }
};
