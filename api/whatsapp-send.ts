import { VercelRequest, VercelResponse } from '@vercel/node';
import WhatsAppService from '../src/services/whatsapp.service';

/**
 * WhatsApp Message Endpoint
 * POST /api/whatsapp-send
 *
 * Send WhatsApp messages via WhatsApp Business API
 */

interface WhatsAppRequest {
  recipient: string;
  templateName: string;
  templateLanguage?: string;
  parameters?: Record<string, unknown>;
  action?: 'send_message' | 'send_broadcast';
  recipients?: string[]; // for broadcast
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload: WhatsAppRequest = req.body;

    // Validate required fields
    if (!payload.templateName) {
      return res.status(400).json({
        status: false,
        message: 'Template name is required',
      });
    }

    if (payload.action === 'send_broadcast' && payload.recipients) {
      // Send broadcast
      return handleSendBroadcast(payload, res);
    } else if (payload.recipient) {
      // Send single message
      return handleSendMessage(payload, res);
    } else {
      return res.status(400).json({
        status: false,
        message: 'Either recipient or recipients array is required',
      });
    }
  } catch (error) {
    console.error('[WhatsApp] Endpoint Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
}

/**
 * Send a single WhatsApp message
 */
async function handleSendMessage(payload: WhatsAppRequest, res: VercelResponse) {
  try {
    if (!payload.recipient) {
      return res.status(400).json({
        status: false,
        message: 'Recipient phone number is required',
      });
    }

    // Validate phone number format
    const formattedPhone = WhatsAppService.formatNigerianPhone(payload.recipient);
    if (!formattedPhone) {
      return res.status(400).json({
        status: false,
        message: 'Invalid phone number format',
      });
    }

    console.log(`[WhatsApp] Sending message to ${formattedPhone} using template: ${payload.templateName}`);

    // Send message
    const response = await WhatsAppService.sendMessage({
      recipient: formattedPhone,
      templateName: payload.templateName,
      templateLanguage: payload.templateLanguage,
      parameters: payload.parameters,
    });

    if (!response.success) {
      return res.status(400).json({
        status: false,
        message: response.error || 'Failed to send message',
      });
    }

    console.log(`[WhatsApp] Message sent successfully: ${response.messageId}`);

    return res.status(200).json({
      status: true,
      message: 'Message sent successfully',
      messageId: response.messageId,
      recipient: formattedPhone,
    });
  } catch (error) {
    console.error('[WhatsApp] Send Message Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to send WhatsApp message',
    });
  }
}

/**
 * Send broadcast to multiple recipients
 */
async function handleSendBroadcast(payload: WhatsAppRequest, res: VercelResponse) {
  try {
    if (!payload.recipients || payload.recipients.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Recipients array is required for broadcast',
      });
    }

    // Format all phone numbers
    const formattedRecipients = payload.recipients
      .map((phone) => WhatsAppService.formatNigerianPhone(phone))
      .filter((phone) => phone !== null) as string[];

    if (formattedRecipients.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No valid phone numbers in recipients list',
      });
    }

    console.log(`[WhatsApp] Sending broadcast to ${formattedRecipients.length} recipients`);

    // Send broadcast
    const results = await WhatsAppService.sendBroadcast(
      formattedRecipients,
      payload.templateName,
      payload.parameters
    );

    const successful = results.filter((r) => r.response.success);
    const failed = results.filter((r) => !r.response.success);

    console.log(`[WhatsApp] Broadcast sent: ${successful.length} successful, ${failed.length} failed`);

    return res.status(200).json({
      status: true,
      message: 'Broadcast completed',
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
      results: results.map((r) => ({
        recipient: r.recipient,
        success: r.response.success,
        messageId: r.response.messageId,
        error: r.response.error,
      })),
    });
  } catch (error) {
    console.error('[WhatsApp] Send Broadcast Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to send broadcast',
    });
  }
}
