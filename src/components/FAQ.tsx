import React from 'react';
import { ToolFAQ } from '../data/toolsRegistry';

interface FAQProps {
  title?: string;
  items: ToolFAQ[];
}

export const FAQ: React.FC<FAQProps> = ({
  title = 'Frequently Asked Questions',
  items,
}) => {
  return (
    <section aria-labelledby="faq-section-heading" className="mt-10">
      <h2
        id="faq-section-heading"
        className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4"
      >
        {title}
      </h2>
      <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {items.map((faq, idx) => (
          <div key={idx} className="p-5">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
