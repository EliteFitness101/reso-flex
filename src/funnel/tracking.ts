import AnalyticsStorageService from '@/services/analytics-storage.service';

/**
 * Extract UTM parameters from URL
 */
function getUtmParameters(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmContent: params.get('utm_content') || undefined,
    utmTerm: params.get('utm_term') || undefined,
  } as Record<string, string>;
}

/**
 * Track analytics event with UTM parameters and local storage
 */
export function track(
  event: string,
  payload?: Record<string, unknown>
) {
  console.log("TRACK", event, payload);

  // Also track to local storage for offline analytics
  try {
    const utmParams = getUtmParameters();
    
    AnalyticsStorageService.trackEvent({
      event,
      ...utmParams,
      ...payload,
    });

    // Send to API endpoint if available
    if (typeof window !== 'undefined') {
      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          sessionId: AnalyticsStorageService.getSessionId(),
          ...utmParams,
          ...payload,
        }),
      }).catch(() => {
        // Silently fail if API is unavailable
      });
    }
  } catch (error) {
    console.error('[Track] Error:', error);
  }
}
