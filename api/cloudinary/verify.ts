import type { VercelRequest, VercelResponse } from ' '@vercel/node';
import crypto from 'node:crypto';

const CLOUDINARY_API = 'https://api.cloudinary.com/v1_1';
const MAX_RESULTS = 100;
const MAX_PAGES = 5;
const REQUEST_TIMEOUT_MS = 8000;
const CANONICAL_ROOT = 'resofit';

type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };
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

function getConfig(): CloudinaryConfig {
  // Prefer the explicit production variables. This prevents a stale/invalid
  // CLOUDINARY_URL from shadowing the current credential set.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };

  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'cloudinary:') throw new Error('Invalid CLOUDINARY_URL');
    const fallbackCloudName = parsed.hostname;
    const fallbackApiKey = decodeURIComponent(parsed.username);
    const fallbackApiSecret = decodeURIComponent(parsed.password);
    if (fallbackCloudName && fallbackApiKey && fallbackApiSecret) {
      return { cloudName: fallbackCloudName, apiKey: fallbackApiKey, apiSecret: fallbackApiSecret };
    }
  }

  throw new Error('Cloudinary server configuration is incomplete');
}

function normalizeFolder(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const folder = value.trim().replace(/^\/+|\/+$/g, '');
  if (!folder) return null;
  if (folder === CANONICAL_ROOT) return folder;
  if (folder.startsWith(`${CANONICAL_ROOT}/`)) return folder;
  return null;
}

function sign(params: Record<string, string | number>, apiSecret: string) {
  const canonical = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${canonical}${apiSecret}`).digest('hex');
}

async function search(config: CloudinaryConfig, expression: string, nextCursor?: string): Promise<SearchResponse> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { expression, max_results: MAX_RESULTS, timestamp };
  const body = new URLSearchParams({
    expression,
    max_results: String(MAX_RESULTS),
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature: sign(params, config.apiSecret),
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  });
  const response = await fetch(`${CLOUDINARY_API}/${encodeURIComponent(config.cloudName)}/resources/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Cloudinary search failed: ${response.status} ${await response.text()}`);
  return response.json() as Promise<SearchResponse>;
}

async function collect(config: CloudinaryConfig, expression: string) {
  const resources: CloudinaryResource[] = [];
  const seen = new Set<string>();
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await search(config, expression, cursor);
    resources.push(...(result.resources ?? []));
    if (!result.next_cursor || seen.has(result.next_cursor)) break;
    seen.add(result.next_cursor);
    cursor = result.next_cursor;
  }
  return resources.slice(0, MAX_RESULTS * MAX_PAGES);
}

function parsePublicIds(value: string | string[] | undefined) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item).split(','))
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 100);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = getConfig();
    const folder = normalizeFolder(req.query.folder);
    const expression = typeof req.query.expression === 'string' ? req.query.expression.trim() : '';
    const publicIds = parsePublicIds(req.query.public_ids);

    let assets: CloudinaryResource[];
    let mode: 'folder' | 'expression' | 'public_ids';

    if (req.query.folder !== undefined && !folder) {
      return res.status(400).json({ error: `folder must resolve under ${CANONICAL_ROOT}` });
    }

    if (folder) {
      assets = await collect(config, `asset_folder:"${folder.replace(/"/g, '\\"')}"`);
      mode = 'folder';
    } else if (expression) {
      assets = await collect(config, expression);
      mode = 'expression';
    } else if (publicIds.length) {
      assets = (await Promise.all(
        publicIds.map((id) => collect(config, `public_id:"${id.replace(/"/g, '\\"')}"`)),
      )).flat();
      mode = 'public_ids';
    } else {
      return res.status(400).json({ error: 'Provide folder, expression, or public_ids' });
    }

    const unique = Array.from(
      new Map(
        assets.map((asset) => [
          String(asset.asset_id ?? `${asset.resource_type ?? ''}/${asset.type ?? ''}/${asset.public_id ?? ''}`),
          asset,
        ]),
      ).values(),
    );

    return res.status(200).json({
      status: 'PASS',
      cloudName: config.cloudName,
      root: CANONICAL_ROOT,
      mode,
      folder: folder ?? null,
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = /Cloudinary search failed: (401|403)\b/.test(message)
      ? 502
      : error?.name === 'TimeoutError' || error?.name === 'AbortError'
        ? 504
        : 500;
    console.error('[cloudinary/verify]', error);
    return res.status(status).json({
      status: 'ERROR',
      error: 'Cloudinary verification failed',
      message,
    });
  }
}
