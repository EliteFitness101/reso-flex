// ============================================================
// MASTER CATALOG IMPORT ENGINE
// CSV → Supabase upsert with validation, duplicate prevention,
// per-entity audit logging and best-effort rollback.
// Entities map to /data/catalog/*.csv (see docs in admin UI).
// ============================================================

import { supabase } from "@/integrations/supabase/client";

export type CatalogEntity =
  | "collections"
  | "products"
  | "product_variants"
  | "product_collection_mappings"
  | "product_assets"
  | "inventory_ledger";

export type ImportResult = {
  entity: CatalogEntity;
  processed: number;
  failed: number;
  errors: string[];
  rolledBack: boolean;
};

/** Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ",") { row.push(field); field = ""; continue; }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== "")) rows.push(row);

  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {};
    header.forEach((h, i) => (o[h] = (r[i] ?? "").trim()));
    return o;
  });
}

const num = (v?: string) => (v == null || v === "" ? null : Number(String(v).replace(/[^0-9.-]/g, "")));
const int = (v?: string) => { const n = num(v); return n == null ? null : Math.round(n); };
const bool = (v?: string) => /^(1|true|yes|y)$/i.test(String(v ?? ""));
const list = (v?: string) =>
  (v ?? "").split(/[|;,]/).map((s) => s.trim()).filter(Boolean);

// ---------------- row mappers + validation ----------------

type Mapped = { key: Record<string, string>; row: Record<string, unknown> };

const MAPPERS: Record<CatalogEntity, {
  table: string;
  conflict: string;
  map: (r: Record<string, string>) => Mapped | string; // string = validation error
}> = {
  collections: {
    table: "collections",
    conflict: "collection_code",
    map: (r) => {
      const code = r.collection_code || r.code;
      if (!code) return "collection_code is required";
      const slug = r.landing_page_slug || r.slug || code.toLowerCase().replace(/_/g, "-");
      return {
        key: { collection_code: code },
        row: {
          collection_code: code,
          slug,
          title: r.collection_name || r.title || code,
          type: r.type || null,
          parent_collection: r.parent_collection || null,
          description: r.description || null,
          hero_banner: r.hero_banner || null,
          thumbnail_image: r.thumbnail_image || null,
          seo_title: r.seo_title || null,
          meta_description: r.meta_description || null,
          og_image: r.open_graph_image || r.og_image || null,
          sort_order: int(r.display_order) ?? 0,
          visibility: r.visibility || "public",
          is_active: (r.visibility || "public") !== "hidden",
          shopify_collection_id: r.shopify_collection_id || null,
          chatb2k_priority: int(r.chatb2k_priority) ?? 0,
          featured_products: list(r.featured_products),
          landing_page_slug: r.landing_page_slug || slug,
        },
      };
    },
  },
  products: {
    table: "products",
    conflict: "sku",
    map: (r) => {
      if (!r.sku) return "sku is required";
      if (!r.name && !r.product_name) return `${r.sku}: name is required`;
      const price = int(r.price_ngn ?? r.price);
      if (price == null || price < 0) return `${r.sku}: price_ngn must be a positive number`;
      return {
        key: { sku: r.sku },
        row: {
          sku: r.sku,
          handle: r.handle || r.sku.toLowerCase(),
          name: r.name || r.product_name,
          tagline: r.tagline || null,
          description: r.description || null,
          category: r.category || null,
          price_ngn: price,
          bulk_price_ngn: int(r.bulk_price_ngn),
          bulk_threshold: int(r.bulk_threshold),
          hero_image_asset: r.hero_image_asset || null,
          sub_assets: list(r.sub_assets),
          status: r.status || "draft",
          digital_product: bool(r.digital_product),
          requires_shipping: r.requires_shipping ? bool(r.requires_shipping) : !bool(r.digital_product),
          chatb2k_enabled: r.chatb2k_enabled ? bool(r.chatb2k_enabled) : true,
          recommendation_priority: int(r.recommendation_priority) ?? 0,
          goals: list(r.goals),
          experience_levels: list(r.experience_levels ?? r.experience),
          seo_title: r.seo_title || null,
          meta_description: r.meta_description || null,
          open_graph_image: r.open_graph_image || null,
          checkout_url: r.checkout_url || null,
          shopify_product_id: r.shopify_product_id || null,
        },
      };
    },
  },
  product_variants: {
    table: "product_variants",
    conflict: "variant_sku",
    map: (r) => {
      if (!r.variant_sku) return "variant_sku is required";
      if (!r.parent_sku && !r.product_sku) return `${r.variant_sku}: parent_sku is required`;
      return {
        key: { variant_sku: r.variant_sku },
        row: {
          variant_sku: r.variant_sku,
          product_sku: r.parent_sku || r.product_sku,
          title: r.title || [r.size, r.color].filter(Boolean).join(" / ") || r.variant_sku,
          size: r.size || null,
          color: r.color || null,
          price: int(r.price) ?? 0,
          currency: r.currency || "NGN",
          stock_level: int(r.stock_level) ?? 0,
          inventory_qty: int(r.stock_level) ?? 0,
          status: r.status || "active",
          is_active: (r.status || "active") === "active",
        },
      };
    },
  },
  product_collection_mappings: {
    table: "product_collection_mappings",
    conflict: "product_sku,collection_code",
    map: (r) => {
      if (!r.product_sku || !r.collection_code) return "product_sku and collection_code are required";
      return {
        key: { product_sku: r.product_sku, collection_code: r.collection_code },
        row: {
          product_sku: r.product_sku,
          collection_code: r.collection_code,
          display_order: int(r.display_order) ?? 0,
        },
      };
    },
  },
  product_assets: {
    table: "product_assets",
    conflict: "url",
    map: (r) => {
      if (!r.sku && !r.product_sku) return "sku is required";
      const url = r.cdn_url || r.relative_path || r.url;
      if (!url) return `${r.sku}: cdn_url or relative_path is required`;
      return {
        key: { url },
        row: {
          product_sku: r.sku || r.product_sku,
          variant_sku: r.variant_sku || null,
          asset_type: r.asset_type || "image",
          url,
          cdn_url: r.cdn_url || null,
          relative_path: r.relative_path || null,
          file_name: r.file_name || null,
          alt_text: r.alt_text || null,
          width: int(r.width),
          height: int(r.height),
          format: r.format || null,
          file_size_kb: int(r.file_size_kb),
          is_hero: bool(r.is_hero),
          seo_title: r.seo_title || null,
          open_graph_asset: bool(r.open_graph_asset),
          sort_order: int(r.sort_order) ?? 0,
          is_public: r.is_public ? bool(r.is_public) : true,
        },
      };
    },
  },
  inventory_ledger: {
    table: "inventory_ledger",
    conflict: "",
    map: (r) => {
      if (!r.variant_sku) return "variant_sku is required";
      const qty = int(r.change_qty ?? r.stock_level ?? r.quantity);
      if (qty == null) return `${r.variant_sku}: change_qty is required`;
      return {
        key: { variant_sku: r.variant_sku },
        row: { variant_sku: r.variant_sku, change_qty: qty, reason: r.reason || "csv_seed" },
      };
    },
  },
};

async function logAudit(entity: CatalogEntity, res: ImportResult, source: string) {
  const { data: sess } = await supabase.auth.getSession();
  await supabase.from("catalog_sync_audit").insert({
    actor_id: sess.session?.user.id ?? null,
    source,
    entity,
    action: "csv_import",
    rows_processed: res.processed,
    rows_failed: res.failed,
    result: res.rolledBack ? "rolled_back" : res.failed ? "partial" : "ok",
    details: { errors: res.errors.slice(0, 25) },
  });
}

/**
 * Import one CSV payload for an entity.
 * `strict` (default) aborts and rolls back newly created rows if any row fails validation.
 */
export async function importCatalogCsv(
  entity: CatalogEntity,
  csv: string,
  opts: { source?: string; strict?: boolean } = {},
): Promise<ImportResult> {
  const { source = "admin_upload", strict = true } = opts;
  const spec = MAPPERS[entity];
  const rows = parseCsv(csv);
  const result: ImportResult = { entity, processed: 0, failed: 0, errors: [], rolledBack: false };

  const payload: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  for (const [i, raw] of rows.entries()) {
    const mapped = spec.map(raw);
    if (typeof mapped === "string") {
      result.failed++;
      result.errors.push(`row ${i + 2}: ${mapped}`);
      continue;
    }
    const dedupe = JSON.stringify(mapped.key);
    if (seen.has(dedupe)) {
      result.failed++;
      result.errors.push(`row ${i + 2}: duplicate key ${dedupe} in file`);
      continue;
    }
    seen.add(dedupe);
    payload.push(mapped.row);
  }

  if (strict && result.failed) {
    await logAudit(entity, result, source);
    return result;
  }
  if (!payload.length) {
    await logAudit(entity, result, source);
    return result;
  }

  const q = spec.conflict
    ? supabase.from(spec.table as never).upsert(payload as never, { onConflict: spec.conflict })
    : supabase.from(spec.table as never).insert(payload as never);

  const { error } = await q;
  if (error) {
    result.failed += payload.length;
    result.errors.push(error.message);
    result.rolledBack = true;
  } else {
    result.processed = payload.length;
  }

  await logAudit(entity, result, source);
  return result;
}

export const CATALOG_IMPORT_FILES: { file: string; entity: CatalogEntity }[] = [
  { file: "01_collections_master.csv", entity: "collections" },
  { file: "02_products_master.csv", entity: "products" },
  { file: "03_product_variants_master.csv", entity: "product_variants" },
  { file: "04_product_collection_mapping.csv", entity: "product_collection_mappings" },
  { file: "05_product_assets_manifest.csv", entity: "product_assets" },
  { file: "06_inventory_seed.csv", entity: "inventory_ledger" },
];
