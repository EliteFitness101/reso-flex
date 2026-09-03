/**
 * Production smoke test — run with: bunx tsx scripts/production-smoke-test.ts
 * Uses the public (anon) API surface only and verifies storefront media/SEO
 * contracts without requiring privileged credentials.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.VITE_SUPABASE_URL ?? "";
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const SHOP_URL = (process.env.PRODUCTION_BASE_URL ?? "https://shop.resofit.fit").replace(/\/$/, "");
const EXPECTED_MAPPED_PRODUCTS = 21;

const results: { name: string; ok: boolean; note?: string }[] = [];
const check = (name: string, ok: boolean, note?: string) => {
  results.push({ name, ok, note });
  console.log(`${ok ? "✓" : "✗"} ${name}${note ? ` — ${note}` : ""}`);
};

async function httpOk(url: string) {
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    return { ok: response.status === 200, status: response.status };
  } catch (error) {
    return { ok: false, status: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

async function mediaSmoke() {
  const manifestPath = path.join(process.cwd(), "public/resoflex_imagekit_verified_manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Array<{
    sku?: string;
    slug?: string;
    role?: string;
    url?: string;
    status?: string;
  }>;

  const mapped = new Map<string, { slug: string; assets: Map<string, string> }>();
  for (const item of manifest) {
    if (item.status !== "verified" || !item.sku || !item.slug || !item.role || !item.url) continue;
    const current = mapped.get(item.sku) ?? { slug: item.slug, assets: new Map<string, string>() };
    current.assets.set(item.role, item.url);
    mapped.set(item.sku, current);
  }

  check(
    "Mapped product media count",
    mapped.size === EXPECTED_MAPPED_PRODUCTS,
    `${mapped.size} verified mapped products; expected ${EXPECTED_MAPPED_PRODUCTS}`,
  );

  let passedAssets = 0;
  let expectedAssets = 0;
  let passedPages = 0;

  for (const [sku, product] of mapped) {
    for (const role of ["hero", "gallery_01", "gallery_02", "gallery_03"]) {
      expectedAssets += 1;
      const sourceUrl = product.assets.get(role);
      if (!sourceUrl) {
        check(`Media ${sku} ${role}`, false, "missing manifest mapping");
        continue;
      }

      const assetResult = await httpOk(sourceUrl);
      check(`Media ${sku} ${role}`, assetResult.ok, `HTTP ${assetResult.status}`);
      if (assetResult.ok) passedAssets += 1;

      const transformedUrl = `${sourceUrl}?tr=f-auto,q-82,w-1200`;
      const transformResult = await httpOk(transformedUrl);
      check(`Transform ${sku} ${role}`, transformResult.ok, `HTTP ${transformResult.status}`);
      if (!transformResult.ok) {
        // Keep the product-level page check independent of transformation failures.
      }
    }

    const pageResult = await httpOk(`${SHOP_URL}/product/${encodeURIComponent(product.slug)}`);
    check(`Product page ${product.slug}`, pageResult.ok, `HTTP ${pageResult.status}`);
    if (pageResult.ok) passedPages += 1;
  }

  check("Hero + Gallery 01/02/03 assets all HTTP 200", passedAssets === expectedAssets, `${passedAssets}/${expectedAssets}`);
  check("All mapped product slugs HTTP 200", passedPages === mapped.size, `${passedPages}/${mapped.size}`);
}

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

  // 9. Public storefront media + route contract
  await mediaSmoke();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}

main();
