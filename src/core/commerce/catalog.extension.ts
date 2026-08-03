// ============================================================
// CATALOG EXTENSION — variants, assets, collections and SEO
// derived on top of the authoritative src/data/products.ts.
// No second product registry is introduced.
// ============================================================

import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, type Product } from "@/data/products";

export type ProductVariant = {
  id: string;
  product_sku: string;
  variant_sku: string;
  title: string;
  price: number;
  currency: string;
  options: Record<string, unknown>;
  inventory_qty: number;
};

export type ProductAsset = {
  id: string;
  product_sku: string;
  variant_sku: string | null;
  asset_type: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  seo_title: string | null;
  meta_description: string | null;
  og_image: string | null;
};

export type ProductSeo = {
  sku: string;
  canonicalSlug: string;
  seoTitle: string;
  metaDescription: string;
  ogImage: string | null;
  matchTags: string[];
};

/** SEO + ChatB2K matching metadata derived from the existing catalog. */
export function getProductSeo(p: Product): ProductSeo {
  const tags = [
    p.handle,
    p.sku,
    ...(p.features ?? []).slice(0, 4).map((f) => String(f).toLowerCase()),
  ].filter(Boolean) as string[];

  return {
    sku: p.sku,
    canonicalSlug: `/product/${p.handle}`,
    seoTitle: `${p.name} — ResoFlex`.slice(0, 60),
    metaDescription: (p.tagline || p.name).slice(0, 155),
    ogImage: (p as any).image ?? null,
    matchTags: tags,
  };
}

export function getAllProductSeo(): ProductSeo[] {
  return PRODUCTS.map(getProductSeo);
}

export async function fetchVariants(productSku?: string): Promise<ProductVariant[]> {
  let q = supabase
    .from("product_variants")
    .select("id, product_sku, variant_sku, title, price, currency, options, inventory_qty")
    .eq("is_active", true)
    .order("title");
  if (productSku) q = q.eq("product_sku", productSku);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as unknown as ProductVariant[];
}

export async function fetchAssets(productSku: string): Promise<ProductAsset[]> {
  const { data, error } = await supabase
    .from("product_assets")
    .select("id, product_sku, variant_sku, asset_type, url, alt_text, sort_order")
    .eq("product_sku", productSku)
    .eq("is_public", true)
    .order("sort_order");
  if (error) return [];
  return (data ?? []) as unknown as ProductAsset[];
}

export async function fetchCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, title, description, seo_title, meta_description, og_image")
    .eq("is_active", true)
    .order("sort_order");
  if (error) return [];
  return (data ?? []) as unknown as Collection[];
}

/** Records a stock movement. Admin-only at the RLS layer. */
export async function recordInventoryMovement(input: {
  variantSku: string;
  changeQty: number;
  reason: string;
  orderId?: string;
}) {
  return supabase.from("inventory_ledger").insert({
    variant_sku: input.variantSku,
    change_qty: input.changeQty,
    reason: input.reason,
    order_id: input.orderId ?? null,
  });
}
