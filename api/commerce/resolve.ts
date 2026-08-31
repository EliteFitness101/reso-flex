import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readCanonicalCatalog } from '../../src/lib/dominionServer';
import { solutionHierarchy, slugify } from '../../src/lib/dominion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const q = String(req.query.q ?? '').trim();
    if (!q) return res.status(400).json({ status: 'ERROR', error: 'q is required' });
    const catalog = await readCanonicalCatalog();
    const terms = slugify(q).split('-').filter(Boolean);
    const matches = catalog.filter((item) => {
      const haystack = `${item.title ?? ''} ${item.handle ?? ''} ${item.sku ?? ''}`.toLowerCase();
      return terms.some((term) => haystack.includes(term));
    }).slice(0, 10);
    const type = solutionHierarchy(matches.length > 0, false, true);
    return res.status(200).json({
      status: 'PASS',
      query: q,
      solutionType: type,
      solutions: matches.map((item) => ({
        id: item.id,
        sku: item.sku,
        handle: item.handle,
        title: item.title,
        price: item.variant_price,
        inventory: item.variant_inventory_qty,
        url: `/product/${item.handle}`,
      })),
      next: matches.length ? 'checkout' : 'external-discovery',
    });
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
