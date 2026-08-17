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
    id: "rf-personalized-meal-workout-reset",
    handle: "rf-personalized-meal-workout-reset",
    sku: "RF-DIG-MW-125",
    name: "Personalized Naija Meal + Workout Reset",
    tagline: "ChatB2K™-guided meal and workout plan built around your goal, activity and lifestyle.",
    priceLabel: "NGN 12,500.00",
    was: 12500,
    now: 12500,
    icon: "fa-person-running",
    popular: true,
    image: rfBlueprint90,
    features: [
      "Personalized Nigerian meal plan",
      "Goal-matched workout plan",
      "ChatB2K™ recommendations and next-step guidance",
      "Digital delivery with no physical shipping",
      "Designed as the core T−16 P1/P3 conversion offer",
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