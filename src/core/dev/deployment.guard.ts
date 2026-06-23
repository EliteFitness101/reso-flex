import { CORE_PRODUCTS } from "@/core/product.engine";

/**
 * Deployment Safety Guard
 * Run before build or CI
 */

export const validateDeployment = () => {
  console.log("🔍 Running deployment validation...");

  validateUniqueSlugs();
  validatePaystackIntegrity();
  validateFreeProducts();

  console.log("✅ Deployment validation passed");
};

/**
 * 1. SLUG UNIQUENESS
 */
const validateUniqueSlugs = () => {
  const slugs = CORE_PRODUCTS.map((p) => p.slug);
  const duplicates = slugs.filter(
    (slug, i) => slugs.indexOf(slug) !== i
  );

  if (duplicates.length > 0) {
    throw new Error(
      `❌ Duplicate slugs detected: ${duplicates.join(", ")}`
    );
  }
};

/**
 * 2. PAYSTACK VALIDATION
 */
const validatePaystackIntegrity = () => {
  const invalid = CORE_PRODUCTS.filter(
    (p) => !p.isFree && !p.paystackUrl
  );

  if (invalid.length > 0) {
    throw new Error(
      `❌ Missing Paystack URLs: ${invalid.map(p => p.id).join(", ")}`
    );
  }
};

/**
 * 3. FREE PRODUCT SAFETY
 */
const validateFreeProducts = () => {
  const invalidFree = CORE_PRODUCTS.filter(
    (p) => p.isFree && p.paystackUrl !== null
  );

  if (invalidFree.length > 0) {
    throw new Error(
      `❌ Free products must NOT have Paystack URLs`
    );
  }
};
