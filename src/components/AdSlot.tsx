import React from 'react';
import { siteConfig } from '../config/siteConfig';

export type AdSlotId = 'ad-slot-top' | 'ad-slot-mid' | 'ad-slot-bottom';

interface AdSlotProps {
  id: AdSlotId;
  className?: string;
}

/**
 * Reusable Advertising Slot Preparation Component.
 * Defaults to disabled (`siteConfig.adsEnabled === false`).
 * When disabled, collapses completely with zero blank space.
 * When enabled, reserves responsive space clearly separated from tool controls,
 * and hides `ad-slot-top` on mobile viewports so primary tool controls stay near the top.
 */
export const AdSlot: React.FC<AdSlotProps> = ({ id, className = '' }) => {
  if (!siteConfig.adsEnabled) {
    return null;
  }

  const visibilityClass =
    id === 'ad-slot-top' ? 'hidden md:flex' : 'flex';

  const minHeightClass =
    id === 'ad-slot-top'
      ? 'min-h-[90px]'
      : id === 'ad-slot-mid'
      ? 'min-h-[120px] md:min-h-[160px]'
      : 'min-h-[120px] md:min-h-[200px]';

  return (
    <aside
      id={id}
      aria-label="Sponsored advertisement"
      className={`${visibilityClass} flex-col items-center justify-center my-6 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/50 ${minHeightClass} ${className}`}
    >
      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
        Advertisement · {id}
      </span>
      <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Reserved responsive ad container (Ad network code not installed)
      </div>
    </aside>
  );
};
