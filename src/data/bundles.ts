// ResoFlex Store Bundles — meal plans, supplements, training packs.
// Externalized Paystack pay links; SKUs map through checkout metadata.

export type BundleCategory = "meal" | "supplement" | "training";

export type Bundle = {
  id: string;
  sku: string;
  category: BundleCategory;
  name: string;
  tagline: string;
  now: number;
  was?: number;
  priceLabel: string;
  features: string[];
  paystackUrl: string;
  popular?: boolean;
  icon: string;
};

const NGN = (n: number) =>
  "NGN " + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const BUNDLES: Bundle[] = [
  // MEAL PLANS
  {
    id: "meal-heritage-30",
    sku: "MEAL-HRT-30",
    category: "meal",
    name: "Heritage 30-Day Meal Plan",
    tagline: "African pantry · macro-tuned for fat loss.",
    now: 7500,
    was: 12000,
    priceLabel: NGN(7500),
    features: ["30-day rotation", "African pantry ingredients", "Macro-tuned", "PDF + mobile"],
    paystackUrl: "https://paystack.shop/pay/heritage-meal-30",
    icon: "fa-utensils",
  },
  {
    id: "meal-elite-90",
    sku: "MEAL-ELT-90",
    category: "meal",
    name: "Elite 90-Day Metabolic Plan",
    tagline: "Periodized 3-phase transformation plan.",
    now: 18000,
    was: 25000,
    priceLabel: NGN(18000),
    popular: true,
    features: ["3 phases × 30 days", "Prep-day templates", "Grocery lists", "Recipe swaps"],
    paystackUrl: "https://paystack.shop/pay/elite-meal-90",
    icon: "fa-fire-flame-curved",
  },

  // SUPPLEMENTS
  {
    id: "supp-core-stack",
    sku: "SUPP-CORE-01",
    category: "supplement",
    name: "Core Recovery Stack",
    tagline: "Whey · creatine · electrolytes.",
    now: 22000,
    was: 28000,
    priceLabel: NGN(22000),
    features: ["30-day supply", "Nationwide delivery", "Elite-grade formulas", "COD available"],
    paystackUrl: "https://paystack.shop/pay/supp-core-stack",
    icon: "fa-flask",
  },
  {
    id: "supp-curve-stack",
    sku: "SUPP-CRV-01",
    category: "supplement",
    name: "Curve Enhancement Stack",
    tagline: "Collagen · glute-support blend.",
    now: 28000,
    was: 35000,
    priceLabel: NGN(28000),
    popular: true,
    features: ["Feminine formulation", "Curve support", "Nationwide delivery", "Escrow protected"],
    paystackUrl: "https://paystack.shop/pay/supp-curve-stack",
    icon: "fa-bottle-droplet",
  },

  // TRAINING PACKS
  {
    id: "train-glute-pro",
    sku: "TRAIN-GLT-01",
    category: "training",
    name: "Glute Pro Training Pack",
    tagline: "8-week sculpt + lift protocol.",
    now: 9500,
    priceLabel: NGN(9500),
    features: ["8-week video program", "Progressive overload", "Mobile-first", "Coach chat"],
    paystackUrl: "https://paystack.shop/pay/train-glute-pro",
    icon: "fa-dumbbell",
  },
  {
    id: "train-fatloss-30",
    sku: "TRAIN-FL-30",
    category: "training",
    name: "30-Day Fat Loss Pack",
    tagline: "HIIT + resistance · home-friendly.",
    now: 6500,
    priceLabel: NGN(6500),
    features: ["30-day plan", "No equipment fallback", "Mobile app delivery", "Progress tracker"],
    paystackUrl: "https://paystack.shop/pay/train-fatloss-30",
    icon: "fa-bolt",
  },
];

export const getBundlesByCategory = (cat: BundleCategory) =>
  BUNDLES.filter((b) => b.category === cat);

export const suggestBundlesFor = (productSku: string): Bundle[] => {
  const s = productSku.toUpperCase();
  if (s.startsWith("B2K")) {
    return BUNDLES.filter((b) => b.id === "supp-curve-stack" || b.id === "train-glute-pro" || b.id === "meal-elite-90");
  }
  if (s.startsWith("RF-")) {
    return BUNDLES.filter((b) => b.id === "supp-core-stack" || b.id === "meal-elite-90" || b.id === "train-fatloss-30");
  }
  // Default: top 3 popular / high value
  return [BUNDLES[1], BUNDLES[3], BUNDLES[4]];
};
