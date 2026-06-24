import PaystackService from '@/services/paystack.service';

export interface PaymentEvent {
  event: string;
  data: {
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
    metadata?: {
      productId?: string;
      productName?: string;
      customerPhone?: string;
    };
  };
}

export interface PaymentValidationResult {
  valid: boolean;
  error?: string;
  event?: PaymentEvent;
  fulfillmentData?: {
    email: string;
    productId: string;
    productName: string;
    amount: number;
    reference: string;
    status: string;
  };
}

class PaymentValidator {
  /**
   * Validate webhook signature and event structure
   */
  static validateWebhookEvent(
    body: string,
    signature: string
  ): PaymentValidationResult {
    // Validate signature
    const isValid = PaystackService.validateWebhookSignature(body, signature);

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid webhook signature',
      };
    }

    try {
      const event: PaymentEvent = JSON.parse(body);

      // Validate event structure
      if (!event.event || !event.data) {
        return {
          valid: false,
          error: 'Invalid event structure',
        };
      }

      // Check if payment was successful
      if (event.data.status !== 'success') {
        return {
          valid: false,
          error: `Payment status is ${event.data.status}, expected success`,
        };
      }

      // Extract fulfillment data
      const fulfillmentData = {
        email: event.data.customer.email,
        productId: event.data.metadata?.productId || 'unknown',
        productName: event.data.metadata?.productName || 'unknown',
        amount: event.data.amount,
        reference: event.data.reference,
        status: event.data.status,
      };

      return {
        valid: true,
        event,
        fulfillmentData,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to parse webhook body',
      };
    }
  }

  /**
   * Verify payment with Paystack API
   */
  static async verifyPaymentReference(
    reference: string
  ): Promise<PaymentValidationResult> {
    try {
      const response = await PaystackService.verifyPayment(reference);

      if (!response.status || response.data?.status !== 'success') {
        return {
          valid: false,
          error: 'Payment verification failed or payment not successful',
        };
      }

      const fulfillmentData = {
        email: response.data.customer.email,
        productId: response.data.metadata?.productId || 'unknown',
        productName: response.data.metadata?.productName || 'unknown',
        amount: response.data.amount,
        reference: response.data.reference,
        status: response.data.status,
      };

      return {
        valid: true,
        fulfillmentData,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to verify payment with Paystack',
      };
    }
  }
}

export default PaymentValidator;
