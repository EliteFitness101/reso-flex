import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Dynamic Sitemap Generator
 * GET /api/sitemap
 *
 * Generates XML sitemap for all products and key pages
 */

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Core products data (would be imported from actual product engine in real scenario)
const PRODUCTS = [
  { slug: 'naijafit-tier2-5000', name: 'NaijaFit Enhanced Wellness' },
  { slug: 'fitness-evolution', name: 'Fitness Evolution' },
  { slug: 'heritage-meal', name: 'Heritage Meal Protocol' },
  { slug: 'buttgrowthb2k', name: 'Butt Growth B2K' },
  { slug: 'rf-expansion-module-blue', name: 'ResoFlex Expansion Module - Blue' },
  { slug: 'rf-expansion-module-duo', name: 'ResoFlex Expansion Module - Duo' },
  { slug: 'rf-elite-coaching-30day', name: 'ResoFlex Elite 30-Day Coaching' },
  { slug: 'rf-90day-metabolic-blueprint', name: '90-Day Metabolic Blueprint' },
  { slug: 'buttgrowthb2k-starter', name: 'B2K Starter Kit' },
  { slug: 'buttgrowthb2k-core', name: 'B2K Core System' },
  { slug: 'buttgrowthb2k-pro', name: 'B2K Pro Sculpt System' },
  { slug: 'buttgrowthb2k-elite', name: 'B2K Elite 90-Day Transformation' },
];

// Core pages
const CORE_PAGES: SitemapEntry[] = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/assessment', changefreq: 'monthly', priority: 0.8 },
  { url: '/membership', changefreq: 'monthly', priority: 0.7 },
];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Build sitemap entries
    const entries: SitemapEntry[] = [...CORE_PAGES];

    // Add product pages
    PRODUCTS.forEach((product) => {
      entries.push({
        url: `/product/${product.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
      });

      entries.push({
        url: `/checkout/${product.slug}`,
        changefreq: 'monthly',
        priority: 0.6,
      });
    });

    // Generate XML
    const xml = generateSitemapXml(entries);

    // Set headers for XML
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    return res.status(200).send(xml);
  } catch (error) {
    console.error('[Sitemap] Generation Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to generate sitemap',
    });
  }
}

/**
 * Generate sitemap XML
 */
function generateSitemapXml(entries: SitemapEntry[]): string {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://resofit.fit';

  const urlEntries = entries
    .map((entry) => {
      const url = `${baseUrl}${entry.url}`;
      const lastmod = entry.lastmod || new Date().toISOString().split('T')[0];

      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq || 'monthly'}</changefreq>
    <priority>${entry.priority || 0.5}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
