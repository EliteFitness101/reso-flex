import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_PUBLIC_KEY = process.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_fake_key';
const PAYSTACK_SECRET_KEY = process.env.VITE_PAYSTACK_SECRET_KEY || 'sk_live_fake_key';

export interface PaystackInitRequest {
  email: string;
  amount: number; // in kobo (NGN * 100)
  productId: string;
  productName: string;
  customerPhone?: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    reference: string;
    amount: number;
    status: string;
    paid_at: string;
    customer: {
      id: number;
      email: string;
      phone?: string;
    };
    metadata?: Record<string, unknown>;
  };
}

class PaystackService {
  /**
   * Initialize payment on Paystack
   */
  static async initializePayment(request: PaystackInitRequest): Promise<PaystackInitResponse> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: request.email,
          amount: request.amount,
          metadata: {
            productId: request.productId,
            productName: request.productName,
            customerPhone: request.customerPhone,
            ...request.metadata,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[Paystack] Initialize Payment Error:', error);
      return {
        status: false,
        message: 'Failed to initialize payment',
      };
    }
  }

  /**
   * Verify payment reference
   */
  static async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[Paystack] Verify Payment Error:', error);
      return {
        status: false,
        message: 'Failed to verify payment',
      };
    }
  }

  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(body: string, signature: string): boolean {
    if (!signature) {
      return false;
    }

    const hash = require('crypto')
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Get list of banks for transfers
   */
  static async getBanks() {
    try {
      const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('[Paystack] Get Banks Error:', error);
      return { status: false, message: 'Failed to fetch banks' };
    }
  }

  /**
   * Get checkout URL from hardcoded Paystack shop links
   */
  static getCheckoutUrl(productSlug: string): string {
    const urlMap: Record<string, string> = {
      'naijafit-5000': 'https://paystack.shop/pay/naijafit-5000',
      'fitness-evolution': 'https://paystack.shop/pay/fitness-evolution',
      'heritage-meal': 'https://paystack.shop/pay/heritage-meal',
      'buttgrowthb2k': 'https://paystack.shop/pay/buttgrowthb2k',
      'rf-expansion-blue': 'https://paystack.shop/pay/rf-expansion-blue',
      'rf-expansion-duo': 'https://paystack.shop/pay/rf-expansion-duo',
      'rf-coaching-30': 'https://paystack.shop/pay/rf-coaching-30',
      'b2k-starter': 'https://paystack.shop/pay/b2k-starter',
      'b2k-core': 'https://paystack.shop/pay/b2k-core',
      'b2k-pro': 'https://paystack.shop/pay/b2k-pro',
      'b2k-elite': 'https://paystack.shop/pay/b2k-elite',
    };

    return urlMap[productSlug] || '';
  }
}

export default PaystackService;
