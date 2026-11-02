import React, { useState } from 'react';
import { GscStatusResponse } from '../../lib/gscService';
import { Ga4StatusResponse } from '../../lib/ga4Service';
import { PageSpeedReport, runPageSpeedAudit } from '../../lib/pagespeedService';
import {
  Search,
  Activity,
  Gauge,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Smartphone,
  Laptop,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsTabProps {
  gscData: GscStatusResponse | null;
  ga4Data: Ga4StatusResponse | null;
  onRefreshGsc: () => void;
  onRefreshGa4: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  gscData,
  ga4Data,
  onRefreshGsc,
  onRefreshGa4,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'gsc' | 'ga4' | 'pagespeed'>('gsc');
  const [pageSpeedStrategy, setPageSpeedStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const [pageSpeedReport, setPageSpeedReport] = useState<PageSpeedReport | null>(null);
  const [runningPageSpeed, setRunningPageSpeed] = useState(false);
  const [pageSpeedError, setPageSpeedError] = useState<string | null>(null);

  const handleRunPageSpeed = async () => {
    setRunningPageSpeed(true);
    setPageSpeedError(null);
    const result = await runPageSpeedAudit('https://playbeatdigital.store', pageSpeedStrategy);
    if (result.success && result.report) {
      setPageSpeedReport(result.report);
    } else {
      setPageSpeedError(result.error || 'Failed to fetch PageSpeed audit.');
    }
    setRunningPageSpeed(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics & Search Console Performance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real search metrics from Google Search Console, audience telemetry from GA4, and PageSpeed audits.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubTab('gsc')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'gsc'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Google Search Console
          </button>
          <button
            onClick={() => setActiveSubTab('ga4')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'ga4'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Google Analytics 4
          </button>
          <button
            onClick={() => setActiveSubTab('pagespeed')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'pagespeed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            PageSpeed Insights
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Google Search Console */}
      {activeSubTab === 'gsc' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Google Search Console (GSC) Integration
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  Property: <code className="text-slate-700 dark:text-slate-300">https://playbeatdigital.store/</code>
                </span>
                <button
                  onClick={onRefreshGsc}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Refresh GSC API data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              <strong>Measurement Boundary:</strong> These metrics describe Google Search performance (impressions and clicks directly from Google search result pages), not total website visits or file conversions.
            </div>

            {gscData?.connected ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Total Search Clicks</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {gscData.totals?.clicks ?? 0}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Search Impressions</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {gscData.totals?.impressions ?? 0}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Average CTR</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {((gscData.totals?.ctr ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Average Position</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {gscData.totals?.position ? gscData.totals.position.toFixed(1) : '--'}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                    Sitemap & Indexation Status
                  </h4>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p>Submitted sitemap: <code>{gscData.sitemapStatus?.path || '/sitemap.xml'}</code></p>
                    <p>Status: {gscData.sitemapStatus?.hasErrors ? 'Errors detected' : 'Success / Valid'}</p>
                    <p>Last crawled: {gscData.sitemapStatus?.lastSubmitted || 'Automatic'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Connect Google Search Console API
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Real search data requires a read-only Google Cloud service account with permissions for <code>https://playbeatdigital.store/</code>.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-left text-xs max-w-md mx-auto space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <p>1. Enable Google Search Console API in Google Cloud</p>
                  <p>2. Set GSC_CLIENT_EMAIL in server environment</p>
                  <p>3. Set GSC_PRIVATE_KEY in server environment</p>
                </div>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
                >
                  Open Google Search Console <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Google Analytics 4 */}
      {activeSubTab === 'ga4' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Google Analytics 4 (GA4) Audience Reporting
                </h3>
              </div>
              <button
                onClick={onRefreshGa4}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Refresh GA4 API data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Distinct states breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tracking ID</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {ga4Data?.trackingId || 'Unset'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Consent Script</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {ga4Data?.trackingIdConfigured ? 'Installed (Consent Gate)' : 'Not Installed'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Data API Status</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {ga4Data?.apiConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Data Freshness</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {ga4Data?.dataFreshness || 'Standard sync'}
                </span>
              </div>
            </div>

            {ga4Data?.connected && ga4Data.report ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Active Users</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {ga4Data.report.activeUsers}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Sessions</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {ga4Data.report.sessions}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Page Views</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {ga4Data.report.screenPageViews}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs text-slate-500 block mb-1">Engagement Rate</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {(ga4Data.report.engagementRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Connect GA4 Reporting Data API
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  To view live visitor analytics inside this dashboard, configure GA4 service account credentials in your Vercel server environment.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-left text-xs max-w-md mx-auto space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <p>1. Enable Google Analytics Data API</p>
                  <p>2. Set GA4_PROPERTY_ID in server environment</p>
                  <p>3. Set GA4_CLIENT_EMAIL and GA4_PRIVATE_KEY</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Google PageSpeed Insights */}
      {activeSubTab === 'pagespeed' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Google PageSpeed Insights (Lighthouse)
                  </h3>
                  <p className="text-xs text-slate-500">Live lab benchmarks and Chrome User Experience (CrUX) field telemetry.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setPageSpeedStrategy('mobile')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 font-medium rounded cursor-pointer ${
                      pageSpeedStrategy === 'mobile'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                  <button
                    onClick={() => setPageSpeedStrategy('desktop')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 font-medium rounded cursor-pointer ${
                      pageSpeedStrategy === 'desktop'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> Desktop
                  </button>
                </div>
                <button
                  onClick={handleRunPageSpeed}
                  disabled={runningPageSpeed}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${runningPageSpeed ? 'animate-spin' : ''}`} />
                  {runningPageSpeed ? 'Running Lighthouse...' : 'Run Audit'}
                </button>
              </div>
            </div>

            {pageSpeedError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs">
                {pageSpeedError}
              </div>
            )}

            {pageSpeedReport ? (
              <div className="space-y-6">
                {/* Lighthouse Category Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block mb-1">Performance</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {pageSpeedReport.scores.performance}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">/ 100</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block mb-1">Accessibility</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {pageSpeedReport.scores.accessibility}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">/ 100</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block mb-1">Best Practices</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {pageSpeedReport.scores.bestPractices}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">/ 100</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                    <span className="text-xs text-slate-500 block mb-1">SEO</span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {pageSpeedReport.scores.seo}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">/ 100</span>
                  </div>
                </div>

                {/* Core Web Vitals Lab Metrics */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Lab Diagnostic Metrics ({pageSpeedReport.strategy.toUpperCase()})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-500 block text-[11px]">First Contentful Paint</span>
                      <span className="font-semibold">{pageSpeedReport.metrics.firstContentfulPaint}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-500 block text-[11px]">Largest Contentful Paint</span>
                      <span className="font-semibold">{pageSpeedReport.metrics.largestContentfulPaint}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-500 block text-[11px]">Total Blocking Time</span>
                      <span className="font-semibold">{pageSpeedReport.metrics.totalBlockingTime}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-500 block text-[11px]">Cumulative Layout Shift</span>
                      <span className="font-semibold">{pageSpeedReport.metrics.cumulativeLayoutShift}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Tested URL: <code>{pageSpeedReport.url}</code></span>
                  <span>
                    Field Data (CrUX):{' '}
                    {pageSpeedReport.fieldDataAvailable ? 'Available' : 'Insufficient real-world user volume'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Click <strong>Run Audit</strong> above to trigger a real Google PageSpeed Insights test against <code>https://playbeatdigital.store</code>.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
