import React, { useState } from 'react';
import {
  SiteSettingsState,
  AUTOMATIC_DEFAULTS,
  computeEffective,
  saveDraftSettings,
  validateSetting,
  getContrastRatio,
} from '../../lib/settingsStore';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Palette,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';

interface SettingsTabProps {
  currentOverrides: Partial<SiteSettingsState>;
  onOverridesUpdated: (newOverrides: Partial<SiteSettingsState>) => void;
  onNavigateTab: (tab: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentOverrides,
  onOverridesUpdated,
  onNavigateTab,
}) => {
  const [formData, setFormData] = useState<Partial<SiteSettingsState>>({ ...currentOverrides });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const effective = computeEffective(formData);

  const handleChange = (key: keyof SiteSettingsState, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setFeedback(null);
  };

  const handleResetField = (key: keyof SiteSettingsState) => {
    setFormData((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setFeedback(null);
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all settings to automatic system defaults?')) {
      setFormData({});
      onOverridesUpdated({});
      setFeedback({ type: 'success', message: 'All settings reset to automatic defaults.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // Validate fields
    for (const key of Object.keys(formData) as (keyof SiteSettingsState)[]) {
      const val = formData[key];
      if (val !== undefined && val !== null) {
        const err = validateSetting(key, val);
        if (err && !err.includes('warning')) {
          setFeedback({ type: 'error', message: err });
          setSaving(false);
          return;
        }
      }
    }

    const res = await saveDraftSettings(formData);
    setSaving(false);
    if (res.success) {
      onOverridesUpdated(formData);
      setFeedback({
        type: 'success',
        message: res.persistedInDatabase
          ? 'Draft overrides saved successfully to Supabase database!'
          : 'Draft overrides saved to local preview. Database sync will persist once migration is executed.',
      });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to save settings.' });
    }
  };

  // Helper renderer for a setting row with Automatic, Override, Effective and Reset
  const renderSettingRow = (
    key: keyof SiteSettingsState,
    label: string,
    description: string,
    inputType: 'text' | 'textarea' | 'color' | 'boolean' = 'text'
  ) => {
    const autoVal = AUTOMATIC_DEFAULTS[key];
    const overrideVal = formData[key];
    const effectiveVal = effective[key];
    const isOverridden = overrideVal !== undefined && overrideVal !== null && overrideVal !== '';
    const errorMsg = validateSetting(key, effectiveVal);

    return (
      <div className="py-4 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <label className="text-xs font-semibold text-slate-900 dark:text-white">
              {label}
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-medium ${
                isOverridden
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              Source: {isOverridden ? 'Manual Override' : 'Automatic Default'}
            </span>
            {isOverridden && (
              <button
                type="button"
                onClick={() => handleResetField(key)}
                className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer"
                title="Reset this specific field to automatic default"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {inputType === 'boolean' ? (
          <div className="flex items-center gap-4 text-xs pt-1">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`bool-${key}`}
                checked={overrideVal === undefined}
                onChange={() => handleResetField(key)}
                className="text-indigo-600"
              />
              <span className="text-slate-600 dark:text-slate-400">
                Automatic ({autoVal ? 'True' : 'False'})
              </span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`bool-${key}`}
                checked={overrideVal === true}
                onChange={() => handleChange(key, true)}
                className="text-indigo-600"
              />
              <span className="text-slate-900 dark:text-white font-medium">True</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`bool-${key}`}
                checked={overrideVal === false}
                onChange={() => handleChange(key, false)}
                className="text-indigo-600"
              />
              <span className="text-slate-900 dark:text-white font-medium">False</span>
            </label>
          </div>
        ) : inputType === 'textarea' ? (
          <textarea
            rows={2}
            value={overrideVal !== undefined ? String(overrideVal) : ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={`Automatic default: "${String(autoVal)}"`}
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        ) : inputType === 'color' ? (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={String(effectiveVal)}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
            />
            <input
              type="text"
              value={overrideVal !== undefined ? String(overrideVal) : ''}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`Automatic: ${String(autoVal)}`}
              className="w-48 text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-900 dark:text-white"
            />
            <span className="text-[11px] text-slate-500">
              Contrast on white: {getContrastRatio(String(effectiveVal), '#ffffff')}:1
            </span>
          </div>
        ) : (
          <input
            type="text"
            value={overrideVal !== undefined ? String(overrideVal) : ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={`Automatic default: "${String(autoVal)}"`}
            className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        )}

        {errorMsg && (
          <p
            className={`text-[11px] flex items-center gap-1 ${
              errorMsg.includes('warning')
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMsg}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Site Configuration & Overrides
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatic defaults apply whenever an override field is left blank.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Draft Overrides'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* General Brand & Identity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Brand Identity & Copy
        </h3>
        <p className="text-xs text-slate-500 mb-3">Core website name, slogan, and contact email.</p>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {renderSettingRow('siteName', 'Site Name', 'Displayed in header, titles, and schema.')}
          {renderSettingRow('siteTagline', 'Tagline', 'Brand promise displayed across pages.')}
          {renderSettingRow(
            'contactEmail',
            'Contact Email Address',
            'Must be a valid email for feedback and inquiries.'
          )}
          {renderSettingRow('heroHeading', 'Homepage Hero Heading', 'Main 3D hero title.')}
          {renderSettingRow('heroSubheading', 'Homepage Hero Subheading', 'Supporting description.')}
          {renderSettingRow('footerText', 'Footer Disclaimer', 'Privacy and utility text in footer.')}
        </div>
      </div>

      {/* Visual Identity & Colors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Theme Colors & Contrast Compliance
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Colors are validated for WCAG AA contrast ratio against white backgrounds.
        </p>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {renderSettingRow(
            'primaryColor',
            'Primary Accent Color',
            'Hex code used for buttons and interactive links.',
            'color'
          )}
          {renderSettingRow(
            'accentColor',
            'Secondary Accent Color',
            'Complementary indigo accent.',
            'color'
          )}
          {renderSettingRow('headerLogo', 'Header Logo (Light Mode)', 'Path to brand light logo.')}
          {renderSettingRow(
            'headerLogoDark',
            'Header Logo (Dark Mode)',
            'Path to brand dark mode logo.'
          )}
          {renderSettingRow('faviconPath', 'Favicon ICO Path', 'Standard browser icon path.')}
        </div>
      </div>

      {/* Advertising Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Advertising & Placement Configuration
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          When disabled, ad slots collapse completely with zero blank space.
        </p>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {renderSettingRow(
            'advertisingEnabled',
            'Master Advertising Switch',
            'Controls whether any ad slots render across the website.',
            'boolean'
          )}
          {renderSettingRow(
            'adPlacementTop',
            'Top Banner Slot',
            'Above primary tool workspace.',
            'boolean'
          )}
          {renderSettingRow(
            'adPlacementMid',
            'Mid Content Slot',
            'Between guide and FAQs.',
            'boolean'
          )}
          {renderSettingRow(
            'adPlacementBottom',
            'Bottom Banner Slot',
            'Below related tools.',
            'boolean'
          )}
        </div>
      </div>

      {/* Analytics Measurement */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Analytics Integration
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Respects visitor consent banner. Tracking runs only if visitor clicks Accept.
        </p>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {renderSettingRow(
            'analyticsMeasurementId',
            'GA4 Measurement ID',
            'Format: G-XXXXXXXXXX. Empty leaves analytics dormant.'
          )}
        </div>
      </div>
    </form>
  );
};
