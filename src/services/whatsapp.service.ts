import axios from 'axios';

const WHATSAPP_API_URL = process.env.VITE_WHATSAPP_API_URL || 'https://graph.instagram.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.VITE_WHATSAPP_ACCESS_TOKEN || '';

export interface WhatsAppMessage {
  recipient: string;
  templateName: string;
  templateLanguage?: string;
  parameters?: Record<string, unknown>;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  /**
   * Send WhatsApp message via WhatsApp Business API
   */
  static async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
        console.warn('[WhatsApp] Service not configured - would send to:', message.recipient);
        // For development, just return success
        return {
          success: true,
          messageId: `dev_${Date.now()}`,
        };
      }

      const response = await axios.post(
        `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: message.recipient,
          type: 'template',
          template: {
            name: message.templateName,
            language: {
              code: message.templateLanguage || 'en_US',
            },
            parameters:
              message.parameters && Object.keys(message.parameters).length > 0
                ? {
                    body: {
                      parameters: Object.values(message.parameters),
                    },
                  }
                : undefined,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
      };
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response
          ? JSON.stringify(error.response.data)
          : String(error);

      console.error('[WhatsApp] Send Message Error:', errorMessage);
      return {
        success: false,
        error: 'Failed to send WhatsApp message',
      };
    }
  }

  /**
   * Send order confirmation message
   */
  static async sendOrderConfirmation(
    phoneNumber: string,
    orderData: {
      reference: string;
      productName: string;
      amount: number;
      email: string;
    }
  ): Promise<WhatsAppResponse> {
    try {
      return await this.sendMessage({
        recipient: phoneNumber,
        templateName: 'order_confirmation',
        parameters: {
          reference: orderData.reference,
          productName: orderData.productName,
          amount: `₦${(orderData.amount / 100).toLocaleString()}`,
          email: orderData.email,
        },
      });
    } catch (error) {
      console.error('[WhatsApp] Send Order Confirmation Error:', error);
      return {
        success: false,
        error: 'Failed to send order confirmation',
      };
    }
  }

  /**
   * Send broadcast message
   */
  static async sendBroadcast(
    recipients: string[],
    templateName: string,
    parameters?: Record<string, unknown>
  ): Promise<Array<{ recipient: string; response: WhatsAppResponse }>> {
    const results = await Promise.all(
      recipients.map(async (recipient) => ({
        recipient,
        response: await this.sendMessage({
          recipient,
          templateName,
          parameters,
        }),
      }))
    );

    return results;
  }

  /**
   * Validate phone number format (E.164)
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // E.164 format: +[country code][number]
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Format Nigerian phone number to E.164
   */
  static formatNigerianPhone(phone: string): string | null {
    // Remove common separators
    const cleaned = phone.replace(/[\s\-()]/g, '');

    // Handle different formats
    if (cleaned.startsWith('234')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+234${cleaned.slice(1)}`;
    } else if (cleaned.match(/^\d{10}$/)) {
      return `+234${cleaned}`;
    } else if (cleaned.startsWith('+234')) {
      return cleaned;
    }

    return null;
  }
}

export default WhatsAppService;
