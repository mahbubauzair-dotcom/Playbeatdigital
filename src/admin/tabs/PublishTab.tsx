import React, { useState, useEffect } from 'react';
import {
  SiteRevision,
  PublishResult,
  triggerPublish,
  fetchRevisionHistory,
} from '../../lib/publishingService';
import { SiteSettingsState } from '../../lib/settingsStore';
import {
  UploadCloud,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  GitCommit,
  ShieldCheck,
} from 'lucide-react';

interface PublishTabProps {
  currentOverrides: Partial<SiteSettingsState>;
  effectiveSettings: SiteSettingsState;
  onRefreshOverrides: () => void;
}

export const PublishTab: React.FC<PublishTabProps> = ({
  currentOverrides,
  effectiveSettings,
  onRefreshOverrides,
}) => {
  const [revisions, setRevisions] = useState<SiteRevision[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [loadingRevisions, setLoadingRevisions] = useState(true);

  const draftKeys = Object.keys(currentOverrides) as (keyof SiteSettingsState)[];
  const hasDrafts = draftKeys.length > 0;

  const loadRevisions = async () => {
    setLoadingRevisions(true);
    const data = await fetchRevisionHistory();
    setRevisions(data);
    setLoadingRevisions(false);
  };

  useEffect(() => {
    loadRevisions();
  }, []);

  const handlePublish = async () => {
    if (!window.confirm('Publish current settings and content to Production? This creates an immutable snapshot revision and triggers a static build.')) {
      return;
    }

    setPublishing(true);
    setPublishResult(null);

    const snapshot = {
      timestamp: new Date().toISOString(),
      overrides: currentOverrides,
      effective: effectiveSettings,
    };

    const res = await triggerPublish(snapshot);
    setPublishResult(res);
    setPublishing(false);
    loadRevisions();
    onRefreshOverrides();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Publishing Pipeline & Revision History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Freeze draft overrides into immutable release snapshots and trigger verified Vercel production rebuilds.
          </p>
        </div>
        <button
          onClick={loadRevisions}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingRevisions ? 'animate-spin' : ''}`} />
          Refresh Revisions
        </button>
      </div>

      {publishResult && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
            publishResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
          }`}
        >
          {publishResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <strong className="font-semibold block">{publishResult.message}</strong>
            {publishResult.deployTriggered ? (
              <p>Vercel automated build triggered. Monitor deployment at your Vercel project dashboard.</p>
            ) : (
              <p className="text-slate-600 dark:text-slate-300">
                To automate atomic rebuilds on every publish click, set <code>VERCEL_DEPLOY_HOOK</code> in your Vercel environment variables.
              </p>
            )}
            {publishResult.error && <p className="text-rose-600 dark:text-rose-400">{publishResult.error}</p>}
          </div>
        </div>
      )}

      {/* Draft State & Publish Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Pending Draft Overrides ({draftKeys.length})
            </h3>
            <p className="text-xs text-slate-500">
              {hasDrafts
                ? 'These manual overrides are active in preview, but not yet frozen into a live production build.'
                : 'All settings are in sync with current published defaults.'}
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {publishing ? 'Publishing Release...' : 'Publish to Production'}
          </button>
        </div>

        {hasDrafts && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/80 text-xs font-mono space-y-1 text-slate-700 dark:text-slate-300">
            {draftKeys.map((k) => (
              <div key={k} className="flex justify-between">
                <span>{k}:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-xs">
                  {String(currentOverrides[k])}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revision History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Immutable Snapshot History
          </h3>
          <span className="text-xs text-slate-500">{revisions.length} recorded</span>
        </div>

        {loadingRevisions ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading revision history...</div>
        ) : revisions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No immutable revisions recorded yet in Supabase. Click <strong>Publish to Production</strong> to create Revision #1.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {revisions.map((rev) => (
              <div key={rev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Revision #{rev.revision_number}
                    </span>
                    <span className="text-[11px] text-slate-400">· {new Date(rev.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Status: <strong className="text-slate-700 dark:text-slate-300 uppercase">{rev.status}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rev.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
