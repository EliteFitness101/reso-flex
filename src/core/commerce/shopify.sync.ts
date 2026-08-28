// ============================================================
// SECONDARY COMMERCE ADAPTER — SHOPIFY
// Shopify is retained only as a secondary/fallback integration.
// It is NOT part of the primary ResoFit revenue path.
// Primary: resofit.fit → shop.resofit.fit → Paystack → Supabase.
// This layer must never be required for product routing or checkout.
// ============================================================

import { supabase } from "@/integrations/supabase/client";

export type SyncEntity = "product" | "collection";

export interface SyncRecord {
  key: string;
  shopify_id?: string | null;
  updated_at?: string | null;
  fields: Record<string, unknown>;
}

export interface SyncResult {
  entity: SyncEntity;
  processed: number;
  failed: number;
  skipped: number;
  result: "ok" | "partial" | "failed" | "skipped";
  details: Record<string, unknown>;
}

export function isShopifyConnected(): boolean {
  const env = import.meta.env as Record<string, string | undefined>;
  return Boolean(env.VITE_SHOPIFY_STORE_DOMAIN && env.VITE_SHOPIFY_STOREFRONT_TOKEN);
}

async function logSync(source: string, r: SyncResult, actorId?: string | null) {
  try {
    await supabase.from("catalog_sync_audit").insert({
      actor_id: actorId ?? null,
      source,
      entity: r.entity,
      action: "upsert",
      rows_processed: r.processed,
      rows_failed: r.failed,
      result: r.result,
      details: r.details as never,
    });
  } catch {
    // Secondary audit logging must never affect primary commerce.
  }
}

export async function reconcileProducts(records: SyncRecord[], source = "shopify"): Promise<SyncResult> {
  const res: SyncResult = { entity: "product", processed: 0, failed: 0, skipped: 0, result: "ok", details: {} };
  const conflicts: string[] = [];
  const errors: string[] = [];

  for (const rec of records) {
    try {
      const { data: existing } = await supabase
        .from("products")
        .select("sku, updated_at")
        .eq("sku", rec.key)
        .maybeSingle();

      if (existing?.updated_at && rec.updated_at && new Date(existing.updated_at) > new Date(rec.updated_at)) {
        res.skipped += 1;
        conflicts.push(rec.key);
        continue;
      }

      const payload = { sku: rec.key, shopify_product_id: rec.shopify_id ?? null, ...rec.fields } as never;
      const { error } = await supabase.from("products").upsert(payload, { onConflict: "sku" });
      if (error) throw error;
      res.processed += 1;
    } catch (e) {
      res.failed += 1;
      errors.push(`${rec.key}: ${(e as Error).message}`);
    }
  }

  res.result = res.failed ? (res.processed ? "partial" : "failed") : "ok";
  res.details = { conflicts, errors: errors.slice(0, 20), skipped_newer_local: res.skipped };
  await logSync(source, res);
  return res;
}

export async function reconcileCollections(records: SyncRecord[], source = "shopify"): Promise<SyncResult> {
  const res: SyncResult = { entity: "collection", processed: 0, failed: 0, skipped: 0, result: "ok", details: {} };
  const errors: string[] = [];

  for (const rec of records) {
    try {
      const payload = {
        collection_code: rec.key,
        shopify_collection_id: rec.shopify_id ?? null,
        ...rec.fields,
      } as never;
      const { error } = await supabase.from("collections").upsert(payload, { onConflict: "collection_code" });
      if (error) throw error;
      res.processed += 1;
    } catch (e) {
      res.failed += 1;
      errors.push(`${rec.key}: ${(e as Error).message}`);
    }
  }

  res.result = res.failed ? (res.processed ? "partial" : "failed") : "ok";
  res.details = { errors: errors.slice(0, 20) };
  await logSync(source, res);
  return res;
}

export async function runScheduledSync(opts?: {
  fetchRemote?: () => Promise<{ products: SyncRecord[]; collections: SyncRecord[] }>;
}): Promise<SyncResult[]> {
  if (!isShopifyConnected() || !opts?.fetchRemote) {
    const skipped: SyncResult = {
      entity: "product",
      processed: 0,
      failed: 0,
      skipped: 0,
      result: "skipped",
      details: { reason: "shopify_secondary_not_connected" },
    };
    await logSync("shopify", skipped);
    return [skipped];
  }

  const remote = await opts.fetchRemote();
  return [await reconcileProducts(remote.products), await reconcileCollections(remote.collections)];
}
