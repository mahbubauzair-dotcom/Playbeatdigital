export interface SiteConfig {
  siteName: string;
  brandPromise: string;
  privacyNotice: string;
  siteUrl: string;
  contactEmail: string;
  gaId: string;
  gscVerification: string;
  adsEnabled: boolean;
}

function getEnvVar(viteKey: string, nextKey: string, fallback = ''): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const val = (import.meta.env as Record<string, string | undefined>)[viteKey] ||
                  (import.meta.env as Record<string, string | undefined>)[nextKey];
      if (val !== undefined && val !== '') return val;
    }
  } catch {
    // ignore in Node context
  }
  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[nextKey] || process.env[viteKey];
      if (val !== undefined && val !== '') return val;
    }
  } catch {
    // ignore in browser context
  }
  return fallback;
}

const rawSiteUrl = getEnvVar('VITE_SITE_URL', 'NEXT_PUBLIC_SITE_URL', 'https://playbeatdigital.store');
const normalizedSiteUrl = rawSiteUrl.replace(/\/+$/, '');

export const siteConfig: SiteConfig = {
  siteName: 'PlayBeat Tools',
  brandPromise: 'Everyday tools. Simple, fast and free.',
  privacyNotice: 'Your files are processed in your browser and never uploaded.',
  siteUrl: normalizedSiteUrl,
  contactEmail: getEnvVar('VITE_CONTACT_EMAIL', 'NEXT_PUBLIC_CONTACT_EMAIL', ''),
  gaId: getEnvVar('VITE_GA_ID', 'NEXT_PUBLIC_GA_ID', ''),
  gscVerification: getEnvVar('VITE_GSC_VERIFICATION', 'NEXT_PUBLIC_GSC_VERIFICATION', ''),
  adsEnabled: getEnvVar('VITE_ADS_ENABLED', 'NEXT_PUBLIC_ADS_ENABLED', 'false').toLowerCase() === 'true',
};

export function buildCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const withTrailing = cleanPath === '/' ? '/' : `${cleanPath.replace(/\/+$/, '')}/`;
  return `${siteConfig.siteUrl}${withTrailing}`;
}
