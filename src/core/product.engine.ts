export type ProductCategory =
  | "digital"
  | "physical"
  | "bundle"
  | "membership";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  paystackUrl: string | null;
  image?: string;
  featured?: boolean;
  isFree?: boolean;
}

/**
 * 🧠 SINGLE SOURCE OF TRUTH
 */
export const CORE_PRODUCTS: Product[] = [
  {
    id: "naijafit-tier2",
    slug: "naijafit-tier2-5000",
    name: "NaijaFit™ Enhanced Wellness Plan",
    category: "digital",
    price: 5000,
    paystackUrl: "https://paystack.shop/pay/naijafit-5000",
    featured: true,
  },
  {
    id: "fitness-evolution",
    slug: "fitness-evolution",
    name: "Fitness Evolution™",
    category: "digital",
    price: 15000,
    paystackUrl: "https://paystack.shop/pay/fitness-evolution",
  },
  {
    id: "heritage-meal",
    slug: "heritage-meal",
    name: "Heritage Meal Protocol",
    category: "digital",
    price: 3500,
    paystackUrl: "https://paystack.shop/pay/heritage-meal",
  },
  {
    id: "buttgrowthb2k",
    slug: "buttgrowthb2k",
    name: "Butt Growth B2K",
    category: "digital",
    price: 15000,
    paystackUrl: "https://paystack.shop/pay/buttgrowthb2k",
  },

  // RESOFLEX
  {
    id: "rf-blue",
    slug: "rf-expansion-module-blue",
    name: "ResoFlex Expansion Module — Blue",
    category: "digital",
    price: 25000,
    paystackUrl: "https://paystack.shop/pay/rf-expansion-blue",
  },
  {
    id: "rf-duo",
    slug: "rf-expansion-module-duo",
    name: "ResoFlex Expansion Module — Duo",
    category: "digital",
    price: 45000,
    paystackUrl: "https://paystack.shop/pay/rf-expansion-duo",
  },
  {
    id: "rf-coach",
    slug: "rf-elite-coaching-30day",
    name: "ResoFlex Elite 30-Day Coaching",
    category: "digital",
    price: 15000,
    paystackUrl: "https://paystack.shop/pay/rf-coaching-30",
  },
  {
    id: "rf-blueprint",
    slug: "rf-90day-metabolic-blueprint",
    name: "90-Day Metabolic Blueprint",
    category: "digital",
    price: 0,
    paystackUrl: null,
    isFree: true,
  },

  // B2K
  {
    id: "b2k-starter",
    slug: "buttgrowthb2k-starter",
    name: "B2K Starter Kit",
    category: "digital",
    price: 5000,
    paystackUrl: "https://paystack.shop/pay/b2k-starter",
  },
  {
    id: "b2k-core",
    slug: "buttgrowthb2k-core",
    name: "B2K Core System",
    category: "digital",
    price: 12000,
    paystackUrl: "https://paystack.shop/pay/b2k-core",
  },
  {
    id: "b2k-pro",
    slug: "buttgrowthb2k-pro",
    name: "B2K Pro Sculpt System",
    category: "digital",
    price: 25000,
    paystackUrl: "https://paystack.shop/pay/b2k-pro",
  },
  {
    id: "b2k-elite",
    slug: "buttgrowthb2k-elite",
    name: "B2K Elite 90-Day Transformation",
    category: "bundle",
    price: 50000,
    paystackUrl: "https://paystack.shop/pay/b2k-elite",
    featured: true,
  },
];
