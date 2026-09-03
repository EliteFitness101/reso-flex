import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OrderStatus from "./pages/OrderStatus";
import OrderStatusV2 from "./pages/OrderStatusV2";
import WhatsAppReport from "./pages/WhatsAppReport";
import ProductPage from "./pages/ProductPage";
import CollectionsPage from "./pages/CollectionsPage";
import { productRoutes } from "@/core/router/product.routes";

const AdminGate = lazy(() => import("./admin/AdminGate"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const RevenueDashboard = lazy(() => import("./pages/admin/RevenueDashboard"));
const OrdersAdmin = lazy(() => import("./pages/admin/OrdersAdmin"));
const PaymentsAdmin = lazy(() => import("./pages/admin/PaymentsAdmin"));
const ResellersAdmin = lazy(() => import("./pages/admin/ResellersAdmin"));
const InventoryAdmin = lazy(() => import("./pages/admin/InventoryAdmin"));
const FulfillmentAdmin = lazy(() => import("./pages/admin/FulfillmentAdmin"));
const ChatB2KAdmin = lazy(() => import("./pages/admin/ChatB2KAdmin"));
const CatalogAdmin = lazy(() => import("./pages/admin/CatalogAdmin"));
const MediaAdmin = lazy(() => import("./pages/admin/MediaAdmin"));
const SecurityAdmin = lazy(() => import("./pages/admin/SecurityAdmin"));
const AuditLogsAdmin = lazy(() => import("./pages/admin/AuditLogsAdmin"));
const ChatB2KPage = lazy(() => import("./pages/ChatB2KPage"));
const AttributionQA = import.meta.env.DEV ? lazy(() => import("./dev/qa/AttributionQA")) : null;
const queryClient = new QueryClient();
const Loading = () => <div className="min-h-screen grid place-items-center bg-noir-950 text-foreground/50 text-xs uppercase tracking-[0.35em]">Loading…</div>;

export default function App() {
  return <QueryClientProvider client={queryClient}><BrowserRouter><Suspense fallback={<Loading />}><Routes>
    <Route path="/" element={<Index />} />
    <Route path="/shop" element={<Index />} />
    <Route path="/product/:slug" element={<ProductPage />} />
    <Route path="/products/:slug" element={<ProductPage />} />
    <Route path="/shop/products/:slug" element={<ProductPage />} />
    <Route path="/collections/:collection" element={<CollectionsPage />} />
    <Route path="/wishlist" element={<CollectionsPage />} />
    <Route path="/order/:reference" element={<OrderStatus />} />
    <Route path="/order-status/:orderId" element={<OrderStatusV2 />} />
    <Route path="/chatb2k" element={<ChatB2KPage />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin/whatsapp" element={<WhatsAppReport />} />
    <Route path="/admin" element={<AdminGate><AdminLayout /></AdminGate>}>
      <Route index element={<RevenueDashboard />} /><Route path="orders" element={<OrdersAdmin />} /><Route path="payments" element={<PaymentsAdmin />} /><Route path="resellers" element={<ResellersAdmin />} /><Route path="inventory" element={<InventoryAdmin />} /><Route path="fulfillment" element={<FulfillmentAdmin />} /><Route path="chatb2k" element={<ChatB2KAdmin />} /><Route path="catalog" element={<CatalogAdmin />} /><Route path="media" element={<MediaAdmin />} /><Route path="security" element={<SecurityAdmin />} /><Route path="security/audit" element={<AuditLogsAdmin />} />
    </Route>
    {import.meta.env.DEV && AttributionQA && <Route path="/__qa/attribution" element={<AttributionQA />} />}
    {productRoutes.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
    <Route path="*" element={<NotFound />} />
  </Routes></Suspense></BrowserRouter></QueryClientProvider>;
}
