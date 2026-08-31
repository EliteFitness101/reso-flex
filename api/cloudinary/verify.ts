import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

const CLOUDINARY_API = 'https://api.cloudinary.com/v1_1';

type CloudinaryResource = Record<string, unknown> & {
  asset_id?: string;
  public_id?: string;
  secure_url?: string;
  resource_type?: string;
  type?: string;
  asset_folder?: string;
  folder?: string;
};

type SearchResponse = { resources?: CloudinaryResource[]; next_cursor?: string };

function getConfig() {
  const url = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (url) {
    const match = url.match(/^cloudinary:\/\/([^:]+):(.+)@([^/?#]+)$/);
    if (match) {
      return {
        cloudName: cloudName || match[3],
        apiKey: apiKey || decodeURIComponent(match[1]),
        apiSecret: apiSecret || decodeURIComponent(match[2]),
      };
    }
  }

  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary server configuration is incomplete');
  return { cloudName, apiKey, apiSecret };
}

function sign(params: Record<string, string | number>, apiSecret: string) {
  const canonical = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${canonical}${apiSecret}`).digest('hex');
}

async function search(cloudName: string, apiKey: string, apiSecret: string, expression: string, nextCursor?: string): Promise<SearchResponse> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { expression, max_results: 500, timestamp };
  const body = new URLSearchParams({
    expression,
    max_results: '500',
    timestamp: String(timestamp),
    api_key: apiKey,
    signature: sign(params, apiSecret),
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });

  const response = await fetch(`${CLOUDINARY_API}/${encodeURIComponent(cloudName)}/resources/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`Cloudinary search failed: ${response.status} ${await response.text()}`);
  return response.json() as Promise<SearchResponse>;
}

async function collectAll(cloudName: string, apiKey: string, apiSecret: string, expression: string) {
  const resources: CloudinaryResource[] = [];
  let cursor: string | undefined;
  do {
    const page = await search(cloudName, apiKey, apiSecret, expression, cursor);
    resources.push(...(page.resources ?? []));
    cursor = page.next_cursor;
  } while (cursor);
  return resources;
}

function parsePublicIds(value: string | string[] | undefined) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item).split(','))
    .map((id) => id.trim())
    .filter(Boolean);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cloudName, apiKey, apiSecret } = getConfig();
    const folder = typeof req.query.folder === 'string' ? req.query.folder.trim() : '';
    const expression = typeof req.query.expression === 'string' ? req.query.expression.trim() : '';
    const publicIds = parsePublicIds(req.query.public_ids);

    let assets: CloudinaryResource[];
    let mode: 'folder' | 'expression' | 'public_ids';

    if (folder) {
      assets = await collectAll(cloudName, apiKey, apiSecret, `asset_folder:${folder}`);
      mode = 'folder';
    } else if (expression) {
      assets = await collectAll(cloudName, apiKey, apiSecret, expression);
      mode = 'expression';
    } else if (publicIds.length) {
      const results = await Promise.all(publicIds.map((id) => collectAll(cloudName, apiKey, apiSecret, `public_id:${id}`)));
      assets = results.flat();
      mode = 'public_ids';
    } else {
      return res.status(400).json({
        error: 'Provide folder, expression, or public_ids',
        usage: '/api/cloudinary/verify?folder=... | /api/cloudinary/verify?expression=... | /api/cloudinary/verify?public_ids=id1,id2,...',
      });
    }

    const unique = Array.from(new Map(assets.map((asset) => [
      String(asset.asset_id ?? `${asset.resource_type ?? ''}/${asset.type ?? ''}/${asset.public_id ?? ''}`), asset,
    ])).values());

    return res.status(200).json({
      status: 'PASS',
      cloudName,
      mode,
      count: unique.length,
      assets: unique.map((asset) => ({
        assetId: asset.asset_id,
        publicId: asset.public_id,
        assetFolder: asset.asset_folder ?? asset.folder,
        resourceType: asset.resource_type,
        type: asset.type,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        secureUrl: asset.secure_url,
      })),
    });
  } catch (error) {
    console.error('[cloudinary/verify]', error);
    return res.status(500).json({ status: 'ERROR', error: 'Cloudinary verification failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
