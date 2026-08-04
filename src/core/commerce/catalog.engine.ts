// ============================================================
// CATALOG ENGINE — DB-backed catalog on top of the single
// product registry (src/data/products.ts). Static products stay
// authoritative for the landing page; DB products extend the
// catalog (activewear, memberships, corporate wellness, …).
// ============================================================

import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, type Product as StaticProduct } from "@/data/products";

export type CatalogProduct = {
  sku: string;
  handle: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  price_ngn: number;
  bulk_price_ngn: number | null;
  bulk_threshold: number | null;
  hero_image_asset: string | null;
  status: string;
  digital_product: boolean;
  requires_shipping: boolean;
  chatb2k_enabled: boolean;
  recommendation_priority: number;
  goals: string[];
  experience_levels: string[];
  seo_title: string | null;
  meta_description: string | null;
  open_graph_image: string | null;
  checkout_url: string | null;
  source: "db" | "static";
};

export const COLLECTION_CODES = [
  "COMMERCIAL_LUXE",
  "HOME_GYM_ESSENTIALS",
  "COACH_BUCHI_SIGNATURE",
  "BEST_SELLERS",
  "MENS_ACTIVEWEAR",
  "WOMENS_ACTIVEWEAR",
  "CURVY_COLLECTION",
  "PERFORMANCE_ACTIVEWEAR",
  "COMBAT_TRAINING",
  "GYM_ACCESSORIES",
  "DIGITAL_PROGRAMS",
  "MEAL_PLANS",
  "MEMBERSHIPS",
  "VIP_BUNDLES",
  "CORPORATE_WELLNESS",
  "CHATB2K_RECOMMENDED",
] as const;

export type CollectionCode = (typeof COLLECTION_CODES)[number];

export const COLLECTION_LABELS: Record<CollectionCode, string> = {
  COMMERCIAL_LUXE: "Commercial Luxe",
  HOME_GYM_ESSENTIALS: "Home Gym Essentials",
  COACH_BUCHI_SIGNATURE: "Coach Buchi Signature Collection",
  BEST_SELLERS: "Best Sellers",
  MENS_ACTIVEWEAR: "Men's Activewear",
  WOMENS_ACTIVEWEAR: "Women's Activewear",
  CURVY_COLLECTION: "Curvy Collection",
  PERFORMANCE_ACTIVEWEAR: "Performance Activewear",
  COMBAT_TRAINING: "Combat Training",
  GYM_ACCESSORIES: "Gym Accessories",
  DIGITAL_PROGRAMS: "Digital Programs",
  MEAL_PLANS: "Meal Plans",
  MEMBERSHIPS: "Memberships",
  VIP_BUNDLES: "VIP Bundles",
  CORPORATE_WELLNESS: "Corporate Wellness",
  CHATB2K_RECOMMENDED: "ChatB2K Recommended",
};

/** Static registry products projected into the catalog shape. */
export function staticAsCatalog(p: StaticProduct): CatalogProduct {
  return {
    sku: p.sku,
    handle: p.handle,
    name: p.name,
    tagline: p.tagline ?? null,
    description: (p.features ?? []).join(". ") || null,
    category: p.sku.startsWith("B2K") ? "digital_program" : "equipment",
    price_ngn: p.now,
    bulk_price_ngn: null,
    bulk_threshold: null,
    hero_image_asset: p.image ?? null,
    status: "published",
    digital_product: p.sku.startsWith("B2K") || p.sku.startsWith("RF-DIG"),
    requires_shipping: !(p.sku.startsWith("B2K") || p.sku.startsWith("RF-DIG")),
    chatb2k_enabled: true,
    recommendation_priority: p.popular ? 10 : 0,
    goals: [],
    experience_levels: [],
    seo_title: `${p.name} — ResoFlex`,
    meta_description: p.tagline ?? p.name,
    open_graph_image: p.image ?? null,
    checkout_url: null,
    source: "static",
  };
}

const SELECT =
  "sku, handle, name, tagline, description, category, price_ngn, bulk_price_ngn, bulk_threshold, hero_image_asset, status, digital_product, requires_shipping, chatb2k_enabled, recommendation_priority, goals, experience_levels, seo_title, meta_description, open_graph_image, checkout_url";

async function fetchDbProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("status", "published")
    .order("recommendation_priority", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Omit<CatalogProduct, "source">[]).map((p) => ({ ...p, source: "db" as const }));
}

/** Full catalog: DB products first, static registry appended (SKU de-duplicated). */
export async function getCatalog(): Promise<CatalogProduct[]> {
  const db = await fetchDbProducts();
  const seen = new Set(db.map((p) => p.sku));
  return [...db, ...PRODUCTS.map(staticAsCatalog).filter((p) => !seen.has(p.sku))];
}

export async function getCatalogBySku(sku: string): Promise<CatalogProduct | undefined> {
  return (await getCatalog()).find((p) => p.sku === sku);
}

export async function getCatalogByCategory(category: string): Promise<CatalogProduct[]> {
  return (await getCatalog()).filter((p) => p.category === category);
}

export async function searchCatalog(term: string): Promise<CatalogProduct[]> {
  const q = term.trim().toLowerCase();
  if (!q) return getCatalog();
  return (await getCatalog()).filter((p) =>
    [p.name, p.sku, p.tagline, p.description, p.category]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );
}

export async function getFeaturedCatalog(limit = 8): Promise<CatalogProduct[]> {
  return (await getCatalog())
    .slice()
    .sort((a, b) => b.recommendation_priority - a.recommendation_priority)
    .slice(0, limit);
}

/** SKUs mapped to a collection code. */
export async function getCollectionSkus(code: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("product_collection_mappings")
    .select("product_sku, display_order")
    .eq("collection_code", code)
    .order("display_order");
  if (error || !data) return [];
  return data.map((r) => r.product_sku as string);
}

export async function getCatalogByCollection(code: string): Promise<CatalogProduct[]> {
  const [skus, catalog] = await Promise.all([getCollectionSkus(code), getCatalog()]);
  const order = new Map(skus.map((s, i) => [s, i]));
  return catalog
    .filter((p) => order.has(p.sku))
    .sort((a, b) => (order.get(a.sku)! - order.get(b.sku)!));
}

export type CatalogCollection = {
  collection_code: string;
  title: string;
  slug: string;
  type: string | null;
  description: string | null;
  hero_banner: string | null;
  thumbnail_image: string | null;
  seo_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  chatb2k_priority: number;
  landing_page_slug: string | null;
};

export async function getCollections(): Promise<CatalogCollection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select(
      "collection_code, title, slug, type, description, hero_banner, thumbnail_image, seo_title, meta_description, og_image, chatb2k_priority, landing_page_slug",
    )
    .eq("visibility", "public")
    .order("sort_order");
  if (error || !data) return [];
  return data as unknown as CatalogCollection[];
}
