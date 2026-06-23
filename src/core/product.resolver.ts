import { CORE_PRODUCTS } from "@/core/product.engine";

/**
 * 🧠 PRODUCT RESOLVER LAYER
 * Safe access to CORE_PRODUCTS
 */

export const getProductBySlug = (slug: string) => {
  const product = CORE_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    console.warn(`⚠ Product not found (slug): ${slug}`);
    return undefined;
  }

  return product;
};

export const getProductById = (id: string) => {
  const product = CORE_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    console.warn(`⚠ Product not found (id): ${id}`);
    return undefined;
  }

  return product;
};

/**
 * 💳 CHECKOUT SAFETY LAYER
 */
export const getCheckoutUrl = (slug: string): string | null => {
  const product = getProductBySlug(slug);

  if (!product) return null;

  if (product.isFree) return null;

  if (!product.paystackUrl) {
    console.warn(`⚠ Missing Paystack URL: ${slug}`);
    return null;
  }

  return product.paystackUrl;
};
