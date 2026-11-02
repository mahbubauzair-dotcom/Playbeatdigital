import React, { useMemo, useState } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { calculateAge, getTodayISO } from '../lib/ageCalculator';

export const AgeCalculatorTool: React.FC = () => {
  const todayIso = useMemo(() => getTodayISO(), []);
  const [birthDate, setBirthDate] = useState('2000-01-15');
  const [targetDate, setTargetDate] = useState(todayIso);

  const result = useMemo(
    () => calculateAge(birthDate, targetDate),
    [birthDate, targetDate]
  );

  const handleReset = () => {
    setBirthDate('2000-01-15');
    setTargetDate(todayIso);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="dob-input"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Date of Birth
          </label>
          <input
            id="dob-input"
            type="date"
            value={birthDate}
            max="2200-12-31"
            min="1900-01-01"
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="target-date-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Calculate Age On
            </label>
            <button
              type="button"
              onClick={() => setTargetDate(todayIso)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Set to Today
            </button>
          </div>
          <input
            id="target-date-input"
            type="date"
            value={targetDate}
            max="2200-12-31"
            min="1900-01-01"
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {!result.valid ? (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-sm text-red-800 dark:text-red-200 font-medium"
        >
          {result.error}
        </div>
      ) : (
        <div aria-live="polite" className="space-y-4">
          {/* Primary Completed Age Output */}
          <div className="p-5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/70">
            <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
              Exact Completed Age on {targetDate}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {result.years}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {result.years === 1 ? 'Year' : 'Years'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {result.months}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {result.months === 1 ? 'Month' : 'Months'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {result.days}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {result.days === 1 ? 'Day' : 'Days'}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Breakdown Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total Elapsed Calendar Days
              </div>
              <div className="mt-1 text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {result.totalDays.toLocaleString()} days
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Day of Birth
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                {result.birthDayOfWeek}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Next Birthday (from {targetDate})
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                {result.isBirthdayToday ? (
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Birthday is on the selected date!
                  </span>
                ) : (
                  <>
                    <span className="font-mono tabular-nums">
                      {result.daysUntilNextBirthday}
                    </span>{' '}
                    {result.daysUntilNextBirthday === 1 ? 'day' : 'days'} ({result.nextBirthdayFormatted})
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Documented February 29 Convention Notice */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">
              Calendar &amp; February 29 Convention:
            </strong>{' '}
            Calculations use date-only calendar arithmetic (ignoring local timezones and daylight-saving changes). For a February 29 birth date, in non-leap years the annual birthday milestone is treated as completed on February 28 (so on March 1 of a non-leap year, age advances to full years + 1 day).
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Tip: Change &ldquo;Calculate Age On&rdquo; to your job advertisement closing date.</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset Dates</span>
        </button>
      </div>
    </div>
  );
};
