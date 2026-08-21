import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "public/resoflex_imagekit_verified_manifest.json");
const productsPath = path.join(root, "src/data/products.ts");
const bundlesPath = path.join(root, "src/data/bundles.ts");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Array<{
  sku?: string;
  product_name?: string;
  slug?: string;
  status?: string;
  imagekit_url?: string;
  role?: string;
}>;

const source = `${fs.readFileSync(productsPath, "utf8")}\n${fs.readFileSync(bundlesPath, "utf8")}`;
const sourceSkus = new Set([...source.matchAll(/sku:\s*["']([^"']+)["']/g)].map((m) => m[1]));

const errors: string[] = [];
const seen = new Set<string>();

for (const asset of manifest) {
  const sku = asset.sku?.trim();
  const slug = asset.slug?.trim();

  if (!sku || !slug || asset.status === "unmapped_folder") {
    errors.push(`UNMAPPED_IMAGEKIT_ASSET: ${asset.product_name ?? "unknown product"} (sku=${sku || "missing"}, slug=${slug || "missing"})`);
    continue;
  }

  if (seen.has(sku)) errors.push(`DUPLICATE_IMAGEKIT_SKU: ${sku}`);
  seen.add(sku);

  if (!asset.imagekit_url) errors.push(`MISSING_IMAGEKIT_URL: ${sku}`);
}

const manifestSkus = [...seen];
const notInApp = manifestSkus.filter((sku) => !sourceSkus.has(sku));
for (const sku of notInApp) errors.push(`IMAGEKIT_SKU_NOT_IN_APP_CATALOG: ${sku}`);

console.log(`ImageKit verified SKUs: ${manifestSkus.length}`);
console.log(`Application catalog SKUs: ${sourceSkus.size}`);
console.log(`Integrity errors: ${errors.length}`);

if (errors.length) {
  console.error("\nCatalog integrity gate FAILED:\n" + errors.map((e) => `- ${e}`).join("\n"));
  console.error("\nUnmapped or unregistered media must never become customer-facing products.");
  process.exit(1);
}

console.log("Catalog integrity gate PASSED.");
