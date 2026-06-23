import { CORE_PRODUCTS } from "@/core/product.engine";
import ProductPage from "@/pages/ProductPage";

/**
 * 🧠 AUTO-GENERATED PRODUCT ROUTES
 * NO MANUAL ROUTE MAINTENANCE
 */

export const productRoutes = CORE_PRODUCTS.map((product) => ({
  path: `/products/${product.slug}`,
  element: <ProductPage />,
}));
