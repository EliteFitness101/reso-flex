import rfExpBlue from "@/assets/products/rf-exp-blue.jpg";
import rfExpDuo from "@/assets/products/rf-exp-duo.jpg";
import rfCoach30 from "@/assets/products/rf-coach-30.jpg";
import rfBlueprint90 from "@/assets/products/rf-blueprint-90.jpg";
import b2kStarter from "@/assets/products/b2k-starter.jpg";
import b2kCore from "@/assets/products/b2k-core.jpg";
import b2kPro from "@/assets/products/b2k-pro.jpg";
import b2kElite from "@/assets/products/b2k-elite.jpg";

export type Product = {
  id: string;
  handle: string;
  sku: string;
  name: string;
  tagline: string;
  priceLabel: string;
  was: number;
  now: number;
  features: string[];
  popular?: boolean;
  free?: boolean;
  icon: string;
  image: string;
};

export const NGN = (n: number) =>
  "NGN " + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const PRODUCTS: Product[] = [
  {
    id: "rf-expansion-module-blue",
    handle: "rf-expansion-module-blue",
    sku: "RF-EXP-BLU-01",
    name: "ResoFlex Expansion Module — Blue",
    tagline: "Anodized telemetry core. Single unit.",
    priceLabel: "NGN 25,000.00",
    was: 25000,
    now: 25000,
    icon: "fa-cube",
    image: rfExpBlue,
    features: [
      "Matte charcoal composite shell",
      "Anodized classic-blue metallic core",
      "Laser-etched ResoFlex telemetry",
      "Pairs with ResoFlex ecosystem",
    ],
  },
  {
    id: "rf-expansion-module-duo",
    handle: "rf-expansion-module-duo",
    sku: "RF-EXP-BLU-02",
    name: "ResoFlex Expansion Module — Duo",
    tagline: "Symmetrical dual-module set. Most popular.",
    priceLabel: "NGN 45,000.00",
    was: 50000,
    now: 45000,
    icon: "fa-cubes",
    popular: true,
    image: rfExpDuo,
    features: [
      "Two synchronized expansion modules",
      "Biomechanical telemetry pairing",
      "Volcanic stone-grade build tolerance",
      "Bundle saving vs single-unit pricing",
    ],
  },
  {
    id: "rf-elite-coaching-30day",
    handle: "rf-elite-coaching-30day",
    sku: "RF-DLG-COACH-30",
    name: "ResoFlex Elite 30-Day Coaching",
    tagline: "Premium digital metabolic masterclass.",
    priceLabel: "NGN 15,000.00",
    was: 15000,
    now: 15000,
    icon: "fa-graduation-cap",
    image: rfCoach30,
    features: [
      "30-day structured coaching program",
      "Daily metabolic blueprint protocols",
      "Mobile-first delivery interface",
      "Lifetime access to module assets",
    ],
  },
  {
    id: "rf-90day-metabolic-blueprint",
    handle: "rf-90day-metabolic-blueprint",
    sku: "RF-DIG-MET-90",
    name: "90-Day Metabolic Blueprint & Meal Plan",
    tagline: "Complimentary with any module purchase.",
    priceLabel: "FREE (With Module Purchase)",
    was: 25000,
    now: 0,
    free: true,
    icon: "fa-book",
    image: rfBlueprint90,
    features: [
      "90-day periodized meal plan",
      "Macro-tuned for African pantry",
      "Premium hardcover-grade digital edition",
      "Auto-unlocked on module checkout",
    ],
  },
];
