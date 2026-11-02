import React from 'react';
import { ToolSlug, getRelatedTools } from '../data/toolsRegistry';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  currentSlug: ToolSlug;
  onNavigate: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({
  currentSlug,
  onNavigate,
}) => {
  const related = getRelatedTools(currentSlug);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading" className="mt-12">
      <h2
        id="related-tools-heading"
        className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4"
      >
        Related Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((tool, idx) => (
          <ToolCard key={tool.slug} tool={tool} index={idx} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
};
