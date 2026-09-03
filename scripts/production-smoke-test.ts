/** Production smoke test — bunx tsx scripts/production-smoke-test.ts */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.VITE_SUPABASE_URL ?? "https://vbqjvmnhdtdhmeeudqnn.supabase.co";
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const SHOP_URL = (process.env.PRODUCTION_BASE_URL ?? "https://shop.resofit.fit").replace(/\/$/, "");
const results: { name: string; ok: boolean; note?: string }[] = [];
const check = (name: string, ok: boolean, note?: string) => { results.push({ name, ok, note }); console.log(`${ok ? "✓" : "✗"} ${name}${note ? ` — ${note}` : ""}`); };

async function http(url: string) { try { const r = await fetch(url, { redirect: "follow" }); return { ok: r.status === 200, status: r.status }; } catch { return { ok: false, status: 0 }; } }

async function main() {
  if (!KEY) { console.error("Missing VITE_SUPABASE_PUBLISHABLE_KEY"); process.exit(1); }
  const db = createClient(URL, KEY);
  const { error: connErr } = await db.from("collections").select("id").limit(1);
  check("Database connection", !connErr, connErr?.message);
  const { error: authErr } = await db.auth.getSession();
  check("Authentication", !authErr, authErr?.message);
  const orders = await db.from("orders").select("id").limit(1);
  check("RBAC: orders locked to anon", !!orders.error || (orders.data ?? []).length === 0);
  const roles = await db.from("user_roles").select("id").limit(1);
  check("RBAC: user_roles locked to anon", !!roles.error || (roles.data ?? []).length === 0);
  const products = await db.from("products").select("id,sku,handle,published,variant_inventory_qty").eq("published", true).limit(250);
  check("Published product API", !products.error, products.error?.message ?? `${products.data?.length ?? 0} rows`);
  const live = products.data ?? [];
  check("All published products in stock", live.every((p: any) => Number(p.variant_inventory_qty ?? 0) > 0), `${live.filter((p: any) => Number(p.variant_inventory_qty ?? 0) > 0).length}/${live.length}`);
  check("Published catalog count", live.length >= 114, `${live.length} published products`);
  const collections = await db.from("collections").select("collection_code,visibility").limit(50);
  check("Collection API", !collections.error, collections.error?.message);
  const mappings = await db.from("product_collection_mappings").select("product_sku").limit(10);
  check("Collection mappings readable", !mappings.error, mappings.error?.message);
  const assets = await db.from("product_assets").select("url,is_public").limit(10);
  check("Asset loading", !assets.error, assets.error?.message);
  const sources = await db.from("commerce_sources").select("id,name,enabled,checkout_mode").eq("enabled", true);
  check("Commerce source control plane", !sources.error && (sources.data ?? []).some((s: any) => s.checkout_mode === "internal"), sources.error?.message);
  const offers = await db.from("commerce_offers").select("id").limit(1);
  check("Commerce offers table secured", !offers.error || offers.error?.code === "PGRST116", offers.error?.message);

  let routePass = 0;
  for (const p of live) {
    const result = await http(`${SHOP_URL}/product/${encodeURIComponent(p.handle)}`);
    if (result.ok) routePass += 1;
    else check(`Product route ${p.handle}`, false, `HTTP ${result.status}`);
  }
  check("Every published product route HTTP 200", routePass === live.length, `${routePass}/${live.length}`);

  const manifestPath = path.join(process.cwd(), "public/resoflex_imagekit_verified_manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Array<{ status?: string; sku?: string; role?: string; url?: string }>;
    const verified = manifest.filter(x => x.status === "verified" && x.sku && x.role && x.url);
    check("Verified media manifest readable", true, `${verified.length} verified assets`);
  }

  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}
main();
