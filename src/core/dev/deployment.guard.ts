import { PRODUCTS } from "@/data/products";

/**
 * Deployment Safety Guard
 * Validates the single product catalog (src/data/products.ts).
 */

export const validateDeployment = () => {
  console.log("🔍 Running deployment validation...");
  validateUniqueHandles();
  validateUniqueSkus();
  validateFreeProducts();
  console.log("✅ Deployment validation passed");
};

const validateUniqueHandles = () => {
  const handles = PRODUCTS.map((p) => p.handle);
  const dup = handles.filter((h, i) => handles.indexOf(h) !== i);
  if (dup.length) throw new Error(`❌ Duplicate handles: ${dup.join(", ")}`);
};

const validateUniqueSkus = () => {
  const skus = PRODUCTS.map((p) => p.sku);
  const dup = skus.filter((s, i) => skus.indexOf(s) !== i);
  if (dup.length) throw new Error(`❌ Duplicate SKUs: ${dup.join(", ")}`);
};

const validateFreeProducts = () => {
  const invalid = PRODUCTS.filter((p) => p.free && p.now !== 0);
  if (invalid.length) {
    throw new Error(
      `❌ Free products must have now=0: ${invalid.map((p) => p.id).join(", ")}`,
    );
  }
};
