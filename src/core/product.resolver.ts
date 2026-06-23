// FILE: src/core/product.resolver.ts

import { CORE_PRODUCTS } from "@/core/product.engine";

export const getProductBySlug = (slug: string) => {
  return CORE_PRODUCTS.find((p) => p.slug === slug);
};

export const getProductById = (id: string) => {
  return CORE_PRODUCTS.find((p) => p.id === id);
};

export const getCheckoutUrl = (slug: string): string | null => {
  const product = CORE_PRODUCTS.find((p) => p.slug === slug);

  if (!product) return null;
  if (product.isFree) return null;

  return product.paystackUrl;
};
