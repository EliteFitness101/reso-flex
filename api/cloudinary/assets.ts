import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const CANONICAL_FOLDERS = [
  'resofit-cdn/brand/videos',
  'resofit-cdn/brand/posters',
  'resofit-cdn/categories/backgrounds',
  'resofit-cdn/categories/posters',
  'resofit-cdn/products/resoflex-equipment',
  'resofit-cdn/products/resoflex-apparel',
  'resofit-cdn/services/chatb2k',
  'resofit-cdn/services/wellness',
];

function sign(params: Record<string, string | number>) {
  const crypto = require('node:crypto') as typeof import('node:crypto');
  const canonical = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(canonical + CLOUDINARY_API_SECRET).digest('hex');
}

async function searchFolder(folder: string) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) throw new Error('Cloudinary server configuration is incomplete');

  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    expression: `folder:${folder}`,
    max_results: '500',
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature: sign({ expression: `folder:${folder}`, max_results: 500, timestamp }),
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary search failed for ${folder}: ${response.status} ${detail}`);
  }

  return response.json() as Promise<{ resources?: Array<Record<string, unknown>> }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const results = await Promise.all(CANONICAL_FOLDERS.map(searchFolder));
    const assets = results.flatMap((result, index) =>
      (result.resources ?? []).map((asset) => ({ ...asset, canonical_folder: CANONICAL_FOLDERS[index] }))
    );

    const unique = Array.from(new Map(assets.map((asset) => [String(asset.asset_id ?? asset.public_id), asset])).values());

    return res.status(200).json({
      ok: true,
      expected: 28,
      count: unique.length,
      verified: unique.length === 28,
      folders: CANONICAL_FOLDERS,
      assets: unique,
    });
  } catch (error) {
    console.error('[cloudinary/assets]', error);
    return res.status(500).json({
      ok: false,
      expected: 28,
      verified: false,
      error: error instanceof Error ? error.message : 'Cloudinary verification failed',
    });
  }
}
