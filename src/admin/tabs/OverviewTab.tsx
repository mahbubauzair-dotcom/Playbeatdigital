import React from 'react';
import { TOOLS_REGISTRY } from '../../data/toolsRegistry';
import { BLOG_ARTICLES } from '../../data/blogRegistry';
import { SeoAuditReport } from '../../lib/seoAuditEngine';
import { GscStatusResponse } from '../../lib/gscService';
import { Ga4StatusResponse } from '../../lib/ga4Service';
import {
  Wrench,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  Activity,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface OverviewTabProps {
  draftCount: number;
  auditReport: SeoAuditReport | null;
  gscData: GscStatusResponse | null;
  ga4Data: Ga4StatusResponse | null;
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  draftCount,
  auditReport,
  gscData,
  ga4Data,
  onNavigateTab,
}) => {
  const publishedToolsCount = TOOLS_REGISTRY.length;
  const publishedArticlesCount = BLOG_ARTICLES.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Overview & Operational Health
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real operational status, published content metrics, technical SEO health, and active integrations.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published Tools */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Tools</span>
            <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {publishedToolsCount}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>100% browser-based</span>
            <button
              onClick={() => onNavigateTab('tools')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              Manage <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Published Blog Articles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Guides</span>
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {publishedArticlesCount}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Pre-rendered HTML</span>
            <button
              onClick={() => onNavigateTab('blog')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              Articles <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Technical SEO Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Technical SEO</span>
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {auditReport ? auditReport.overallScore : '--'}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Coverage: {auditReport ? `${auditReport.auditCoveragePercent}%` : 'Pending'}</span>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              Audit <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Pending Draft Overrides */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Draft Overrides</span>
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {draftCount}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{draftCount > 0 ? 'Unpublished drafts' : 'Clean / Live synced'}</span>
            <button
              onClick={() => onNavigateTab('publish')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              Publish <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Integration Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Search Console Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                Google Search Console
              </span>
            </div>
            {gscData?.connected ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <XCircle className="w-3.5 h-3.5" /> Disconnected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            {gscData?.disclaimer ||
              'Metrics describe Google Search performance (clicks, impressions, position), not total website traffic.'}
          </p>
          {gscData?.connected ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-500 block">Total Clicks</span>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {gscData.totals?.clicks ?? 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-500 block">Impressions</span>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {gscData.totals?.impressions ?? 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p>Service account credentials not configured in server environment.</p>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View setup instructions <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Google Analytics 4 Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                Google Analytics 4 (GA4)
              </span>
            </div>
            {ga4Data?.connected ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> API Connected
              </span>
            ) : ga4Data?.trackingIdConfigured ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                <Activity className="w-3.5 h-3.5" /> Tracking Installed (API Pending)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <XCircle className="w-3.5 h-3.5" /> Not Configured
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            {ga4Data?.disclaimer ||
              'GA4 reports measured, consented traffic and may not represent all visitors.'}
          </p>
          {ga4Data?.connected ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-500 block">Active Users</span>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {ga4Data.report?.activeUsers ?? 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-500 block">Page Views</span>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {ga4Data.report?.screenPageViews ?? 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p>Tracking measurement ID: <code>{ga4Data?.trackingId || 'Unset'}</code></p>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Connect GA4 Data API <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Production Deployment & Operational Health */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Production Deployment & Hosting Target
          </h3>
          <a
            href="https://playbeatdigital.store/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            Visit Live Site <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <p>
            <strong className="text-slate-900 dark:text-slate-200">Domain:</strong>{' '}
            <code className="text-slate-700 dark:text-slate-300">https://playbeatdigital.store</code>
          </p>
          <p>
            <strong className="text-slate-900 dark:text-slate-200">Architecture:</strong>{' '}
            Static Pre-rendered HTML (18 routes) + Client React Hydration + Local Browser Processing.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-slate-200">Security Guarantee:</strong>{' '}
            Visitor file transformations (PDF, images, QR, text) execute strictly in user browsers with zero server transmission.
          </p>
        </div>
      </div>
    </div>
  );
};
