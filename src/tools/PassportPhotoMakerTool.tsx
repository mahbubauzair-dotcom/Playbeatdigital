import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Move, Printer, RotateCcw } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingStatus } from '../components/ProcessingStatus';
import {
  DecodedImageInfo,
  PASSPORT_PRESETS,
  PrintSheetSize,
  decodeImageFile,
  drawPassportCropOnCanvas,
  formatBytes,
  generatePassportSheetPdf,
  generatePassportSingleJpeg,
  getPassportOutputPixels,
} from '../lib/imageProcessing';
import { triggerSuccessCelebration } from '../lib/celebration';

export const PassportPhotoMakerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [decoded, setDecoded] = useState<DecodedImageInfo | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>('35x45mm');
  const [customUnit, setCustomUnit] = useState<'mm' | 'in'>('mm');
  const [customWidth, setCustomWidth] = useState<number>(35);
  const [customHeight, setCustomHeight] = useState<number>(45);

  const [zoom, setZoom] = useState<number>(1.1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [sheetSize, setSheetSize] = useState<PrintSheetSize>('4x6');
  const [cutGuides, setCutGuides] = useState<boolean>(true);

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; startOffsetX: number; startOffsetY: number } | null>(null);

  const activeSpec = useMemo(() => {
    if (selectedPresetId === 'custom') {
      const w = Math.max(10, Math.min(customUnit === 'mm' ? 150 : 6, customWidth));
      const h = Math.max(10, Math.min(customUnit === 'mm' ? 200 : 8, customHeight));
      return {
        label: `Custom (${w} × ${h} ${customUnit})`,
        unit: customUnit,
        width: w,
        height: h,
      };
    }
    const found = PASSPORT_PRESETS.find((p) => p.id === selectedPresetId) ?? PASSPORT_PRESETS[0];
    return {
      label: found.label,
      unit: found.unit,
      width: found.width,
      height: found.height,
    };
  }, [selectedPresetId, customUnit, customWidth, customHeight]);

  const geometry = useMemo(
    () => getPassportOutputPixels(activeSpec.width, activeSpec.height, activeSpec.unit),
    [activeSpec]
  );

  useEffect(() => {
    return () => {
      if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
    };
  }, [decoded]);

  // Redraw live crop preview whenever parameters change
  useEffect(() => {
    if (!decoded || !previewCanvasRef.current) return;
    drawPassportCropOnCanvas(decoded.element, previewCanvasRef.current, {
      zoom,
      offsetX,
      offsetY,
      outputWidthPx: geometry.widthPx,
      outputHeightPx: geometry.heightPx,
      backgroundColor: bgColor,
    });
  }, [decoded, zoom, offsetX, offsetY, geometry, bgColor]);

  const handleFilesSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
    setStatus('processing');
    setStatusMsg('Decoding portrait photo...');

    try {
      const info = await decodeImageFile(selected);
      setFile(selected);
      setDecoded(info);
      setZoom(1.05);
      setOffsetX(0);
      setOffsetY(0);
      setStatus('idle');
      setStatusMsg('');
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Failed to load photo.');
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextX = Math.max(-1, Math.min(1, dragStartRef.current.startOffsetX + dx / 120));
    const nextY = Math.max(-1, Math.min(1, dragStartRef.current.startOffsetY + dy / 120));
    setOffsetX(Number(nextX.toFixed(3)));
    setOffsetY(Number(nextY.toFixed(3)));
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
  };

  const handleDownloadSingleJpeg = async () => {
    if (!decoded || status === 'processing') return;
    setStatus('processing');
    setStatusMsg('Generating 300 DPI single passport JPEG...');
    try {
      const blob = await generatePassportSingleJpeg(decoded.element, {
        zoom,
        offsetX,
        offsetY,
        outputWidthPx: geometry.widthPx,
        outputHeightPx: geometry.heightPx,
        backgroundColor: bgColor,
      });
      const url = URL.createObjectURL(blob);
      triggerSuccessCelebration();
      const a = document.createElement('a');
      a.href = url;
      a.download = `passport-photo-${geometry.widthPx}x${geometry.heightPx}px-300dpi.jpg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('success');
      setStatusMsg(
        `Downloaded single 300 DPI JPEG (${geometry.widthPx} × ${geometry.heightPx} px · ${formatBytes(blob.size)}).`
      );
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Could not export JPEG.');
    }
  };

  const handleDownloadPrintSheet = async () => {
    if (!decoded || status === 'processing') return;
    setStatus('processing');
    setStatusMsg(`Building printable ${sheetSize} PDF sheet at exact physical dimensions...`);
    try {
      const singleBlob = await generatePassportSingleJpeg(decoded.element, {
        zoom,
        offsetX,
        offsetY,
        outputWidthPx: geometry.widthPx,
        outputHeightPx: geometry.heightPx,
        backgroundColor: bgColor,
      });

      const { pdfBlob, copiesCount } = await generatePassportSheetPdf(
        singleBlob,
        geometry.widthPt,
        geometry.heightPt,
        sheetSize,
        cutGuides
      );

      triggerSuccessCelebration();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passport-sheet-${sheetSize}-${activeSpec.width}x${activeSpec.height}${activeSpec.unit}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setStatus('success');
      setStatusMsg(
        `Generated printable ${sheetSize} PDF sheet with ${copiesCount} photos (${formatBytes(pdfBlob.size)}). Remember: Print at Actual size / 100%. Disable Fit to page.`
      );
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Could not generate PDF sheet.');
    }
  };

  const handleReset = () => {
    if (decoded?.objectUrl) URL.revokeObjectURL(decoded.objectUrl);
    setFile(null);
    setDecoded(null);
    setStatus('idle');
    setStatusMsg('');
  };

  return (
    <div className="space-y-6">
      {!decoded ? (
        <FileDropzone
          accept="image/jpeg,image/png,image/webp"
          label="Upload Portrait Photo for Passport Crop"
          sublabel="Supports JPEG, PNG, and WebP — 300 DPI output & printable PDF sheets"
          limitsText="Max 25 MB · Processed locally in your browser"
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Preset & Crop Controls */}
          <div className="lg:col-span-7 space-y-4 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                1. Choose Physical Photo Size (300 DPI)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PASSPORT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-2.5 rounded-lg text-left border transition-colors cursor-pointer ${
                      selectedPresetId === preset.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{preset.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 line-clamp-1 ${
                        selectedPresetId === preset.id
                          ? 'text-indigo-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {preset.description}
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedPresetId('custom')}
                  className={`p-2.5 rounded-lg text-left border transition-colors cursor-pointer ${
                    selectedPresetId === 'custom'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                  }`}
                >
                  <div className="text-xs font-bold">Custom Size</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      selectedPresetId === 'custom'
                        ? 'text-indigo-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Enter mm or inches
                  </div>
                </button>
              </div>

              {selectedPresetId === 'custom' && (
                <div className="mt-3 flex flex-wrap items-end gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Unit
                    </label>
                    <select
                      value={customUnit}
                      onChange={(e) => {
                        const u = e.target.value as 'mm' | 'in';
                        setCustomUnit(u);
                        if (u === 'in') {
                          setCustomWidth(2);
                          setCustomHeight(2);
                        } else {
                          setCustomWidth(35);
                          setCustomHeight(45);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <option value="mm">Millimeters (mm)</option>
                      <option value="in">Inches (in)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Width ({customUnit})
                    </label>
                    <input
                      type="number"
                      step={customUnit === 'in' ? 0.1 : 1}
                      min={customUnit === 'in' ? 1 : 15}
                      max={customUnit === 'in' ? 6 : 150}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value) || 35)}
                      className="w-24 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Height ({customUnit})
                    </label>
                    <input
                      type="number"
                      step={customUnit === 'in' ? 0.1 : 1}
                      min={customUnit === 'in' ? 1 : 15}
                      max={customUnit === 'in' ? 8 : 200}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value) || 45)}
                      className="w-24 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Zoom & Position Sliders */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                2. Adjust Zoom &amp; Position (Drag preview or use sliders)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="passport-zoom"
                    className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                  >
                    Zoom: <span className="font-mono">{Math.round(zoom * 100)}%</span>
                  </label>
                  <input
                    id="passport-zoom"
                    type="range"
                    min={1}
                    max={2.6}
                    step={0.02}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label
                    htmlFor="passport-pan-x"
                    className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                  >
                    Horizontal Pan: <span className="font-mono">{Math.round(offsetX * 100)}%</span>
                  </label>
                  <input
                    id="passport-pan-x"
                    type="range"
                    min={-1}
                    max={1}
                    step={0.02}
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label
                    htmlFor="passport-pan-y"
                    className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                  >
                    Vertical Pan: <span className="font-mono">{Math.round(offsetY * 100)}%</span>
                  </label>
                  <input
                    id="passport-pan-y"
                    type="range"
                    min={-1}
                    max={1}
                    step={0.02}
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Transparent Region Fill Notice */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="passport-bg-color"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Transparent Region Fill Color:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="passport-bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    {bgColor}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Important:</strong> Automatic background removal is not included. Canvas background fill only colors transparent regions (such as in a pre-cut transparent PNG) and does not replace an existing wall or background in a standard photograph.
              </p>
            </div>

            {/* Printable Sheet Options */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                3. Printable Multi-Photo PDF Sheet Settings
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="sheet-size-select"
                    className="text-xs text-slate-600 dark:text-slate-300"
                  >
                    Paper Size:
                  </label>
                  <select
                    id="sheet-size-select"
                    value={sheetSize}
                    onChange={(e) => setSheetSize(e.target.value as PrintSheetSize)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100"
                  >
                    <option value="4x6">4 × 6 inch Photo Sheet</option>
                    <option value="A4">A4 Page (210 × 297 mm)</option>
                  </select>
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cutGuides}
                    onChange={(e) => setCutGuides(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Include light gray cut guides</span>
                </label>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200 font-medium">
                When printing PDF sheets: <strong>Print at Actual size / 100%. Disable Fit to page.</strong> Always check the current photo requirements of your receiving organization, embassy, or exam board.
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Crop Frame & Download Actions */}
          <div className="lg:col-span-5 flex flex-col items-center p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Live 300 DPI Crop Preview ({activeSpec.label})
              </div>
              <div className="text-xs font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-0.5">
                Output Resolution: {geometry.widthPx} × {geometry.heightPx} px (300 DPI)
              </div>
            </div>

            <div className="relative p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs">
              <canvas
                ref={previewCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  aspectRatio: `${geometry.widthPx} / ${geometry.heightPx}`,
                  maxHeight: '260px',
                  width: 'auto',
                }}
                className="block mx-auto rounded border border-slate-300 dark:border-slate-700 cursor-move touch-none"
              />
              <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Move className="w-3 h-3" aria-hidden="true" />
                <span>Drag inside frame to pan portrait</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadSingleJpeg}
                disabled={status === 'processing'}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>
                  Download Single JPEG ({geometry.widthPx} × {geometry.heightPx} px)
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPrintSheet}
                disabled={status === 'processing'}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Generate Printable {sheetSize} PDF Sheet</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Upload Different Photo ({file?.name})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ProcessingStatus status={status} message={statusMsg} />
    </div>
  );
};
