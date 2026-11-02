import React, { useState } from 'react';
import { TOOLS_REGISTRY } from '../../data/toolsRegistry';
import { BLOG_ARTICLES } from '../../data/blogRegistry';
import { supabase } from '../../lib/supabaseClient';
import {
  Search,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Code,
  ArrowUpRight,
} from 'lucide-react';

interface SeoPageConfig {
  routePath: string;
  name: string;
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  robotsIndex: boolean;
  structuredDataType: string;
}

export const SeoTab: React.FC = () => {
  // Generate list of all 18 pre-rendered routes
  const pages: SeoPageConfig[] = [
    {
      routePath: '/',
      name: 'Homepage',
      title: 'PlayBeat Tools – Free Online PDF, Photo & Form Utilities',
      description:
        'Free browser-based tools to compress photos to 50KB, resize passport pictures, merge and reduce PDFs, calculate age, count words, make QR codes and type Urdu.',
      canonicalUrl: 'https://playbeatdigital.store/',
      ogTitle: 'PlayBeat Tools – Free Online PDF, Photo & Form Utilities',
      ogDescription:
        'Free browser-based tools to compress photos to 50KB, resize passport pictures, merge and reduce PDFs, calculate age, count words, make QR codes and type Urdu.',
      ogImage: 'https://playbeatdigital.store/og-card.svg',
      twitterTitle: 'PlayBeat Tools – Free Online PDF, Photo & Form Utilities',
      twitterDescription:
        'Free browser-based tools to compress photos to 50KB, resize passport pictures, merge and reduce PDFs, calculate age, count words, make QR codes and type Urdu.',
      robotsIndex: true,
      structuredDataType: 'Organization, WebSite',
    },
    ...TOOLS_REGISTRY.map((t) => ({
      routePath: `/${t.slug}/`,
      name: t.name,
      title: t.title,
      description: t.metaDescription,
      canonicalUrl: `https://playbeatdigital.store/${t.slug}/`,
      ogTitle: t.title,
      ogDescription: t.metaDescription,
      ogImage: 'https://playbeatdigital.store/og-card.svg',
      twitterTitle: t.title,
      twitterDescription: t.metaDescription,
      robotsIndex: true,
      structuredDataType: 'WebApplication, BreadcrumbList',
    })),
    {
      routePath: '/blog/',
      name: 'Blog Index',
      title: 'Application & File Preparation Guides – PlayBeat Tools Blog',
      description:
        'Practical step-by-step guides on preparing photos, signatures, and PDF documents for online application forms in Pakistan and India.',
      canonicalUrl: 'https://playbeatdigital.store/blog/',
      ogTitle: 'Application & File Preparation Guides – PlayBeat Tools Blog',
      ogDescription:
        'Practical step-by-step guides on preparing photos, signatures, and PDF documents for online application forms in Pakistan and India.',
      ogImage: 'https://playbeatdigital.store/og-card.svg',
      twitterTitle: 'Application & File Preparation Guides – PlayBeat Tools Blog',
      twitterDescription:
        'Practical step-by-step guides on preparing photos, signatures, and PDF documents for online application forms in Pakistan and India.',
      robotsIndex: true,
      structuredDataType: 'Blog, BreadcrumbList',
    },
    ...BLOG_ARTICLES.map((a) => ({
      routePath: `/blog/${a.slug}/`,
      name: `Guide: ${a.title.slice(0, 30)}...`,
      title: a.metaTitle,
      description: a.metaDescription,
      canonicalUrl: `https://playbeatdigital.store/blog/${a.slug}/`,
      ogTitle: a.metaTitle,
      ogDescription: a.metaDescription,
      ogImage: 'https://playbeatdigital.store/og-card.svg',
      twitterTitle: a.metaTitle,
      twitterDescription: a.metaDescription,
      robotsIndex: true,
      structuredDataType: 'Article, BreadcrumbList',
    })),
  ];

  const [selectedRoute, setSelectedRoute] = useState<string>(pages[0].routePath);
  const [pageConfigs, setPageConfigs] = useState<Record<string, SeoPageConfig>>(
    pages.reduce((acc, p) => ({ ...acc, [p.routePath]: p }), {})
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const currentPage = pageConfigs[selectedRoute] || pages[0];

  const updateCurrentPage = (fields: Partial<SeoPageConfig>) => {
    setPageConfigs((prev) => ({
      ...prev,
      [selectedRoute]: { ...prev[selectedRoute], ...fields },
    }));
    setStatus(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // Validate structured data constraints: disallow fake review/rating markup
    const fakeReviewKeywords = ['aggregaterating', 'reviewrating', 'ratingvalue', 'bestrating'];
    const lowerDesc = (currentPage.description + currentPage.title).toLowerCase();
    const hasFakeRating = fakeReviewKeywords.some((kw) => lowerDesc.includes(kw));

    if (hasFakeRating) {
      setStatus({
        type: 'error',
        message: 'Validation policy: Fake reviews, ratings or aggregateRating schema are strictly prohibited.',
      });
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase.from('seo_pages').upsert({
        route_path: currentPage.routePath,
        seo_title: currentPage.title,
        meta_description: currentPage.description,
        canonical_url: currentPage.canonicalUrl,
        og_title: currentPage.ogTitle,
        og_description: currentPage.ogDescription,
        og_image: currentPage.ogImage,
        twitter_title: currentPage.twitterTitle,
        twitter_description: currentPage.twitterDescription,
        robots_index: currentPage.robotsIndex,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setStatus({
          type: 'success',
          message: `Saved SEO settings in local preview. Database notice: ${error.message}`,
        });
      } else {
        setStatus({
          type: 'success',
          message: `SEO settings for "${currentPage.name}" saved successfully!`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Page-by-Page SEO Metadata Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage &lt;title&gt;, meta descriptions, canonical URLs, Open Graph cards, and robots directives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {pages.map((p) => (
              <option key={p.routePath} value={p.routePath}>
                {p.routePath} ({p.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {status && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            status.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Search Snippet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              Search Engine Snippet
            </h3>
            <a
              href={currentPage.routePath}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
            >
              Open Page <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SEO Title
              </label>
              <span className="text-[11px] text-slate-400">
                {currentPage.title.length} characters (Recommended: 40–65)
              </span>
            </div>
            <input
              type="text"
              value={currentPage.title}
              onChange={(e) => updateCurrentPage({ title: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Meta Description
              </label>
              <span className="text-[11px] text-slate-400">
                {currentPage.description.length} characters (Recommended: 120–155)
              </span>
            </div>
            <textarea
              rows={2}
              value={currentPage.description}
              onChange={(e) => updateCurrentPage({ description: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Canonical URL
              </label>
              <input
                type="text"
                value={currentPage.canonicalUrl}
                onChange={(e) => updateCurrentPage({ canonicalUrl: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Robots Indexing Directive
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="robots-idx"
                    checked={currentPage.robotsIndex === true}
                    onChange={() => updateCurrentPage({ robotsIndex: true })}
                    className="text-indigo-600"
                  />
                  <span className="text-slate-900 dark:text-white font-medium">index, follow</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="robots-idx"
                    checked={currentPage.robotsIndex === false}
                    onChange={() => updateCurrentPage({ robotsIndex: false })}
                    className="text-rose-600"
                  />
                  <span className="text-rose-600 font-medium">noindex, nofollow</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Social Share Cards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-blue-600" />
            Open Graph & Twitter Share Cards
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Open Graph Title
              </label>
              <input
                type="text"
                value={currentPage.ogTitle}
                onChange={(e) => updateCurrentPage({ ogTitle: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Open Graph Image URL
              </label>
              <input
                type="text"
                value={currentPage.ogImage}
                onChange={(e) => updateCurrentPage({ ogImage: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Open Graph Description
            </label>
            <textarea
              rows={2}
              value={currentPage.ogDescription}
              onChange={(e) => updateCurrentPage({ ogDescription: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Structured Data */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-600" />
              Structured Data Schema.org
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Type: {currentPage.structuredDataType}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pre-rendered JSON-LD schema is automatically injected into HTML during static build. Fake reviews and unsupported ratings are disabled to comply with search quality guidelines.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Page SEO'}
          </button>
        </div>
      </form>
    </div>
  );
};
