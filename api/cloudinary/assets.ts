import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };
type CloudinaryResource = Record<string, unknown> & { asset_id?: string; public_id?: string; secure_url?: string; resource_type?: string; type?: string; asset_folder?: string; folder?: string };
type SearchResponse = { resources?: CloudinaryResource[]; next_cursor?: string };

function getConfig(): CloudinaryConfig {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'cloudinary:') throw new Error('Invalid CLOUDINARY_URL');
    const cloudName = parsed.hostname;
    const apiKey = decodeURIComponent(parsed.username);
    const apiSecret = decodeURIComponent(parsed.password);
    if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary server configuration is incomplete');
  return { cloudName, apiKey, apiSecret };
}

function sign(params: Record<string, string | number>, apiSecret: string) {
  const canonical = Object.keys(params).filter((key) => params[key] !== undefined && params[key] !== '').sort().map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${canonical}${apiSecret}`).digest('hex');
}

async function search(config: CloudinaryConfig, expression: string, nextCursor?: string): Promise<SearchResponse> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = { expression, max_results: 500, timestamp };
  const body = new URLSearchParams({ expression, max_results: '500', timestamp: String(timestamp), api_key: config.apiKey, signature: sign(params, config.apiSecret), ...(nextCursor ? { next_cursor: nextCursor } : {}) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/resources/search`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error(`Cloudinary search failed: ${response.status} ${await response.text()}`);
  return response.json() as Promise<SearchResponse>;
}

async function collectAll(config: CloudinaryConfig, expression: string) {
  const all: CloudinaryResource[] = [];
  let cursor: string | undefined;
  do { const page = await search(config, expression, cursor); all.push(...(page.resources ?? [])); cursor = page.next_cursor; } while (cursor);
  return all;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const config = getConfig();
    const publicIdsRaw = typeof req.query.public_ids === 'string' ? req.query.public_ids : undefined;
    const folderRaw = typeof req.query.folder === 'string' ? req.query.folder.trim().replace(/^\/+|\/+$/g, '') : undefined;
    const expression = typeof req.query.expression === 'string' ? req.query.expression.trim() : undefined;
    let assets: CloudinaryResource[];
    let mode: string;

    if (publicIdsRaw) {
      const publicIds = publicIdsRaw.split(',').map((id) => id.trim()).filter(Boolean);
      if (!publicIds.length) return res.status(400).json({ error: 'public_ids must contain at least one id' });
      assets = (await Promise.all(publicIds.map((publicId) => collectAll(config, `public_id:${publicId}`)))).flat();
      mode = 'public_ids';
    } else if (folderRaw) {
      assets = await collectAll(config, `asset_folder:"${folderRaw.replace(/"/g, '\\"')}"`);
      mode = 'asset_folder';
    } else if (expression) {
      assets = await collectAll(config, expression);
      mode = 'expression';
    } else {
      return res.status(400).json({ error: 'Provide public_ids, folder, or expression', usage: '/api/cloudinary/assets?public_ids=id1,id2,... | /api/cloudinary/assets?folder=resofit | /api/cloudinary/assets?expression=...' });
    }

    const unique = Array.from(new Map(assets.map((asset) => [String(asset.asset_id ?? `${asset.resource_type ?? ''}/${asset.type ?? ''}/${asset.public_id ?? ''}`), asset])).values());
    return res.status(200).json({ ok: true, mode, cloudName: config.cloudName, count: unique.length, assets: unique });
  } catch (error) {
    console.error('[cloudinary/assets]', error);
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Cloudinary verification failed' });
  }
}
