import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Analytics Tracking Endpoint
 * POST /api/track
 *
 * Receives analytics events from the client and processes them
 * In production, these would be stored in a database for reporting
 */

interface AnalyticsPayload {
  event: string;
  sessionId?: string;
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

// Simple in-memory event store (in production, use database)
const eventStore: AnalyticsPayload[] = [];
const MAX_EVENTS = 10000;

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

  if (req.method === 'POST') {
    return handleTrackEvent(req, res);
  } else if (req.method === 'GET') {
    return handleGetAnalytics(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * POST /api/track
 * Track an analytics event
 */
async function handleTrackEvent(req: VercelRequest, res: VercelResponse) {
  try {
    const payload: AnalyticsPayload = req.body;

    // Validate required fields
    if (!payload.event) {
      return res.status(400).json({
        status: false,
        message: 'Event name is required',
      });
    }

    // Add timestamp
    const event = {
      ...payload,
      timestamp: Date.now(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    // Store event
    eventStore.push(event);

    // Prevent unbounded growth
    if (eventStore.length > MAX_EVENTS) {
      eventStore.splice(0, eventStore.length - MAX_EVENTS);
    }

    console.log(`[Analytics] Event tracked: ${payload.event}`, {
      productId: payload.productId,
      amount: payload.amount,
    });

    return res.status(200).json({
      status: true,
      message: 'Event tracked successfully',
      eventId: `evt_${Date.now()}`,
    });
  } catch (error) {
    console.error('[Analytics] Track Event Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to track event',
    });
  }
}

/**
 * GET /api/track?report=summary
 * Get analytics report
 */
async function handleGetAnalytics(req: VercelRequest, res: VercelResponse) {
  try {
    const { report, sessionId } = req.query;

    if (report === 'summary') {
      // Return summary report
      const summary = {
        totalEvents: eventStore.length,
        eventTypes: [...new Set(eventStore.map((e) => e.event))],
        uniqueSessions: new Set(eventStore.map((e) => e.sessionId)).size,
        totalRevenue: eventStore
          .filter((e) => e.event === 'payment_success')
          .reduce((sum, e) => sum + (e.amount || 0), 0),
        successfulPayments: eventStore.filter((e) => e.event === 'payment_success').length,
        topProducts: Array.from(
          new Map(
            eventStore
              .filter((e) => e.event === 'payment_success')
              .reduce(
                (map, e) => {
                  const current = map.get(e.productId || 'unknown') || {
                    productName: e.productName || e.productId,
                    count: 0,
                    revenue: 0,
                  };
                  current.count += 1;
                  current.revenue += e.amount || 0;
                  return map.set(e.productId || 'unknown', current);
                },
                new Map()
              )
          ).values()
        )
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
        funnelConversion: calculateFunnelConversion(),
      };

      return res.status(200).json({
        status: true,
        data: summary,
      });
    } else if (sessionId && typeof sessionId === 'string') {
      // Return events for specific session
      const events = eventStore.filter((e) => e.sessionId === sessionId);
      return res.status(200).json({
        status: true,
        data: events,
      });
    } else {
      // Return all events
      return res.status(200).json({
        status: true,
        data: eventStore,
      });
    }
  } catch (error) {
    console.error('[Analytics] Get Analytics Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to retrieve analytics',
    });
  }
}

/**
 * Calculate funnel conversion metrics
 */
function calculateFunnelConversion() {
  const stages = {
    landing: eventStore.filter((e) => e.event === 'landing').length,
    assessment: eventStore.filter((e) => e.event === 'assessment').length,
    checkout: eventStore.filter((e) => e.event === 'checkout').length,
    success: eventStore.filter((e) => e.event === 'payment_success').length,
  };

  return {
    ...stages,
    landingToAssessment: stages.assessment > 0 ? ((stages.assessment / stages.landing) * 100).toFixed(2) : 0,
    assessmentToCheckout: stages.checkout > 0 ? ((stages.checkout / stages.assessment) * 100).toFixed(2) : 0,
    checkoutToSuccess: stages.success > 0 ? ((stages.success / stages.checkout) * 100).toFixed(2) : 0,
    overallConversion: stages.success > 0 ? ((stages.success / stages.landing) * 100).toFixed(2) : 0,
  };
}
