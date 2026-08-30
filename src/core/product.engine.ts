// ============================================================
// PRODUCT ENGINE — canonical resolver layer.
// Identity is slug OR SKU. No special-case Reset route is used.
// Paystack destinations come from the canonical Paystack catalog.
// ============================================================

import { PRODUCTS, type Product } from "@/data/products";
import { BUNDLES, suggestBundlesFor, type Bundle } from "@/data/bundles";
import { RESOFLEX_PAYSTACK_PAGES } from "@/data/resoflex-paystack-pages";
import { verifyCheckoutUrl } from "@/lib/verifyCheckoutUrl";

export type { Product, Bundle };

const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

export const getAllProducts = (): Product[] => PRODUCTS;

export const getProduct = (identifier: string): Product | undefined => {
  const key = normalizeIdentifier(identifier);
  return PRODUCTS.find(
    (p) => normalizeIdentifier(p.id) === key || normalizeIdentifier(p.handle) === key || normalizeIdentifier(p.sku) === key,
  );
};

export const getProductBySlug = (slug: string): Product | undefined => getProduct(slug);
export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => normalizeIdentifier(p.id) === normalizeIdentifier(id));
export const getProductBySku = (sku: string): Product | undefined =>
  PRODUCTS.find((p) => normalizeIdentifier(p.sku) === normalizeIdentifier(sku));
export const getFeaturedProducts = (): Product[] => PRODUCTS.filter((p) => p.popular);
export const getFreeProducts = (): Product[] => PRODUCTS.filter((p) => p.free || p.now === 0);
export const getBundles = (): Bundle[] => BUNDLES;
export const getBundleBySku = (sku: string): Bundle | undefined =>
  BUNDLES.find((b) => normalizeIdentifier(b.sku) === normalizeIdentifier(sku));
export const getBundleSuggestionsFor = (sku: string): Bundle[] => suggestBundlesFor(sku);

const TRACKING_QUERY = "rsid=08c53b223ff148b19a9d&referrer=https%3A%2F%2Fshop.resofit.fit%2F";

/** Primary checkout: use the canonical Paystack storefront destination. */
export const getCheckoutUrl = (identifier: string): string | null => {
  const key = normalizeIdentifier(identifier);
  const paystackPage = RESOFLEX_PAYSTACK_PAGES.find(
    (item) => normalizeIdentifier(item.slug) === key || normalizeIdentifier(item.title) === key,
  );

  if (paystackPage) {
    const separator = paystackPage.checkoutUrl.includes("?") ? "&" : "?";
    return verifyCheckoutUrl(`${paystackPage.checkoutUrl}${separator}${TRACKING_QUERY}`);
  }

  const bundle = BUNDLES.find(
    (b) => normalizeIdentifier(b.id) === key || normalizeIdentifier(b.sku) === key,
  );
  if (bundle?.paystackUrl) return verifyCheckoutUrl(bundle.paystackUrl);

  const product = getProduct(identifier);
  if (!product || product.free || product.now === 0) return null;

  // Never fabricate a payment destination when no canonical route exists.
  return null;
};

export interface LegacyCoreProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  paystackUrl: string | null;
  isFree: boolean;
}

export const CORE_PRODUCTS: LegacyCoreProduct[] = PRODUCTS.map((p) => ({
  id: p.id,
  slug: p.handle,
  name: p.name,
  price: p.now,
  paystackUrl: getCheckoutUrl(p.handle),
  isFree: Boolean(p.free) || p.now === 0,
}));
