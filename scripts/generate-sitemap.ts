// Runs before `vite dev` and `vite build`; writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://shop.resofit.fit";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Canonical production catalogue: 41 SKUs currently registered in the ResoFlex catalogue.
// Keep this list explicit until the sitemap generator is connected to the canonical catalogue API.
const PRODUCT_HANDLES = [
  "resoflex-commercial-functional-trainer",
  "resoflex-adjustable-heavy-duty-workout-bench",
  "resoflex-commercial-rubber-bumper-plates-set",
  "resoflex-studio-rubber-hex-dumbbells",
  "resoflex-50kg-chrome-dumbbell-and-barbell-home-gym-set",
  "resoflex-essentials-chrome-lifting-set",
  "resoflex-commercial-rubber-hex-dumbbell-tower",
  "resoflex-station-gym",
  "resoflex-combat-training-heavy-boxing-bag",
  "resoflex-pro-combat-striking-boxing-gloves",
  "resoflex-mobility-and-strength-resistance-bands-set",
  "resoflex-lightweight-running-hydration-vest",
  "resoflex-speedwork-running-waist-belt",
  "resoflex-stainless-steel-gym-shaker-bottle",
  "resoflex-mechanical-padded-gym-weightlifting-gloves",
  "resoflex-duraq-blue-green-rose-gold",
  "reso-grip-pair-multi-color",
  "resoflex-mens-tank",
  "resoflex-men-technical-performance-compression-set",
  "resoflex-men-athletic-balaclava-tracksuit",
  "resoflex-men-performance-training-shorts",
  "resoflex-men-aero-dry-running-t-shirt",
  "resoflex-men-heavyweight-sleeveless-gym-hoodie",
  "resoflex-ladies-2piece-ribbed-activewear-set",
  "resoflex-women-curvy-collection-obsidian-black",
  "resoflex-sculpt-long-sleeve-biker-set",
  "resoflex-pro-zip-long-sleeve-legging-set",
  "resoflex-core-short-sleeve-legging-set",
  "25-steel-boned-latex-shaper",
  "resoflex-athletic-muscle-recovery-lotion-and-skin-balm",
  "naijafit-7day-free",
  "heritage-meal-plan",
  "enhanced-meal-move",
  "fitness-evolution",
  "resoflex-kinetic",
  "resoflex-commander",
  "b2k-elite-90-day-vip-bundle",
  "resoflex-ascension-bundle",
  "resoflex-15kg-cast-iron-set",
  "resoflex-30kg-cast-iron-set",
  "resoflex-apex-bundle",
];

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "weekly", priority: "0.9" },
  { path: "/chatb2k", changefreq: "monthly", priority: "0.7" },
  ...PRODUCT_HANDLES.map((handle) => ({
    path: `/product/${handle}`,
    changefreq: "weekly" as const,
    priority: "0.8",
  })),
];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
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

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
