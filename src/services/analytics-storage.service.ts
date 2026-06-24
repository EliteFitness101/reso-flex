export interface AnalyticsEvent {
  timestamp: number;
  event: string;
  sessionId: string;
  productId?: string;
  productName?: string;
  amount?: number;
  reference?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  metadata?: Record<string, unknown>;
}

export interface FunnelConversion {
  sessionId: string;
  landing: number;
  assessment: number;
  checkout: number;
  success: number;
  conversionRate: number;
  timeSpent: number; // milliseconds
}

export interface AnalyticsReport {
  totalEvents: number;
  totalSessions: number;
  uniqueProducts: string[];
  totalRevenue: number;
  conversionFunnel: FunnelConversion[];
  topProducts: Array<{
    productId: string;
    productName: string;
    purchases: number;
    revenue: number;
  }>;
  utmBreakdown: Record<string, Record<string, number>>;
}

class AnalyticsStorageService {
  private static STORAGE_KEY = 'resoflex_analytics_events';
  private static SESSION_KEY = 'resoflex_session_id';
  private static MAX_EVENTS = 1000; // Prevent storage bloat

  /**
   * Get or create session ID
   */
  static getSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(this.SESSION_KEY, sessionId);
      }
      return sessionId;
    } catch (error) {
      return `session_${Date.now()}_anonymous`;
    }
  }

  /**
   * Track an analytics event
   */
  static trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>): void {
    try {
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
      };

      const events = this.getStoredEvents();
      events.push(analyticsEvent);

      // Keep only latest MAX_EVENTS
      if (events.length > this.MAX_EVENTS) {
        events.splice(0, events.length - this.MAX_EVENTS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('[AnalyticsStorage] Failed to track event:', error);
    }
  }

  /**
   * Get all stored events
   */
  static getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[AnalyticsStorage] Failed to get stored events:', error);
      return [];
    }
  }

  /**
   * Get events for current session
   */
  static getSessionEvents(): AnalyticsEvent[] {
    const sessionId = this.getSessionId();
    return this.getStoredEvents().filter((e) => e.sessionId === sessionId);
  }

  /**
   * Calculate funnel conversion for a session
   */
  static calculateFunnelConversion(sessionId: string): FunnelConversion | null {
    try {
      const events = this.getStoredEvents().filter((e) => e.sessionId === sessionId);

      if (events.length === 0) {
        return null;
      }

      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];

      return {
        sessionId,
        landing: events.filter((e) => e.event === 'landing').length,
        assessment: events.filter((e) => e.event === 'assessment').length,
        checkout: events.filter((e) => e.event === 'checkout').length,
        success: events.filter((e) => e.event === 'payment_success').length,
        conversionRate: events.some((e) => e.event === 'payment_success') ? 1 : 0,
        timeSpent: lastEvent.timestamp - firstEvent.timestamp,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate analytics report
   */
  static generateReport(): AnalyticsReport {
    try {
      const events = this.getStoredEvents();

      const uniqueSessions = new Set(events.map((e) => e.sessionId));
      const successEvents = events.filter((e) => e.event === 'payment_success');

      // Calculate product stats
      const productStats: Record<string, { name: string; purchases: number; revenue: number }> = {};
      successEvents.forEach((e) => {
        if (e.productId) {
          if (!productStats[e.productId]) {
            productStats[e.productId] = {
              name: e.productName || e.productId,
              purchases: 0,
              revenue: 0,
            };
          }
          productStats[e.productId].purchases += 1;
          productStats[e.productId].revenue += e.amount || 0;
        }
      });

      // Calculate UTM breakdown
      const utmBreakdown: Record<string, Record<string, number>> = {
        source: {},
        medium: {},
        campaign: {},
      };

      events.forEach((e) => {
        if (e.utmSource) utmBreakdown.source[e.utmSource] = (utmBreakdown.source[e.utmSource] || 0) + 1;
        if (e.utmMedium) utmBreakdown.medium[e.utmMedium] = (utmBreakdown.medium[e.utmMedium] || 0) + 1;
        if (e.utmCampaign) utmBreakdown.campaign[e.utmCampaign] = (utmBreakdown.campaign[e.utmCampaign] || 0) + 1;
      });

      const totalRevenue = successEvents.reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        totalEvents: events.length,
        totalSessions: uniqueSessions.size,
        uniqueProducts: Object.keys(productStats),
        totalRevenue,
        conversionFunnel: Array.from(uniqueSessions)
          .map((sessionId) => this.calculateFunnelConversion(sessionId))
          .filter((f) => f !== null) as FunnelConversion[],
        topProducts: Object.entries(productStats)
          .map(([productId, stats]) => ({
            productId,
            productName: stats.name,
            purchases: stats.purchases,
            revenue: stats.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue),
        utmBreakdown,
      };
    } catch (error) {
      console.error('[AnalyticsStorage] Failed to generate report:', error);
      return {
        totalEvents: 0,
        totalSessions: 0,
        uniqueProducts: [],
        totalRevenue: 0,
        conversionFunnel: [],
        topProducts: [],
        utmBreakdown: {},
      };
    }
  }

  /**
   * Clear all analytics data
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('[AnalyticsStorage] Failed to clear data:', error);
    }
  }
}

export default AnalyticsStorageService;
