import type { VercelRequest, VercelResponse } from '@vercel/node';
import { detectOpportunity, type Signal } from '../../src/lib/dominion.js';
import { persistOpportunity, signalFromInput } from '../../src/lib/dominionServer.js';

function bodySignals(body: unknown): Signal[] {
  if (!Array.isArray(body)) return [];
  return body.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => signalFromInput({
      source: item.source as Signal['source'],
      topic: String(item.topic ?? ''),
      query: typeof item.query === 'string' ? item.query : undefined,
      url: typeof item.url === 'string' ? item.url : undefined,
      geography: typeof item.geography === 'string' ? item.geography : undefined,
      demandScore: Number(item.demandScore ?? 0),
      freshnessScore: Number(item.freshnessScore ?? 50),
      engagementScore: Number(item.engagementScore ?? 0),
      authorized: item.authorized !== false,
      metadata: item.metadata as Record<string, unknown> | undefined,
    }))
    .filter((signal) => signal.topic.length > 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const signals = bodySignals(req.body?.signals ?? req.body);
    const opportunity = detectOpportunity(signals);
    if (!opportunity) return res.status(200).json({ status: 'NO_OPPORTUNITY', signals: signals.length });
    const persisted = await persistOpportunity(opportunity);
    return res.status(200).json({ status: 'PASS', opportunity, persisted });
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
