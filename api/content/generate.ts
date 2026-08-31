import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildContentBrief, detectOpportunity, type Signal } from '../../src/lib/dominion.js';
import { signalFromInput } from '../../src/lib/dominionServer.js';

const PLATFORMS = ['website', 'tiktok', 'youtube', 'instagram', 'facebook', 'whatsapp'];

function generateVariants(brief: ReturnType<typeof buildContentBrief>) {
  return PLATFORMS.map((platform) => ({
    platform,
    title: brief.topic,
    hook: brief.hook,
    script: `${brief.hook}. ${brief.angle}`,
    caption: `${brief.angle} ${brief.cta}.`,
    cta: brief.cta,
    status: 'draft',
  }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const input = req.body?.signal ?? req.body;
    const signal: Signal = signalFromInput({
      source: input?.source,
      topic: String(input?.topic ?? ''),
      query: input?.query,
      url: input?.url,
      geography: input?.geography,
      demandScore: Number(input?.demandScore ?? 70),
      freshnessScore: Number(input?.freshnessScore ?? 70),
      engagementScore: Number(input?.engagementScore ?? 50),
      authorized: input?.authorized !== false,
      metadata: input?.metadata,
    });
    if (!signal.topic) return res.status(400).json({ status: 'ERROR', error: 'topic is required' });
    if (signal.authorized === false) return res.status(403).json({ status: 'ERROR', error: 'Source is not authorized for ingestion' });
    const opportunity = detectOpportunity([signal]);
    if (!opportunity) return res.status(200).json({ status: 'BELOW_THRESHOLD' });
    const brief = buildContentBrief(opportunity);
    return res.status(200).json({ status: 'PASS', opportunity, brief, variants: generateVariants(brief) });
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
