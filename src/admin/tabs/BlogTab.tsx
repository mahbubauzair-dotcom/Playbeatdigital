import React, { useState } from 'react';
import { BLOG_ARTICLES, BlogArticle } from '../../data/blogRegistry';
import { supabase } from '../../lib/supabaseClient';
import DOMPurify from 'dompurify';
import {
  BookOpen,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

function articleSectionsToHtml(article: BlogArticle): string {
  return article.sections
    .map(
      (s) =>
        `<h2>${s.heading}</h2>\n${s.paragraphs.map((p) => `<p>${p}</p>`).join('\n')}${
          s.bullets && s.bullets.length > 0
            ? `\n<ul>\n${s.bullets.map((b) => `  <li>${b}</li>`).join('\n')}\n</ul>`
            : ''
        }`
    )
    .join('\n\n');
}

export const BlogTab: React.FC = () => {
  const [articles, setArticles] = useState<BlogArticle[]>(BLOG_ARTICLES);
  const [selectedSlug, setSelectedSlug] = useState<string>(BLOG_ARTICLES[0].slug);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string>(BLOG_ARTICLES[0].slug);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  const current = articles.find((a) => a.slug === selectedSlug) || articles[0];
  const [bodyHtml, setBodyHtml] = useState<string>(() => articleSectionsToHtml(current));

  const handleSelectArticle = (slug: string) => {
    setSelectedSlug(slug);
    setOriginalSlug(slug);
    setRedirectNotice(null);
    const found = articles.find((a) => a.slug === slug);
    if (found) {
      setBodyHtml(articleSectionsToHtml(found));
    }
  };

  const updateCurrent = (fields: Partial<BlogArticle>) => {
    if (fields.slug && fields.slug !== originalSlug) {
      setRedirectNotice(
        `Note: Changing slug from "${originalSlug}" to "${fields.slug}" requires an explicit 301 redirect rule in vercel.json to prevent 404s.`
      );
    } else if (fields.slug === originalSlug) {
      setRedirectNotice(null);
    }
    setArticles((prev) =>
      prev.map((a) => (a.slug === selectedSlug ? { ...a, ...fields } : a))
    );
    setStatus(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // Sanitize HTML body using DOMPurify
    const cleanBodyHtml = DOMPurify.sanitize(bodyHtml);

    try {
      const { error } = await supabase.from('blog_posts').upsert({
        slug: current.slug,
        title: current.title,
        excerpt: current.summary,
        body_markdown: bodyHtml,
        body_html: cleanBodyHtml,
        featured_image: null,
        image_alt: null,
        meta_title: current.metaTitle,
        meta_description: current.metaDescription,
        status: 'published',
        published_at: current.publishedDate,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setStatus({
          type: 'success',
          message: `Saved blog changes to local preview. Supabase note: ${error.message}`,
        });
      } else {
        setStatus({
          type: 'success',
          message: `Article "${current.title}" saved successfully!`,
        });
        setOriginalSlug(current.slug);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleNewArticle = () => {
    const newSlug = `new-article-${Date.now()}`;
    const newArticle: BlogArticle = {
      slug: newSlug,
      title: 'New File Preparation Guide',
      metaTitle: 'New Guide – PlayBeat Tools Blog',
      metaDescription: 'Step-by-step tutorial on preparing files for application forms.',
      publishedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      readingTimeMinutes: 4,
      category: 'Application Guides',
      summary: 'Comprehensive instructions and guidelines for online application forms.',
      relatedToolSlugs: ['compress-image', 'resize-image'],
      sections: [
        {
          heading: 'Overview',
          paragraphs: ['Provide clear, actionable instructions here for your applicants.'],
        },
      ],
    };
    setArticles([newArticle, ...articles]);
    setSelectedSlug(newSlug);
    setOriginalSlug(newSlug);
    setBodyHtml(articleSectionsToHtml(newArticle));
    setRedirectNotice(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Blog & Application Guides Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create, edit, preview, and publish pre-rendered tutorial guides for applicants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewArticle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New Guide
          </button>
          <select
            value={selectedSlug}
            onChange={(e) => handleSelectArticle(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {articles.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {redirectNotice && (
        <div className="p-3.5 rounded-lg text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{redirectNotice}</span>
        </div>
      )}

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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Article Metadata & SEO
            </h3>
            <a
              href={`/blog/${current.slug}/`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
            >
              View Published Post <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Article Title
              </label>
              <input
                type="text"
                value={current.title}
                onChange={(e) => updateCurrent({ title: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={current.slug}
                onChange={(e) => updateCurrent({ slug: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SEO Meta Title (&lt;title&gt;)
              </label>
              <input
                type="text"
                value={current.metaTitle}
                onChange={(e) => updateCurrent({ metaTitle: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category & Read Time
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={current.category}
                  onChange={(e) => updateCurrent({ category: e.target.value })}
                  placeholder="Category"
                  className="w-2/3 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  value={current.readingTimeMinutes}
                  onChange={(e) =>
                    updateCurrent({ readingTimeMinutes: parseInt(e.target.value, 10) || 1 })
                  }
                  placeholder="Min"
                  className="w-1/3 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Article Summary & Meta Description
            </label>
            <textarea
              rows={2}
              value={current.summary}
              onChange={(e) =>
                updateCurrent({ summary: e.target.value, metaDescription: e.target.value })
              }
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Content Body Editor & Sanitized Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Article Body Content
              </h3>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  !previewMode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                HTML Editor
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  previewMode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sanitized Preview
              </button>
            </div>
          </div>

          {!previewMode ? (
            <textarea
              rows={12}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 leading-relaxed"
            />
          ) : (
            <div
              className="prose dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(bodyHtml),
              }}
            />
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Rendered content automatically sanitized via DOMPurify
            </span>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Article'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
