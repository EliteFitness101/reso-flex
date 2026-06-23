// FILE: src/core/product.engine.ts

export type ProductCategory =
  | "digital"
  | "physical"
  | "bundle"
  | "membership";

export interface CoreProduct {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  paystackUrl: string | null;
  isFree?: boolean;
  featured?: boolean;
}

export const CORE_PRODUCTS: CoreProduct[] = [
  {
    id: "rf-expansion-module-blue",
    slug: "rf-expansion-module-blue",
    name: "ResoFlex Expansion Module — Blue",
    category: "digital",
    price: 25000,
    paystackUrl: "https://paystack.shop/pay/rf-expansion-blue",
  },
  {
    id: "rf-expansion-module-duo",
    slug: "rf-expansion-module-duo",
    name: "ResoFlex Expansion Module — Duo",
    category: "digital",
    price: 45000,
    paystackUrl: "https://paystack.shop/pay/rf-expansion-duo",
  },
  {
    id: "rf-elite-coaching-30day",
    slug: "rf-elite-coaching-30day",
    name: "ResoFlex Elite 30-Day Coaching",
    category: "digital",
    price: 15000,
    paystackUrl: "https://paystack.shop/pay/rf-coaching-30",
  },
  {
    id: "rf-90day-metabolic-blueprint",
    slug: "rf-90day-metabolic-blueprint",
    name: "90-Day Metabolic Blueprint",
    category: "digital",
    price: 0,
    isFree: true,
    paystackUrl: null,
  },
  {
    id: "buttgrowthb2k-starter",
    slug: "buttgrowthb2k-starter",
    name: "B2K Starter Kit",
    category: "digital",
    price: 5000,
    paystackUrl: "https://paystack.shop/pay/b2k-starter",
  },
  {
    id: "buttgrowthb2k-core",
    slug: "buttgrowthb2k-core",
    name: "B2K Core System",
    category: "digital",
    price: 12000,
    paystackUrl: "https://paystack.shop/pay/b2k-core",
  },
  {
    id: "buttgrowthb2k-pro",
    slug: "buttgrowthb2k-pro",
    name: "B2K Pro Sculpt System",
    category: "digital",
    price: 25000,
    paystackUrl: "https://paystack.shop/pay/b2k-pro",
  },
  {
    id: "buttgrowthb2k-elite",
    slug: "buttgrowthb2k-elite",
    name: "B2K Elite 90-Day Transformation",
    category: "bundle",
    price: 50000,
    paystackUrl: "https://paystack.shop/pay/b2k-elite",
    featured: true,
  },
];
