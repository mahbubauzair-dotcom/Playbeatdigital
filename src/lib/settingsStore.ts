import { siteConfig } from '../config/siteConfig';
import { supabase } from './supabaseClient';

export interface SiteSettingsState {
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  primaryColor: string;
  accentColor: string;
  headerLogo: string;
  headerLogoDark: string;
  faviconPath: string;
  footerText: string;
  heroHeading: string;
  heroSubheading: string;
  advertisingEnabled: boolean;
  adPlacementTop: boolean;
  adPlacementMid: boolean;
  adPlacementBottom: boolean;
  analyticsMeasurementId: string;
  socialGithub: string;
  socialTwitter: string;
  socialLinkedin: string;
}

export const AUTOMATIC_DEFAULTS: SiteSettingsState = {
  siteName: siteConfig.siteName,
  siteTagline: siteConfig.brandPromise,
  contactEmail: siteConfig.contactEmail,
  primaryColor: '#4F46E5',
  accentColor: '#6366F1',
  headerLogo: '/logo.png',
  headerLogoDark: '/logo-dark.png',
  faviconPath: '/favicon.ico',
  footerText:
    'Free browser utilities for students, job seekers, and applicants. Files are processed locally on your device and never uploaded.',
  heroHeading: 'Everyday tools. Simple, fast and free.',
  heroSubheading:
    'Free online tools to compress photos to 50KB, resize pictures, prepare passport photos, merge & compress PDFs, calculate age, count words, make QR codes, and type Urdu.',
  advertisingEnabled: false,
  adPlacementTop: true,
  adPlacementMid: true,
  adPlacementBottom: true,
  analyticsMeasurementId: siteConfig.gaId || '',
  socialGithub: 'https://github.com/mahbubauzair-dotcom/Playbeatdigital',
  socialTwitter: '',
  socialLinkedin: '',
};

export type SettingSource = 'Automatic' | 'Manual';

export interface EffectiveSetting<T> {
  key: keyof SiteSettingsState;
  automaticValue: T;
  manualOverride: T | null;
  effectiveValue: T;
  source: SettingSource;
  error?: string;
}

export type SettingsMap = {
  [K in keyof SiteSettingsState]: EffectiveSetting<SiteSettingsState[K]>;
};

/**
 * Calculates WCAG 2.1 relative luminance and contrast ratio against white/dark backgrounds
 */
export function getContrastRatio(hexColor: string, backgroundHex: string = '#ffffff'): number {
  const getLuminance = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return 0;
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const [lr, lg, lb] = [r, g, b].map((val) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };

  const l1 = getLuminance(hexColor);
  const l2 = getLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function validateSetting(key: keyof SiteSettingsState, value: unknown): string | null {
  if (key === 'contactEmail') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value === 'string' && value.trim() && !emailRegex.test(value.trim())) {
      return 'Please enter a valid email address (e.g., admin@playbeatdigital.store).';
    }
  }

  if (key === 'primaryColor' || key === 'accentColor') {
    if (typeof value === 'string' && value.trim()) {
      if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())) {
        return 'Color must be a valid hex code (e.g. #4F46E5).';
      }
      const ratio = getContrastRatio(value.trim(), '#ffffff');
      if (ratio < 3.0) {
        return `Low contrast warning: Ratio is ${ratio}:1 on white (WCAG AA requires ≥ 4.5:1 for normal text).`;
      }
    }
  }

  if (key === 'analyticsMeasurementId') {
    if (typeof value === 'string' && value.trim()) {
      if (!/^G-[A-Z0-9]+$/i.test(value.trim())) {
        return 'GA4 Measurement ID must follow the format G-XXXXXXXXXX.';
      }
    }
  }

  return null;
}

const LOCAL_STORAGE_KEY = 'playbeat_manual_overrides_draft';

export async function fetchCurrentSettings(): Promise<{
  overrides: Partial<SiteSettingsState>;
  effective: SiteSettingsState;
  isDraft: boolean;
  persistedInDatabase: boolean;
}> {
  // Try fetching from Supabase site_settings
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('manual_overrides, is_draft')
      .eq('id', 'current')
      .maybeSingle();

    if (!error && data && data.manual_overrides) {
      const overrides = data.manual_overrides as Partial<SiteSettingsState>;
      const effective = computeEffective(overrides);
      return { overrides, effective, isDraft: data.is_draft ?? true, persistedInDatabase: true };
    }
  } catch (err) {
    console.warn('Supabase site_settings lookup deferred:', err);
  }

  // Fallback to local draft storage if offline or table not yet migrated
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const overrides = JSON.parse(local) as Partial<SiteSettingsState>;
      return {
        overrides,
        effective: computeEffective(overrides),
        isDraft: true,
        persistedInDatabase: false,
      };
    }
  } catch {}

  return {
    overrides: {},
    effective: { ...AUTOMATIC_DEFAULTS },
    isDraft: false,
    persistedInDatabase: false,
  };
}

export function computeEffective(overrides: Partial<SiteSettingsState>): SiteSettingsState {
  const result = { ...AUTOMATIC_DEFAULTS };
  for (const key of Object.keys(AUTOMATIC_DEFAULTS) as (keyof SiteSettingsState)[]) {
    const val = overrides[key];
    if (val !== undefined && val !== null && val !== '') {
      (result as Record<string, unknown>)[key] = val;
    }
  }
  return result;
}

export async function saveDraftSettings(
  overrides: Partial<SiteSettingsState>
): Promise<{ success: boolean; persistedInDatabase: boolean; error?: string }> {
  // Always update local draft for instant client preview
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
  } catch {}

  const effective = computeEffective(overrides);

  try {
    const { error } = await supabase.from('site_settings').upsert({
      id: 'current',
      automatic_values: AUTOMATIC_DEFAULTS,
      manual_overrides: overrides,
      effective_values: effective,
      is_draft: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return {
        success: true,
        persistedInDatabase: false,
        error: `Saved to local preview. Note: Supabase save deferred (${error.message}). Run migration to persist.`,
      };
    }

    return { success: true, persistedInDatabase: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: true, persistedInDatabase: false, error: message };
  }
}
