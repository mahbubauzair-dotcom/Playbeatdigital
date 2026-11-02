import React, { useEffect, useRef, useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingStatus } from '../components/ProcessingStatus';
import {
  CompressImageResult,
  DecodedImageInfo,
  compressImageToTarget,
  decodeImageFile,
  formatBytes,
} from '../lib/imageProcessing';
import { triggerSuccessCelebration } from '../lib/celebration';

const TARGET_PRESETS = [20, 50, 100, 200];

export const CompressImageTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [decoded, setDecoded] = useState<DecodedImageInfo | null>(null);
  const [presetKb, setPresetKb] = useState<number | 'custom'>(50);
  const [customKb, setCustomKb] = useState<number>(45);
  const [allowDimReduction, setAllowDimReduction] = useState(true);
  const [minQualityPercent, setMinQualityPercent] = useState(20);
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [result, setResult] = useState<CompressImageResult | null>(null);
  const [outputPreviewUrl, setOutputPreviewUrl] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const effectiveTargetKb = presetKb === 'custom' ? Math.max(5, customKb) : presetKb;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
      if (outputPreviewUrl) URL.revokeObjectURL(outputPreviewUrl);
    };
  }, [decoded, outputPreviewUrl]);

  const handleFilesSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
    if (outputPreviewUrl) URL.revokeObjectURL(outputPreviewUrl);
    setOutputPreviewUrl('');
    setResult(null);
    setStatus('processing');
    setStatusMsg('Decoding image in browser...');

    try {
      const info = await decodeImageFile(selected);
      setFile(selected);
      setDecoded(info);
      setStatus('idle');
      setStatusMsg('');
    } catch (err: unknown) {
      setFile(null);
      setDecoded(null);
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Failed to decode image.');
    }
  };

  const handleCompress = async () => {
    if (!decoded || !file || status === 'processing') return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('processing');
    setStatusMsg(`Compressing photo toward ${effectiveTargetKb} KB...`);

    try {
      const res = await compressImageToTarget(
        decoded,
        {
          targetKb: effectiveTargetKb,
          allowDimensionReduction: allowDimReduction,
          backgroundColor: bgColor,
          minQuality: Math.max(0.1, Math.min(0.9, minQualityPercent / 100)),
        },
        controller.signal
      );

      if (outputPreviewUrl) URL.revokeObjectURL(outputPreviewUrl);
      const nextUrl = URL.createObjectURL(res.blob);
      setOutputPreviewUrl(nextUrl);
      setResult(res);
      setStatus('success');
      if (res.targetAchieved) {
        setStatusMsg(
          `Success! Compressed to ${formatBytes(res.blob.size)} (at or below ${effectiveTargetKb} KB target).`
        );
      } else {
        setStatusMsg(
          `Target of ${effectiveTargetKb} KB could not be met within your minimum quality/dimension settings. Smallest result produced: ${formatBytes(res.blob.size)}. Enable dimension reduction or lower minimum quality if a smaller file is required.`
        );
      }
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Compression failed.');
    }
  };

  const handleDownload = () => {
    if (!result || !outputPreviewUrl || !file) return;
    triggerSuccessCelebration();
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = outputPreviewUrl;
    a.download = `${baseName}-${Math.round(result.blob.size / 1024)}kb.jpg`;
    a.click();
  };

  const handleReset = () => {
    abortRef.current?.abort();
    if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
    if (outputPreviewUrl) URL.revokeObjectURL(outputPreviewUrl);
    setFile(null);
    setDecoded(null);
    setResult(null);
    setOutputPreviewUrl('');
    setStatus('idle');
    setStatusMsg('');
  };

  return (
    <div className="space-y-6">
      {!decoded ? (
        <FileDropzone
          accept="image/jpeg,image/png,image/webp"
          label="Select or Drop an Image to Compress"
          sublabel="Supports JPEG, PNG, and WebP — Exports optimized JPEG (.jpg)"
          limitsText="Max 25 MB · Up to 8000 × 8000 px · Processed locally in browser"
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <div className="space-y-5">
          {/* Controls Panel */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Target Maximum File Size
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {TARGET_PRESETS.map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => setPresetKb(kb)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono tabular-nums transition-colors cursor-pointer ${
                      presetKb === kb
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    {kb} KB
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
                      min={5}
                      max={5000}
                      value={customKb}
                      onChange={(e) => setCustomKb(Number(e.target.value) || 50)}
                      aria-label="Custom target size in KB"
                      className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      KB
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDimReduction}
                    onChange={(e) => setAllowDimReduction(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>Allow proportional dimension reduction if needed</span>
                </label>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Recommended for small targets (20KB or 50KB) when high-megapixel photos cannot fit by quality reduction alone.
                </p>
              </div>

              <div>
                <label
                  htmlFor="min-quality-slider"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Minimum Quality Floor: <span className="font-mono">{minQualityPercent}%</span>
                </label>
                <input
                  id="min-quality-slider"
                  type="range"
                  min={10}
                  max={85}
                  step={5}
                  value={minQualityPercent}
                  onChange={(e) => setMinQualityPercent(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Transparency Notice & Fill Color */}
            {(decoded.hasTransparency || decoded.mimeType !== 'image/jpeg') && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>Transparency Notice:</strong> Output is JPEG, which does not support transparent pixels. Any transparent regions will be filled with your chosen background color.
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="compress-bg-color"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Fill Color:
                  </label>
                  <input
                    id="compress-bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCompress}
                disabled={status === 'processing'}
                className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {status === 'processing' ? 'Compressing...' : `Compress to ≤ ${effectiveTargetKb} KB`}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Choose Another Photo</span>
              </button>
            </div>
          </div>

          {/* Before & After Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Original Image</span>
                  <span className="font-mono tabular-nums">
                    {file ? formatBytes(file.size) : ''} · {decoded.width} × {decoded.height} px
                  </span>
                </div>
                <div className="h-56 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={decoded.objectUrl}
                    alt="Original uploaded preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                {file?.name}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Compressed JPEG Output</span>
                  {result && (
                    <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      {formatBytes(result.blob.size)} · {result.width} × {result.height} px
                    </span>
                  )}
                </div>
                <div className="h-56 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden p-2">
                  {outputPreviewUrl && result ? (
                    <img
                      src={outputPreviewUrl}
                      alt="Compressed output preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      Click &ldquo;Compress&rdquo; above to generate output preview
                    </span>
                  )}
                </div>
              </div>

              {result && file && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    Quality: {Math.round(result.qualityUsed * 100)}% · Change:{' '}
                    {Math.round(((result.blob.size - file.size) / file.size) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Download JPEG ({formatBytes(result.blob.size)})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ProcessingStatus
        status={status}
        message={statusMsg}
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
