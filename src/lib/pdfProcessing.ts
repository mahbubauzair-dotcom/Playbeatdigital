import { canvasToBlob, decodeImageFile, formatBytes } from './imageProcessing';

export const MAX_PDF_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_MERGE_FILES = 25;
export const MAX_MERGE_TOTAL_PAGES = 300;
export const MAX_COMPRESS_PDF_PAGES = 50;
export const MAX_CANVAS_PIXELS = 4_500_000; // Bounded memory per rendered page

export interface PdfInspectionResult {
  pageCount: number;
}

let pdfjsConfigured = false;

async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjsConfigured && typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    pdfjsConfigured = true;
  }
  return pdfjs;
}

export async function inspectPdfFile(file: File): Promise<PdfInspectionResult> {
  if (file.size === 0) {
    throw new Error(`"${file.name}" is empty (0 bytes).`);
  }
  if (file.size > MAX_PDF_FILE_BYTES) {
    throw new Error(
      `"${file.name}" (${formatBytes(file.size)}) exceeds the 50 MB file size limit.`
    );
  }

  const { PDFDocument } = await import('pdf-lib');
  const buffer = await file.arrayBuffer();

  // Check PDF magic header %PDF-
  const headerBytes = new Uint8Array(buffer.slice(0, 8));
  const headerStr = String.fromCharCode(...headerBytes);
  if (!headerStr.includes('%PDF-')) {
    throw new Error(`"${file.name}" is not a valid PDF document.`);
  }

  try {
    const doc = await PDFDocument.load(buffer, { updateMetadata: false });
    const pageCount = doc.getPageCount();
    if (pageCount <= 0) {
      throw new Error(`"${file.name}" contains 0 pages.`);
    }
    return { pageCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (/encrypted|password/i.test(message)) {
      throw new Error(
        `"${file.name}" is password-protected or encrypted. Please unlock the PDF before processing.`
      );
    }
    throw new Error(
      `"${file.name}" could not be read. The file may be corrupted or use an unsupported PDF structure.`
    );
  }
}

export async function mergePdfFiles(
  files: File[],
  onProgress?: (current: number, total: number, statusText: string) => void,
  signal?: AbortSignal
): Promise<{ blob: Blob; totalPages: number }> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }
  if (files.length > MAX_MERGE_FILES) {
    throw new Error(`You can merge up to ${MAX_MERGE_FILES} PDF files at once.`);
  }

  const { PDFDocument } = await import('pdf-lib');
  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;

  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Merge cancelled.');
    }

    const file = files[i];
    onProgress?.(i + 1, files.length, `Merging "${file.name}" (${i + 1} of ${files.length})...`);

    const buffer = await file.arrayBuffer();
    let sourceDoc;
    try {
      sourceDoc = await PDFDocument.load(buffer, { updateMetadata: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/encrypted|password/i.test(msg)) {
        throw new Error(`"${file.name}" is encrypted or password-protected and cannot be merged.`);
      }
      throw new Error(`"${file.name}" is corrupted or unsupported.`);
    }

    const count = sourceDoc.getPageCount();
    totalPages += count;
    if (totalPages > MAX_MERGE_TOTAL_PAGES) {
      throw new Error(
        `Total page count exceeds the ${MAX_MERGE_TOTAL_PAGES}-page browser memory limit.`
      );
    }

    const pageIndices = Array.from({ length: count }, (_, idx) => idx);
    const copiedPages = await mergedPdf.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  if (signal?.aborted) {
    throw new Error('Merge cancelled.');
  }

  const mergedBytes = await mergedPdf.save();
  return {
    blob: new Blob([new Uint8Array(mergedBytes)], { type: 'application/pdf' }),
    totalPages,
  };
}

export interface CompressPdfResult {
  blob: Blob;
  originalBytes: number;
  outputBytes: number;
  pageCount: number;
  targetAchieved: boolean;
  outputLargerThanOriginal: boolean;
  scaleUsed: number;
  qualityUsed: number;
}

interface RenderAttemptConfig {
  scale: number;
  quality: number;
}

const COMPRESS_CANDIDATES: RenderAttemptConfig[] = [
  { scale: 1.5, quality: 0.78 },
  { scale: 1.25, quality: 0.65 },
  { scale: 1.0, quality: 0.52 },
  { scale: 0.85, quality: 0.42 },
  { scale: 0.72, quality: 0.34 },
];

export async function compressPdfToTarget(
  file: File,
  targetKb: number,
  onProgress?: (percent: number, statusText: string) => void,
  signal?: AbortSignal
): Promise<CompressPdfResult> {
  if (file.size === 0) {
    throw new Error('The selected PDF file is empty.');
  }
  if (file.size > MAX_PDF_FILE_BYTES) {
    throw new Error('PDF exceeds the 50 MB browser limit.');
  }

  const targetBytes = Math.max(10 * 1024, Math.round(targetKb * 1024));
  const pdfjs = await getPdfJs();
  const { PDFDocument } = await import('pdf-lib');

  const rawBuffer = await file.arrayBuffer();
  let loadingTask: ReturnType<typeof pdfjs.getDocument> | null = null;

  try {
    loadingTask = pdfjs.getDocument({
      data: new Uint8Array(rawBuffer),
    });

    const pdfDocProxy = await loadingTask.promise;
    const numPages = pdfDocProxy.numPages;

    if (numPages <= 0) {
      throw new Error('This PDF contains no pages.');
    }
    if (numPages > MAX_COMPRESS_PDF_PAGES) {
      throw new Error(
        `This PDF has ${numPages} pages. Browser-based image compression supports up to ${MAX_COMPRESS_PDF_PAGES} pages.`
      );
    }

    // Choose starting candidate index based on target bytes per page
    const bytesPerPageBudget = targetBytes / numPages;
    let startIdx = 0;
    if (bytesPerPageBudget < 25 * 1024) startIdx = 3;
    else if (bytesPerPageBudget < 45 * 1024) startIdx = 2;
    else if (bytesPerPageBudget < 90 * 1024) startIdx = 1;

    let bestBytes: Uint8Array | null = null;
    let bestConfig = COMPRESS_CANDIDATES[startIdx];

    // Bounded attempts (max 3 passes to keep processing fast and memory bounded)
    const maxPasses = Math.min(COMPRESS_CANDIDATES.length, startIdx + 3);

    for (let pass = startIdx; pass < maxPasses; pass++) {
      if (signal?.aborted) throw new Error('Compression cancelled.');

      const candidate = COMPRESS_CANDIDATES[pass];
      const outPdf = await PDFDocument.create();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        if (signal?.aborted) throw new Error('Compression cancelled.');

        const overallFraction =
          ((pass - startIdx) * numPages + (pageNum - 1)) /
          ((maxPasses - startIdx) * numPages);
        onProgress?.(
          Math.min(95, Math.round(overallFraction * 100)),
          `Processing page ${pageNum} of ${numPages} (pass ${pass - startIdx + 1})...`
        );

        const page = await pdfDocProxy.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });

        // Keep page proportions and cap maximum pixel area
        let effectiveScale = candidate.scale;
        const projectedPixels =
          baseViewport.width * effectiveScale * (baseViewport.height * effectiveScale);
        if (projectedPixels > MAX_CANVAS_PIXELS) {
          effectiveScale = Math.sqrt(
            MAX_CANVAS_PIXELS / (baseViewport.width * baseViewport.height)
          );
        }

        const renderViewport = page.getViewport({ scale: effectiveScale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(renderViewport.width));
        canvas.height = Math.max(1, Math.floor(renderViewport.height));

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not initialize canvas for PDF rendering.');
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        try {
          await page.render({
            canvasContext: ctx,
            canvas,
            viewport: renderViewport,
          }).promise;

          const pageJpegBlob = await canvasToBlob(canvas, 'image/jpeg', candidate.quality);
          const pageJpegBytes = new Uint8Array(await pageJpegBlob.arrayBuffer());
          const embeddedImg = await outPdf.embedJpg(pageJpegBytes);

          // Preserve original PDF page points dimensions and orientation
          const newPage = outPdf.addPage([baseViewport.width, baseViewport.height]);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: baseViewport.width,
            height: baseViewport.height,
          });
        } finally {
          canvas.width = 0;
          canvas.height = 0;
          page.cleanup();
        }
      }

      const outBytes = await outPdf.save();
      if (!bestBytes || outBytes.byteLength < bestBytes.byteLength) {
        bestBytes = outBytes;
        bestConfig = candidate;
      }

      if (outBytes.byteLength <= targetBytes) {
        break;
      }
    }

    await pdfDocProxy.cleanup();
    await loadingTask.destroy();

    if (!bestBytes) {
      throw new Error('Failed to generate compressed PDF.');
    }

    onProgress?.(100, 'Complete');

    return {
      blob: new Blob([new Uint8Array(bestBytes)], { type: 'application/pdf' }),
      originalBytes: file.size,
      outputBytes: bestBytes.byteLength,
      pageCount: numPages,
      targetAchieved: bestBytes.byteLength <= targetBytes,
      outputLargerThanOriginal: bestBytes.byteLength >= file.size,
      scaleUsed: bestConfig.scale,
      qualityUsed: bestConfig.quality,
    };
  } catch (err: unknown) {
    if (loadingTask) {
      try {
        await loadingTask.destroy();
      } catch {
        // ignore cleanup error
      }
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (/PasswordException|password|encrypted/i.test(msg)) {
      throw new Error(
        'This PDF is password-protected or encrypted. Please unlock it before compressing.'
      );
    }
    if (/InvalidPDFException/i.test(msg)) {
      throw new Error('This file is not a valid or readable PDF document.');
    }
    throw err instanceof Error ? err : new Error(msg);
  }
}

export type PdfPageSizeOption = 'A4' | 'Letter' | 'fit';
export type PdfOrientationOption = 'auto' | 'portrait' | 'landscape';
export type PdfMarginOption = 'none' | 'small' | 'normal';

export interface JpgToPdfOptions {
  pageSize: PdfPageSizeOption;
  orientation: PdfOrientationOption;
  margin: PdfMarginOption;
}

export async function convertImagesToPdf(
  files: File[],
  options: JpgToPdfOptions,
  onProgress?: (current: number, total: number, statusText: string) => void,
  signal?: AbortSignal
): Promise<{ blob: Blob; pageCount: number }> {
  if (files.length === 0) {
    throw new Error('Please upload at least one image.');
  }
  if (files.length > 40) {
    throw new Error('You can convert up to 40 images at once.');
  }

  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();

  const marginPt =
    options.margin === 'none' ? 0 : options.margin === 'small' ? 18 : 36;

  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Conversion cancelled.');
    }

    const file = files[i];
    onProgress?.(i + 1, files.length, `Adding "${file.name}" (${i + 1} of ${files.length})...`);

    const decoded = await decodeImageFile(file);
    const canvas = document.createElement('canvas');
    try {
      canvas.width = decoded.width;
      canvas.height = decoded.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable.');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(decoded.element, 0, 0, canvas.width, canvas.height);

      const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      const embeddedJpg = await pdfDoc.embedJpg(jpegBytes);

      const imgWidthPx = decoded.width;
      const imgHeightPx = decoded.height;
      // 96 DPI assumption: 1 px = 72 / 96 = 0.75 PDF points
      const imgWidthPt = imgWidthPx * 0.75;
      const imgHeightPt = imgHeightPx * 0.75;

      let pageW = 595.28; // A4 width pt
      let pageH = 841.89; // A4 height pt

      if (options.pageSize === 'fit') {
        pageW = imgWidthPt + marginPt * 2;
        pageH = imgHeightPt + marginPt * 2;
      } else {
        const baseW = options.pageSize === 'A4' ? 595.28 : 612;
        const baseH = options.pageSize === 'A4' ? 841.89 : 792;

        const useLandscape =
          options.orientation === 'landscape' ||
          (options.orientation === 'auto' && imgWidthPx > imgHeightPx);

        pageW = useLandscape ? baseH : baseW;
        pageH = useLandscape ? baseW : baseH;
      }

      const page = pdfDoc.addPage([pageW, pageH]);
      const availW = Math.max(10, pageW - marginPt * 2);
      const availH = Math.max(10, pageH - marginPt * 2);

      // Contain without stretching
      const scale =
        options.pageSize === 'fit'
          ? 1
          : Math.min(availW / imgWidthPt, availH / imgHeightPt);

      const drawW = imgWidthPt * scale;
      const drawH = imgHeightPt * scale;
      const drawX = (pageW - drawW) / 2;
      const drawY = (pageH - drawH) / 2;

      page.drawImage(embeddedJpg, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      });
    } finally {
      canvas.width = 0;
      canvas.height = 0;
      URL.revokeObjectURL(decoded.objectUrl);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return {
    blob: new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
    pageCount: files.length,
  };
}
