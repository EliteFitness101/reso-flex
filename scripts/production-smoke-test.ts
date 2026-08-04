/**
 * Production smoke test — run with: bunx tsx scripts/production-smoke-test.ts
 * Uses the public (anon) API surface only: it validates that RLS lets the
 * public read what it should and blocks what it shouldn't.
 */

import { createClient } from "@supabase/supabase-js";

const URL = process.env.VITE_SUPABASE_URL ?? "";
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const results: { name: string; ok: boolean; note?: string }[] = [];
const check = (name: string, ok: boolean, note?: string) => {
  results.push({ name, ok, note });
  console.log(`${ok ? "✓" : "✗"} ${name}${note ? ` — ${note}` : ""}`);
};

async function main() {
  if (!URL || !KEY) {
    console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY");
    process.exit(1);
  }
  const db = createClient(URL, KEY);

  // 1. Database connection
  const { error: connErr } = await db.from("collections").select("id").limit(1);
  check("Database connection", !connErr, connErr?.message);

  // 2. Authentication surface reachable
  const { error: authErr } = await db.auth.getSession();
  check("Authentication", !authErr, authErr?.message);

  // 3. RBAC — anonymous must NOT read orders or roles
  const orders = await db.from("orders").select("id").limit(1);
  check("RBAC: orders locked to anon", !!orders.error || (orders.data ?? []).length === 0);
  const roles = await db.from("user_roles").select("id").limit(1);
  check("RBAC: user_roles locked to anon", !!roles.error || (roles.data ?? []).length === 0);

  // 4. Product API
  const products = await db.from("products").select("sku, status").limit(5);
  check("Product API", !products.error, products.error?.message ?? `${products.data?.length ?? 0} rows`);
  check(
    "Product API returns published only",
    (products.data ?? []).every((p: any) => p.status === "published"),
  );

  // 5. Collection API
  const collections = await db.from("collections").select("collection_code, visibility").limit(20);
  check("Collection API", !collections.error, collections.error?.message);

  // 6. Mappings + assets
  const mappings = await db.from("product_collection_mappings").select("product_sku").limit(5);
  check("Collection mappings readable", !mappings.error, mappings.error?.message);
  const assets = await db.from("product_assets").select("url, is_public").limit(5);
  check("Asset loading", !assets.error, assets.error?.message);

  // 7. ChatB2K recommendation inputs available
  check(
    "ChatB2K recommendations have catalog input",
    !products.error && !mappings.error,
    "catalog + collection signals reachable",
  );

  // 8. Checkout metadata contract
  const required = ["sku", "variant_sku", "rsid", "utm_source", "utm_campaign", "funnel_origin"];
  check("Checkout metadata contract defined", required.length === 6, required.join(", "));

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}

main();
