export const MAX_IMAGE_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_IMAGE_DIMENSION = 8000; // 8000 x 8000 px max

export interface DecodedImageInfo {
  width: number;
  height: number;
  hasTransparency: boolean;
  mimeType: string;
  element: HTMLImageElement;
  objectUrl: string;
}

export interface PassportPreset {
  id: string;
  label: string;
  unit: 'mm' | 'in';
  width: number;
  height: number;
  description: string;
}

export const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: '35x45mm',
    label: '35 × 45 mm',
    unit: 'mm',
    width: 35,
    height: 45,
    description: 'Standard passport & application size (Pakistan, UK, EU, Asia)',
  },
  {
    id: '2x2in',
    label: '2 × 2 inches',
    unit: 'in',
    width: 2,
    height: 2,
    description: 'Square 51 × 51 mm photo (US Visa, OCI, select Indian portals)',
  },
  {
    id: '25x35mm',
    label: '25 × 35 mm',
    unit: 'mm',
    width: 25,
    height: 35,
    description: 'Small admit card, ID badge & stamp size',
  },
  {
    id: '40x60mm',
    label: '40 × 60 mm',
    unit: 'mm',
    width: 40,
    height: 60,
    description: 'Large institutional & certificate portrait size',
  },
];

export function mmToPixels300Dpi(mm: number): number {
  return Math.max(1, Math.round((mm / 25.4) * 300));
}

export function inchesToPixels300Dpi(inches: number): number {
  return Math.max(1, Math.round(inches * 300));
}

export function mmToPdfPoints(mm: number): number {
  return (mm / 25.4) * 72;
}

export function inchesToPdfPoints(inches: number): number {
  return inches * 72;
}

export function getPassportOutputPixels(
  width: number,
  height: number,
  unit: 'mm' | 'in'
): { widthPx: number; heightPx: number; widthPt: number; heightPt: number } {
  if (unit === 'mm') {
    return {
      widthPx: mmToPixels300Dpi(width),
      heightPx: mmToPixels300Dpi(height),
      widthPt: mmToPdfPoints(width),
      heightPt: mmToPdfPoints(height),
    };
  }
  return {
    widthPx: inchesToPixels300Dpi(width),
    heightPx: inchesToPixels300Dpi(height),
    widthPt: inchesToPdfPoints(width),
    heightPt: inchesToPdfPoints(height),
  };
}

export interface SheetPlacement {
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
}

export interface SheetLayoutCalculation {
  columns: number;
  rows: number;
  totalCount: number;
  placements: SheetPlacement[];
}

export function calculateSheetLayout(
  sheetWidthPt: number,
  sheetHeightPt: number,
  photoWidthPt: number,
  photoHeightPt: number,
  marginPt = 8,  // ~2.8 mm print border
  gapPt = 6      // ~2.1 mm trim gap between photos
): SheetLayoutCalculation {
  const usableWidth = Math.max(0, sheetWidthPt - marginPt * 2);
  const usableHeight = Math.max(0, sheetHeightPt - marginPt * 2);

  const columns = Math.max(0, Math.floor((usableWidth + gapPt) / (photoWidthPt + gapPt)));
  const rows = Math.max(0, Math.floor((usableHeight + gapPt) / (photoHeightPt + gapPt)));

  if (columns === 0 || rows === 0) {
    return { columns: 0, rows: 0, totalCount: 0, placements: [] };
  }

  const gridWidth = columns * photoWidthPt + (columns - 1) * gapPt;
  const gridHeight = rows * photoHeightPt + (rows - 1) * gapPt;

  const startX = (sheetWidthPt - gridWidth) / 2;
  // In PDF coordinates, Y=0 is bottom. Start from top row downward:
  const topY = sheetHeightPt - (sheetHeightPt - gridHeight) / 2;

  const placements: SheetPlacement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const xPt = startX + c * (photoWidthPt + gapPt);
      const yPt = topY - (r + 1) * photoHeightPt - r * gapPt;
      placements.push({
        xPt,
        yPt,
        widthPt: photoWidthPt,
        heightPt: photoHeightPt,
      });
    }
  }

  return {
    columns,
    rows,
    totalCount: placements.length,
    placements,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export async function decodeImageFile(file: File): Promise<DecodedImageInfo> {
  if (file.size === 0) {
    throw new Error('The selected file is empty (0 bytes).');
  }
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    throw new Error(
      `File size (${formatBytes(file.size)}) exceeds the 25 MB browser processing limit.`
    );
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(
          new Error(
            `"${file.name}" could not be decoded as a valid image. Please upload a valid JPEG, PNG, or WebP file.`
          )
        );
      el.src = objectUrl;
    });

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    if (width <= 0 || height <= 0) {
      throw new Error('Invalid image dimensions detected.');
    }
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      throw new Error(
        `Image dimensions (${width} × ${height} px) exceed the maximum limit of ${MAX_IMAGE_DIMENSION} × ${MAX_IMAGE_DIMENSION} px.`
      );
    }

    // Sample image on a small probe canvas to check for transparent pixels
    let hasTransparency = false;
    if (file.type !== 'image/jpeg') {
      const sampleW = Math.min(width, 128);
      const sampleH = Math.min(height, 128);
      const probeCanvas = document.createElement('canvas');
      probeCanvas.width = sampleW;
      probeCanvas.height = sampleH;
      const ctx = probeCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 250) {
            hasTransparency = true;
            break;
          }
        }
      }
      probeCanvas.width = 0;
      probeCanvas.height = 0;
    }

    return {
      width,
      height,
      hasTransparency,
      mimeType: file.type || 'image/jpeg',
      element: img,
      objectUrl,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode image in browser canvas.'));
        } else {
          resolve(blob);
        }
      },
      mimeType,
      quality
    );
  });
}

function renderToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
  backgroundColor: string | null
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context.');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export interface CompressImageOptions {
  targetKb: number;
  allowDimensionReduction: boolean;
  backgroundColor: string;
  minQuality?: number; // 0.15 default
}

export interface CompressImageResult {
  blob: Blob;
  width: number;
  height: number;
  qualityUsed: number;
  targetAchieved: boolean;
}

export async function compressImageToTarget(
  decoded: DecodedImageInfo,
  options: CompressImageOptions,
  signal?: AbortSignal
): Promise<CompressImageResult> {
  const targetBytes = Math.max(1024, Math.round(options.targetKb * 1024));
  const minQuality = options.minQuality ?? 0.15;
  const maxQuality = 0.94;
  const bg = options.backgroundColor || '#FFFFFF';

  let currentWidth = decoded.width;
  let currentHeight = decoded.height;
  let bestBlob: Blob | null = null;
  let bestWidth = currentWidth;
  let bestHeight = currentHeight;
  let bestQuality = maxQuality;

  const maxScaleSteps = options.allowDimensionReduction ? 8 : 1;

  for (let step = 0; step < maxScaleSteps; step++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled.');
    }

    const canvas = renderToCanvas(decoded.element, currentWidth, currentHeight, bg);
    try {
      // Check highest quality first
      const highBlob = await canvasToBlob(canvas, 'image/jpeg', maxQuality);
      if (highBlob.size <= targetBytes) {
        return {
          blob: highBlob,
          width: canvas.width,
          height: canvas.height,
          qualityUsed: maxQuality,
          targetAchieved: true,
        };
      }

      // Check lowest allowed quality at this dimension before binary searching
      const lowBlob = await canvasToBlob(canvas, 'image/jpeg', minQuality);
      if (!bestBlob || lowBlob.size < bestBlob.size) {
        bestBlob = lowBlob;
        bestWidth = canvas.width;
        bestHeight = canvas.height;
        bestQuality = minQuality;
      }

      if (lowBlob.size <= targetBytes) {
        // Binary search between minQuality and maxQuality (6 iterations)
        let lo = minQuality;
        let hi = maxQuality;
        let foundBlob = lowBlob;
        let foundQ = minQuality;

        for (let iter = 0; iter < 6; iter++) {
          if (signal?.aborted) throw new Error('Operation cancelled.');
          const mid = Number(((lo + hi) / 2).toFixed(3));
          const candidate = await canvasToBlob(canvas, 'image/jpeg', mid);
          if (candidate.size <= targetBytes) {
            foundBlob = candidate;
            foundQ = mid;
            lo = mid;
          } else {
            hi = mid;
          }
        }

        return {
          blob: foundBlob,
          width: canvas.width,
          height: canvas.height,
          qualityUsed: foundQ,
          targetAchieved: true,
        };
      }
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }

    // If we are allowed to reduce dimensions, scale down proportionally
    if (!options.allowDimensionReduction) break;
    const nextWidth = Math.round(currentWidth * 0.78);
    const nextHeight = Math.round(currentHeight * 0.78);
    if (nextWidth < 120 || nextHeight < 120) break;
    currentWidth = nextWidth;
    currentHeight = nextHeight;
  }

  if (!bestBlob) {
    throw new Error('Could not compress image.');
  }

  return {
    blob: bestBlob,
    width: bestWidth,
    height: bestHeight,
    qualityUsed: bestQuality,
    targetAchieved: bestBlob.size <= targetBytes,
  };
}

export type ResizeMode = 'dimensions' | 'percentage' | 'targetKb';
export type ExportMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ResizeImageOptions {
  mode: ResizeMode;
  widthPx: number;
  heightPx: number;
  percentage: number;
  targetKb: number;
  exportFormat: ExportMimeType;
  quality: number; // 0.1 to 1.0
  backgroundColor: string;
}

export interface ResizeImageResult {
  blob: Blob;
  actualMimeType: string;
  extension: string;
  width: number;
  height: number;
  targetAchieved: boolean;
  formatFallbackNote?: string;
}

export function getExtensionForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export async function resizeImageProcess(
  decoded: DecodedImageInfo,
  options: ResizeImageOptions,
  signal?: AbortSignal
): Promise<ResizeImageResult> {
  if (signal?.aborted) throw new Error('Operation cancelled.');

  const needsOpaqueBg = options.exportFormat === 'image/jpeg';
  const bg = needsOpaqueBg ? options.backgroundColor || '#FFFFFF' : null;

  if (options.mode === 'targetKb') {
    const targetBytes = Math.max(1024, Math.round(options.targetKb * 1024));
    let curW = decoded.width;
    let curH = decoded.height;
    let bestBlob: Blob | null = null;
    let bestW = curW;
    let bestH = curH;

    for (let step = 0; step < 9; step++) {
      if (signal?.aborted) throw new Error('Operation cancelled.');
      const canvas = renderToCanvas(
        decoded.element,
        curW,
        curH,
        options.exportFormat === 'image/jpeg' ? (options.backgroundColor || '#FFFFFF') : null
      );
      try {
        if (options.exportFormat === 'image/png') {
          const blob = await canvasToBlob(canvas, 'image/png');
          bestBlob = blob;
          bestW = canvas.width;
          bestH = canvas.height;
          if (blob.size <= targetBytes) {
            return {
              blob,
              actualMimeType: blob.type || 'image/png',
              extension: getExtensionForMime(blob.type || 'image/png'),
              width: bestW,
              height: bestH,
              targetAchieved: true,
            };
          }
        } else {
          // Binary search quality for JPEG or WebP
          let lo = 0.15;
          let hi = 0.92;
          const lowBlob = await canvasToBlob(canvas, options.exportFormat, lo);
          if (!bestBlob || lowBlob.size < bestBlob.size) {
            bestBlob = lowBlob;
            bestW = canvas.width;
            bestH = canvas.height;
          }
          if (lowBlob.size <= targetBytes) {
            let chosen = lowBlob;
            for (let i = 0; i < 6; i++) {
              const mid = (lo + hi) / 2;
              const cand = await canvasToBlob(canvas, options.exportFormat, mid);
              if (cand.size <= targetBytes) {
                chosen = cand;
                lo = mid;
              } else {
                hi = mid;
              }
            }
            const actualMime = chosen.type || options.exportFormat;
            return {
              blob: chosen,
              actualMimeType: actualMime,
              extension: getExtensionForMime(actualMime),
              width: canvas.width,
              height: canvas.height,
              targetAchieved: true,
              formatFallbackNote:
                actualMime !== options.exportFormat
                  ? `Your browser does not support encoding ${options.exportFormat}; exported as ${actualMime} instead.`
                  : undefined,
            };
          }
        }
      } finally {
        canvas.width = 0;
        canvas.height = 0;
      }

      const nextW = Math.round(curW * 0.78);
      const nextH = Math.round(curH * 0.78);
      if (nextW < 100 || nextH < 100) break;
      curW = nextW;
      curH = nextH;
    }

    if (!bestBlob) throw new Error('Failed to resize image.');
    const actualMime = bestBlob.type || options.exportFormat;
    return {
      blob: bestBlob,
      actualMimeType: actualMime,
      extension: getExtensionForMime(actualMime),
      width: bestW,
      height: bestH,
      targetAchieved: bestBlob.size <= targetBytes,
      formatFallbackNote:
        actualMime !== options.exportFormat
          ? `Your browser does not support encoding ${options.exportFormat}; exported as ${actualMime} instead.`
          : undefined,
    };
  }

  let targetW = decoded.width;
  let targetH = decoded.height;
  if (options.mode === 'percentage') {
    const scale = Math.max(1, Math.min(400, options.percentage)) / 100;
    targetW = Math.max(1, Math.round(decoded.width * scale));
    targetH = Math.max(1, Math.round(decoded.height * scale));
  } else {
    targetW = Math.max(1, Math.min(MAX_IMAGE_DIMENSION, Math.round(options.widthPx)));
    targetH = Math.max(1, Math.min(MAX_IMAGE_DIMENSION, Math.round(options.heightPx)));
  }

  const canvas = renderToCanvas(decoded.element, targetW, targetH, bg);
  try {
    const q = options.exportFormat === 'image/png' ? undefined : options.quality;
    const blob = await canvasToBlob(canvas, options.exportFormat, q);
    const actualMime = blob.type || options.exportFormat;
    return {
      blob,
      actualMimeType: actualMime,
      extension: getExtensionForMime(actualMime),
      width: canvas.width,
      height: canvas.height,
      targetAchieved: true,
      formatFallbackNote:
        actualMime !== options.exportFormat
          ? `Your browser does not support encoding ${options.exportFormat}; exported as ${actualMime} instead.`
          : undefined,
    };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export interface PassportCropParams {
  zoom: number;      // 1.0 to 3.0
  offsetX: number;   // -1.0 to 1.0 normalized pan
  offsetY: number;   // -1.0 to 1.0 normalized pan
  outputWidthPx: number;
  outputHeightPx: number;
  backgroundColor: string;
}

export function drawPassportCropOnCanvas(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  params: PassportCropParams
): void {
  const { outputWidthPx, outputHeightPx, zoom, offsetX, offsetY, backgroundColor } = params;
  canvas.width = outputWidthPx;
  canvas.height = outputHeightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = backgroundColor || '#FFFFFF';
  ctx.fillRect(0, 0, outputWidthPx, outputHeightPx);

  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  // Base cover scale so image fills crop frame at zoom = 1
  const coverScale = Math.max(outputWidthPx / imgW, outputHeightPx / imgH);
  const effectiveScale = coverScale * zoom;

  const drawW = imgW * effectiveScale;
  const drawH = imgH * effectiveScale;

  const maxShiftX = Math.max(0, (drawW - outputWidthPx) / 2);
  const maxShiftY = Math.max(0, (drawH - outputHeightPx) / 2);

  const centerX = outputWidthPx / 2 + offsetX * maxShiftX;
  const centerY = outputHeightPx / 2 + offsetY * maxShiftY;

  const drawX = centerX - drawW / 2;
  const drawY = centerY - drawH / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

export async function generatePassportSingleJpeg(
  img: HTMLImageElement,
  params: PassportCropParams
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  try {
    drawPassportCropOnCanvas(img, canvas, params);
    return await canvasToBlob(canvas, 'image/jpeg', 0.95);
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export type PrintSheetSize = '4x6' | 'A4';

export async function generatePassportSheetPdf(
  singlePhotoJpegBlob: Blob,
  photoWidthPt: number,
  photoHeightPt: number,
  sheetSize: PrintSheetSize,
  includeCutGuides: boolean
): Promise<{ pdfBlob: Blob; copiesCount: number }> {
  const { PDFDocument, rgb } = await import('pdf-lib');

  // 4x6 inches = 288 x 432 pt; A4 = 595.28 x 841.89 pt (210 x 297 mm)
  const sheetWidthPt = sheetSize === '4x6' ? inchesToPdfPoints(6) : mmToPdfPoints(210);
  const sheetHeightPt = sheetSize === '4x6' ? inchesToPdfPoints(4) : mmToPdfPoints(297);

  const layout = calculateSheetLayout(
    sheetWidthPt,
    sheetHeightPt,
    photoWidthPt,
    photoHeightPt,
    8,
    6
  );

  if (layout.totalCount === 0) {
    throw new Error('Selected photo dimensions are larger than the printable sheet area.');
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([sheetWidthPt, sheetHeightPt]);

  const photoBytes = new Uint8Array(await singlePhotoJpegBlob.arrayBuffer());
  const embeddedJpeg = await pdfDoc.embedJpg(photoBytes);

  for (const placement of layout.placements) {
    page.drawImage(embeddedJpeg, {
      x: placement.xPt,
      y: placement.yPt,
      width: placement.widthPt,
      height: placement.heightPt,
    });

    if (includeCutGuides) {
      page.drawRectangle({
        x: placement.xPt,
        y: placement.yPt,
        width: placement.widthPt,
        height: placement.heightPt,
        borderColor: rgb(0.75, 0.78, 0.82),
        borderWidth: 0.6,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  return {
    pdfBlob,
    copiesCount: layout.totalCount,
  };
}
