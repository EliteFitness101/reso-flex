import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OrderStatus from "./pages/OrderStatus";
import OrderStatusV2 from "./pages/OrderStatusV2";
import WhatsAppReport from "./pages/WhatsAppReport";
import { productRoutes } from "@/core/router/product.routes";

const AdminGate = lazy(() => import("./admin/AdminGate"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const RevenueDashboard = lazy(() => import("./pages/admin/RevenueDashboard"));
const OrdersAdmin = lazy(() => import("./pages/admin/OrdersAdmin"));
const PaymentsAdmin = lazy(() => import("./pages/admin/PaymentsAdmin"));
const ResellersAdmin = lazy(() => import("./pages/admin/ResellersAdmin"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen grid place-items-center bg-noir-950 text-foreground/50 text-xs uppercase tracking-[0.35em]">Loading…</div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/order/:reference" element={<OrderStatus />} />
            <Route path="/order-status/:orderId" element={<OrderStatusV2 />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/whatsapp" element={<WhatsAppReport />} />
            <Route path="/admin" element={<AdminGate><AdminLayout /></AdminGate>}>
              <Route index element={<RevenueDashboard />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="payments" element={<PaymentsAdmin />} />
              <Route path="resellers" element={<ResellersAdmin />} />
            </Route>

            {productRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
