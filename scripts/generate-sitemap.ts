// Runs before `vite dev` and `vite build`; writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://shop.resofit.fit";
const SUPABASE_URL = "https://vbqjvmnhdtdhmeeudqnn.supabase.co";
const SUPABASE_KEY = "sb_publishable_fu_Y3KQipfuomFQyd3zNtA_rG9XpOfG";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

type LiveProductRow = {
  handle: string;
  published: boolean;
};

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

const FALLBACK_PRODUCT_HANDLES = [
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

async function getLiveProductHandles(): Promise<string[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/products?select=handle,published&published=eq.true&order=created_at.desc&limit=250`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      console.warn(`Live catalogue sitemap fetch failed: HTTP ${response.status}; using fallback handles.`);
      return FALLBACK_PRODUCT_HANDLES;
    }

    const rows = (await response.json()) as LiveProductRow[];
    const handles = rows
      .map((row) => row.handle?.trim())
      .filter((handle): handle is string => Boolean(handle));

    if (handles.length === 0) {
      console.warn("Live catalogue sitemap fetch returned no published handles; using fallback handles.");
      return FALLBACK_PRODUCT_HANDLES;
    }

    return handles;
  } catch (error) {
    console.warn("Live catalogue sitemap fetch failed; using fallback handles.", error);
    return FALLBACK_PRODUCT_HANDLES;
  }
}

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

const productHandles = await getLiveProductHandles();
const entries: SitemapEntry[] = [
  ...STATIC_ROUTES,
  ...productHandles.map((handle) => ({
    path: `/product/${encodeURIComponent(handle)}`,
    changefreq: "weekly" as const,
    priority: "0.8",
  })),
];

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${new Set(entries.map((entry) => entry.path)).size} entries; ${productHandles.length} live product handles)`);
