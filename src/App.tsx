import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import ProductPage from "./pages/ProductPage";

import { productRoutes } from "@/core/router/product.routes";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* 🧠 AUTO PRODUCT ROUTES */}
          {productRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}

          {/* FUNNEL */}
          <Route path="/checkout/:slug" element={<CheckoutPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/membership" element={<MembershipPage />} />

          {/* DASHBOARDS */}
          <Route path="/vip" element={<VipDashboard />} />
          <Route path="/elite" element={<EliteDashboard />} />

          {/* FALLBACK */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
