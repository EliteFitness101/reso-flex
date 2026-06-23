export interface Tier {
  name: string;
  price: number;
  slug: string;
  checkout: string;
}

export const TIERS: Tier[] = [
  {
    name: "Tier 1",
    price: 0,
    slug: "naijafit-tier1",
    checkout:
      "https://joy-funnel-ai.lovable.app/?rsid=rs_daaee90990874cc8b5e5",
  },
  {
    name: "Tier 2",
    price: 5000,
    slug: "naijafit-tier2-5000",
    checkout: "https://paystack.shop/pay/naijafit-5000",
  },
  {
    name: "Tier 3",
    price: 15000,
    slug: "resoflex-meal-move",
    checkout: "https://paystack.shop/pay/resoflex-meal-move",
  },
  {
    name: "Tier 4",
    price: 25000,
    slug: "wellness-protocol",
    checkout: "https://paystack.shop/pay/wellness-protocol",
  },
  {
    name: "Tier 5",
    price: 30000,
    slug: "resoflex-kinetic",
    checkout: "https://paystack.shop/pay/resoflex-kinetic",
  },
  {
    name: "Tier 6",
    price: 45000,
    slug: "resoflex-commander",
    checkout: "https://paystack.shop/pay/resoflex-commander",
  },
];
