import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resetFunnelForNavigation } from "@/lib/funnelLock";

// Reset RIL behavioral baseline on SPA route change.
// Preserves UTM, Paystack tracking, session identity.
export const useFunnelNavReset = () => {
  const loc = useLocation();
  useEffect(() => {
    resetFunnelForNavigation();
  }, [loc.pathname]);
};
