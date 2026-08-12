/**
 * 🧠 PRODUCT ROUTES
 *
 * All product URLs are served by the dynamic `/products/:slug` route in App.tsx.
 * Static per-product paths are intentionally NOT emitted here: React Router
 * ranks a static segment above a dynamic one regardless of declaration order,
 * so `/products/<slug>` would win the match and `useParams().slug` would be
 * undefined — rendering "Product not found" for every product.
 */

export const productRoutes: { path: string; element: JSX.Element }[] = [];
