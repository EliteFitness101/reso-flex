import { useState } from "react";
import { AnnouncementBar } from "@/components/sales/AnnouncementBar";
import { Nav } from "@/components/sales/Nav";
import { Hero } from "@/components/sales/Hero";
import { TrustBadges } from "@/components/sales/TrustBadges";
import { PainMatrix } from "@/components/sales/PainMatrix";
import { ProductGrid } from "@/components/sales/ProductGrid";
import { SocialProof } from "@/components/sales/SocialProof";
import { UrgencyStrip } from "@/components/sales/UrgencyStrip";
import { Reseller } from "@/components/sales/Reseller";
import { FAQ } from "@/components/sales/FAQ";
import { AdminDashboard } from "@/components/sales/AdminDashboard";
import { Footer } from "@/components/sales/Footer";
import { CheckoutModal } from "@/components/sales/CheckoutModal";
import { WelcomeOnboarding } from "@/components/sales/WelcomeOnboarding";
import type { Product } from "@/data/products";

const Index = () => {
  const [checkout, setCheckout] = useState<Product | null>(null);
  const [welcome, setWelcome] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero />
        <TrustBadges />
        <PainMatrix />
        <ProductGrid onBuy={setCheckout} />
        <UrgencyStrip />
        <SocialProof />
        <Reseller />
        <FAQ />
        <AdminDashboard />
      </main>
      <Footer />

      {checkout && (
        <CheckoutModal
          product={checkout}
          onClose={() => setCheckout(null)}
          onPaid={(p) => { setCheckout(null); setWelcome(p); }}
        />
      )}
      {welcome && <WelcomeOnboarding product={welcome} onClose={() => setWelcome(null)} />}
    </div>
  );
};

export default Index;
