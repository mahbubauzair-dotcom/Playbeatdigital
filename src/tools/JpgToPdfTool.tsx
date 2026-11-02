import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingStatus } from '../components/ProcessingStatus';
import { decodeImageFile, formatBytes } from '../lib/imageProcessing';
import {
  PdfMarginOption,
  PdfOrientationOption,
  PdfPageSizeOption,
  convertImagesToPdf,
} from '../lib/pdfProcessing';

interface QueuedImageItem {
  id: string;
  file: File;
  thumbUrl: string;
  width: number;
  height: number;
}

export const JpgToPdfTool: React.FC = () => {
  const [items, setItems] = useState<QueuedImageItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const [pageSize, setPageSize] = useState<PdfPageSizeOption>('A4');
  const [orientation, setOrientation] = useState<PdfOrientationOption>('auto');
  const [margin, setMargin] = useState<PdfMarginOption>('small');

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number | undefined>(undefined);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfBytesCount, setPdfBytesCount] = useState<number>(0);

  const addMoreRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.thumbUrl));
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);

  const handleAddFiles = async (selected: File[]) => {
    if (selected.length === 0) return;

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
    setStatus('processing');
    setStatusMsg('Validating image files...');

    const added: QueuedImageItem[] = [];
    const errors: string[] = [];

    for (const f of selected) {
      try {
        const info = await decodeImageFile(f);
        added.push({
          id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: f,
          thumbUrl: info.objectUrl,
          width: info.width,
          height: info.height,
        });
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err.message : `Could not decode "${f.name}".`);
      }
    }

    setItems((prev) => [...prev, ...added]);

    if (errors.length > 0) {
      setStatus('error');
      setStatusMsg(errors.join(' '));
    } else {
      setStatus('idle');
      setStatusMsg('');
    }
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(target, 0, moved);
      return copy;
    });
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.thumbUrl);
      return prev.filter((i) => i.id !== id);
    });
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
  };

  const handleConvert = async () => {
    if (items.length === 0 || status === 'processing') return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }

    setStatus('processing');
    setProgressPct(10);
    setStatusMsg('Converting images to PDF...');

    try {
      const { blob, pageCount } = await convertImagesToPdf(
        items.map((i) => i.file),
        { pageSize, orientation, margin },
        (cur, tot, text) => {
          setProgressPct(Math.round((cur / tot) * 100));
          setStatusMsg(text);
        },
        controller.signal
      );

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBytesCount(blob.size);
      setStatus('success');
      setProgressPct(undefined);
      setStatusMsg(
        `Created ${pageCount}-page PDF (${formatBytes(blob.size)}). One image per page without stretching.`
      );
    } catch (err: unknown) {
      setStatus('error');
      setProgressPct(undefined);
      setStatusMsg(err instanceof Error ? err.message : 'Failed to create PDF.');
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `playbeat-images-to-pdf-${items.length}pages.pdf`;
    a.click();
  };

  const handleReset = () => {
    abortRef.current?.abort();
    items.forEach((i) => URL.revokeObjectURL(i.thumbUrl));
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl('');
    setItems([]);
    setStatus('idle');
    setStatusMsg('');
    setProgressPct(undefined);
  };

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <FileDropzone
          accept="image/jpeg,image/png,image/webp"
          multiple
          label="Select or Drop Images to Convert to PDF"
          sublabel="Accepts JPEG, PNG, and WebP — Places one image per page without stretching"
          limitsText="Up to 40 images · Max 20 MB per image · Processed locally in browser"
          onFilesSelected={handleAddFiles}
        />
      ) : (
        <div className="space-y-5">
          {/* Page Setup Controls */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="jpgpdf-pagesize"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Page Size
                </label>
                <select
                  id="jpgpdf-pagesize"
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PdfPageSizeOption)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">US Letter (8.5 × 11 in)</option>
                  <option value="fit">Fit to Image Dimensions</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="jpgpdf-orientation"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Page Orientation
                </label>
                <select
                  id="jpgpdf-orientation"
                  value={orientation}
                  disabled={pageSize === 'fit'}
                  onChange={(e) => setOrientation(e.target.value as PdfOrientationOption)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 disabled:opacity-50"
                >
                  <option value="auto">Automatic (Match Image Shape)</option>
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="landscape">Landscape (Horizontal)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="jpgpdf-margin"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Page Margin
                </label>
                <select
                  id="jpgpdf-margin"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as PdfMarginOption)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100"
                >
                  <option value="none">No Margin (0 in)</option>
                  <option value="small">Small Margin (0.25 in / 18 pt)</option>
                  <option value="normal">Normal Margin (0.5 in / 36 pt)</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Sizing Note:</strong> On A4 and Letter pages, images are centered and scaled proportionally (&ldquo;contain&rdquo;) so they never stretch. In &ldquo;Fit to Image&rdquo; mode, physical PDF page size is calculated from pixel dimensions using a standard 96 DPI screen assumption (1 pixel = 0.75 PDF points).
            </p>
          </div>

          {/* Image List Header & Add More */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {items.length} {items.length === 1 ? 'Image' : 'Images'} (1 per PDF page)
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={addMoreRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleAddFiles(Array.from(e.target.files));
                  }
                  e.target.value = '';
                }}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => addMoreRef.current?.click()}
                disabled={status === 'processing'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add More Images</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={status === 'processing'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Reorderable Image List */}
          <ul aria-label="Images to convert to PDF" className="space-y-2">
            {items.map((item, idx) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDraggedIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedIdx === null || draggedIdx === idx) return;
                  setItems((prev) => {
                    const copy = [...prev];
                    const [moved] = copy.splice(draggedIdx, 1);
                    copy.splice(idx, 0, moved);
                    return copy;
                  });
                  setDraggedIdx(idx);
                }}
                onDragEnd={() => setDraggedIdx(null)}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical className="w-4 h-4 text-slate-400 cursor-grab shrink-0 hidden sm:block" aria-hidden="true" />
                  <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold inline-flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <img
                    src={item.thumbUrl}
                    alt={item.file.name}
                    className="w-11 h-11 rounded object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.file.name}
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {item.width} × {item.height} px · {formatBytes(item.file.size)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, -1)}
                    disabled={idx === 0 || status === 'processing'}
                    aria-label={`Move ${item.file.name} up`}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 1)}
                    disabled={idx === items.length - 1 || status === 'processing'}
                    aria-label={`Move ${item.file.name} down`}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Down</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={status === 'processing'}
                    aria-label={`Remove ${item.file.name}`}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-red-50 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleConvert}
              disabled={status === 'processing'}
              className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {status === 'processing'
                ? 'Building PDF...'
                : `Convert ${items.length} ${items.length === 1 ? 'Image' : 'Images'} to PDF`}
            </button>

            {pdfUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Download PDF ({formatBytes(pdfBytesCount)})</span>
              </button>
            )}
          </div>
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
