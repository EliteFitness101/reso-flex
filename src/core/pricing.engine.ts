export interface Tier {
  name: string;
  price: number;
  slug: string;
  checkout: string;
}

export const TIERS: Tier[] = [
  {
    name: "Tier 1 Assessment",
    price: 0,
    slug: "naijafit-tier1",
    checkout:
      "https://joy-funnel-ai.lovable.app/?rsid=rs_daaee90990874cc8b5e5&utm_source=resoflex_os&utm_medium=spa&utm_campaign=sovereign_os_v4_2",
  },

  {
    name: "NaijaFit Enhanced Wellness",
    price: 5000,
    slug: "naijafit-tier2-5000",
    checkout:
      "https://paystack.shop/pay/naijafit-5000",
  },

  {
    name: "ResoFlex Meal Move",
    price: 15000,
    slug: "resoflex-meal-move",
    checkout:
      "https://paystack.shop/pay/resoflex-meal-move",
  },

  {
    name: "Wellness Protocol",
    price: 25000,
    slug: "wellness-protocol",
    checkout:
      "https://paystack.shop/pay/wellness-protocol",
  },

  {
    name: "ResoFlex Kinetic",
    price: 30000,
    slug: "resoflex-kinetic",
    checkout:
      "https://paystack.shop/pay/resoflex-kinetic",
  },

  {
    name: "ResoFlex Commander",
    price: 45000,
    slug: "resoflex-commander",
    checkout:
      "https://paystack.shop/pay/resoflex-commander",
  },
];
