export interface Ga4MetricReport {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  engagementRate: number;
  topPages: { path: string; views: number; users: number }[];
  sources: { source: string; sessions: number }[];
  devices: { category: string; users: number }[];
}

export interface Ga4StatusResponse {
  connected: boolean;
  trackingIdConfigured: boolean;
  trackingId: string | null;
  propertyId: string | null;
  apiConnected: boolean;
  dataAvailable: boolean;
  timezone?: string;
  dataFreshness?: string;
  lastSync?: string;
  report?: Ga4MetricReport;
  error?: string;
  disclaimer: string;
}

export async function getGa4Data(): Promise<Ga4StatusResponse> {
  const disclaimer =
    'GA4 metrics reflect consented visitor interactions tracked via Google Analytics. Tool processing is 100% browser-based and never logs user documents or payloads.';

  try {
    const res = await fetch('/api/admin/ga4');
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const env = typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env ? (import.meta as unknown as { env: Record<string, string> }).env : {};
  const trackingId = env.VITE_GA_ID || (typeof process !== 'undefined' && process.env ? process.env.VITE_GA_ID : null) || null;

  return {
    connected: false,
    trackingIdConfigured: !!trackingId,
    trackingId,
    propertyId: null,
    apiConnected: false,
    dataAvailable: false,
    disclaimer,
    error:
      'Google Analytics Data API not connected. Provide GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY in server environment to view live audience traffic.',
  };
}
