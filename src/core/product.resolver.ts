// Thin re-export layer over the Product Engine. Kept for import stability.
export {
  getProduct,
  getProductBySlug,
  getProductById,
  getProductBySku,
  getCheckoutUrl,
  getFeaturedProducts,
  getBundles,
  getBundleBySku,
  getBundleSuggestionsFor,
} from "@/core/product.engine";
