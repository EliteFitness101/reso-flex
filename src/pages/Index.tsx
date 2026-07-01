import { lazy, Suspense, useEffect, useState } from "react";
import { AnnouncementBar } from "@/components/sales/AnnouncementBar";
import { Nav } from "@/components/sales/Nav";
import { TrustFloatBadge } from "@/components/sales/TrustFloatBadge";
import { HeroCarousel } from "@/components/sales/HeroCarousel";
import { TrustBadges } from "@/components/sales/TrustBadges";
import { ProductGrid } from "@/components/sales/ProductGrid";
import { LazySection } from "@/components/sales/LazySection";
import { MusicBubble } from "@/components/sales/MusicBubble";
import { ChatBubble } from "@/components/sales/ChatBubble";
import type { Product } from "@/data/products";
import { captureAttribution } from "@/lib/attribution";

// Below-the-fold: code-split + IntersectionObserver gated
const BundleGrid = lazy(() => import("@/components/sales/BundleGrid").then(m => ({ default: m.BundleGrid })));
const TrustAuthority = lazy(() => import("@/components/sales/TrustAuthority").then(m => ({ default: m.TrustAuthority })));
const PainMatrix = lazy(() => import("@/components/sales/PainMatrix").then(m => ({ default: m.PainMatrix })));
const UrgencyStrip = lazy(() => import("@/components/sales/UrgencyStrip").then(m => ({ default: m.UrgencyStrip })));
const SocialProof = lazy(() => import("@/components/sales/SocialProof").then(m => ({ default: m.SocialProof })));
const NaijaFitRev = lazy(() => import("@/components/sales/NaijaFitRev").then(m => ({ default: m.NaijaFitRev })));
const Reseller = lazy(() => import("@/components/sales/Reseller").then(m => ({ default: m.Reseller })));
const FAQ = lazy(() => import("@/components/sales/FAQ").then(m => ({ default: m.FAQ })));

const Footer = lazy(() => import("@/components/sales/Footer").then(m => ({ default: m.Footer })));
const CheckoutModal = lazy(() => import("@/components/sales/CheckoutModal").then(m => ({ default: m.CheckoutModal })));
const WelcomeOnboarding = lazy(() => import("@/components/sales/WelcomeOnboarding").then(m => ({ default: m.WelcomeOnboarding })));
const UpsellPrompt = lazy(() => import("@/components/sales/UpsellPrompt").then(m => ({ default: m.UpsellPrompt })));

const Index = () => {
  const [upsell, setUpsell] = useState<Product | null>(null);
  const [checkout, setCheckout] = useState<Product | null>(null);
  const [welcome, setWelcome] = useState<Product | null>(null);

  useEffect(() => { captureAttribution(); }, []);

  const handleBuy = (p: Product) => setUpsell(p);
  const skipUpsell = () => {
    if (upsell) {
      setCheckout(upsell);
      setUpsell(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnnouncementBar />
      <Nav />
      <main>
        {/* Above-the-fold: eagerly rendered for sub-3s Equipment Store visibility */}
        <TrustFloatBadge />
        <HeroCarousel />
        <TrustBadges />
        <ProductGrid onBuy={handleBuy} />

        {/* Below-the-fold: lazy + IO-gated, with force-mount fallback */}
        <LazySection forceAfterMs={2500} minHeight={300}>
          <Suspense fallback={null}><BundleGrid /></Suspense>
        </LazySection>
        <LazySection><Suspense fallback={null}><TrustAuthority /></Suspense></LazySection>
        <LazySection><Suspense fallback={null}><PainMatrix /></Suspense></LazySection>
        <LazySection><Suspense fallback={null}><UrgencyStrip /></Suspense></LazySection>
        <LazySection><Suspense fallback={null}><SocialProof /></Suspense></LazySection>
        <LazySection><Suspense fallback={null}><NaijaFitRev /></Suspense></LazySection>
        <LazySection><Suspense fallback={null}><Reseller /></Suspense></LazySection>
        <LazySection><Suspense fallback={null}><FAQ /></Suspense></LazySection>
      </main>

      <LazySection minHeight={120}>
        <Suspense fallback={null}><Footer /></Suspense>
      </LazySection>

      <MusicBubble />
      <ChatBubble />

      {upsell && (
        <Suspense fallback={null}>
          <UpsellPrompt
            productSku={upsell.sku}
            productName={upsell.name}
            onClose={skipUpsell}
          />
        </Suspense>
      )}
      {checkout && (
        <Suspense fallback={null}>
          <CheckoutModal
            product={checkout}
            onClose={() => setCheckout(null)}
            onPaid={(p) => { setCheckout(null); setWelcome(p); }}
          />
        </Suspense>
      )}
      {welcome && (
        <Suspense fallback={null}>
          <WelcomeOnboarding product={welcome} onClose={() => setWelcome(null)} />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
