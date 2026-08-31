import type { VercelRequest, VercelResponse } from '@vercel/node';
import { detectOpportunity, type Signal, type SourcePlatform } from '../../src/lib/dominion.js';
import { persistOpportunity, signalFromInput } from '../../src/lib/dominionServer.js';

const SOURCES = new Set<SourcePlatform>(['web', 'tiktok', 'twitch', 'bigo', 'x', 'youtube', 'internal']);

function bodySignals(body: unknown): Signal[] {
  if (!Array.isArray(body)) return [];
  return body
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => {
      const source = item.source as SourcePlatform;
      return signalFromInput({
        source,
        topic: String(item.topic ?? ''),
        query: typeof item.query === 'string' ? item.query : undefined,
        url: typeof item.url === 'string' ? item.url : undefined,
        geography: typeof item.geography === 'string' ? item.geography : undefined,
        demandScore: Number(item.demandScore ?? 0),
        freshnessScore: Number(item.freshnessScore ?? 50),
        engagementScore: Number(item.engagementScore ?? 0),
        // External sources must explicitly assert authorization. Internal signals are trusted.
        authorized: source === 'internal' || item.authorized === true,
        metadata: item.metadata as Record<string, unknown> | undefined,
      });
    })
    .filter((signal) => signal.topic.length > 0 && SOURCES.has(signal.source));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const signals = bodySignals(req.body?.signals ?? req.body);
    if (!signals.length) return res.status(400).json({ status: 'ERROR', error: 'At least one valid signal is required' });
    const unauthorized = signals.filter((signal) => signal.authorized === false);
    if (unauthorized.length) {
      return res.status(403).json({ status: 'ERROR', error: 'External signals require explicit authorization' });
    }
    const opportunity = detectOpportunity(signals);
    if (!opportunity) return res.status(200).json({ status: 'NO_OPPORTUNITY', signals: signals.length });
    const persisted = await persistOpportunity(opportunity);
    return res.status(200).json({ status: 'PASS', opportunity, persisted });
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
