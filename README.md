# PlayBeat Tools (`https://playbeatdigital.store`)

**Brand Promise:** *“Everyday tools. Simple, fast and free.”*  
**Privacy Guarantee:** *“Your files are processed in your browser and never uploaded.”*

PlayBeat Tools is a fast, privacy-first static web application built for students, job seekers, and online form applicants in Pakistan, India, and worldwide. All 10 utilities execute locally in the user's browser with zero backend servers, zero file uploads, and full static HTML pre-rendering for SEO.

---

## 1. Local Setup & Commands

```bash
# 1. Install dependencies (uses exact pinned versions in package.json and package-lock.json)
npm install

# 2. Start local development server on port 3000
npm run dev

# 3. Run TypeScript strict typecheck
npm run lint

# 4. Run automated verification test suite
npm test

# 5. Build production bundle and pre-render all static HTML routes to out/ and dist/
npm run build
```

---

## 2. Architecture & Code Organization

- **Static Export & Pre-rendered HTML (`scripts/prerender-static.tsx`)**:
  During `npm run build`, Vite bundles client assets and `scripts/prerender-static.tsx` pre-renders every public route with trailing slashes (`/merge-pdf/index.html`, `/compress-pdf/index.html`, etc.), complete with `<title>`, `<meta name="description">`, canonical URLs, Open Graph/Twitter cards, JSON-LD structured data, headings, 350–500 word practical guides, 4 FAQs per tool, breadcrumbs, related links, `sitemap.xml`, `robots.txt`, and `404.html` into `out/` (and `dist/`).
- **Vercel Security & Routing Configuration (`vercel.json`)**:
  Configures `buildCommand: "npm run build"`, `outputDirectory: "out"`, `trailingSlash: true`, `cleanUrls: true`, immutable caching for `/assets/*` and `/pdf.worker.min.mjs`, and tested security headers (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) compatible with local PDF.js workers, `blob:` image/PDF previews and downloads, and optional consented Google Analytics.
- **Central Typed Tool Registry (`src/data/toolsRegistry.ts`)**:
  Single source of truth for all 10 tools (slug, name, category, search aliases, target keyword, title, meta description, intro, 4 FAQs, related tools, and guide content). Adding a tool to the registry automatically updates navigation, homepage cards, related tools, and `sitemap.xml`.
- **Separated Pure Processing Modules (`src/lib/`)**:
  - `src/lib/pdfProcessing.ts`: Lazy-loads `pdf-lib` (`1.17.1`) and `pdfjs-dist` (`6.5.438`) with self-hosted `/pdf.worker.min.mjs` matching the exact library version.
  - `src/lib/imageProcessing.ts`: Browser image decoding validation, bounded binary search over JPEG quality + proportional dimension reduction, multi-mode image resizing with real `blob.type` MIME detection, and 300 DPI physical sizing (`mm`/`in` to `px` and PDF `pt`) for passport crops and printable A4 / 4×6 inch PDF sheets.
  - `src/lib/ageCalculator.ts`: Pure date-only calendar arithmetic avoiding timezone/DST bugs, handling leap years, Feb 29 birthdays (documented Feb 28 non-leap convention), month-end clamping, future dates, and invalid inputs.
  - `src/lib/wordCounter.ts`: Unicode-aware (`\p{L}`, `\p{N}`) word/character/sentence/paragraph counter and stop-word-filtered Top 10 keyword density analyzer.
  - `src/lib/qrPayload.ts`: Static QR payload builder with WiFi field escaping (`\`, `;`, `,`, `:`, `"`) and WCAG relative luminance contrast checking.
  - `src/lib/urduKeyboardMap.ts`: Phonetic English-to-Urdu key mapping and cursor/selection preservation helpers (`insertAtSelection`, `backspaceAtSelection`) paired with self-hosted `Noto Naskh Arabic`.
- **Internal Launch Report & 30-Day Content Plan (`docs/LAUNCH_REPORT_AND_CONTENT_PLAN.md`)**:
  Contains the environment configuration flags, post-launch checklist, and the unpublished 30-day editorial content plan outside public routes and `sitemap.xml`.

---

## 3. Known Technical Limitations & Honest Disclosures

1. **Compress PDF Rasterization**: Browser-based PDF compression renders each page to an HTML5 Canvas via PDF.js and re-encodes it as a JPEG inside a rebuilt PDF. Selectable/searchable text, hyperlinks, bookmarks, and interactive forms are not preserved. Pure vector text PDFs may become larger when rasterized; the tool detects this honestly and advises keeping the original.
2. **Merge PDF Signatures**: Merging copies pages into a new PDF container, which invalidates cryptographic digital signatures and may omit interactive document-level scripts.
3. **Passport Photo Background Fill**: Automatic AI background removal is not included. The background color picker only fills transparent regions (e.g., pre-cut transparent PNGs).
4. **Contact Email Configuration**: Configured to `admin@playbeatdigital.store` in `.env`, `.env.example`, and `siteConfig`. `/contact/` displays the active verified mailbox with copy and mailto actions.
5. **Build-Time Environment Variables**: Public variables (`NEXT_PUBLIC_*` / `VITE_*`) are embedded at build time. Modifying them in Vercel Project Settings requires triggering a new deployment build.

---

## 4. GitHub + Vercel Deployment & Custom Domain (`playbeatdigital.store`)

### A. Push to GitHub & Import into Vercel
1. Push this repository (including `package.json`, `package-lock.json`, `vercel.json`, and `.env.example`) to your GitHub repository.
2. Sign in to the **Vercel Dashboard** → **Add New...** → **Project** → Import your GitHub repository.
3. Vercel automatically reads `vercel.json` at the root of the repository, which configures:
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`
   - **Trailing Slash**: `true` (`trailingSlash: true`)
   - **Security Headers & CSP**: Applied automatically to all routes (`/(.*)`), `/assets/(.*)`, and `/pdf.worker.min.mjs`.
4. Under **Environment Variables** in Vercel Project Settings, configure your build-time variables:
   - `NEXT_PUBLIC_SITE_URL` = `https://playbeatdigital.store`
   - `VITE_SITE_URL` = `https://playbeatdigital.store`
   - `NEXT_PUBLIC_CONTACT_EMAIL` = *(your verified support email)*
   - `VITE_CONTACT_EMAIL` = *(your verified support email)*
   - `NEXT_PUBLIC_GA_ID` = *(optional, e.g. `G-XXXXXXXXXX`)*
   - `NEXT_PUBLIC_GSC_VERIFICATION` = *(optional Google Search Console token)*
   - `NEXT_PUBLIC_ADS_ENABLED` = `false`
5. Click **Deploy**. Every push to your `main` branch on GitHub will automatically build and deploy on Vercel, and pull requests will receive preview deployment URLs.

### B. Custom Domain Setup for `playbeatdigital.store` on Vercel
1. In your Vercel project dashboard, go to **Settings → Domains**.
2. Enter `playbeatdigital.store` and click **Add**.
3. Choose the recommended option to add both `playbeatdigital.store` (Primary) and `www.playbeatdigital.store` (redirecting 308/301 to `playbeatdigital.store`).
4. At your DNS provider, configure the records shown by Vercel:
   - **Apex domain (`@` / `playbeatdigital.store`)**: `A` record pointing to `76.76.21.21`
   - **Subdomain (`www`)**: `CNAME` record pointing to `cname.vercel-dns.com.`
5. Once DNS propagates, Vercel automatically provisions and renews the Let's Encrypt SSL/TLS certificate over HTTPS.

---

## 5. Post-Launch Checklist

See [`docs/LAUNCH_REPORT_AND_CONTENT_PLAN.md`](./docs/LAUNCH_REPORT_AND_CONTENT_PLAN.md) for the complete post-launch checklist and the 30-day editorial content plan.
