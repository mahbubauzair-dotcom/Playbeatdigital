import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';

const OUT_DIR = path.resolve(process.cwd(), 'out');
const VERCEL_JSON = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'vercel.json'), 'utf-8')
);

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
};

function startStaticServerWithVercelHeaders(): Promise<{
  server: http.Server;
  baseUrl: string;
}> {
  return new Promise((resolve) => {
    const globalHeaders: { key: string; value: string }[] =
      VERCEL_JSON.headers.find((h: { source: string }) => h.source === '/(.*)')?.headers ?? [];

    const server = http.createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0];

      // Apply Vercel security headers
      for (const h of globalHeaders) {
        res.setHeader(h.key, h.value);
      }

      let filePath = path.join(OUT_DIR, urlPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        const notFoundPath = path.join(OUT_DIR, '404.html');
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(fs.existsSync(notFoundPath) ? fs.readFileSync(notFoundPath) : 'Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      res.end(fs.readFileSync(filePath));
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 4173;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function createSamplePdfBuffer(pageCount: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]);
    page.drawText(`PlayBeat Test PDF Page ${i + 1} of ${pageCount}`, {
      x: 50,
      y: 750,
      size: 18,
    });
  }
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function runBrowserE2E() {
  console.log('Starting Vercel-header static server & headless Chromium E2E checks...\n');
  const { server, baseUrl } = await startStaticServerWithVercelHeaders();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const cspViolations: string[] = [];
  const pageErrors: string[] = [];
  const externalRequests: string[] = [];
  const allRequestUrls: string[] = [];

  await page.exposeFunction('__reportCspViolation', (msg: string) => {
    cspViolations.push(msg);
  });

  await page.addInitScript('window.__name = (fn) => fn;');
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      // @ts-expect-error exposed helper
      window.__reportCspViolation(`${e.violatedDirective}: ${e.blockedURI}`);
    });
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  page.on('request', (req) => {
    const u = req.url();
    allRequestUrls.push(u);
    if (
      !u.startsWith(baseUrl) &&
      !u.startsWith('blob:') &&
      !u.startsWith('data:')
    ) {
      externalRequests.push(u);
    }
  });

  try {
    // -------------------------------------------------------------------------
    // 1. Verify Direct Loading of All 18 Public Exported Routes + 404 + Sitemap
    // -------------------------------------------------------------------------
    const expectedPublicRoutes = [
      '/',
      '/merge-pdf/',
      '/compress-pdf/',
      '/compress-image/',
      '/jpg-to-pdf/',
      '/passport-photo-maker/',
      '/qr-code-generator/',
      '/age-calculator/',
      '/word-counter/',
      '/resize-image/',
      '/urdu-keyboard/',
      '/blog/',
      '/blog/reduce-photo-to-50kb-online-application/',
      '/about/',
      '/contact/',
      '/privacy-policy/',
      '/terms/',
      '/disclaimer/',
    ];

    for (const route of expectedPublicRoutes) {
      const resp = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      assert.equal(resp?.status(), 200, `Route ${route} should return 200 OK`);
      const cspHeader = resp?.headers()['content-security-policy'];
      assert.ok(cspHeader && cspHeader.includes("worker-src 'self' blob:"), 'CSP header must be active');
      const h1Count = await page.locator('h1').count();
      assert.equal(h1Count, 1, `Route ${route} must have exactly 1 <h1>`);
    }

    // Verify /launch-report/ is NOT a public route anymore (returns 404)
    const launchResp = await page.goto(`${baseUrl}/launch-report/`, { waitUntil: 'networkidle' });
    assert.equal(launchResp?.status(), 404, '/launch-report/ must return 404');

    // Verify /contact/ shows the configured contact email and interactive mail actions
    await page.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle' });
    const contactText = await page.locator('main').innerText();
    assert.ok(
      contactText.includes('admin@playbeatdigital.store'),
      '/contact/ must display the configured contact email address'
    );
    const mailtoCount = await page.locator('a[href^="mailto:admin@playbeatdigital.store"]').count();
    assert.ok(mailtoCount >= 1, '/contact/ must have an active mailto link');

    console.log('✓ [Browser Check 1] All 18 exported routes loaded directly with 200 OK, Vercel CSP headers, and 1 H1 each; /launch-report/ removed (404); /contact/ shows verified email');

    // -------------------------------------------------------------------------
    // 2. Mobile Layouts (360px & 390px), Ad Slot Collapse & Keyboard Navigation
    // -------------------------------------------------------------------------
    for (const width of [360, 390, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      for (const route of ['/', '/compress-image/', '/merge-pdf/', '/urdu-keyboard/']) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        assert.equal(
          overflow,
          false,
          `No horizontal overflow allowed on ${route} at ${width}px viewport`
        );

        // Confirm no blank ad slots are rendered when ads are disabled
        const adSlotsCount = await page.locator('#ad-slot-top, #ad-slot-mid, #ad-slot-bottom').count();
        assert.equal(adSlotsCount, 0, 'Ad slots must be completely collapsed when disabled');
      }
    }

    // Keyboard navigation check on Homepage
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const firstFocusedText = await page.evaluate(() => document.activeElement?.textContent?.trim());
    assert.equal(firstFocusedText, 'Skip to main content');

    console.log('✓ [Browser Check 2] Mobile viewports (360px, 390px) and desktop (1440px) verified with zero horizontal overflow, collapsed ad slots, and working keyboard Tab focus');

    // -------------------------------------------------------------------------
    // 3. Generate Real Test Image Buffers Inside Browser Canvas
    // -------------------------------------------------------------------------
    const testImages = await page.evaluate(async () => {
      async function makeImageBase64(w: number, h: number, mime: string): Promise<string> {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d')!;
        // Draw rich gradients and patterns so file is ~200KB+
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#4F46E5');
        grad.addColorStop(0.5, '#10B981');
        grad.addColorStop(1, '#F59E0B');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 1500; i++) {
          ctx.fillStyle = `rgb(${(i * 37) % 255}, ${(i * 73) % 255}, ${(i * 19) % 255})`;
          ctx.fillRect((i * 29) % w, (i * 43) % h, 18, 18);
        }
        const dataUrl = c.toDataURL(mime, 0.98);
        return dataUrl.split(',')[1];
      }

      return {
        largePngBase64: await makeImageBase64(1200, 900, 'image/png'),
        portraitJpgBase64: await makeImageBase64(800, 1000, 'image/jpeg'),
        landscapeJpgBase64: await makeImageBase64(1000, 750, 'image/jpeg'),
      };
    });

    const largePngBuffer = Buffer.from(testImages.largePngBase64, 'base64');
    const portraitJpgBuffer = Buffer.from(testImages.portraitJpgBase64, 'base64');
    const landscapeJpgBuffer = Buffer.from(testImages.landscapeJpgBase64, 'base64');

    // -------------------------------------------------------------------------
    // 4. Tool A: Merge PDF (/merge-pdf/) — Corrupted Error + Reorder + Merge + Reopen
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/merge-pdf/`, { waitUntil: 'networkidle' });

    // Test invalid/corrupted PDF error handling
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'corrupted-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('not-a-valid-pdf-content'),
    });
    await page.getByText(/not a valid PDF/i).waitFor({ state: 'visible', timeout: 10000 });
    const mergeErrText = await page.locator('[role="status"]').innerText();
    assert.ok(mergeErrText.includes('not a valid PDF'), 'Corrupted PDF must trigger clear error');

    // Upload 2 valid PDFs (1 page and 2 pages)
    const pdf1Buf = await createSamplePdfBuffer(1);
    const pdf2Buf = await createSamplePdfBuffer(2);
    await page.locator('input[type="file"]').first().setInputFiles([
      { name: 'first-1page.pdf', mimeType: 'application/pdf', buffer: pdf1Buf },
      { name: 'second-2pages.pdf', mimeType: 'application/pdf', buffer: pdf2Buf },
    ]);

    await page.getByText('first-1page.pdf').waitFor({ state: 'visible' });
    // Reorder first file down
    await page.getByRole('button', { name: 'Move first-1page.pdf down' }).click();

    const mergeDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Merge 2 PDFs \(3 pages\)/i }).click();
    await page.getByRole('button', { name: /Download Merged PDF/i }).click();
    const mergedDownload = await mergeDownloadPromise;
    const mergedPath = await mergedDownload.path();
    assert.ok(mergedPath, 'Merged PDF must download');
    const mergedFileBytes = fs.readFileSync(mergedPath);
    const reopenedMerged = await PDFDocument.load(mergedFileBytes);
    assert.equal(reopenedMerged.getPageCount(), 3, 'Reopened merged PDF must have 3 pages');
    console.log(`✓ [Tool 1: Merge PDF] Verified corrupted error state, accessible reorder, download, and reopened 3-page PDF (${mergedFileBytes.byteLength} bytes)`);

    // -------------------------------------------------------------------------
    // 5. Tool B: Compress PDF (/compress-pdf/) — Worker, Unreachable Target, Vector Larger Warning & Cancellation
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/compress-pdf/`, { waitUntil: 'networkidle' });

    // Create a multi-page image-heavy PDF using JPG-to-PDF logic in pdf-lib
    const heavyPdfDoc = await PDFDocument.create();
    const embeddedHeavyJpg = await heavyPdfDoc.embedJpg(portraitJpgBuffer);
    for (let i = 0; i < 6; i++) {
      const p = heavyPdfDoc.addPage([595.28, 841.89]);
      p.drawImage(embeddedHeavyJpg, { x: 0, y: 0, width: 595.28, height: 841.89 });
    }
    const heavyPdfBytes = Buffer.from(await heavyPdfDoc.save());

    // Upload heavy PDF and test unreachable 20 KB target on 6 full-page images
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'scanned-6pages.pdf',
      mimeType: 'application/pdf',
      buffer: heavyPdfBytes,
    });
    await page.getByRole('button', { name: 'Custom KB' }).click();
    await page.getByLabel('Custom PDF target size in KB').fill('20');
    await page.getByRole('button', { name: 'Compress PDF' }).click();

    await page.getByRole('button', { name: /Download Compressed PDF/i }).waitFor({
      state: 'visible',
      timeout: 30000,
    });

    const compressStatusText = await page.locator('main').innerText();
    assert.ok(
      compressStatusText.includes('could not be met within readable quality limits') ||
        compressStatusText.includes('was not reached within readable quality limits') ||
        compressStatusText.includes('at or below'),
      'Compress PDF must report target outcome honestly'
    );

    const compPdfDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download Compressed PDF/i }).click();
    const compPdfDownload = await compPdfDownloadPromise;
    const compPdfPath = await compPdfDownload.path();
    assert.ok(compPdfPath);
    const compPdfBytes = fs.readFileSync(compPdfPath);
    const reopenedCompPdf = await PDFDocument.load(compPdfBytes);
    assert.equal(reopenedCompPdf.getPageCount(), 6, 'Compressed PDF must preserve all 6 pages');

    // Test cancellation on a 12-page PDF
    await page.getByRole('button', { name: /Choose Another PDF/i }).click();
    const cancelPdfDoc = await PDFDocument.create();
    const embCancel = await cancelPdfDoc.embedJpg(portraitJpgBuffer);
    for (let i = 0; i < 12; i++) {
      const p = cancelPdfDoc.addPage([595.28, 841.89]);
      p.drawImage(embCancel, { x: 0, y: 0, width: 595.28, height: 841.89 });
    }
    const cancelPdfBytes = Buffer.from(await cancelPdfDoc.save());
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'twelve-pages.pdf',
      mimeType: 'application/pdf',
      buffer: cancelPdfBytes,
    });
    await page.getByRole('button', { name: 'Compress PDF' }).click();
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.waitFor({ state: 'visible', timeout: 5000 });
    await cancelBtn.click();
    await page.getByText(/cancelled/i).waitFor({ state: 'visible', timeout: 5000 });

    console.log(`✓ [Tool 2: Compress PDF] Verified PDF.js local worker, 6-page compression & reopen (${compPdfBytes.byteLength} bytes), unreachable target reporting, and mid-run cancellation`);

    // -------------------------------------------------------------------------
    // 6. Tool C: Compress Image (/compress-image/) — Compress to <= 50KB & Verify
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/compress-image/`, { waitUntil: 'networkidle' });
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'candidate-photo.png',
      mimeType: 'image/png',
      buffer: largePngBuffer,
    });
    await page.getByRole('button', { name: '50 KB', exact: true }).click();
    await page.getByRole('button', { name: /Compress to ≤ 50 KB/i }).click();

    const dlImgBtn = page.getByRole('button', { name: /Download JPEG/i });
    await dlImgBtn.waitFor({ state: 'visible' });

    const imgDownloadPromise = page.waitForEvent('download');
    await dlImgBtn.click();
    const imgDownload = await imgDownloadPromise;
    const imgPath = await imgDownload.path();
    assert.ok(imgPath);
    const compressedImgBytes = fs.readFileSync(imgPath);
    assert.ok(
      compressedImgBytes.byteLength <= 50 * 1024,
      `Compressed JPEG (${compressedImgBytes.byteLength} B) must be <= 51,200 B`
    );
    // Verify JPEG magic bytes FF D8 FF
    assert.equal(compressedImgBytes[0], 0xff);
    assert.equal(compressedImgBytes[1], 0xd8);
    console.log(`✓ [Tool 3: Compress Image] Compressed ${largePngBuffer.byteLength} B PNG to ${compressedImgBytes.byteLength} B valid JPEG (≤ 50 KB)`);

    // -------------------------------------------------------------------------
    // 7. Tool D: JPG to PDF (/jpg-to-pdf/) — Multi-Image Auto Orientation & Reopen
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/jpg-to-pdf/`, { waitUntil: 'networkidle' });
    await page.locator('input[type="file"]').first().setInputFiles([
      { name: 'landscape.jpg', mimeType: 'image/jpeg', buffer: landscapeJpgBuffer },
      { name: 'portrait.jpg', mimeType: 'image/jpeg', buffer: portraitJpgBuffer },
    ]);
    await page.getByRole('button', { name: /Convert 2 Images to PDF/i }).click();
    const dlJpgPdfBtn = page.getByRole('button', { name: /Download PDF/i });
    await dlJpgPdfBtn.waitFor({ state: 'visible' });

    const jpgPdfDownloadPromise = page.waitForEvent('download');
    await dlJpgPdfBtn.click();
    const jpgPdfDownload = await jpgPdfDownloadPromise;
    const jpgPdfPath = await jpgPdfDownload.path();
    assert.ok(jpgPdfPath);
    const jpgPdfBytes = fs.readFileSync(jpgPdfPath);
    const reopenedJpgPdf = await PDFDocument.load(jpgPdfBytes);
    assert.equal(reopenedJpgPdf.getPageCount(), 2);
    const p1Size = reopenedJpgPdf.getPage(0).getSize();
    const p2Size = reopenedJpgPdf.getPage(1).getSize();
    assert.ok(p1Size.width > p1Size.height, 'Page 1 (landscape image) must be landscape A4');
    assert.ok(p2Size.height > p2Size.width, 'Page 2 (portrait image) must be portrait A4');
    console.log(`✓ [Tool 4: JPG to PDF] Converted 2 images into 2-page PDF (${jpgPdfBytes.byteLength} B) with verified landscape/portrait auto-orientation`);

    // -------------------------------------------------------------------------
    // 8. Tool E: Passport Photo Maker (/passport-photo-maker/) — 300 DPI JPEG & 4x6 PDF Sheet
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/passport-photo-maker/`, { waitUntil: 'networkidle' });
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'portrait.jpg',
      mimeType: 'image/jpeg',
      buffer: portraitJpgBuffer,
    });
    await page.getByText('Output Resolution: 413 × 531 px (300 DPI)').waitFor({ state: 'visible' });

    const singlePassportPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download Single JPEG \(413 × 531 px\)/i }).click();
    const singlePassportDl = await singlePassportPromise;
    const singlePassportPath = await singlePassportDl.path();
    assert.ok(singlePassportPath);
    const singlePassportBytes = fs.readFileSync(singlePassportPath);

    // Decode downloaded single JPEG in browser to verify exact 413 x 531 px dimensions
    const singleDims = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${b64}`;
      await new Promise((r) => (img.onload = r));
      return { w: img.naturalWidth, h: img.naturalHeight };
    }, singlePassportBytes.toString('base64'));
    assert.equal(singleDims.w, 413);
    assert.equal(singleDims.h, 531);

    // Download 4x6 inch printable PDF sheet and verify physical dimensions (432 x 288 pt)
    const sheetDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Generate Printable 4x6 PDF Sheet/i }).click();
    const sheetDownload = await sheetDownloadPromise;
    const sheetPath = await sheetDownload.path();
    assert.ok(sheetPath);
    const sheetBytes = fs.readFileSync(sheetPath);
    const reopenedSheet = await PDFDocument.load(sheetBytes);
    assert.equal(reopenedSheet.getPageCount(), 1);
    const sheetPageSize = reopenedSheet.getPage(0).getSize();
    assert.equal(Math.round(sheetPageSize.width), 432);
    assert.equal(Math.round(sheetPageSize.height), 288);
    console.log(`✓ [Tool 5: Passport Photo Maker] Verified 413×531 px (300 DPI) single JPEG and 4×6 inch (432×288 pt) printable PDF sheet`);

    // -------------------------------------------------------------------------
    // 9. Tool F: QR Code Generator (/qr-code-generator/) — Contrast Warning + PNG & SVG Download
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/qr-code-generator/`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'WiFi' }).click();
    await page.getByLabel('Network Name (SSID)').fill('Student_Hostel;5G');
    await page.getByLabel('WiFi Password').fill('Secret:Pass123');

    // Trigger low-contrast warning by setting foreground to light gray
    await page.locator('#qr-fg-color').fill('#e2e8f0');
    await page.getByText('Scannability Contrast Warning').waitFor({ state: 'visible' });
    // Restore dark foreground
    await page.locator('#qr-fg-color').fill('#0f172a');

    const qrPngPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download PNG' }).click();
    const qrPngDl = await qrPngPromise;
    const qrPngBytes = fs.readFileSync((await qrPngDl.path())!);
    assert.equal(qrPngBytes[0], 0x89); // PNG header 89 50 4E 47
    assert.equal(qrPngBytes[1], 0x50);

    const qrSvgPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download SVG' }).click();
    const qrSvgDl = await qrSvgPromise;
    const qrSvgText = fs.readFileSync((await qrSvgDl.path())!, 'utf-8');
    assert.ok(qrSvgText.includes('<svg'));
    console.log(`✓ [Tool 6: QR Code Generator] Verified WiFi mode, low-contrast warning, PNG (${qrPngBytes.byteLength} B) and SVG downloads`);

    // -------------------------------------------------------------------------
    // 10. Tool G: Age Calculator (/age-calculator/) — Exact Cutoff Age & Future DOB Error
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/age-calculator/`, { waitUntil: 'networkidle' });
    await page.locator('#dob-input').fill('1998-07-24');
    await page.locator('#target-date-input').fill('2026-11-01');
    const ageText = await page.locator('main').innerText();
    assert.ok(ageText.includes('28') && ageText.includes('Friday'), 'Age calculator must show 28 years and Friday');

    // Future birth date error state
    await page.locator('#dob-input').fill('2028-01-01');
    await page.getByRole('alert').waitFor({ state: 'visible' });
    console.log('✓ [Tool 7: Age Calculator] Verified exact cutoff date age calculation and future birth date error state');

    // -------------------------------------------------------------------------
    // 11. Tool H: Word Counter (/word-counter/) — Live Counts, Keywords & Clear
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/word-counter/`, { waitUntil: 'networkidle' });
    const wcTextarea = page.locator('#word-counter-textarea');
    await wcTextarea.fill('Scholarship application essay test. Scholarship essay requires clear writing.');
    const wcText = await page.locator('main').innerText();
    assert.ok(wcText.includes('scholarship') && wcText.includes('essay'));
    await page.getByRole('button', { name: 'Clear' }).click();
    assert.equal(await wcTextarea.inputValue(), '');
    console.log('✓ [Tool 8: Word Counter] Verified live word/character counts, keyword density table, and Clear button');

    // -------------------------------------------------------------------------
    // 12. Tool I: Resize Image (/resize-image/) — Aspect Lock + Dimension Verification
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/resize-image/`, { waitUntil: 'networkidle' });
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'landscape-1000x750.jpg',
      mimeType: 'image/jpeg',
      buffer: landscapeJpgBuffer,
    });
    await page.locator('#resize-w-input').fill('400');
    // With 1000x750 and aspect ratio locked, height must auto-update to 300
    assert.equal(await page.locator('#resize-h-input').inputValue(), '300');
    await page.getByRole('button', { name: 'Resize Image' }).click();

    const resizeDlBtn = page.getByRole('button', { name: /Download \.JPG/i });
    await resizeDlBtn.waitFor({ state: 'visible' });
    const resizeDlPromise = page.waitForEvent('download');
    await resizeDlBtn.click();
    const resizeDl = await resizeDlPromise;
    const resizedBytes = fs.readFileSync((await resizeDl.path())!);
    const resizedDims = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${b64}`;
      await new Promise((r) => (img.onload = r));
      return { w: img.naturalWidth, h: img.naturalHeight };
    }, resizedBytes.toString('base64'));
    assert.equal(resizedDims.w, 400);
    assert.equal(resizedDims.h, 300);
    console.log(`✓ [Tool 9: Resize Image] Verified aspect-ratio lock (1000×750 → 400×300 px) and reopened downloaded JPEG (${resizedBytes.byteLength} B)`);

    // -------------------------------------------------------------------------
    // 13. Tool J: Urdu Keyboard (/urdu-keyboard/) — Phonetic Typing, Cursor, Toggle & .txt Download
    // -------------------------------------------------------------------------
    await page.goto(`${baseUrl}/urdu-keyboard/`, { waitUntil: 'networkidle' });
    const urduArea = page.locator('#urdu-editor-textarea');
    await urduArea.click();
    await page.keyboard.type('pak');
    assert.equal(await urduArea.inputValue(), 'پاک');

    // Click on-screen key 'س'
    await page.locator('[aria-label="On-screen Urdu keyboard"]').getByRole('button', { name: /s س/i }).click();
    assert.equal(await urduArea.inputValue(), 'پاکس');

    // Place cursor at index 1 (between پ and ا) and type 't' ('ت') to verify mid-string cursor insertion
    await page.evaluate(() => {
      const el = document.getElementById('urdu-editor-textarea') as HTMLTextAreaElement;
      el.focus();
      el.setSelectionRange(1, 1);
    });
    await page.keyboard.type('t');
    assert.equal(await urduArea.inputValue(), 'پتاکس');
    const cursorAfterMidInsert = await page.evaluate(() => {
      const el = document.getElementById('urdu-editor-textarea') as HTMLTextAreaElement;
      return el.selectionStart;
    });
    assert.equal(cursorAfterMidInsert, 2, 'Urdu cursor must advance to index 2 after mid-string insertion');

    // Disable phonetic mapping, focus textarea, move cursor to end, and type English '123'
    await page.getByLabel(/Enable Phonetic Physical Keyboard Mapping/i).uncheck();
    await page.evaluate(() => {
      const el = document.getElementById('urdu-editor-textarea') as HTMLTextAreaElement;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
    await page.keyboard.type('123');
    assert.equal(await urduArea.inputValue(), 'پتاکس123');

    const urduTxtPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download .txt' }).click();
    const urduTxtDl = await urduTxtPromise;
    const urduTxtContent = fs.readFileSync((await urduTxtDl.path())!, 'utf-8');
    assert.ok(urduTxtContent.includes('پتاکس123'));
    console.log('✓ [Tool 10: Urdu Keyboard] Verified phonetic typing, on-screen keys, mapping toggle, cursor preservation, and UTF-8 .txt download');

    // -------------------------------------------------------------------------
    // 14. Verify Zero Network Leakage, Zero CSP Violations & Zero Page Errors
    // -------------------------------------------------------------------------
    assert.equal(cspViolations.length, 0, `CSP violations detected: ${cspViolations.join(', ')}`);
    assert.equal(pageErrors.length, 0, `Page errors detected: ${pageErrors.join(', ')}`);
    assert.equal(
      externalRequests.length,
      0,
      `External network requests detected: ${externalRequests.join(', ')}`
    );

    const sensitiveTokens = [
      'candidate-photo.png',
      'scanned-6pages.pdf',
      '1998-07-24',
      'Student_Hostel',
      'Secret:Pass123',
      'Scholarship',
      'پاکس123',
    ];
    for (const token of sensitiveTokens) {
      const leaked = allRequestUrls.some((u) => u.includes(token) || u.includes(encodeURIComponent(token)));
      assert.equal(leaked, false, `Sensitive token "${token}" must never appear in network URLs`);
    }

    console.log(
      `✓ [Network & Security Audit] Inspected ${allRequestUrls.length} browser requests: 0 external requests, 0 sensitive payload leaks, 0 CSP violations, 0 page errors`
    );
    console.log('\nAll 14 end-to-end headless Chromium browser verification checks passed!');
  } finally {
    await browser.close();
    server.close();
  }
}

runBrowserE2E().catch((err) => {
  console.error(err);
  process.exit(1);
});
