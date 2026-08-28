export const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  DIGITAL: "/digital",
  PHYSICAL: "/physical",
  MEMBERSHIP: "/membership",
  PRODUCTS: "/products",
  STATUS: "/status",
  CHECKOUT_SUCCESS: "/status?payment=success",
  CHECKOUT_PENDING: "/status?payment=pending",
  CHECKOUT_FAILED: "/status?payment=failed",
};

// Product pages are resolved dynamically from the canonical catalog.
// Do not add per-product routes here; this prevents hardcoded/reset-specific
// routing and keeps SKU/slug resolution in the product resolver.
export const PRODUCT_ROUTES: string[] = [];
