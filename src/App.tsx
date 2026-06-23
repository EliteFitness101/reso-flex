import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import { useFunnelNavReset } from "@/hooks/useFunnelNavReset";
import { RILDebugPanel } from "@/components/sales/RILDebugPanel";

/**
 * 🧠 DYNAMIC PRODUCT ROUTES
 */
import { productRoutes } from "@/core/router/product.routes";

/**
 * OTHER PAGES
 */
import CheckoutPage from "@/pages/CheckoutPage";
import AssessmentPage from "@/pages/AssessmentPage";
import ThankYouPage from "@/pages/ThankYouPage";
import MembershipPage from "@/pages/MembershipPage";
import VipDashboard from "@/pages/VipDashboard";
import EliteDashboard from "@/pages/EliteDashboard";

const queryClient = new QueryClient();

const RouterShell = () => {
  useFunnelNavReset();

  return (
    <>
      <Routes>
        {/* 🏠 HOME */}
        <Route path="/" element={<Index />} />

        {/* 🧠 AUTO-GENERATED PRODUCT ROUTES */}
        {productRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* 💳 CHECKOUT SYSTEM */}
        <Route path="/checkout/:slug" element={<CheckoutPage />} />

        {/* 🎯 FUNNEL */}
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/membership" element={<MembershipPage />} />

        {/* 🔐 DASHBOARDS */}
        <Route path="/vip" element={<VipDashboard />} />
        <Route path="/elite" element={<EliteDashboard />} />

        {/* ❌ FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <RILDebugPanel />
    </>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <RouterShell />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
