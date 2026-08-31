import type { VercelRequest, VercelResponse } from '@vercel/node';

const PROVIDERS = [
  { id: 'shopify', category: 'commerce', capabilities: ['products', 'pricing', 'availability', 'orders'] },
  { id: 'paystack', category: 'payments', capabilities: ['checkout', 'webhooks', 'verification'] },
  { id: 'imagekit', category: 'media', capabilities: ['assets', 'delivery', 'transformations'] },
  { id: 'cloudinary', category: 'media', capabilities: ['assets', 'delivery', 'video'] },
  { id: 'whatsapp', category: 'communications', capabilities: ['messaging'] },
  { id: 'buffer', category: 'publishing', capabilities: ['scheduling', 'publishing', 'analytics'] },
  { id: 'n8n', category: 'automation', capabilities: ['workflows', 'webhooks'] },
  { id: 'resend', category: 'communications', capabilities: ['email'] },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const enabled = PROVIDERS.map((provider) => ({
    ...provider,
    configured: Boolean(process.env[`${provider.id.toUpperCase()}_API_KEY`] || process.env[`${provider.id.toUpperCase()}_ACCESS_TOKEN`]),
  }));
  return res.status(200).json({ status: 'PASS', sourceOfTruth: 'ResoFit', providers: enabled });
}
