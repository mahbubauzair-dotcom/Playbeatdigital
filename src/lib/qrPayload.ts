export type QrMode = 'url' | 'text' | 'wifi' | 'phone' | 'email';
export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface QrInputState {
  mode: QrMode;
  url: string;
  text: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: WifiEncryption;
  wifiHidden: boolean;
  phone: string;
  emailAddress: string;
  emailSubject: string;
  emailBody: string;
}

export interface QrPayloadResult {
  valid: boolean;
  payload: string;
  error?: string;
}

/**
 * Escapes special characters (\ ; , : ") in WiFi QR fields per ZXing WiFi Network config spec
 */
export function escapeWifiField(val: string): string {
  return val.replace(/([\\;,:""])/g, '\\$1');
}

export function buildQrPayload(state: QrInputState): QrPayloadResult {
  switch (state.mode) {
    case 'url': {
      const trimmed = state.url.trim();
      if (!trimmed) {
        return { valid: false, payload: '', error: 'Please enter a website URL.' };
      }
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return {
            valid: false,
            payload: '',
            error: 'URL must start with https:// or http://',
          };
        }
        return { valid: true, payload: parsed.toString() };
      } catch {
        return {
          valid: false,
          payload: '',
          error: 'Please enter a valid full URL starting with https:// (for example, https://playbeatdigital.store).',
        };
      }
    }

    case 'text': {
      const trimmed = state.text.trim();
      if (!trimmed) {
        return { valid: false, payload: '', error: 'Please enter text to encode in the QR code.' };
      }
      if (trimmed.length > 1800) {
        return {
          valid: false,
          payload: '',
          error: 'Text is too long for a reliable scannable QR code (maximum 1,800 characters).',
        };
      }
      return { valid: true, payload: state.text };
    }

    case 'wifi': {
      const ssid = state.wifiSsid.trim();
      if (!ssid) {
        return { valid: false, payload: '', error: 'Please enter the WiFi Network Name (SSID).' };
      }
      if (state.wifiEncryption !== 'nopass' && !state.wifiPassword) {
        return {
          valid: false,
          payload: '',
          error: 'Please enter the WiFi password or select "None (Open)" encryption.',
        };
      }
      const escapedSsid = escapeWifiField(ssid);
      const escapedPass = state.wifiEncryption === 'nopass' ? '' : escapeWifiField(state.wifiPassword);
      const hiddenPart = state.wifiHidden ? 'H:true;' : '';
      const passPart = state.wifiEncryption === 'nopass' ? '' : `P:${escapedPass};`;
      const payload = `WIFI:T:${state.wifiEncryption};S:${escapedSsid};${passPart}${hiddenPart};`;
      return { valid: true, payload };
    }

    case 'phone': {
      const cleaned = state.phone.trim().replace(/[\s()-]/g, '');
      if (!cleaned || !/^\+?\d{3,18}$/.test(cleaned)) {
        return {
          valid: false,
          payload: '',
          error: 'Please enter a valid phone number (for example, +923001234567 or 03001234567).',
        };
      }
      return { valid: true, payload: `tel:${cleaned}` };
    }

    case 'email': {
      const email = state.emailAddress.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return {
          valid: false,
          payload: '',
          error: 'Please enter a valid email address.',
        };
      }
      const params: string[] = [];
      if (state.emailSubject.trim()) {
        params.push(`subject=${encodeURIComponent(state.emailSubject.trim())}`);
      }
      if (state.emailBody.trim()) {
        params.push(`body=${encodeURIComponent(state.emailBody.trim())}`);
      }
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      return { valid: true, payload: `mailto:${email}${query}` };
    }
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = transform(rgb.r);
  const G = transform(rgb.g);
  const B = transform(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export interface ContrastCheckResult {
  ratio: number;
  isLowContrast: boolean;
  isInverted: boolean;
  warningMessage: string | null;
}

export function checkQrContrast(foregroundHex: string, backgroundHex: string): ContrastCheckResult {
  const fg = hexToRgb(foregroundHex) ?? { r: 0, g: 0, b: 0 };
  const bg = hexToRgb(backgroundHex) ?? { r: 255, g: 255, b: 255 };

  const lumFg = relativeLuminance(fg);
  const lumBg = relativeLuminance(bg);

  const lighter = Math.max(lumFg, lumBg);
  const darker = Math.min(lumFg, lumBg);
  const ratio = Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));

  const isInverted = lumFg > lumBg;
  const isLowContrast = ratio < 4.5 || isInverted;

  let warningMessage: string | null = null;
  if (isInverted) {
    warningMessage =
      'Inverted colors detected (foreground is lighter than background). Many phone cameras cannot scan light QR modules on a dark background. Use a dark foreground on a light background.';
  } else if (ratio < 4.5) {
    warningMessage = `Low contrast ratio (${ratio}:1). Phone cameras require strong contrast (at least 4.5:1) to scan QR codes reliably.`;
  }

  return {
    ratio,
    isLowContrast,
    isInverted,
    warningMessage,
  };
}
