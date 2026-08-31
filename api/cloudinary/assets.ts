import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

function requireConfig() {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary server configuration is incomplete');
  }
}

function sign(params: Record<string, string | number>) {
  requireConfig();
  const canonical = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${canonical}${API_SECRET}`).digest('hex');
}

type CloudinaryResource = Record<string, unknown> & {
  asset_id?: string;
  public_id?: string;
  secure_url?: string;
  resource_type?: string;
  type?: string;
  folder?: string;
};

type SearchResponse = { resources?: CloudinaryResource[]; next_cursor?: string };

async function search(expression: string, nextCursor?: string): Promise<SearchResponse> {
  requireConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    expression,
    max_results: 500,
    timestamp,
  };
  const body = new URLSearchParams({
    expression,
    max_results: '500',
    timestamp: String(timestamp),
    api_key: API_KEY!,
    signature: sign(params),
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary search failed: ${response.status} ${detail}`);
  }
  return response.json() as Promise<SearchResponse>;
}

async function collectAll(expression: string) {
  const all: CloudinaryResource[] = [];
  let cursor: string | undefined;
  do {
    const page = await search(expression, cursor);
    all.push(...(page.resources ?? []));
    cursor = page.next_cursor;
  } while (cursor);
  return all;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    requireConfig();

    const publicIdsRaw = typeof req.query.public_ids === 'string' ? req.query.public_ids : undefined;
    const folderRaw = typeof req.query.folder === 'string' ? req.query.folder : undefined;
    const expression = typeof req.query.expression === 'string' ? req.query.expression : undefined;

    let assets: CloudinaryResource[];
    let mode: string;

    if (publicIdsRaw) {
      const publicIds = publicIdsRaw.split(',').map((id) => id.trim()).filter(Boolean);
      if (!publicIds.length) return res.status(400).json({ error: 'public_ids must contain at least one id' });
      const results = await Promise.all(
        publicIds.map((publicId) => collectAll(`public_id:${publicId}`))
      );
      assets = results.flat();
      mode = 'public_ids';
    } else if (folderRaw) {
      assets = await collectAll(`folder:${folderRaw}`);
      mode = 'folder';
    } else if (expression) {
      assets = await collectAll(expression);
      mode = 'expression';
    } else {
      return res.status(400).json({
        error: 'Provide public_ids, folder, or expression',
        usage: '/api/cloudinary/assets?public_ids=id1,id2,... | /api/cloudinary/assets?folder=folder/path | /api/cloudinary/assets?expression=...'
      });
    }

    const unique = Array.from(
      new Map(assets.map((asset) => [String(asset.asset_id ?? `${asset.resource_type ?? ''}/${asset.type ?? ''}/${asset.public_id ?? ''}`), asset])).values()
    );

    return res.status(200).json({
      ok: true,
      mode,
      count: unique.length,
      assets: unique,
    });
  } catch (error) {
    console.error('[cloudinary/assets]', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Cloudinary verification failed',
    });
  }
}
