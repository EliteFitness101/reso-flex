// ============================================================
// PRODUCT ENGINE — thin resolver layer.
// Single source of truth: src/data/products.ts (+ src/data/bundles.ts).
// Do NOT define products, prices, or Paystack URLs here.
// ============================================================

import { PRODUCTS, type Product } from "@/data/products";
import {
  BUNDLES,
  suggestBundlesFor,
  type Bundle,
} from "@/data/bundles";
import { verifyCheckoutUrl } from "@/lib/verifyCheckoutUrl";

export type { Product, Bundle };

// -------- Product lookups (derive from PRODUCTS) -------------
export const getAllProducts = (): Product[] => PRODUCTS;

export const getProduct = (idOrHandle: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === idOrHandle || p.handle === idOrHandle);

export const getProductBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.handle === slug);

export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);

export const getProductBySku = (sku: string): Product | undefined =>
  PRODUCTS.find((p) => p.sku === sku);

export const getFeaturedProducts = (): Product[] =>
  PRODUCTS.filter((p) => p.popular);

export const getFreeProducts = (): Product[] =>
  PRODUCTS.filter((p) => p.free || p.now === 0);

// -------- Bundle lookups (derive from BUNDLES) ---------------
export const getBundles = (): Bundle[] => BUNDLES;
export const getBundleBySku = (sku: string): Bundle | undefined =>
  BUNDLES.find((b) => b.sku === sku);
export const getBundleSuggestionsFor = (sku: string): Bundle[] =>
  suggestBundlesFor(sku);

// -------- Checkout resolution --------------------------------
// PRODUCTS are sold through CheckoutModal (WhatsApp handoff → Paystack link
// issued server-side). BUNDLES ship with a direct paystackUrl. This helper
// resolves a validated URL only when one exists.
export const getCheckoutUrl = (idOrHandleOrSku: string): string | null => {
  const bundle = BUNDLES.find(
    (b) => b.id === idOrHandleOrSku || b.sku === idOrHandleOrSku,
  );
  if (bundle?.paystackUrl) return verifyCheckoutUrl(bundle.paystackUrl);

  const product = getProduct(idOrHandleOrSku) ?? getProductBySku(idOrHandleOrSku);
  if (!product) return null;
  if (product.free || product.now === 0) return null;

  // Physical/digital products route through CheckoutModal — no direct URL.
  return null;
};

// -------- Legacy compatibility shim --------------------------
// Older code paths (deployment guard, auto-generated routes) expect a flat
// array. Derive it so we never maintain a second catalog.
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
  paystackUrl: null, // resolved on-demand via CheckoutModal
  isFree: Boolean(p.free) || p.now === 0,
}));
