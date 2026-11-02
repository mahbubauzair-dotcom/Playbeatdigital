import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { ToolDefinition } from '../data/toolsRegistry';
import { AdSlot } from './AdSlot';
import { Breadcrumbs } from './Breadcrumbs';
import { FAQ } from './FAQ';
import { RelatedTools } from './RelatedTools';
import { SeoSchema } from './SeoSchema';

interface ToolLayoutProps {
  tool: ToolDefinition;
  onNavigate: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  onNavigate,
  children,
}) => {
  const canonicalPath = `/${tool.slug}/`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <SeoSchema
        title={tool.title}
        description={tool.metaDescription}
        canonicalPath={canonicalPath}
        breadcrumbs={[{ label: tool.name, href: canonicalPath }]}
        webAppTool={{
          name: tool.name,
          description: tool.metaDescription,
          category: tool.category,
        }}
      />

      <Breadcrumbs
        items={[{ label: tool.name, href: canonicalPath }]}
        onNavigate={onNavigate}
      />

      {/* Compact Tool Header keeping primary workspace near top on mobile */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
          {tool.h1}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {tool.intro}
        </p>

        {/* Privacy & File Limits Notice */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-medium text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{siteConfig.privacyNotice}</span>
          </span>
          {tool.acceptedFormatsLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span>Formats: {tool.acceptedFormatsLabel}</span>
            </>
          )}
          {tool.limitsSummary && (
            <>
              <span aria-hidden="true">·</span>
              <span>Limits: {tool.limitsSummary}</span>
            </>
          )}
        </div>
      </div>

      {/* Top Ad Slot (hidden on mobile when enabled, completely collapsed when disabled) */}
      <AdSlot id="ad-slot-top" />

      {/* Primary Interactive Tool Workspace Card */}
      <section
        aria-label={`${tool.name} workspace`}
        className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 shadow-xl shadow-indigo-500/5 dark:shadow-indigo-950/20"
      >
        {children}
      </section>

      {/* Mid Ad Slot */}
      <AdSlot id="ad-slot-mid" />

      {/* Practical Guide, Step-by-Step Instructions, Tips & Common Mistakes */}
      <article className="mt-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {tool.guide.heading}
          </h2>
          <div className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {tool.guide.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
              Step-by-Step Instructions
            </h3>
            <ol className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
              {tool.guide.steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
              Practical Tips &amp; Common Mistakes
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
              {tool.guide.tipsAndMistakes.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Example Upload Size Table where applicable */}
        {tool.guide.exampleTable && tool.guide.exampleTable.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {tool.guide.exampleTableTitle}
            </h3>
            {tool.guide.exampleTableDisclaimer && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {tool.guide.exampleTableDisclaimer}
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <th className="py-2.5 pr-4 font-semibold">Document / Photo Type</th>
                    <th className="py-2.5 px-4 font-semibold tabular-nums">Example Size / Range</th>
                    <th className="py-2.5 px-4 font-semibold">Format</th>
                    <th className="py-2.5 pl-4 font-semibold">Practical Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-600 dark:text-slate-300">
                  {tool.guide.exampleTable.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-slate-100">
                        {row.useCase}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums whitespace-nowrap">
                        {row.exampleRange}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">{row.recommendedFormat}</td>
                      <td className="py-2.5 pl-4">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </article>

      {/* Four Visible FAQs */}
      <FAQ items={tool.faqs} />

      {/* Related Tools */}
      <RelatedTools currentSlug={tool.slug} onNavigate={onNavigate} />

      {/* Bottom Ad Slot */}
      <AdSlot id="ad-slot-bottom" />
    </div>
  );
};
