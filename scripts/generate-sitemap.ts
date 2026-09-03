// Runs before `vite dev` and `vite build`; writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://shop.resofit.fit";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Authoritative published-product handle manifest generated from the production
// catalogue. Keeping the sitemap build deterministic avoids making production
// builds depend on Supabase REST authentication/network availability.
const LIVE_PRODUCT_HANDLES = [
  "naijafit-personalized-meal-and-workout-plan",
  "naijafit-ngn-1-000-nigerian-metabolic-blueprint",
  "naijafit-enhanced-wellness-meal-plan",
  "heritage-meals-the-achua-system",
  "2in1-arm-shaper-sweat-arm-band-plus-free-meal-workout-plan",
  "resoflex-lovers-platform-sovereign-flagship-allocation",
  "premium-quality-military-knuckle-gym-gloves-plus-90-day-fitness-evolution-blueprint",
  "pearlzie-gym-fitness-drinking-sport-water-bottle-kettle-1300ml-1-3l-blue-plus-wellness-guide",
  "ladies-fitness-long-casual-trousers-taupe",
  "single-status-advert",
  "back-massager-magic-fitness-stretch-equipment-plus-90-day-meal-workout-guide",
  "daily-posting-package",
  "pouch-waist-bag-and-fitness-purse",
  "weekly-ads-package",
  "fitness-exercise-sport-wrist-band-free-bodybuilding-plan",
  "resoflex-fitness-hand-grip",
  "abdominal-wheeler-roller-automatic-rebound-abs-roller-plus-90-day-meal-workout-guide",
  "4-wheels-abdominal-wheel-roller-with-knee-pad-mat-plus-digital-meal-workout-plan-green-pack",
  "gym-half-finger-sports-fitness-wrist-glove-1-pair",
  "fitness-water-bottle-900ml-plus-free-hydration-plan",
  "smart-fitness-foot-stimulator-massager-plus-free-anti-inflammatory-meal-workout-guide",
  "6-pack-smart-fitness-mobile-gym-single-abdominal-reduction-meal-workout-plan",
  "9-1ft-adjustable-jump-rope-fitness-skipping-rope-soft-foam",
  "tummy-trimmer-fitness-exerciser",
  "sports-pressurized-elastic-knee-pads-support-fitness-gear-1pc",
  "steel-wire-skipping-rope",
  "monthly-ads-package",
  "broadcast-message-status-combo-blast",
  "repost-on-partner-influencer-networks",
  "full-whatsapp-marketing-takeover",
  "unisex-premium-hot-power-fitness-belt-black",
  "revoflex-xtreme-fitness-plus-90-day-abdominal-meal-workout-plan",
  "fitness-exercise-sport-wrist-band-plus-free-meal-plan",
  "the-resoflex-ascension-bundle",
  "weight-gain-gummies",
  "resoflex-gym-station",
  "resistance-bands-set-100-lbs-tube-bands-11-piece-set",
  "resoflex-elite-spin-bike",
  "resoflex-slim-walking-pad",
  "curve-enhancement-stack",
  "resoflex-expansion-module-duo",
  "core-recovery-stack",
  "b2k-003",
  "resoflex-micronized-creatine-monohydrate",
  "elite-90-day-metabolic-plan",
  "b2k-001",
  "power-station-gym",
  "resoflex-4hp-elite-treadmill",
  "resoflex-expansion-module-blue",
  "heritage-30-day-meal-plan",
  "b2k-002",
  "multi-station-power-tower",
  "pro-foam-roller-mat-set",
  "b2k-elite-90-day-vip-bundle",
  "resoflex-hiit-cardio-starter",
  "resoflex-air-rower-ergometer",
  "corporate-wellness-starter-kit",
  "glutes-sculpt-kit",
  "alpha-station-power-rack",
  "home-gym-pro-kit",
  "resoflex-recovery-mobility-bundle",
  "resoflex-yoga-flexibility-starter",
  "90-day-body-reset-program",
  "resoflex-pro-indoor-studio-cycle",
  "adjustable-heavy-duty-workout-bench",
  "15kg-cast-iron-set",
  "commercial-station-gym-hub",
  "resoflex-lightweight-running-hydration-vest",
  "resoflex-men-performance-training-shorts",
  "resoflex-men-technical-performance-compression-set",
  "resoflex-mens-compression-tank",
  "res-dig-reset",
  "res-bundle-apex",
  "resoflex-mechanical-padded-gym-weightlifting-gloves",
  "resoflex-core-short-sleeve-legging-set",
  "res-iron-15",
  "25-steel-boned-latex-shaper",
  "resoflex-50kg-chrome-dumbbell-and-barbell-home-gym-set",
  "resoflex-commercial-station-gym-hub",
  "resoflex-stainless-steel-gym-shaker-bottle",
  "resoflex-pro-combat-striking-boxing-gloves",
  "heritage-meal-plan",
  "resoflex-sculpt-long-sleeve-biker-set",
  "resoflex-women-curvy-collection-obsidian-black",
  "resoflex-kinetic",
  "resoflex-men-aero-dry-running-t-shirt",
  "res-iron-50",
  "resoflex-pro-zip-long-sleeve-legging-set",
  "resoflex-essentials-chrome-lifting-set",
  "resoflex-adjustable-heavy-duty-workout-bench",
  "resoflex-commercial-rubber-hex-dumbbell-tower",
  "resoflex-commercial-rubber-bumper-plates-set",
  "b2k-004",
  "resoflex-commercial-functional-trainer",
  "res-iron-30",
  "resoflex-duraq-blue-green-rose-gold",
  "res-coach-01",
  "resoflex-speedwork-running-waist-belt",
  "naijafit-7day-free",
  "resoflex-mobility-and-strength-resistance-bands-set",
  "resoflex-men-heavyweight-sleeveless-gym-hoodie",
  "resoflex-ascension-bundle",
  "resoflex-studio-rubber-hex-dumbbells",
  "resoflex-combat-training-heavy-boxing-bag",
  "res-dig-nut",
  "enhanced-meal-move",
  "reso-grip-pair-multi-color",
  "resoflex-athletic-muscle-recovery-lotion-and-skin-balm",
  "resoflex-commander",
  "resoflex-men-athletic-balaclava-tracksuit",
  "fitness-evolution",
  "resoflex-ladies-2-piece-ribbed-activewear-set",
  "7-day-nigerian-reset",
  "butt-and-curves-guide",
] as const;

const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "weekly", priority: "0.9" },
  { path: "/chatb2k", changefreq: "monthly", priority: "0.7" },
  { path: "/collections/featured", changefreq: "daily", priority: "0.8" },
  { path: "/collections/digital", changefreq: "weekly", priority: "0.8" },
  { path: "/collections/physical", changefreq: "weekly", priority: "0.8" },
  { path: "/collections/digital-plus-physical", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/bundles", changefreq: "weekly", priority: "0.8" },
  { path: "/collections/students", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/corporate", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/body-enhancement", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/men", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/apparel", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/supplements", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/equipment", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/heavy-equipment", changefreq: "weekly", priority: "0.7" },
  { path: "/collections/frequently-bought", changefreq: "daily", priority: "0.7" },
  { path: "/collections/recently-bought", changefreq: "daily", priority: "0.6" },
  { path: "/wishlist", changefreq: "daily", priority: "0.5" },
];

function generateSitemap(list: SitemapEntry[]) {
  const unique = new Map(list.map((entry) => [entry.path, entry]));
  const urls = [...unique.values()].map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const entries: SitemapEntry[] = [
  ...STATIC_ROUTES,
  ...LIVE_PRODUCT_HANDLES.map((handle) => ({
    path: `/product/${encodeURIComponent(handle)}`,
    changefreq: "weekly" as const,
    priority: "0.8",
  })),
];

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${new Set(entries.map((entry) => entry.path)).size} entries; ${LIVE_PRODUCT_HANDLES.length} published product handles)`);
