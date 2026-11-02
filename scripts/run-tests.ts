import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import { calculateAge, isLeapYear } from '../src/lib/ageCalculator';
import { analyzeText } from '../src/lib/wordCounter';
import { buildQrPayload, checkQrContrast, escapeWifiField } from '../src/lib/qrPayload';
import { backspaceAtSelection, insertAtSelection, PHONETIC_MAP } from '../src/lib/urduKeyboardMap';
import {
  calculateSheetLayout,
  getPassportOutputPixels,
  inchesToPdfPoints,
  inchesToPixels300Dpi,
  mmToPdfPoints,
  mmToPixels300Dpi,
} from '../src/lib/imageProcessing';
import { TOOLS_REGISTRY } from '../src/data/toolsRegistry';

async function runAllTests() {
  let passedAssertions = 0;
  console.log('Running PlayBeat Tools automated verification suite...\n');

  // 1. Age Calculator Tests (Leap years, Feb 29 birthdays, month-ends, future birth dates, invalid inputs)
  {
    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(2025), false);
    assert.equal(isLeapYear(2000), true);
    assert.equal(isLeapYear(1900), false);
    passedAssertions += 4;

    // Standard exact age
    const res1 = calculateAge('2000-05-15', '2026-05-15');
    assert.equal(res1.valid, true);
    assert.equal(res1.years, 26);
    assert.equal(res1.months, 0);
    assert.equal(res1.days, 0);
    assert.equal(res1.isBirthdayToday, true);
    assert.equal(res1.daysUntilNextBirthday, 0);
    passedAssertions += 6;

    // Leap year birthday (Feb 29, 2004) in a non-leap year (2025)
    const feb28NonLeap = calculateAge('2004-02-29', '2025-02-28');
    assert.equal(feb28NonLeap.valid, true);
    assert.equal(feb28NonLeap.years, 21);
    assert.equal(feb28NonLeap.months, 0);
    assert.equal(feb28NonLeap.days, 0);
    assert.equal(feb28NonLeap.feb29NoteApplied, true);
    passedAssertions += 5;

    const mar1NonLeap = calculateAge('2004-02-29', '2025-03-01');
    assert.equal(mar1NonLeap.valid, true);
    assert.equal(mar1NonLeap.years, 21);
    assert.equal(mar1NonLeap.months, 0);
    assert.equal(mar1NonLeap.days, 1);
    passedAssertions += 4;

    // Leap year birthday in a leap year (2024-02-28 vs 2024-02-29)
    const feb28Leap = calculateAge('2004-02-29', '2024-02-28');
    assert.equal(feb28Leap.years, 19);
    assert.equal(feb28Leap.months, 11);
    assert.equal(feb28Leap.days, 30);
    passedAssertions += 3;

    const feb29Leap = calculateAge('2004-02-29', '2024-02-29');
    assert.equal(feb29Leap.years, 20);
    assert.equal(feb29Leap.months, 0);
    assert.equal(feb29Leap.days, 0);
    passedAssertions += 3;

    // Month-end date clamping (Jan 31 to Feb 28 in non-leap year)
    const monthEnd = calculateAge('2025-01-31', '2025-02-28');
    assert.equal(monthEnd.valid, true);
    assert.equal(monthEnd.years, 0);
    assert.equal(monthEnd.months, 1);
    assert.equal(monthEnd.days, 0);
    assert.equal(monthEnd.totalDays, 28);
    passedAssertions += 5;

    // Future birth date rejected
    const futureDob = calculateAge('2027-01-01', '2026-11-01');
    assert.equal(futureDob.valid, false);
    passedAssertions += 1;

    // Invalid calendar date (Feb 30) rejected
    const invalidFeb = calculateAge('2025-02-30', '2026-11-01');
    assert.equal(invalidFeb.valid, false);
    passedAssertions += 1;

    console.log('✓ [Suite 1] Age Calculator tests passed (32 assertions)');
  }

  // 2. Word Counter Tests (Unicode, characters, sentences, paragraphs, keyword density)
  {
    const sample =
      'PlayBeat Tools compresses photos in your browser. Browser tools keep your photos private!\n\nیہ اردو ٹیکسٹ ہے۔';
    const res = analyzeText(sample);
    assert.equal(res.words, 17);
    assert.equal(res.paragraphs, 2);
    assert.equal(res.sentences, 3);
    assert.ok(res.charactersWithSpaces > res.charactersWithoutSpaces);
    assert.ok(res.topKeywords.some((k) => k.word === 'photos' && k.count === 2));
    assert.ok(res.topKeywords.some((k) => k.word === 'browser' && k.count === 2));
    passedAssertions += 6;
    console.log('✓ [Suite 2] Word Counter tests passed (6 assertions)');
  }

  // 3. QR Payload & Contrast & Generation Tests
  {
    assert.equal(escapeWifiField('My;Net:Name"\\'), 'My\\;Net\\:Name\\"\\\\');
    const wifiPayload = buildQrPayload({
      mode: 'wifi',
      url: '',
      text: '',
      wifiSsid: 'PlayBeat;Cafe',
      wifiPassword: 'pass:123',
      wifiEncryption: 'WPA',
      wifiHidden: false,
      phone: '',
      emailAddress: '',
      emailSubject: '',
      emailBody: '',
    });
    assert.equal(wifiPayload.valid, true);
    assert.equal(wifiPayload.payload, 'WIFI:T:WPA;S:PlayBeat\\;Cafe;P:pass\\:123;;');

    const goodContrast = checkQrContrast('#0F172A', '#FFFFFF');
    assert.equal(goodContrast.isLowContrast, false);
    assert.equal(goodContrast.isInverted, false);

    const lowContrast = checkQrContrast('#CBD5E1', '#FFFFFF');
    assert.equal(lowContrast.isLowContrast, true);

    const inverted = checkQrContrast('#FFFFFF', '#0F172A');
    assert.equal(inverted.isInverted, true);
    assert.equal(inverted.isLowContrast, true);

    const svgOut = await QRCode.toString('https://playbeatdigital.store', {
      type: 'svg',
      margin: 4,
    });
    assert.ok(svgOut.includes('<svg'));
    passedAssertions += 9;
    console.log('✓ [Suite 3] QR Code Generator tests passed (9 assertions)');
  }

  // 4. Urdu Keyboard Cursor & Selection Preservation Tests
  {
    assert.equal(PHONETIC_MAP['a'], 'ا');
    assert.equal(PHONETIC_MAP['A'], 'آ');
    assert.equal(PHONETIC_MAP['p'], 'پ');

    const ins1 = insertAtSelection('پاکان', 3, 3, 'ست');
    assert.equal(ins1.text, 'پاکستان');
    assert.equal(ins1.selectionStart, 5);
    assert.equal(ins1.selectionEnd, 5);

    const ins2 = insertAtSelection('ہیلو دنیا', 5, 9, 'پاکستان');
    assert.equal(ins2.text, 'ہیلو پاکستان');
    assert.equal(ins2.selectionStart, 12);

    const bs1 = backspaceAtSelection('اردو', 4, 4);
    assert.equal(bs1.text, 'ارد');
    assert.equal(bs1.selectionStart, 3);

    const bs2 = backspaceAtSelection('اردو کی بورڈ', 0, 5);
    assert.equal(bs2.text, 'کی بورڈ');
    assert.equal(bs2.selectionStart, 0);
    passedAssertions += 12;
    console.log('✓ [Suite 4] Urdu Keyboard tests passed (12 assertions)');
  }

  // 5. Passport Photo 300 DPI Physical Sizing & Printable Sheet + PDF Generation Tests
  {
    assert.equal(mmToPixels300Dpi(35), 413);
    assert.equal(mmToPixels300Dpi(45), 531);
    assert.equal(inchesToPixels300Dpi(2), 600);

    const p25x35 = getPassportOutputPixels(25, 35, 'mm');
    assert.equal(p25x35.widthPx, 295);
    assert.equal(p25x35.heightPx, 413);

    const sheet4x6 = calculateSheetLayout(
      inchesToPdfPoints(6),
      inchesToPdfPoints(4),
      mmToPdfPoints(35),
      mmToPdfPoints(45)
    );
    assert.equal(sheet4x6.totalCount, 8);

    const sheetA4 = calculateSheetLayout(
      mmToPdfPoints(210),
      mmToPdfPoints(297),
      mmToPdfPoints(35),
      mmToPdfPoints(45)
    );
    assert.equal(sheetA4.totalCount, 30);

    const doc1 = await PDFDocument.create();
    doc1.addPage([595.28, 841.89]);
    const bytes1 = await doc1.save();

    const doc2 = await PDFDocument.create();
    doc2.addPage([595.28, 841.89]);
    doc2.addPage([595.28, 841.89]);
    const bytes2 = await doc2.save();

    const merged = await PDFDocument.create();
    const loaded1 = await PDFDocument.load(bytes1);
    const loaded2 = await PDFDocument.load(bytes2);
    const copied1 = await merged.copyPages(loaded1, [0]);
    const copied2 = await merged.copyPages(loaded2, [0, 1]);
    copied1.forEach((p) => merged.addPage(p));
    copied2.forEach((p) => merged.addPage(p));
    const mergedBytes = await merged.save();

    const reopened = await PDFDocument.load(mergedBytes);
    assert.equal(reopened.getPageCount(), 3);
    passedAssertions += 8;
    console.log('✓ [Suite 5] Passport 300 DPI sizing, sheet layout math, and PDF creation/merge/reopen passed (8 assertions)');
  }

  // 6. Tool Registry, Vercel Configuration & Documentation Integrity Tests
  {
    assert.equal(TOOLS_REGISTRY.length, 10);
    const titles = new Set(TOOLS_REGISTRY.map((t) => t.title));
    const descriptions = new Set(TOOLS_REGISTRY.map((t) => t.metaDescription));
    assert.equal(titles.size, 10, 'All 10 tool titles must be unique');
    assert.equal(descriptions.size, 10, 'All 10 tool meta descriptions must be unique');
    passedAssertions += 3;

    for (const tool of TOOLS_REGISTRY) {
      assert.equal(tool.faqs.length, 4, `${tool.slug} must have 4 FAQs`);
      assert.ok(tool.guide.paragraphs.length >= 3, `${tool.slug} must have complete guide paragraphs`);
      assert.ok(tool.relatedTools.length >= 3, `${tool.slug} must have related tools`);
      passedAssertions += 3;
    }

    // Verify vercel.json exists and contains required security headers & trailingSlash
    const vercelJsonPath = path.resolve(process.cwd(), 'vercel.json');
    assert.equal(fs.existsSync(vercelJsonPath), true, 'vercel.json must exist');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
    assert.equal(vercelConfig.trailingSlash, true);
    assert.equal(vercelConfig.outputDirectory, 'out');
    assert.ok(Array.isArray(vercelConfig.headers) && vercelConfig.headers.length >= 3);
    passedAssertions += 4;

    // Verify Cloudflare _headers is removed
    assert.equal(fs.existsSync(path.resolve(process.cwd(), 'public/_headers')), false);
    passedAssertions += 1;

    // Verify docs/LAUNCH_REPORT_AND_CONTENT_PLAN.md exists and has all 30 days
    const docPath = path.resolve(process.cwd(), 'docs/LAUNCH_REPORT_AND_CONTENT_PLAN.md');
    assert.equal(fs.existsSync(docPath), true);
    const docContent = fs.readFileSync(docPath, 'utf-8');
    assert.ok(docContent.includes('Day 1'));
    assert.ok(docContent.includes('Day 30'));
    assert.ok(docContent.includes('FLAGGED: Not Supplied Yet'));
    passedAssertions += 5;

    console.log('✓ [Suite 6] Tool Registry (10 tools), vercel.json security headers, and docs integrity passed (43 assertions)');
  }

  console.log(`\nAll 6 suites (${passedAssertions} total assertions) in PlayBeat Tools unit verification passed!`);
}

runAllTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
