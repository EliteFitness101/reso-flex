// FILE: src/core/dev/deployment.guard.js

const { CORE_PRODUCTS } = require("../product.engine");

function run() {
  console.log("🔍 Running deployment validation...");

  checkSlugs();
  checkPaystack();
  checkFreeRules();

  console.log("✅ Deployment validation passed");
}

function checkSlugs() {
  const slugs = CORE_PRODUCTS.map((p) => p.slug);
  const duplicates = slugs.filter(
    (s, i) => slugs.indexOf(s) !== i
  );

  if (duplicates.length) {
    throw new Error("Duplicate slugs: " + duplicates.join(", "));
  }
}

function checkPaystack() {
  const invalid = CORE_PRODUCTS.filter(
    (p) => !p.isFree && !p.paystackUrl
  );

  if (invalid.length) {
    throw new Error(
      "Missing Paystack URLs: " +
        invalid.map((p) => p.id).join(", ")
    );
  }
}

function checkFreeRules() {
  const invalid = CORE_PRODUCTS.filter(
    (p) => p.isFree && p.paystackUrl !== null
  );

  if (invalid.length) {
    throw new Error("Free products must not have Paystack URLs");
  }
}

run();
