export interface GscMetricRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscStatusResponse {
  connected: boolean;
  siteUrl: string;
  hasCredentials: boolean;
  serviceAccountEmail?: string;
  lastUpdated?: string;
  error?: string;
  totals?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  topQueries?: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages?: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
  countries?: { country: string; clicks: number; impressions: number }[];
  devices?: { device: string; clicks: number; impressions: number }[];
  sitemapStatus?: {
    path: string;
    lastSubmitted?: string;
    isPending?: boolean;
    hasErrors?: boolean;
  };
  disclaimer: string;
}

/**
 * Evaluates real Google Search Console integration status.
 * Never invents mock or random numbers. If credentials or API responses
 * are absent, returns a truthful disconnected state with setup instructions.
 */
export async function getGscData(
  startDate?: string,
  endDate?: string
): Promise<GscStatusResponse> {
  const disclaimer =
    'Google Search Console metrics reflect search performance from Google Search results only, not total website traffic.';

  try {
    const res = await fetch(
      `/api/admin/gsc?startDate=${startDate || ''}&endDate=${endDate || ''}`
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // Fallback check when running in purely client mode without backend server env
  return {
    connected: false,
    siteUrl: 'https://playbeatdigital.store/',
    hasCredentials: false,
    disclaimer,
    error:
      'Google Search Console credentials not configured. Please supply GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY in server environment to sync live data.',
  };
}
