import crypto from 'crypto';

export interface AccessToken {
  id: string;
  productId: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
  reference: string;
}

export interface TokenValidationResult {
  valid: boolean;
  token?: AccessToken;
  error?: string;
}

const TOKEN_VALIDITY_DAYS = 365; // 1 year access
const TOKEN_SECRET = process.env.VITE_TOKEN_SECRET || 'dev-secret-key-change-in-production';

class TokenService {
  /**
   * Generate a JWT-like access token
   */
  static generateToken(
    productId: string,
    email: string,
    reference: string
  ): string {
    const payload: AccessToken = {
      id: crypto.randomBytes(16).toString('hex'),
      productId,
      email,
      issuedAt: Date.now(),
      expiresAt: Date.now() + TOKEN_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
      reference,
    };

    // Create a simple signature using HMAC
    const payloadStr = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(payloadStr)
      .digest('hex');

    // Return base64 encoded payload.signature
    const token = `${Buffer.from(payloadStr).toString('base64')}.${signature}`;
    return token;
  }

  /**
   * Validate and decode token
   */
  static validateToken(token: string): TokenValidationResult {
    try {
      const [payloadStr, signature] = token.split('.');

      if (!payloadStr || !signature) {
        return {
          valid: false,
          error: 'Invalid token format',
        };
      }

      // Decode payload
      const payload: AccessToken = JSON.parse(
        Buffer.from(payloadStr, 'base64').toString()
      );

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(payloadStr)
        .digest('hex');

      if (signature !== expectedSignature) {
        return {
          valid: false,
          error: 'Invalid token signature',
        };
      }

      // Check expiry
      if (payload.expiresAt < Date.now()) {
        return {
          valid: false,
          error: 'Token has expired',
        };
      }

      return {
        valid: true,
        token: payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate token',
      };
    }
  }

  /**
   * Store token in localStorage
   */
  static storeToken(token: string, productId: string): void {
    try {
      const tokens = this.getStoredTokens();
      tokens[productId] = token;
      localStorage.setItem('resoflex_access_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('[TokenService] Failed to store token:', error);
    }
  }

  /**
   * Retrieve stored tokens from localStorage
   */
  static getStoredTokens(): Record<string, string> {
    try {
      const stored = localStorage.getItem('resoflex_access_tokens');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[TokenService] Failed to get stored tokens:', error);
      return {};
    }
  }

  /**
   * Get token for a specific product
   */
  static getTokenForProduct(productId: string): string | null {
    try {
      const tokens = this.getStoredTokens();
      return tokens[productId] || null;
    } catch (error) {
      console.error('[TokenService] Failed to get token for product:', error);
      return null;
    }
  }

  /**
   * Check if user has access to product
   */
  static hasAccessToProduct(productId: string): boolean {
    try {
      const token = this.getTokenForProduct(productId);
      if (!token) {
        return false;
      }

      const validation = this.validateToken(token);
      return validation.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove token for a product (revoke access)
   */
  static revokeAccess(productId: string): void {
    try {
      const tokens = this.getStoredTokens();
      delete tokens[productId];
      localStorage.setItem('resoflex_access_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('[TokenService] Failed to revoke access:', error);
    }
  }

  /**
   * Clear all tokens
   */
  static clearAllTokens(): void {
    try {
      localStorage.removeItem('resoflex_access_tokens');
    } catch (error) {
      console.error('[TokenService] Failed to clear tokens:', error);
    }
  }

  /**
   * Get all purchased products
   */
  static getPurchasedProducts(): string[] {
    try {
      const tokens = this.getStoredTokens();
      return Object.keys(tokens).filter((productId) => {
        const token = tokens[productId];
        const validation = this.validateToken(token);
        return validation.valid;
      });
    } catch (error) {
      return [];
    }
  }
}

export default TokenService;
