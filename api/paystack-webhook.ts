import { VercelRequest, VercelResponse } from '@vercel/node';
import PaymentValidator from '../src/core/payment-validator';
import TokenService from '../src/services/token.service';
import WhatsAppService from '../src/services/whatsapp.service';

/**
 * Paystack Webhook Handler
 * POST /api/paystack-webhook
 *
 * This endpoint receives payment confirmation webhooks from Paystack
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get signature from header
    const signature = req.headers['x-paystack-signature'] as string;
    const body = JSON.stringify(req.body);

    // Validate webhook
    const validation = PaymentValidator.validateWebhookEvent(body, signature);

    if (!validation.valid) {
      console.error('[Webhook] Validation failed:', validation.error);
      return res.status(400).json({
        status: false,
        message: validation.error || 'Webhook validation failed',
      });
    }

    // Extract fulfillment data
    const fulfillment = validation.fulfillmentData;
    if (!fulfillment) {
      return res.status(400).json({
        status: false,
        message: 'No fulfillment data found',
      });
    }

    console.log('[Webhook] Processing payment:', fulfillment);

    // Issue access token
    const accessToken = TokenService.generateToken(
      fulfillment.productId,
      fulfillment.email,
      fulfillment.reference
    );

    // Store in a simple in-memory cache (in production, use database)
    const tokenCache: Record<string, { token: string; email: string; productId: string }> = {};
    tokenCache[fulfillment.reference] = {
      token: accessToken,
      email: fulfillment.email,
      productId: fulfillment.productId,
    };

    console.log('[Webhook] Token issued for:', fulfillment.email, fulfillment.productId);

    // Send WhatsApp confirmation if phone number available
    if (validation.event?.data.customer.phone) {
      try {
        await WhatsAppService.sendOrderConfirmation(
          validation.event.data.customer.phone,
          {
            reference: fulfillment.reference,
            productName: fulfillment.productName,
            amount: fulfillment.amount,
            email: fulfillment.email,
          }
        );
        console.log('[Webhook] WhatsApp confirmation sent');
      } catch (error) {
        console.error('[Webhook] WhatsApp send failed:', error);
        // Don't fail the webhook if WhatsApp fails
      }
    }

    // Return success
    return res.status(200).json({
      status: true,
      message: 'Webhook processed successfully',
      reference: fulfillment.reference,
      accessToken, // In production, don't return token in webhook response
    });
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
}
