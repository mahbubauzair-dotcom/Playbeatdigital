# PlayBeat Tools – Launch Report, Post-Launch Checklist & 30-Day Editorial Plan

This document houses the internal launch readiness report, environment configuration checklist, and the unpublished 30-day editorial content plan for **PlayBeat Tools** (`https://playbeatdigital.store`). It is stored in project documentation (`/docs/LAUNCH_REPORT_AND_CONTENT_PLAN.md`) so it is never exposed as a public route or indexed in `sitemap.xml`.

---

## 1. Build-Time Environment Configuration Status

Public environment variables (`NEXT_PUBLIC_*` / `VITE_*`) are embedded into the static bundle during `npm run build`. Modifying any variable in Vercel Project Settings requires triggering a new build and deployment.

| Variable | Default / Current Value | Status |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` / `VITE_SITE_URL` | `https://playbeatdigital.store` | Configured |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `VITE_CONTACT_EMAIL` | `""` (empty) | **FLAGGED: Not Supplied Yet** — `/contact/` displays a configuration notice until set |
| `NEXT_PUBLIC_GA_ID` / `VITE_GA_ID` | `""` (empty) | Optional — Analytics consent banner stays hidden while unset |
| `NEXT_PUBLIC_GSC_VERIFICATION` / `VITE_GSC_VERIFICATION` | `""` (empty) | Optional — Meta tag omitted while unset |
| `NEXT_PUBLIC_ADS_ENABLED` / `VITE_ADS_ENABLED` | `"false"` | Disabled by default — Ad slots collapse completely |

---

## 2. Post-Launch Checklist (`playbeatdigital.store` on GitHub + Vercel)

- [ ] **Confirm Contact Details**: Set `NEXT_PUBLIC_CONTACT_EMAIL` (and `VITE_CONTACT_EMAIL`) to your verified mailbox in **Vercel Dashboard → Project Settings → Environment Variables**, then redeploy so `/contact/` activates the *Copy email* and *Open email app* controls.
- [ ] **HTTPS & Canonical Host**: Verify in **Vercel Dashboard → Settings → Domains** that `playbeatdigital.store` is the primary domain over HTTPS, `www.playbeatdigital.store` redirects (308/301) to `https://playbeatdigital.store`, and `trailingSlash: true` in `vercel.json` is active.
- [ ] **Google Search Console Verification**: Verify domain ownership via DNS TXT record (recommended) or by setting `NEXT_PUBLIC_GSC_VERIFICATION` in Vercel and redeploying.
- [ ] **Sitemap Submission**: Submit `https://playbeatdigital.store/sitemap.xml` in Google Search Console and confirm `https://playbeatdigital.store/robots.txt` is reachable.
- [ ] **Inspect Important URLs**: Use the URL Inspection tool in Search Console for `/` and all 10 tool routes (`/merge-pdf/`, `/compress-pdf/`, `/compress-image/`, `/jpg-to-pdf/`, `/passport-photo-maker/`, `/qr-code-generator/`, `/age-calculator/`, `/word-counter/`, `/resize-image/`, `/urdu-keyboard/`) and request indexing where available.
- [ ] **Optional GA4 & Consent Verification**: If `NEXT_PUBLIC_GA_ID` is configured later, open DevTools Network tab to confirm that no Google Analytics requests fire before clicking *“Accept analytics”*, and that dismissing or rejecting keeps GA4 blocked.
- [ ] **Broken Links & Mobile Checks**: Verify navigation, breadcrumbs, and tool controls at `360px` and `390px` mobile widths on the live Vercel URL.
- [ ] **AdSense Policy Readiness**: Ensure all public pages maintain complete, helpful original content, clear navigation, and accurate legal pages before applying. Note that no specific page count or traffic level guarantees AdSense approval.

---

## 3. 30-Day Editorial Content Plan (Unpublished Roadmap)

> **Editorial Note:** Content quantity is an editorial roadmap for helping students and job seekers solve real application problems—not an official eligibility threshold or guarantee for AdSense approval or search rankings. Unfinished drafts must remain outside public routes and `sitemap.xml` until fully written.

| Day | Article / Guide Idea | Target Keyword | Related Internal Links |
| :--- | :--- | :--- | :--- |
| **Day 1** *(Published)* | How to reduce a photo to 50KB for an online application | `compress photo to 50KB online` | `/compress-image/`, `/passport-photo-maker/`, `/resize-image/` |
| **Day 2** | How to compress a scanned signature to 20KB without losing ink clarity | `compress signature to 20KB` | `/compress-image/`, `/resize-image/` |
| **Day 3** | 35x45mm vs 2x2 inch passport photos: Understanding pixel sizes at 300 DPI | `35x45mm photo size in pixels` | `/passport-photo-maker/`, `/resize-image/`, `/compress-image/` |
| **Day 4** | How to print multiple passport photos on a 4x6 inch or A4 sheet at actual size | `passport photo print sheet 4x6 A4` | `/passport-photo-maker/`, `/jpg-to-pdf/` |
| **Day 5** | How to combine matric, intermediate, and degree transcripts into one PDF | `combine academic transcripts into one PDF` | `/merge-pdf/`, `/compress-pdf/`, `/jpg-to-pdf/` |
| **Day 6** | How to reduce a scanned PDF under 200KB for job recruitment portals | `compress PDF to 200KB online` | `/compress-pdf/`, `/merge-pdf/` |
| **Day 7** | Converting smartphone photos of certificates into an A4 printable PDF | `convert certificate photo to A4 PDF` | `/jpg-to-pdf/`, `/compress-pdf/`, `/compress-image/` |
| **Day 8** | How to calculate your exact age on a job advertisement closing date | `calculate age on closing date` | `/age-calculator/` |
| **Day 9** | Understanding leap year and February 29 birthday rules in age calculators | `February 29 birthday age calculation` | `/age-calculator/` |
| **Day 10** | Pixel dimensions vs file size in KB: Why portals reject resized images | `difference between image pixels and KB size` | `/resize-image/`, `/compress-image/` |
| **Day 11** | Why PNG files stay large and when to convert PNG to JPEG for uploads | `why PNG file size is larger than JPEG` | `/resize-image/`, `/compress-image/` |
| **Day 12** | How to type Urdu on an English QWERTY keyboard using phonetic mapping | `phonetic Urdu typing guide` | `/urdu-keyboard/`, `/word-counter/` |
| **Day 13** | How to check word and character limits for scholarship personal statements | `scholarship essay word count checker` | `/word-counter/` |
| **Day 14** | Static vs dynamic QR codes: Why static QR codes on CVs never expire | `static QR code for resume CV` | `/qr-code-generator/` |
| **Day 15** | How to create a scannable WiFi QR code for guests and study spaces | `create WiFi QR code free` | `/qr-code-generator/` |
| **Day 16** | Why merging digitally signed PDFs invalidates cryptographic signatures | `merging signed PDF files warning` | `/merge-pdf/`, `/compress-pdf/` |
| **Day 17** | How to photograph ID cards and domiciles without glare before PDF conversion | `scan ID card to PDF with phone` | `/jpg-to-pdf/`, `/compress-image/` |
| **Day 18** | Preparing a 25x35mm admit card photo at 300 DPI in your browser | `25x35mm photo size online` | `/passport-photo-maker/`, `/compress-image/` |
| **Day 19** | How to compress a multi-page PDF to 500KB or 1MB while keeping text readable | `compress PDF to 500KB readable` | `/compress-pdf/`, `/merge-pdf/` |
| **Day 20** | QR code color contrast and quiet zones: Why some custom QR codes fail to scan | `why QR code is not scanning contrast` | `/qr-code-generator/` |
| **Day 21** | How to handle transparent PNG portraits when a portal requires a white background JPEG | `convert transparent PNG to white background JPEG` | `/compress-image/`, `/resize-image/`, `/passport-photo-maker/` |
| **Day 22** | Checking keyword repetition and density in university statements of purpose | `check repeated words in essay` | `/word-counter/` |
| **Day 23** | How to save and open UTF-8 Urdu text files (.txt) without garbled characters | `save Urdu text file UTF-8` | `/urdu-keyboard/`, `/word-counter/` |
| **Day 24** | Portrait vs Landscape vs Fit-to-Image: Choosing the right JPG to PDF page layout | `JPG to PDF A4 portrait or landscape` | `/jpg-to-pdf/`, `/merge-pdf/` |
| **Day 25** | How to resize an image to exact 300x400 or 600x600 pixels in your browser | `resize photo to 600x600 pixels` | `/resize-image/`, `/passport-photo-maker/` |
| **Day 26** | Why local browser file processing is safer for CNIC, Aadhaar, and passport scans | `private browser PDF and photo tools` | `/merge-pdf/`, `/compress-pdf/`, `/compress-image/` |
| **Day 27** | How to unlock a password-protected PDF before merging or compressing | `remove PDF password before merging` | `/merge-pdf/`, `/compress-pdf/` |
| **Day 28** | How to count characters with and without spaces for online application text boxes | `character count with spaces online` | `/word-counter/` |
| **Day 29** | Complete pre-submission checklist for online admission and job portal uploads | `online form document upload checklist` | `/compress-image/`, `/merge-pdf/`, `/age-calculator/`, `/passport-photo-maker/` |
| **Day 30** | Troubleshooting blurry text on compressed certificates and mark sheets | `keep certificate text clear when compressing` | `/compress-image/`, `/compress-pdf/`, `/jpg-to-pdf/` |
