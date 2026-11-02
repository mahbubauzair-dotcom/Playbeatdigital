import React, { useMemo, useState } from 'react';
import { Check, Copy, Trash2 } from 'lucide-react';
import { analyzeText } from '../lib/wordCounter';

export const WordCounterTool: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => analyzeText(text), [text]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
    }
  };

  const handleClear = () => {
    setText('');
    setCopied(false);
  };

  return (
    <div className="space-y-5">
      {/* Live Metric Bar */}
      <div
        aria-live="polite"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
      >
        <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
          <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Words</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {stats.words.toLocaleString()}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Characters</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {stats.charactersWithSpaces.toLocaleString()}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">No Spaces</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {stats.charactersWithoutSpaces.toLocaleString()}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Sentences*</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {stats.sentences.toLocaleString()}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Paragraphs</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {stats.paragraphs.toLocaleString()}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Reading Time*</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {stats.readingTimeFormatted}
          </div>
        </div>
      </div>

      {/* Textarea & Action Bar */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label
            htmlFor="word-counter-textarea"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Enter or Paste Your Text Below
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          id="word-counter-textarea"
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your essay, personal statement, cover letter, or application answer here..."
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y"
        />

        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          *Sentence counts and reading time (~200 words/min) are estimates. Entered text is processed in memory and never stored in localStorage or sent over the network.
        </p>
      </div>

      {/* Top 10 Keyword Frequency & Density */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          Top 10 Keywords &amp; Density (Stop Words Filtered)
        </h3>
        {stats.topKeywords.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Start typing meaningful words above to see top keyword frequencies and density percentages.
          </p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <th className="py-2 pr-4 font-semibold">#</th>
                  <th className="py-2 px-4 font-semibold">Keyword</th>
                  <th className="py-2 px-4 font-semibold text-right">Count</th>
                  <th className="py-2 pl-4 font-semibold text-right">Density</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {stats.topKeywords.map((kw, idx) => (
                  <tr key={kw.word}>
                    <td className="py-2 pr-4 font-mono tabular-nums text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {kw.word}
                    </td>
                    <td className="py-2 px-4 font-mono tabular-nums text-right text-slate-700 dark:text-slate-300">
                      {kw.count}
                    </td>
                    <td className="py-2 pl-4 font-mono tabular-nums text-right text-indigo-600 dark:text-indigo-400 font-medium">
                      {kw.densityPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
