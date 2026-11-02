import React, { useState } from 'react';
import { SeoAuditReport, runSeoAudit } from '../../lib/seoAuditEngine';
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface AuditTabProps {
  initialReport: SeoAuditReport | null;
  onNavigateTab: (tab: string) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({ initialReport, onNavigateTab }) => {
  const [report, setReport] = useState<SeoAuditReport | null>(initialReport);
  const [running, setRunning] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>('https://playbeatdigital.store/');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const executeAudit = async () => {
    setRunning(true);
    try {
      const res = await fetch(`/api/admin/audit?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        // Fallback: client-side audit using current document HTML
        const html = document.documentElement.outerHTML;
        const fallbackReport = runSeoAudit(html, targetUrl, 'Local Build (Pre-rendered)');
        setReport(fallbackReport);
      }
    } catch {
      const html = document.documentElement.outerHTML;
      const fallbackReport = runSeoAudit(html, targetUrl, 'Local Build (Pre-rendered)');
      setReport(fallbackReport);
    } finally {
      setRunning(false);
    }
  };

  const filteredFindings = (report?.findings || []).filter((f) => {
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Technical SEO Audit Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent 13-point audit verifying indexability, headers, semantic structure, and Schema markup.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://playbeatdigital.store/"
            className="text-xs p-1.5 w-60 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={executeAudit}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Auditing...' : 'Run Audit'}
          </button>
        </div>
      </div>

      {/* Mandatory Audit Disclaimer & Score Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Audit Score
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {report ? report.overallScore : '--'}
              </span>
              <span className="text-sm text-slate-500">out of 100</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              PlayBeat Tools technical SEO audit score — not a Google ranking score.
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Formula: {report?.formulaDescription || 'Score = (Sum of Earned Check Weights / Total Evaluated Weights) × 100.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Audit Coverage</span>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {report ? `${report.auditCoveragePercent}%` : '--'}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
              <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase font-semibold">Passed</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-base">
                {report?.summary.passCount ?? 0}
              </span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
              <span className="text-amber-700 dark:text-amber-400 block text-[10px] uppercase font-semibold">Warnings</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 text-base">
                {report?.summary.warningCount ?? 0}
              </span>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-center">
              <span className="text-rose-700 dark:text-rose-400 block text-[10px] uppercase font-semibold">Errors</span>
              <span className="font-bold text-rose-700 dark:text-rose-400 text-base">
                {report?.summary.errorCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {report && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>Environment: <strong>{report.environment}</strong></span>
            <span>Target: <code className="text-slate-700 dark:text-slate-300">{report.targetUrl}</code></span>
            <span>Audited: {new Date(report.timestamp).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Filter Bar (Zero-pill compliant segmented buttons) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {['all', 'Indexing', 'Metadata', 'Content', 'Technical', 'Social', 'Structured Data'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Checks' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
          >
            <option value="all">All ({report?.findings.length || 0})</option>
            <option value="pass">Passed ({report?.summary.passCount || 0})</option>
            <option value="warning">Warnings ({report?.summary.warningCount || 0})</option>
            <option value="error">Errors ({report?.summary.errorCount || 0})</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredFindings.map((finding) => (
            <div key={finding.id} className="p-4 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {finding.status === 'pass' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {finding.status === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  {finding.status === 'error' && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  {finding.status === 'not_checked' && (
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {finding.name}
                  </span>
                  <span className="text-[11px] text-slate-400">· {finding.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500">
                    Weight: {finding.weight} pt ({finding.scoreEarned}/{finding.weight})
                  </span>
                  <button
                    onClick={() => onNavigateTab(finding.editorLink.replace('/admin/', ''))}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    Edit <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-100 dark:border-slate-800/80">
                  <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Observed Value:</strong>
                  <span className="font-mono break-all">{finding.observedValue}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-100 dark:border-slate-800/80">
                  <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Evaluation:</strong>
                  <span>{finding.reason}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-100 dark:border-slate-800/80">
                  <strong className="block text-slate-800 dark:text-slate-200 mb-0.5">Recommended Fix:</strong>
                  <span>{finding.recommendedFix}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
