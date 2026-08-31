import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DOMINION_VERSION, DOMAINS, SOURCE_CAPABILITIES } from '../../src/lib/dominion.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json({
    status: 'PASS',
    engine: 'ResoFit Dominion Engine',
    version: DOMINION_VERSION,
    host: 'Vercel',
    domains: DOMAINS,
    sources: Object.fromEntries(Object.entries(SOURCE_CAPABILITIES).map(([source, capabilities]) => [source, { enabled: true, capabilities }])),
    generatedAt: new Date().toISOString(),
  });
}
