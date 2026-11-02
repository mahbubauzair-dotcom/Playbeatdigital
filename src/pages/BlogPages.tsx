import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoSchema } from '../components/SeoSchema';
import { ToolCard } from '../components/ToolCard';
import { BLOG_ARTICLES, BlogArticle } from '../data/blogRegistry';
import { TOOL_BY_SLUG } from '../data/toolsRegistry';

interface BlogIndexProps {
  onNavigate: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const BlogIndexPage: React.FC<BlogIndexProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoSchema
        title="Application & File Preparation Guides – PlayBeat Tools Blog"
        description="Practical step-by-step guides on preparing photos, signatures, and PDF documents for online application forms in Pakistan and India."
        canonicalPath="/blog/"
        breadcrumbs={[{ label: 'Guides & Blog', href: '/blog/' }]}
      />

      <Breadcrumbs
        items={[{ label: 'Guides & Blog', href: '/blog/' }]}
        onNavigate={onNavigate}
      />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Application &amp; Document Preparation Guides
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Practical tutorials for resizing photos, compressing PDFs, and preparing files for online admissions and recruitment portals.
        </p>
      </div>

      <div className="space-y-4">
        {BLOG_ARTICLES.map((article) => {
          const href = `/blog/${article.slug}/`;
          return (
            <article
              key={article.slug}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{article.category}</span>
                <span aria-hidden="true">·</span>
                <span>Published {article.publishedDate}</span>
                <span aria-hidden="true">·</span>
                <span>{article.readingTimeMinutes} min read</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                <a
                  href={href}
                  onClick={(e) => onNavigate(href, e)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {article.title}
                </a>
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {article.summary}
              </p>

              <div className="pt-2">
                <a
                  href={href}
                  onClick={(e) => onNavigate(href, e)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Read complete guide</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

interface BlogArticlePageProps {
  article: BlogArticle;
  onNavigate: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const BlogArticlePage: React.FC<BlogArticlePageProps> = ({
  article,
  onNavigate,
}) => {
  const canonicalPath = `/blog/${article.slug}/`;
  const relatedTools = article.relatedToolSlugs
    .map((slug) => TOOL_BY_SLUG[slug])
    .filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoSchema
        title={article.metaTitle}
        description={article.metaDescription}
        canonicalPath={canonicalPath}
        breadcrumbs={[
          { label: 'Guides & Blog', href: '/blog/' },
          { label: article.title, href: canonicalPath },
        ]}
        articleData={{
          headline: article.title,
          description: article.metaDescription,
          datePublished: article.publishedDate,
          dateModified: article.updatedDate,
        }}
      />

      <Breadcrumbs
        items={[
          { label: 'Guides & Blog', href: '/blog/' },
          { label: article.title, href: canonicalPath },
        ]}
        onNavigate={onNavigate}
      />

      <article className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>Published {article.publishedDate}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readingTimeMinutes} min read</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
            {article.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {article.summary}
          </p>
        </header>

        <div className="space-y-6">
          {article.sections.map((sec, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  {p}
                </p>
              ))}
              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300 pt-1">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>

      {relatedTools.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Tools Mentioned in This Guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
