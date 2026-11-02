import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { FAQ } from '../components/FAQ';
import { SeoSchema } from '../components/SeoSchema';
import { ToolCard } from '../components/ToolCard';
import { ThreeHeroScene } from '../components/ThreeHeroScene';
import { TOOLS_REGISTRY, ToolCategory } from '../data/toolsRegistry';

interface HomePageProps {
  onNavigate: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const CATEGORIES: ('All' | ToolCategory)[] = [
  'All',
  'PDF Tools',
  'Image Tools',
  'Utility Tools',
];

const QUICK_SEARCH_ALIASES = [
  'Photo to 50KB',
  'PDF joiner',
  'Passport picture',
  'Date of birth calculator',
  'Urdu typing',
];

const HOMEPAGE_FAQS = [
  {
    question: 'Are my photos and PDF documents uploaded to any server?',
    answer:
      'No. Every file tool on PlayBeat Tools runs locally inside your web browser using HTML5 Canvas, PDF.js, and pdf-lib. Your personal photographs, transcripts, and identity documents never leave your device.',
  },
  {
    question: 'Do I need to create an account or pay to download files?',
    answer:
      'No. PlayBeat Tools is free to use with no signup, no watermarks, and no daily download quotas.',
  },
  {
    question: 'Can I use these tools on an Android phone or iPhone when filling out online forms?',
    answer:
      'Yes. All 10 tools are built for mobile and desktop browsers with touch-friendly upload zones, compact controls, and direct file downloads.',
  },
  {
    question: 'Does PlayBeat Tools guarantee that any government or university portal will accept my file?',
    answer:
      'No utility can guarantee portal acceptance. Every examination board, passport authority, and recruitment system sets its own rules for dimensions, background lighting, and document validity. Always verify the official instructions of your receiving organization.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ToolCategory>('All');

  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'All' || tool.category === selectedCategory;

    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.trim().toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.shortDescription.toLowerCase().includes(q) ||
      tool.targetKeyword.toLowerCase().includes(q) ||
      tool.searchAliases.some((alias) => alias.toLowerCase().includes(q))
    );
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handle3DSelectCategory = (cat: 'All' | ToolCategory) => {
    setSelectedCategory(cat);
    const directorySection = document.getElementById('tools-directory');
    if (directorySection) {
      directorySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      <SeoSchema
        title="PlayBeat Tools – Free Online PDF, Photo & Form Utilities"
        description="Free browser-based tools to compress photos to 50KB, resize passport pictures, merge and reduce PDFs, calculate age, count words, make QR codes and type Urdu."
        canonicalPath="/"
        isHomepage
      />

      {/* Subtle Background Glowing Ambient Spheres (Constrained to prevent viewport scroll overflow) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-10 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl"
        />
        <div
          className="absolute top-40 -right-10 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl"
        />
      </div>

      {/* 1. Modern 3D Animated Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-white/95 via-white/80 to-slate-50/90 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-950/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 md:p-10 shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-950/20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline, Brand Promise & CTAs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} aria-hidden="true" />
              <span>Next-Gen Web Utilities · 100% In-Browser</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Everyday tools. Simple, fast and free.</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 dark:text-slate-300">No signup</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 dark:text-slate-300">Files stay on your device</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
              Free tools for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 dark:from-indigo-400 dark:via-purple-300 dark:to-sky-400 bg-clip-text text-transparent">
                everyday tasks.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Compress photos, prepare PDFs, calculate age and get forms ready—all in your browser. Zero uploads, zero telemetry, instant offline processing.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#tools-directory"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
              >
                <span>Explore all 10 tools</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href="/passport-photo-maker/"
                onClick={(e) => onNavigate('/passport-photo-maker/', e)}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <span>Passport Photo 35×45mm</span>
              </a>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>No signup needed</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Files stay on your device</span>
              </span>
            </div>
          </div>

          {/* Right Column: Interactive 3D Three.js Hero Scene */}
          <div className="lg:col-span-6 relative">
            <ThreeHeroScene onSelectCategory={handle3DSelectCategory} />
          </div>
        </div>
      </section>

      {/* Top Ad Slot (collapsed by default) */}
      <AdSlot id="ad-slot-top" />

      {/* 2 & 3 & 4: Live Tool Search, Category Filters & All 10 3D Tilt Cards */}
      <section id="tools-directory" aria-labelledby="directory-heading" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h2
                id="directory-heading"
                className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              >
                All 10 Browser Utilities
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Your files are processed in your browser and never uploaded.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div
            role="group"
            aria-label="Filter tools by category"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start shadow-inner"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-slate-900/5'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Input + Quick Alias Suggestions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 space-y-3.5 shadow-sm">
          <div className="relative flex items-center">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool name, category, or task (e.g., Photo to 50KB, PDF joiner, Passport picture, Urdu typing)..."
              aria-label="Search tools by name, category, or alias"
              className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 px-2 py-1 rounded-md text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Quick suggestions:</span>
            {QUICK_SEARCH_ALIASES.map((alias, idx) => (
              <React.Fragment key={alias}>
                <button
                  type="button"
                  onClick={() => setSearchQuery(alias)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {alias}
                </button>
                {idx < QUICK_SEARCH_ALIASES.length - 1 && <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 3D Tilt Tool Cards Grid or Friendly Empty State */}
        {filteredTools.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
              No tools matched &ldquo;{searchQuery}&rdquo; in {selectedCategory}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Try searching for terms like &ldquo;50KB&rdquo;, &ldquo;PDF&rdquo;, &ldquo;Passport&rdquo;, &ldquo;Age&rdquo;, or &ldquo;Urdu&rdquo;, or reset the active filters below.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
            >
              Clear Search &amp; Show All 10 Tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* 5. "Get your form files ready" Workflow Section */}
      <section
        aria-labelledby="form-files-ready-heading"
        className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h2
            id="form-files-ready-heading"
            className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
          >
            Get your form files ready
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Submitting an online admission, scholarship, or job application in Pakistan or India? Follow these direct links to prepare every required attachment and field in minutes:
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>1. Candidate Photos &amp; Signatures</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Crop your portrait to 35×45 mm or 2×2 inches at 300 DPI, resize dimensions, and compress to 20KB or 50KB JPEG limits:
            </p>
            <ul className="space-y-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <li>
                <a
                  href="/passport-photo-maker/"
                  onClick={(e) => onNavigate('/passport-photo-maker/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>Passport Photo Maker (35×45mm, 2×2 &amp; Print Sheet)</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
              <li>
                <a
                  href="/compress-image/"
                  onClick={(e) => onNavigate('/compress-image/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>Compress Image to 50KB or 20KB</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
              <li>
                <a
                  href="/resize-image/"
                  onClick={(e) => onNavigate('/resize-image/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>Resize Image by Pixels, Percentage or KB</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              2. Transcripts, Certificates &amp; PDFs
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Turn phone photos of degrees and ID cards into PDFs, combine multiple mark sheets, and shrink scanned PDF sizes:
            </p>
            <ul className="space-y-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <li>
                <a
                  href="/jpg-to-pdf/"
                  onClick={(e) => onNavigate('/jpg-to-pdf/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>JPG to PDF Converter (A4, Letter &amp; Fit)</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
              <li>
                <a
                  href="/merge-pdf/"
                  onClick={(e) => onNavigate('/merge-pdf/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>Merge PDF Online Free</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
              <li>
                <a
                  href="/compress-pdf/"
                  onClick={(e) => onNavigate('/compress-pdf/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>Compress PDF to 100KB, 200KB or 500KB</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              3. Form Details, Essays &amp; Urdu Fields
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verify your exact cutoff age, check personal statement word counts, type Urdu fields, or generate CV QR codes:
            </p>
            <ul className="space-y-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <li>
                <a
                  href="/age-calculator/"
                  onClick={(e) => onNavigate('/age-calculator/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>Age Calculator by Date of Birth</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
              <li>
                <a
                  href="/word-counter/"
                  onClick={(e) => onNavigate('/word-counter/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>Word &amp; Character Counter</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
              <li>
                <a
                  href="/qr-code-generator/"
                  onClick={(e) => onNavigate('/qr-code-generator/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>QR Code Generator (URL, Text, WiFi)</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
              <li>
                <a
                  href="/urdu-keyboard/"
                  onClick={(e) => onNavigate('/urdu-keyboard/', e)}
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <span>Online Urdu Keyboard (Phonetic)</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. "Why PlayBeat Tools?" Value Proposition */}
      <section
        aria-labelledby="why-heading"
        className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-4 shadow-sm"
      >
        <h2
          id="why-heading"
          className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
        >
          Why PlayBeat Tools?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center text-xs">01</span>
              <span>100% Client-Side Privacy</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Files are processed entirely within your web browser using HTML5 Canvas, WebAssembly, and local JavaScript libraries. Your documents and photos are never uploaded to any remote server.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center text-xs">02</span>
              <span>Fast &amp; Free With No Signup</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No account creation, no email signups, no watermarks, and no hidden subscriptions. Open the tool you need and complete your task in seconds.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 inline-flex items-center justify-center text-xs">03</span>
              <span>Tailored for Online Portals</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every tool is tuned for common application requirements in Pakistan and India: exact 50KB image limits, 35×45mm passport dimensions, multi-page PDF merges, and age cutoff dates.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Homepage FAQs */}
      <FAQ items={HOMEPAGE_FAQS} title="Frequently Asked Questions" />

      {/* Bottom Ad Slot (collapsed by default) */}
      <AdSlot id="ad-slot-bottom" />
    </div>
  );
};
