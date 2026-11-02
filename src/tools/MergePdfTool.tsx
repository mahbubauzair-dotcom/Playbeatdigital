import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
  FileText,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingStatus } from '../components/ProcessingStatus';
import { formatBytes } from '../lib/imageProcessing';
import { inspectPdfFile, mergePdfFiles } from '../lib/pdfProcessing';
import { triggerSuccessCelebration } from '../lib/celebration';

interface QueuedPdfItem {
  id: string;
  file: File;
  pageCount: number;
}

export const MergePdfTool: React.FC = () => {
  const [items, setItems] = useState<QueuedPdfItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number | undefined>(undefined);
  const [mergedUrl, setMergedUrl] = useState<string>('');
  const [mergedBytesCount, setMergedBytesCount] = useState<number>(0);
  const [mergedTotalPages, setMergedTotalPages] = useState<number>(0);

  const addMoreInputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    };
  }, [mergedUrl]);

  const handleAddFiles = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl);
      setMergedUrl('');
    }
    setStatus('processing');
    setStatusMsg('Inspecting PDF files and checking page counts...');
    setProgressPct(undefined);

    const validAdditions: QueuedPdfItem[] = [];
    const errors: string[] = [];

    for (const f of selectedFiles) {
      try {
        const info = await inspectPdfFile(f);
        validAdditions.push({
          id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: f,
          pageCount: info.pageCount,
        });
      } catch (err: unknown) {
        errors.push(err instanceof Error ? err.message : `Could not read "${f.name}".`);
      }
    }

    setItems((prev) => [...prev, ...validAdditions]);

    if (errors.length > 0) {
      setStatus('error');
      setStatusMsg(errors.join(' '));
    } else {
      setStatus('idle');
      setStatusMsg('');
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl);
      setMergedUrl('');
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl);
      setMergedUrl('');
    }
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(draggedIdx, 1);
      copy.splice(idx, 0, moved);
      return copy;
    });
    setDraggedIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleMerge = async () => {
    if (items.length < 2 || status === 'processing') return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl);
      setMergedUrl('');
    }

    setStatus('processing');
    setProgressPct(10);
    setStatusMsg('Merging PDF files in your browser...');

    try {
      const { blob, totalPages } = await mergePdfFiles(
        items.map((i) => i.file),
        (current, total, text) => {
          setProgressPct(Math.round((current / total) * 100));
          setStatusMsg(text);
        },
        controller.signal
      );

      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
      setMergedBytesCount(blob.size);
      setMergedTotalPages(totalPages);
      setStatus('success');
      setProgressPct(undefined);
      setStatusMsg(
        `Merged ${items.length} PDF files (${totalPages} total pages · ${formatBytes(blob.size)}). Ready to download.`
      );
    } catch (err: unknown) {
      setStatus('error');
      setProgressPct(undefined);
      setStatusMsg(err instanceof Error ? err.message : 'Failed to merge PDFs.');
    }
  };

  const handleDownload = () => {
    if (!mergedUrl) return;
    triggerSuccessCelebration();
    const a = document.createElement('a');
    a.href = mergedUrl;
    a.download = `playbeat-merged-${items.length}-files.pdf`;
    a.click();
  };

  const handleReset = () => {
    abortRef.current?.abort();
    if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    setMergedUrl('');
    setItems([]);
    setStatus('idle');
    setStatusMsg('');
    setProgressPct(undefined);
  };

  const totalQueuedPages = items.reduce((acc, i) => acc + i.pageCount, 0);
  const totalQueuedBytes = items.reduce((acc, i) => acc + i.file.size, 0);

  return (
    <div className="space-y-6">
      {/* Important Signature / Interactive Feature Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="font-semibold">Document Features Notice:</strong> Merging copies pages into a newly generated PDF file. Document features such as cryptographic digital signatures, document-level bookmarks, or interactive form scripts may not be preserved. Never merge a digitally signed PDF if the recipient validates cryptographic signature integrity.
        </div>
      </div>

      {items.length === 0 ? (
        <FileDropzone
          accept="application/pdf,.pdf"
          multiple
          label="Select or Drop Multiple PDF Files to Merge"
          sublabel="Choose 2 or more PDFs — Reorder easily before combining"
          limitsText="Up to 25 PDFs · Max 50 MB per file · Up to 300 total pages"
          onFilesSelected={handleAddFiles}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {items.length} {items.length === 1 ? 'File' : 'Files'} Selected ·{' '}
              <span className="font-mono tabular-nums">{totalQueuedPages} pages</span> ·{' '}
              <span className="font-mono tabular-nums">{formatBytes(totalQueuedBytes)}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={addMoreInputRef}
                type="file"
                accept="application/pdf,.pdf"
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
                onClick={() => addMoreInputRef.current?.click()}
                disabled={status === 'processing'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add More PDFs</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={status === 'processing'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset All</span>
              </button>
            </div>
          </div>

          {/* Reorderable File List */}
          <ul
            aria-label="PDF files to merge"
            className="space-y-2"
          >
            {items.map((item, idx) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60 transition-colors ${
                  draggedIdx === idx
                    ? 'border-indigo-500 opacity-75'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GripVertical
                    className="w-4 h-4 text-slate-400 cursor-grab shrink-0 hidden sm:block"
                    aria-hidden="true"
                  />
                  <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold inline-flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.file.name}
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {formatBytes(item.file.size)} · {item.pageCount}{' '}
                      {item.pageCount === 1 ? 'page' : 'pages'}
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

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleMerge}
              disabled={items.length < 2 || status === 'processing'}
              className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {status === 'processing'
                ? 'Merging PDFs...'
                : items.length < 2
                ? 'Add at least 2 PDFs to Merge'
                : `Merge ${items.length} PDFs (${totalQueuedPages} pages)`}
            </button>

            {mergedUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>
                  Download Merged PDF ({mergedTotalPages} pages · {formatBytes(mergedBytesCount)})
                </span>
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
