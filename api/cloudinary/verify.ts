import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLOUDINARY_API = 'https://api.cloudinary.com/v1_1';
const MAX_ASSETS = 28;

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary server configuration is incomplete');
  }

  return { cloudName, apiKey, apiSecret };
}

function basicAuth(apiKey: string, apiSecret: string) {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;
}

function parsePublicIds(req: VercelRequest): string[] {
  const value = req.query.public_ids;
  if (Array.isArray(value)) return value.flatMap((item) => String(item).split(',')).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((id) => id.trim()).filter(Boolean);
  return [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ids = parsePublicIds(req).slice(0, MAX_ASSETS);
    if (!ids.length) {
      return res.status(400).json({
        error: 'Missing public_ids',
        usage: '/api/cloudinary/verify?public_ids=id1,id2,...',
        maxAssets: MAX_ASSETS,
      });
    }

    const { cloudName, apiKey, apiSecret } = getConfig();
    const endpoint = `${CLOUDINARY_API}/${encodeURIComponent(cloudName)}/resources/image/upload`;
    const query = ids.map((id) => `public_ids[]=${encodeURIComponent(id)}`).join('&');

    const response = await fetch(`${endpoint}?${query}`, {
      headers: {
        Authorization: basicAuth(apiKey, apiSecret),
        Accept: 'application/json',
      },
    });

    const text = await response.text();
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        status: 'ERROR',
        error: 'Cloudinary resource verification failed',
        details: body,
      });
    }

    const resources = Array.isArray(body.resources) ? body.resources : [];
    const found = new Set(resources.map((resource: any) => resource.public_id));
    const verified = ids.filter((id) => found.has(id));
    const missing = ids.filter((id) => !found.has(id));

    return res.status(200).json({
      status: missing.length === 0 ? 'PASS' : 'FAIL',
      cloudName,
      requested: ids.length,
      verified: verified.length,
      missing: missing.length,
      missingPublicIds: missing,
      assets: resources.map((resource: any) => ({
        publicId: resource.public_id,
        resourceType: resource.resource_type,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        secureUrl: resource.secure_url,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      error: 'Cloudinary verification unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
