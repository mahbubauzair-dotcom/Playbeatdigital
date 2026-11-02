import React, { useEffect, useRef, useState } from 'react';
import { Download, Lock, RotateCcw, Unlock } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingStatus } from '../components/ProcessingStatus';
import {
  DecodedImageInfo,
  ExportMimeType,
  ResizeImageResult,
  ResizeMode,
  decodeImageFile,
  formatBytes,
  resizeImageProcess,
} from '../lib/imageProcessing';

export const ResizeImageTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [decoded, setDecoded] = useState<DecodedImageInfo | null>(null);

  const [mode, setMode] = useState<ResizeMode>('dimensions');
  const [widthPx, setWidthPx] = useState<number>(600);
  const [heightPx, setHeightPx] = useState<number>(800);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [percentage, setPercentage] = useState<number>(50);
  const [targetKb, setTargetKb] = useState<number>(50);

  const [exportFormat, setExportFormat] = useState<ExportMimeType>('image/jpeg');
  const [qualityPercent, setQualityPercent] = useState<number>(85);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [result, setResult] = useState<ResizeImageResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [decoded, previewUrl]);

  const handleFilesSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setResult(null);
    setStatus('processing');
    setStatusMsg('Loading image...');

    try {
      const info = await decodeImageFile(selected);
      setFile(selected);
      setDecoded(info);
      setWidthPx(info.width);
      setHeightPx(info.height);
      setStatus('idle');
      setStatusMsg('');
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Could not decode image.');
    }
  };

  const handleWidthChange = (nextW: number) => {
    setWidthPx(nextW);
    if (lockAspect && decoded && decoded.width > 0) {
      const ratio = decoded.height / decoded.width;
      setHeightPx(Math.max(1, Math.round(nextW * ratio)));
    }
  };

  const handleHeightChange = (nextH: number) => {
    setHeightPx(nextH);
    if (lockAspect && decoded && decoded.height > 0) {
      const ratio = decoded.width / decoded.height;
      setWidthPx(Math.max(1, Math.round(nextH * ratio)));
    }
  };

  const handleResize = async () => {
    if (!decoded || !file || status === 'processing') return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('processing');
    setStatusMsg('Resizing image in browser...');

    try {
      const res = await resizeImageProcess(
        decoded,
        {
          mode,
          widthPx,
          heightPx,
          percentage,
          targetKb,
          exportFormat,
          quality: qualityPercent / 100,
          backgroundColor: bgColor,
        },
        controller.signal
      );

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const nextUrl = URL.createObjectURL(res.blob);
      setPreviewUrl(nextUrl);
      setResult(res);
      setStatus('success');

      const formatLabel = res.actualMimeType.replace('image/', '').toUpperCase();
      if (mode === 'targetKb' && !res.targetAchieved) {
        setStatusMsg(
          `Smallest result produced is ${formatBytes(res.blob.size)} (${res.width} × ${res.height} px, ${formatLabel}). If using PNG, switch to JPEG or WebP to reach smaller KB limits.`
        );
      } else {
        setStatusMsg(
          `Resized to ${res.width} × ${res.height} px · ${formatBytes(res.blob.size)} (${formatLabel} format).`
        );
      }
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Resize failed.');
    }
  };

  const handleDownload = () => {
    if (!result || !previewUrl || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `${baseName}-${result.width}x${result.height}.${result.extension}`;
    a.click();
  };

  const handleReset = () => {
    abortRef.current?.abort();
    if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setDecoded(null);
    setResult(null);
    setPreviewUrl('');
    setStatus('idle');
    setStatusMsg('');
  };

  return (
    <div className="space-y-6">
      {!decoded ? (
        <FileDropzone
          accept="image/jpeg,image/png,image/webp"
          label="Select or Drop an Image to Resize"
          sublabel="Resize by pixel width & height, percentage, or target KB size"
          limitsText="Supports JPEG, PNG, WebP · Max 25 MB · Output up to 8000 × 8000 px"
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <div className="space-y-5">
          {/* Resize Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('dimensions')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'dimensions'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              By Width &amp; Height (px)
            </button>
            <button
              type="button"
              onClick={() => setMode('percentage')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'percentage'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              By Percentage (%)
            </button>
            <button
              type="button"
              onClick={() => setMode('targetKb')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'targetKb'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Reduce to Target KB Size
            </button>
          </div>

          {/* Mode Controls */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
            {mode === 'dimensions' && (
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label
                    htmlFor="resize-w-input"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Width (px)
                  </label>
                  <input
                    id="resize-w-input"
                    type="number"
                    min={1}
                    max={8000}
                    value={widthPx}
                    onChange={(e) => handleWidthChange(Number(e.target.value) || 1)}
                    className="w-32 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setLockAspect((prev) => !prev)}
                  aria-pressed={lockAspect}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    lockAspect
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {lockAspect ? (
                    <>
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Aspect Ratio Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Aspect Unlocked</span>
                    </>
                  )}
                </button>

                <div>
                  <label
                    htmlFor="resize-h-input"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Height (px)
                  </label>
                  <input
                    id="resize-h-input"
                    type="number"
                    min={1}
                    max={8000}
                    value={heightPx}
                    onChange={(e) => handleHeightChange(Number(e.target.value) || 1)}
                    className="w-32 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            {mode === 'percentage' && (
              <div className="space-y-2">
                <label
                  htmlFor="resize-pct-slider"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Scale Percentage:{' '}
                  <span className="font-mono tabular-nums">{percentage}%</span> (
                  {Math.max(1, Math.round((decoded.width * percentage) / 100))} ×{' '}
                  {Math.max(1, Math.round((decoded.height * percentage) / 100))} px)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[25, 50, 75, 100, 150].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPercentage(pct)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                        percentage === pct
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    id="resize-pct-slider"
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-48 accent-indigo-600 cursor-pointer ml-2"
                  />
                </div>
              </div>
            )}

            {mode === 'targetKb' && (
              <div className="space-y-2">
                <label
                  htmlFor="resize-target-kb"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Target Maximum File Size (KB)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[20, 50, 100, 200].map((kb) => (
                    <button
                      key={kb}
                      type="button"
                      onClick={() => setTargetKb(kb)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                        targetKb === kb
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {kb} KB
                    </button>
                  ))}
                  <input
                    id="resize-target-kb"
                    type="number"
                    min={5}
                    max={5000}
                    value={targetKb}
                    onChange={(e) => setTargetKb(Number(e.target.value) || 50)}
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            {/* Export Format & Quality */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="resize-format-select"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Export Format
                </label>
                <select
                  id="resize-format-select"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportMimeType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/png">PNG (.png)</option>
                  <option value="image/webp">WebP (.webp)</option>
                </select>
              </div>

              {exportFormat !== 'image/png' && mode !== 'targetKb' ? (
                <div>
                  <label
                    htmlFor="resize-q-slider"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Encoding Quality: <span className="font-mono">{qualityPercent}%</span>
                  </label>
                  <input
                    id="resize-q-slider"
                    type="range"
                    min={20}
                    max={98}
                    step={2}
                    value={qualityPercent}
                    onChange={(e) => setQualityPercent(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                  {exportFormat === 'image/png'
                    ? 'Note: PNG is lossless and does not respond to a lossy quality slider like JPEG. Meeting a small KB limit requires smaller dimensions or switching to JPEG/WebP.'
                    : 'Quality and dimensions will adjust automatically to approach your target KB size.'}
                </div>
              )}

              {exportFormat === 'image/jpeg' && (
                <div>
                  <label
                    htmlFor="resize-bg-picker"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Transparency Fill (JPEG)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="resize-bg-picker"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {bgColor}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Remember:</strong> Pixel dimensions (width × height) and storage file size (KB) are different. Reducing pixel dimensions lowers both screen size and KB size.
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleResize}
                disabled={status === 'processing'}
                className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {status === 'processing' ? 'Resizing...' : 'Resize Image'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Start Over</span>
              </button>
            </div>
          </div>

          {/* Before & After Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Before (Original)</span>
                <span className="font-mono tabular-nums">
                  {decoded.width} × {decoded.height} px · {file ? formatBytes(file.size) : ''}
                </span>
              </div>
              <div className="h-52 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={decoded.objectUrl}
                  alt="Original image before resize"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span>After (Resized Output)</span>
                  {result && (
                    <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      {result.width} × {result.height} px · {formatBytes(result.blob.size)}
                    </span>
                  )}
                </div>
                <div className="h-52 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2">
                  {previewUrl && result ? (
                    <img
                      src={previewUrl}
                      alt="Resized image preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      Click &ldquo;Resize Image&rdquo; to preview output
                    </span>
                  )}
                </div>
              </div>

              {result && (
                <div className="mt-3 space-y-2">
                  {result.formatFallbackNote && (
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {result.formatFallbackNote}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      Actual Format: {result.actualMimeType}
                    </span>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        Download .{result.extension.toUpperCase()} ({formatBytes(result.blob.size)})
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ProcessingStatus status={status} message={statusMsg} />
    </div>
  );
};
