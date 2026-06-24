import AnalyticsStorageService, { AnalyticsReport } from '@/services/analytics-storage.service';
import TokenService from '@/services/token.service';

/**
 * Analytics Engine - Comprehensive funnel analytics for RESOFLEX™
 */

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  trafficSources: Record<string, number>;
  funnel: {
    landing: number;
    assessment: number;
    checkout: number;
    success: number;
  };
}

class AnalyticsEngine {
  /**
   * Get comprehensive dashboard metrics
   */
  static getDashboardMetrics(): DashboardMetrics {
    const report = AnalyticsStorageService.generateReport();
    const successEvents = AnalyticsStorageService.getStoredEvents().filter(
      (e) => e.event === 'payment_success'
    );

    // Calculate funnel stats
    const allEvents = AnalyticsStorageService.getStoredEvents();
    const funnelStats = {
      landing: allEvents.filter((e) => e.event === 'landing').length,
      assessment: allEvents.filter((e) => e.event === 'assessment').length,
      checkout: allEvents.filter((e) => e.event === 'checkout').length,
      success: successEvents.length,
    };

    // Calculate conversion rate
    const conversionRate =
      funnelStats.landing > 0
        ? ((funnelStats.success / funnelStats.landing) * 100)
        : 0;

    // Calculate average order value
    const averageOrderValue =
      successEvents.length > 0
        ? report.totalRevenue / successEvents.length
        : 0;

    // Extract traffic sources
    const trafficSources: Record<string, number> = {};
    allEvents.forEach((e) => {
      if (e.utmSource) {
        trafficSources[e.utmSource] = (trafficSources[e.utmSource] || 0) + 1;
      }
    });

    return {
      totalRevenue: report.totalRevenue,
      totalOrders: successEvents.length,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      topProducts: report.topProducts.map((p) => ({
        id: p.productId,
        name: p.productName,
        sales: p.purchases,
        revenue: p.revenue,
      })),
      trafficSources,
      funnel: funnelStats,
    };
  }

  /**
   * Get detailed funnel analysis
   */
  static getFunnelAnalysis() {
    const report = AnalyticsStorageService.generateReport();
    const allEvents = AnalyticsStorageService.getStoredEvents();

    const stages = {
      landing: allEvents.filter((e) => e.event === 'landing').length,
      assessment: allEvents.filter((e) => e.event === 'assessment').length,
      checkout: allEvents.filter((e) => e.event === 'checkout').length,
      success: allEvents.filter((e) => e.event === 'payment_success').length,
    };

    return {
      stages,
      dropoff: {
        landingToAssessment: stages.landing - stages.assessment,
        assessmentToCheckout: stages.assessment - stages.checkout,
        checkoutToSuccess: stages.checkout - stages.success,
      },
      conversionRates: {
        landingToAssessment:
          stages.landing > 0
            ? ((stages.assessment / stages.landing) * 100).toFixed(2)
            : 0,
        assessmentToCheckout:
          stages.assessment > 0
            ? ((stages.checkout / stages.assessment) * 100).toFixed(2)
            : 0,
        checkoutToSuccess:
          stages.checkout > 0
            ? ((stages.success / stages.checkout) * 100).toFixed(2)
            : 0,
        overall:
          stages.landing > 0
            ? ((stages.success / stages.landing) * 100).toFixed(2)
            : 0,
      },
    };
  }

  /**
   * Get cohort analysis (time-based)
   */
  static getCohortAnalysis() {
    const events = AnalyticsStorageService.getStoredEvents();

    // Group by date
    const byDate: Record<string, number> = {};
    events.forEach((e) => {
      const date = new Date(e.timestamp).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return {
      dailyEvents: byDate,
      dailyRevenue: this.getDailyRevenue(),
      dailyOrders: this.getDailyOrders(),
    };
  }

  /**
   * Get daily revenue breakdown
   */
  private static getDailyRevenue(): Record<string, number> {
    const events = AnalyticsStorageService.getStoredEvents().filter(
      (e) => e.event === 'payment_success'
    );

    const byDate: Record<string, number> = {};
    events.forEach((e) => {
      const date = new Date(e.timestamp).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + (e.amount || 0);
    });

    return byDate;
  }

  /**
   * Get daily orders breakdown
   */
  private static getDailyOrders(): Record<string, number> {
    const events = AnalyticsStorageService.getStoredEvents().filter(
      (e) => e.event === 'payment_success'
    );

    const byDate: Record<string, number> = {};
    events.forEach((e) => {
      const date = new Date(e.timestamp).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return byDate;
  }

  /**
   * Get user acquisition metrics
   */
  static getUserAcquisitionMetrics() {
    const events = AnalyticsStorageService.getStoredEvents();

    // Group by UTM source
    const bySource: Record<
      string,
      { events: number; conversions: number; revenue: number }
    > = {};

    events.forEach((e) => {
      const source = e.utmSource || 'direct';
      if (!bySource[source]) {
        bySource[source] = { events: 0, conversions: 0, revenue: 0 };
      }
      bySource[source].events += 1;

      if (e.event === 'payment_success') {
        bySource[source].conversions += 1;
        bySource[source].revenue += e.amount || 0;
      }
    });

    return Object.entries(bySource).map(([source, data]) => ({
      source,
      ...data,
      conversionRate: data.events > 0 ? ((data.conversions / data.events) * 100).toFixed(2) : 0,
      costPerConversion: data.conversions > 0 ? (data.revenue / data.conversions).toFixed(2) : 0,
    }));
  }

  /**
   * Get product performance metrics
   */
  static getProductPerformance() {
    const events = AnalyticsStorageService.getStoredEvents();
    const successEvents = events.filter((e) => e.event === 'payment_success');

    const byProduct: Record<
      string,
      {
        name: string;
        clicks: number;
        purchases: number;
        revenue: number;
      }
    > = {};

    events.forEach((e) => {
      if (e.productId) {
        if (!byProduct[e.productId]) {
          byProduct[e.productId] = {
            name: e.productName || e.productId,
            clicks: 0,
            purchases: 0,
            revenue: 0,
          };
        }

        if (e.event === 'product_view') {
          byProduct[e.productId].clicks += 1;
        }

        if (e.event === 'payment_success') {
          byProduct[e.productId].purchases += 1;
          byProduct[e.productId].revenue += e.amount || 0;
        }
      }
    });

    return Object.entries(byProduct)
      .map(([productId, data]) => ({
        productId,
        ...data,
        conversionRate:
          data.clicks > 0
            ? ((data.purchases / data.clicks) * 100).toFixed(2)
            : 0,
        averageOrderValue:
          data.purchases > 0
            ? (data.revenue / data.purchases).toFixed(2)
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get user access metrics (purchased products)
   */
  static getUserAccessMetrics() {
    const purchasedProducts = TokenService.getPurchasedProducts();
    const events = AnalyticsStorageService.getStoredEvents().filter(
      (e) => e.event === 'payment_success'
    );

    return {
      totalPurchases: events.length,
      uniqueProductsPurchased: purchasedProducts.length,
      purchasedProducts,
      totalRevenue: events.reduce((sum, e) => sum + (e.amount || 0), 0),
      averageOrderValue:
        events.length > 0
          ? (events.reduce((sum, e) => sum + (e.amount || 0), 0) / events.length).toFixed(2)
          : 0,
    };
  }

  /**
   * Generate full analytics report
   */
  static generateFullReport(): AnalyticsReport {
    return AnalyticsStorageService.generateReport();
  }

  /**
   * Export analytics data as CSV
   */
  static exportAsCSV(): string {
    const events = AnalyticsStorageService.getStoredEvents();
    const headers = [
      'timestamp',
      'event',
      'sessionId',
      'productId',
      'productName',
      'amount',
      'reference',
      'utmSource',
      'utmMedium',
      'utmCampaign',
    ];

    const rows = [headers.join(',')];

    events.forEach((e) => {
      const row = [
        new Date(e.timestamp).toISOString(),
        e.event,
        e.sessionId,
        e.productId || '',
        e.productName || '',
        e.amount || '',
        e.reference || '',
        e.utmSource || '',
        e.utmMedium || '',
        e.utmCampaign || '',
      ];
      rows.push(row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    });

    return rows.join('\n');
  }

  /**
   * Clear all analytics data
   */
  static clearAllData(): void {
    AnalyticsStorageService.clearAll();
  }
}

export default AnalyticsEngine;
