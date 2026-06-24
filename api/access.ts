import { VercelRequest, VercelResponse } from '@vercel/node';
import TokenService from '../src/services/token.service';
import PaymentValidator from '../src/core/payment-validator';

/**
 * Access Token Endpoint
 * GET /api/access?reference=PAYMENT_REFERENCE
 * POST /api/access/validate
 *
 * Retrieve access tokens or validate existing tokens
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Get access token by payment reference
    return handleGetAccess(req, res);
  } else if (req.method === 'POST') {
    // Validate token
    return handleValidateAccess(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET /api/access?reference=PAYMENT_REFERENCE
 * Verify payment and return access token
 */
async function handleGetAccess(req: VercelRequest, res: VercelResponse) {
  try {
    const { reference } = req.query;

    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({
        status: false,
        message: 'Payment reference required',
      });
    }

    // Verify payment with Paystack
    const validation = await PaymentValidator.verifyPaymentReference(reference);

    if (!validation.valid || !validation.fulfillmentData) {
      return res.status(400).json({
        status: false,
        message: validation.error || 'Payment verification failed',
      });
    }

    const fulfillment = validation.fulfillmentData;

    // Generate access token
    const accessToken = TokenService.generateToken(
      fulfillment.productId,
      fulfillment.email,
      reference
    );

    return res.status(200).json({
      status: true,
      message: 'Access token issued',
      accessToken,
      expiresIn: 365 * 24 * 60 * 60, // 1 year in seconds
      productId: fulfillment.productId,
      productName: fulfillment.productName,
      email: fulfillment.email,
    });
  } catch (error) {
    console.error('[Access] Get Access Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
}

/**
 * POST /api/access/validate
 * Validate an access token
 */
async function handleValidateAccess(req: VercelRequest, res: VercelResponse) {
  try {
    const { token, productId } = req.body;

    if (!token) {
      return res.status(400).json({
        status: false,
        message: 'Access token required',
      });
    }

    // Validate token
    const validation = TokenService.validateToken(token);

    if (!validation.valid) {
      return res.status(401).json({
        status: false,
        message: validation.error || 'Invalid token',
      });
    }

    const decodedToken = validation.token;

    // If productId specified, ensure token is for that product
    if (productId && decodedToken?.productId !== productId) {
      return res.status(403).json({
        status: false,
        message: 'Token does not grant access to this product',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Token is valid',
      productId: decodedToken?.productId,
      email: decodedToken?.email,
      expiresAt: decodedToken?.expiresAt,
    });
  } catch (error) {
    console.error('[Access] Validate Access Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
}
