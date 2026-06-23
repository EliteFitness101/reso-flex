export type ProductCategory =
  | "digital"
  | "physical"
  | "bundle"
  | "membership";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  paystackUrl: string;
  image: string;
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "tier2",
    name: "NaijaFit™ Enhanced Wellness Plan",
    slug: "naijafit-tier2-5000",
    category: "digital",
    price: 5000,
    paystackUrl: "https://paystack.shop/pay/naijafit-5000",
    image: "/images/tier2_cover_enhanced_naijafit.jpeg",
    featured: true,
  },
  {
    id: "fitness-evolution",
    name: "Fitness Evolution™",
    slug: "fitness-evolution",
    category: "digital",
    price: 15000,
    paystackUrl: "https://paystack.shop/pay/fitness-evolution",
    image: "/images/fitness-evolution.jpeg",
  },
  {
    id: "heritage",
    name: "Heritage Meal Protocol",
    slug: "heritage-meal",
    category: "digital",
    price: 3500,
    paystackUrl: "https://paystack.shop/pay/heritage-meal",
    image: "/images/heritage-meal.jpeg",
  },
  {
    id: "buttgrowth",
    name: "Butt Growth B2K",
    slug: "buttgrowthb2k",
    category: "digital",
    price: 15000,
    paystackUrl: "https://paystack.shop/pay/buttgrowthb2k",
    image: "/images/buttgrowth.jpeg",
  },
];
