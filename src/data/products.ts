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
  // NaijaFit™ Tier 1 — Free Funnel Entry
  {
    id: "naijafit-tier1-1000",
    handle: "naijafit-tier1-1000",
    sku: "NF-T1-001",
    name: "NaijaFit™ 7-Day Smart Nigerian Meal Plan",
    tagline: "Free funnel entry. Proven metabolism kickstart.",
    priceLabel: "FREE",
    was: 0,
    now: 0,
    free: true,
    icon: "fa-utensils",
    image: rfBlueprint90,
    features: [
      "7-day Nigerian-authentic meal plan",
      "Proven metabolism activation protocol",
      "Funnel entry to premium tiers",
      "No credit card required",
    ],
  },

  // NaijaFit™ Tier 2 — NGN 5,000
  {
    id: "naijafit-tier2-5000",
    handle: "naijafit-tier2-5000",
    sku: "NF-T2-001",
    name: "NaijaFit™ Core Meal Plan - 30 Days",
    tagline: "Core Nigerian nutrition protocol. 30 days.",
    priceLabel: "NGN 5,000.00",
    was: 5000,
    now: 5000,
    icon: "fa-heart",
    image: rfBlueprint90,
    features: [
      "30-day Nigerian meal framework",
      "Macro-tuned for African pantry",
      "Beginner-friendly meal swap guides",
      "WhatsApp group support included",
    ],
  },

  // NaijaFit™ Tier 3 — NGN 15,000 (Meal Move)
  {
    id: "resoflex-meal-move",
    handle: "resoflex-meal-move",
    sku: "NF-T3-001",
    name: "ResoFlex Meal Move — 90-Day Transformation",
    tagline: "Movement + nutrition. 90-day protocol.",
    priceLabel: "NGN 15,000.00",
    was: 15000,
    now: 15000,
    icon: "fa-dumbbell",
    image: rfCoach30,
    features: [
      "90-day meal + movement protocol",
      "Daily activation routines",
      "Metabolic blueprint workouts",
      "Lifetime meal asset access",
    ],
  },

  // NaijaFit™ Tier 4 — NGN 25,000 (Wellness Protocol)
  {
    id: "wellness-protocol",
    handle: "wellness-protocol",
    sku: "NF-T4-001",
    name: "Wellness Protocol™ — Complete Lifestyle System",
    tagline: "Nutrition + recovery + performance. 90 days.",
    priceLabel: "NGN 25,000.00",
    was: 25000,
    now: 25000,
    icon: "fa-leaf",
    image: rfExpBlue,
    features: [
      "90-day wellness transformation system",
      "Meal + movement + recovery protocols",
      "Performance tracking dashboard",
      "Coach access + community",
    ],
  },

  // NaijaFit™ Tier 5 — NGN 30,000 (Kinetic)
  {
    id: "resoflex-kinetic",
    handle: "resoflex-kinetic",
    sku: "NF-T5-001",
    name: "ResoFlex Kinetic™ — Advanced Performance System",
    tagline: "Performance science. For serious transformers.",
    priceLabel: "NGN 30,000.00",
    was: 30000,
    now: 30000,
    icon: "fa-bolt",
    image: b2kPro,
    features: [
      "Advanced performance science system",
      "Biometric optimization protocols",
      "Weekly coach check-ins",
      "Priority support + community",
    ],
  },

  // NaijaFit™ Tier 6 — NGN 45,000 (Commander)
  {
    id: "resoflex-commander",
    handle: "resoflex-commander",
    sku: "NF-T6-001",
    name: "ResoFlex Commander™ — VIP Transformation Suite",
    tagline: "VIP suite. Full access. Personal guidance.",
    priceLabel: "NGN 45,000.00",
    was: 50000,
    now: 45000,
    popular: true,
    icon: "fa-crown",
    image: rfExpDuo,
    features: [
      "VIP 90-day transformation suite",
      "Personal coach guidance",
      "Weekly accountability sessions",
      "Full system access + lifetime assets",
    ],
  },

  // Additional Verified Products
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
  {
    id: "buttgrowthb2k-starter",
    handle: "buttgrowthb2k-starter",
    sku: "B2K-001",
    name: "B2K-START™ | ButtgrowthB2K Starter Digital Kit",
    tagline: "Entry-level digital glute & nutrition starter kit.",
    priceLabel: "NGN 5,000.00",
    was: 5000,
    now: 5000,
    icon: "fa-seedling",
    image: b2kStarter,
    features: [
      "Beginner glute workout protocols",
      "Nutrition starter guide",
      "Onboarding support",
      "Natural curve enhancement basics",
    ],
  },
  {
    id: "buttgrowthb2k-core",
    handle: "buttgrowthb2k-core",
    sku: "B2K-002",
    name: "B2K-CORE™ | ButtgrowthB2K Complete Curve System",
    tagline: "Complete nutrition + workout curve system.",
    priceLabel: "NGN 12,000.00",
    was: 12000,
    now: 12000,
    icon: "fa-fire",
    image: b2kCore,
    features: [
      "Full sculpt & lift workout system",
      "Hip & glute nutrition program",
      "Coach-supported curve enhancement",
      "Natural transformation methodology",
    ],
  },
  {
    id: "buttgrowthb2k-pro",
    handle: "buttgrowthb2k-pro",
    sku: "B2K-003",
    name: "B2K-PRO™ | ButtgrowthB2K Sculpt & Lift Kit",
    tagline: "Advanced sculpt routines with priority support.",
    priceLabel: "NGN 25,000.00",
    was: 25000,
    now: 25000,
    icon: "fa-bolt",
    image: b2kPro,
    features: [
      "Advanced sculpt & lift routines",
      "Weekly periodized plans",
      "Priority coach support",
      "Lifestyle & definition guidance",
    ],
  },
  {
    id: "buttgrowthb2k-elite",
    handle: "buttgrowthb2k-elite",
    sku: "B2K-004",
    name: "B2K-ELITE™ | 90-Day Curve Transformation Bundle",
    tagline: "VIP 90-day transformation with full B2K system.",
    priceLabel: "NGN 50,000.00",
    was: 60000,
    now: 50000,
    popular: true,
    icon: "fa-crown",
    image: b2kElite,
    features: [
      "90-day transformation roadmap",
      "VIP coach direct access",
      "Personalized weekly guidance",
      "Full ButtgrowthB2K system included",
    ],
  },
];
