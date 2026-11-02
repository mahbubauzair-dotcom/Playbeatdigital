import React from 'react';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  progressPercent?: number;
  onCancel?: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  status,
  message,
  progressPercent,
  onCancel,
}) => {
  if (status === 'idle' && !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`my-4 p-4 rounded-xl border text-sm ${
        status === 'error'
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200'
          : status === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
          : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 text-slate-900 dark:text-slate-100'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {status === 'processing' && (
            <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" aria-hidden="true" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium">{message}</span>
        </div>

        {status === 'processing' && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-red-700 dark:text-red-300 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {status === 'processing' && typeof progressPercent === 'number' && (
        <div className="mt-3 w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-transform duration-150 origin-left"
            style={{ transform: `scaleX(${Math.max(0.02, Math.min(1, progressPercent / 100))})` }}
          />
        </div>
      )}
    </div>
  );
};
