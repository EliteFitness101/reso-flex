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

class TokenService {
  /**
   * Generate a simple access token (crypto signing done server-side)
   * Browser: Just create a reference token, server validates on /api/access
   */
  static generateToken(
    productId: string,
    email: string,
    reference: string
  ): string {
    const payload: AccessToken = {
      id: this.generateId(),
      productId,
      email,
      issuedAt: Date.now(),
      expiresAt: Date.now() + TOKEN_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
      reference,
    };

    // Return base64 encoded payload only (signature verified server-side)
    const token = btoa(JSON.stringify(payload));
    return token;
  }

  /**
   * Simple UUID-like ID generator for browser
   */
  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Validate and decode token (basic validation on browser side)
   */
  static validateToken(token: string): TokenValidationResult {
    try {
      // Decode payload
      const payload: AccessToken = JSON.parse(atob(token));

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
