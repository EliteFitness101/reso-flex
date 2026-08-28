import type { VercelRequest, VercelResponse } from '@vercel/node';

const IMAGEKIT_API = 'https://api.imagekit.io/v1/files';
const MAX_LIMIT = 1000;

function authHeader() {
  const key = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!key) throw new Error('IMAGEKIT_PRIVATE_KEY is not configured');
  return `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const path = typeof req.query.path === 'string' ? req.query.path : undefined;
    const searchQuery = typeof req.query.searchQuery === 'string' ? req.query.searchQuery : undefined;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit || MAX_LIMIT)));

    const url = new URL(IMAGEKIT_API);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('skip', String((page - 1) * limit));
    if (path) url.searchParams.set('path', path);
    if (searchQuery) url.searchParams.set('searchQuery', searchQuery);

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader(),
        Accept: 'application/json',
      },
    });

    const text = await response.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'ImageKit inventory request failed',
        status: response.status,
        details: body,
      });
    }

    // Return ImageKit's native identifiers and metadata unchanged. Never expose credentials.
    return res.status(200).json({
      source: 'imagekit',
      page,
      limit,
      path: path ?? null,
      searchQuery: searchQuery ?? null,
      assets: body,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ImageKit inventory unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
