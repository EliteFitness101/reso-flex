import type { VercelRequest, VercelResponse } from '@vercel/node';
import { emitEvent } from '../../src/lib/dominionServer';
import { slugify, type SourcePlatform } from '../../src/lib/dominion';

const SOURCES = new Set<SourcePlatform>(['web', 'tiktok', 'twitch', 'bigo', 'x', 'youtube', 'internal']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const input = req.body ?? {};
    const source = input.source as SourcePlatform;
    const title = String(input.title ?? input.topic ?? '').trim();
    const sourceId = String(input.sourceId ?? input.id ?? '').trim();
    const authorized = input.authorized === true || source === 'internal';
    if (!SOURCES.has(source) || !title || !sourceId) return res.status(400).json({ status: 'ERROR', error: 'source, title/topic and sourceId are required' });
    if (!authorized) return res.status(403).json({ status: 'ERROR', error: 'Only public or explicitly authorized source content may be ingested' });
    const normalized = {
      canonicalId: `content_${source}_${slugify(sourceId)}`,
      source,
      sourceId,
      title,
      description: typeof input.description === 'string' ? input.description : null,
      url: typeof input.url === 'string' ? input.url : null,
      mediaUrl: typeof input.mediaUrl === 'string' ? input.mediaUrl : null,
      publishedAt: input.publishedAt ?? null,
      author: typeof input.author === 'string' ? input.author : null,
      metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
      authorized: true,
    };
    const event = await emitEvent('content.ingested', normalized, `content.ingested:${normalized.canonicalId}`);
    return res.status(200).json({ status: 'PASS', content: normalized, event });
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
