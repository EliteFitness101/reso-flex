// ============================================================
// PRODUCT ENGINE — thin resolver layer.
// Canonical storefront identity is slug OR SKU. Never hardcode a
// special product route (including Reset) here.
// ============================================================

import { PRODUCTS, type Product } from "@/data/products";
import {
  BUNDLES,
  suggestBundlesFor,
  type Bundle,
} from "@/data/bundles";
import { verifyCheckoutUrl } from "@/lib/verifyCheckoutUrl";

export type { Product, Bundle };

const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

export const getAllProducts = (): Product[] => PRODUCTS;

export const getProduct = (identifier: string): Product | undefined => {
  const key = normalizeIdentifier(identifier);
  return PRODUCTS.find(
    (p) =>
      normalizeIdentifier(p.id) === key ||
      normalizeIdentifier(p.handle) === key ||
      normalizeIdentifier(p.sku) === key,
  );
};

export const getProductBySlug = (slug: string): Product | undefined =>
  getProduct(slug);

export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => normalizeIdentifier(p.id) === normalizeIdentifier(id));

export const getProductBySku = (sku: string): Product | undefined =>
  PRODUCTS.find((p) => normalizeIdentifier(p.sku) === normalizeIdentifier(sku));

export const getFeaturedProducts = (): Product[] =>
  PRODUCTS.filter((p) => p.popular);

export const getFreeProducts = (): Product[] =>
  PRODUCTS.filter((p) => p.free || p.now === 0);

export const getBundles = (): Bundle[] => BUNDLES;
export const getBundleBySku = (sku: string): Bundle | undefined =>
  BUNDLES.find((b) => normalizeIdentifier(b.sku) === normalizeIdentifier(sku));
export const getBundleSuggestionsFor = (sku: string): Bundle[] =>
  suggestBundlesFor(sku);

// Primary checkout: ResoFit → shop.resofit.fit → Paystack → Supabase.
// Shopify is not a checkout dependency here.
export const getCheckoutUrl = (identifier: string): string | null => {
  const key = normalizeIdentifier(identifier);
  const bundle = BUNDLES.find(
    (b) => normalizeIdentifier(b.id) === key || normalizeIdentifier(b.sku) === key,
  );
  if (bundle?.paystackUrl) return verifyCheckoutUrl(bundle.paystackUrl);

  const product = getProduct(identifier);
  if (!product || product.free || product.now === 0) return null;

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
  paystackUrl: null,
  isFree: Boolean(p.free) || p.now === 0,
}));
