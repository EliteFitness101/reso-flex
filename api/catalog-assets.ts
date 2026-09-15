import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IMAGEKIT_VERIFIED_MEDIA } from '../src/core/media/imagekit.media';
import { PAYSTACK_RESOFLEX_CATALOG } from '../src/data/paystack-resoflex-catalog';

const BLOB_BASE = (process.env.VITE_RESOFLEX_BLOB_PUBLIC_BASE_URL || process.env.RESOFLEX_BLOB_PUBLIC_BASE_URL || '').replace(/\/$/, '');
const roles = ['hero', 'gallery_01', 'gallery_02', 'gallery_03', 'lifestyle', 'detail'] as const;
const fileNames = {
  hero: 'hero.png', gallery_01: 'gallery-01.png', gallery_02: 'gallery-02.png', gallery_03: 'gallery-03.png', lifestyle: 'lifestyle.png', detail: 'detail.png',
} as const;

function blobUrl(folder: string, role: typeof roles[number]) {
  if (!BLOB_BASE) return null;
  return `${BLOB_BASE}/imagekit/assets/products/${folder}/${fileNames[role]}`;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const imagekit = Object.fromEntries(Object.entries(IMAGEKIT_VERIFIED_MEDIA).map(([sku, media]) => [sku, {
    ...media,
    assets: Object.fromEntries(Object.entries(media.assets).map(([role, asset]) => [role, asset ? {
      ...asset,
      imagekitUrl: `https://ik.imagekit.io/resofit808${asset.path}`,
      blobUrl: blobUrl(media.folder, role as typeof roles[number]),
    } : asset])),
  }]));

  const paystack = PAYSTACK_RESOFLEX_CATALOG.map((item) => ({ ...item, source: 'https://paystack.shop/resoflex' }));
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json({
    source: 'ResoFlex canonical media bridge',
    generatedAt: new Date().toISOString(),
    imagekit: { verified: imagekit, count: Object.keys(imagekit).length },
    paystack: { products: paystack, count: paystack.length },
    blob: { configured: Boolean(BLOB_BASE) },
  });
}
