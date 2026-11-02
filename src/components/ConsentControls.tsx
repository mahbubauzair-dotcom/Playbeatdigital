import React, { useEffect, useState } from 'react';
import { siteConfig } from '../config/siteConfig';

export type ConsentChoice = 'accepted' | 'rejected' | 'unset';

const CONSENT_STORAGE_KEY = 'playbeat_analytics_consent';

function injectGoogleAnalytics(gaId: string) {
  if (!gaId || typeof document === 'undefined') return;
  if (document.getElementById('playbeat-ga-script')) return;

  const script1 = document.createElement('script');
  script1.id = 'playbeat-ga-script';
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.id = 'playbeat-ga-init';
  script2.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', { anonymize_ip: true, allow_google_signals: false });
  `;
  document.head.appendChild(script2);
}

export const ConsentControls: React.FC<{
  showManageModal: boolean;
  onCloseManageModal: () => void;
}> = ({ showManageModal, onCloseManageModal }) => {
  const gaConfigured = Boolean(siteConfig.gaId && /^G-[A-Z0-9]+$/i.test(siteConfig.gaId));
  const [choice, setChoice] = useState<ConsentChoice>('unset');
  const [bannerDismissedForSession, setBannerDismissedForSession] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored === 'accepted' || stored === 'rejected') {
        setChoice(stored);
        if (stored === 'accepted' && gaConfigured) {
          injectGoogleAnalytics(siteConfig.gaId);
        }
      }
    } catch {
      // ignore localStorage error
    }
  }, [gaConfigured]);

  const handleSaveChoice = (next: 'accepted' | 'rejected') => {
    setChoice(next);
    setBannerDismissedForSession(true);
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, next);
    } catch {
      // ignore localStorage error
    }
    if (next === 'accepted' && gaConfigured) {
      injectGoogleAnalytics(siteConfig.gaId);
    }
    onCloseManageModal();
  };

  // If GA is not configured and user hasn't opened the preferences modal, do not render any unnecessary banner
  const shouldShowBanner =
    gaConfigured && choice === 'unset' && !bannerDismissedForSession && !showManageModal;

  if (!shouldShowBanner && !showManageModal) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Analytics and privacy preferences"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Analytics &amp; Privacy Preferences
        </h2>
        <button
          type="button"
          onClick={() => {
            // Closing or dismissing does NOT imply consent
            setBannerDismissedForSession(true);
            onCloseManageModal();
          }}
          className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-1.5 py-0.5 rounded cursor-pointer"
          aria-label="Dismiss banner without accepting analytics"
        >
          Close
        </button>
      </div>

      {gaConfigured ? (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          We use optional anonymous page-view analytics only if you accept. Your files, typed text, dates of birth, and QR contents are processed in your browser and never sent to analytics.
        </p>
      ) : (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          Optional analytics is currently disabled in this build (<code>NEXT_PUBLIC_GA_ID</code> is not configured). Local preferences are stored only in your browser.
        </p>
      )}

      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Current setting:{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {choice === 'accepted'
            ? 'Analytics Accepted'
            : choice === 'rejected'
            ? 'Analytics Rejected'
            : 'Not chosen (Analytics inactive)'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleSaveChoice('accepted')}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Accept analytics
        </button>
        <button
          type="button"
          onClick={() => handleSaveChoice('rejected')}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Reject analytics
        </button>
      </div>
    </div>
  );
};
