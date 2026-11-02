import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Download, FileText, RotateCcw } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingStatus } from '../components/ProcessingStatus';
import { formatBytes } from '../lib/imageProcessing';
import {
  CompressPdfResult,
  compressPdfToTarget,
  inspectPdfFile,
} from '../lib/pdfProcessing';

const PDF_PRESETS = [
  { label: '100 KB', kb: 100 },
  { label: '200 KB', kb: 200 },
  { label: '500 KB', kb: 500 },
  { label: '1 MB', kb: 1024 },
];

export const CompressPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [presetKb, setPresetKb] = useState<number | 'custom'>(200);
  const [customKb, setCustomKb] = useState<number>(150);

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const abortRef = useRef<AbortController | null>(null);

  const effectiveTargetKb = presetKb === 'custom' ? Math.max(20, customKb) : presetKb;

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFilesSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
    }
    setResult(null);
    setStatus('processing');
    setStatusMsg('Inspecting PDF file...');

    try {
      const info = await inspectPdfFile(selected);
      setFile(selected);
      setPageCount(info.pageCount);
      setStatus('idle');
      setStatusMsg('');
    } catch (err: unknown) {
      setFile(null);
      setPageCount(0);
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Invalid PDF file.');
    }
  };

  const handleCompress = async () => {
    if (!file || status === 'processing') return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
    }
    setResult(null);
    setStatus('processing');
    setProgressPct(5);
    setStatusMsg('Rendering and compressing PDF pages sequentially...');

    try {
      const res = await compressPdfToTarget(
        file,
        effectiveTargetKb,
        (pct, text) => {
          setProgressPct(pct);
          setStatusMsg(text);
        },
        controller.signal
      );

      const url = URL.createObjectURL(res.blob);
      setDownloadUrl(url);
      setResult(res);
      setProgressPct(undefined);

      if (res.outputLargerThanOriginal) {
        setStatus('error');
        setStatusMsg(
          `The re-encoded output (${formatBytes(res.outputBytes)}) is larger than your original file (${formatBytes(res.originalBytes)}). This happens when a PDF contains pure vector text rather than scanned images. We recommend retaining your original file.`
        );
      } else if (!res.targetAchieved) {
        setStatus('success');
        setStatusMsg(
          `Your target of ${effectiveTargetKb} KB could not be met within readable quality limits for ${res.pageCount} ${res.pageCount === 1 ? 'page' : 'pages'}. The smallest result produced is ${formatBytes(res.outputBytes)}. You can still download this file below.`
        );
      } else {
        setStatus('success');
        setStatusMsg(
          `Compressed PDF from ${formatBytes(res.originalBytes)} to ${formatBytes(res.outputBytes)}.`
        );
      }
    } catch (err: unknown) {
      setStatus('error');
      setProgressPct(undefined);
      setStatusMsg(err instanceof Error ? err.message : 'PDF compression failed.');
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file || !result) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${baseName}-compressed-${Math.round(result.outputBytes / 1024)}kb.pdf`;
    a.click();
  };

  const handleReset = () => {
    abortRef.current?.abort();
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl('');
    setFile(null);
    setPageCount(0);
    setResult(null);
    setStatus('idle');
    setStatusMsg('');
    setProgressPct(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Mandatory Pre-Processing Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed font-medium">
          This method converts PDF pages into images. Text will no longer be selectable or searchable, and links, forms and other interactive features may be lost.
        </p>
      </div>

      {!file ? (
        <FileDropzone
          accept="application/pdf,.pdf"
          label="Select or Drop a PDF File to Compress"
          sublabel="Ideal for scanned certificates, mark sheets, and multi-page forms"
          limitsText="Max 50 MB · Up to 50 pages · Sequential in-browser processing"
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <div className="space-y-5">
          {/* Selected File Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {file.name}
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  Original Size: {formatBytes(file.size)} · {pageCount}{' '}
                  {pageCount === 1 ? 'page' : 'pages'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={status === 'processing'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Choose Another PDF</span>
            </button>
          </div>

          {/* Target Preset Selector */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Target Size Goal (Not guaranteed for high page counts)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PDF_PRESETS.map((p) => (
                  <button
                    key={p.kb}
                    type="button"
                    onClick={() => setPresetKb(p.kb)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono tabular-nums transition-colors cursor-pointer ${
                      presetKb === p.kb
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPresetKb('custom')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    presetKb === 'custom'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                  }`}
                >
                  Custom KB
                </button>

                {presetKb === 'custom' && (
                  <div className="inline-flex items-center gap-1.5 ml-1">
                    <input
                      type="number"
                      min={20}
                      max={10240}
                      value={customKb}
                      onChange={(e) => setCustomKb(Number(e.target.value) || 200)}
                      aria-label="Custom PDF target size in KB"
                      className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      KB
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCompress}
                disabled={status === 'processing'}
                className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {status === 'processing' ? 'Compressing PDF...' : 'Compress PDF'}
              </button>
            </div>
          </div>

          {/* Honest Result Summary Card */}
          {result && (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Original Size</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                    {formatBytes(result.originalBytes)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Smallest Output Produced
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {formatBytes(result.outputBytes)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Size Change</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                    {result.outputBytes <= result.originalBytes ? '' : '+'}
                    {Math.round(
                      ((result.outputBytes - result.originalBytes) / result.originalBytes) * 100
                    )}
                    %
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {result.outputLargerThanOriginal ? (
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      Output is larger than your original PDF. We recommend retaining your original file.
                    </span>
                  ) : result.targetAchieved ? (
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Output is at or below your {effectiveTargetKb} KB target.
                    </span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      Target of {effectiveTargetKb} KB was not reached within readable quality limits. Showing smallest result produced.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download Compressed PDF ({formatBytes(result.outputBytes)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ProcessingStatus
        status={status}
        message={statusMsg}
        progressPercent={progressPct}
        onCancel={
          status === 'processing'
            ? () => {
                abortRef.current?.abort();
              }
            : undefined
        }
      />
    </div>
  );
};
