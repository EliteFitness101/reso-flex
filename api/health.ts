import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Simple health check for the API
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      paystack: process.env.VITE_PAYSTACK_SECRET_KEY ? 'configured' : 'not_configured',
      whatsapp: process.env.VITE_WHATSAPP_ACCESS_TOKEN ? 'configured' : 'not_configured',
      environment: process.env.NODE_ENV || 'development',
    },
  });
}
