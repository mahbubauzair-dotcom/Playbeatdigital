import React, { useState, useEffect } from 'react';
import { AdminProfile, supabase } from '../lib/supabaseClient';
import {
  SiteSettingsState,
  fetchCurrentSettings,
  AUTOMATIC_DEFAULTS,
} from '../lib/settingsStore';
import { SeoAuditReport, runSeoAudit } from '../lib/seoAuditEngine';
import { GscStatusResponse, getGscData } from '../lib/gscService';
import { Ga4StatusResponse, getGa4Data } from '../lib/ga4Service';

import { OverviewTab } from './tabs/OverviewTab';
import { SettingsTab } from './tabs/SettingsTab';
import { ToolsTab } from './tabs/ToolsTab';
import { BlogTab } from './tabs/BlogTab';
import { SeoTab } from './tabs/SeoTab';
import { AuditTab } from './tabs/AuditTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { PublishTab } from './tabs/PublishTab';

import {
  LayoutDashboard,
  Sliders,
  Wrench,
  BookOpen,
  Search,
  ShieldCheck,
  Activity,
  UploadCloud,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Layers,
} from 'lucide-react';

interface AdminDashboardProps {
  admin: AdminProfile;
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Settings & Overrides state
  const [overrides, setOverrides] = useState<Partial<SiteSettingsState>>({});
  const [effective, setEffective] = useState<SiteSettingsState>(AUTOMATIC_DEFAULTS);
  const [isDraft, setIsDraft] = useState(false);

  // SEO Audit & Integrations state
  const [auditReport, setAuditReport] = useState<SeoAuditReport | null>(null);
  const [gscData, setGscData] = useState<GscStatusResponse | null>(null);
  const [ga4Data, setGa4Data] = useState<Ga4StatusResponse | null>(null);

  const loadAllData = async () => {
    // 1. Settings
    const settings = await fetchCurrentSettings();
    setOverrides(settings.overrides);
    setEffective(settings.effective);
    setIsDraft(settings.isDraft);

    // 2. Initial Audit
    try {
      const html = document.documentElement.outerHTML;
      const initialAudit = runSeoAudit(html, 'https://playbeatdigital.store/', 'Local Build (Pre-rendered)');
      setAuditReport(initialAudit);
    } catch {}

    // 3. GSC & GA4
    const gsc = await getGscData();
    setGscData(gsc);

    const ga4 = await getGa4Data();
    setGa4Data(ga4);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSignOutClick = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'settings', label: 'Site Settings', icon: Sliders },
    { id: 'tools', label: 'Tool Content', icon: Wrench },
    { id: 'blog', label: 'Blog & Guides', icon: BookOpen },
    { id: 'seo', label: 'SEO Metadata', icon: Search },
    { id: 'audit', label: 'SEO Audit', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics & Search', icon: Activity },
    { id: 'publish', label: 'Publish & Deploy', icon: UploadCloud },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <a href="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="PlayBeat Tools"
                className="h-6 w-auto dark:hidden"
                width="120"
                height="28"
              />
              <img
                src="/logo-dark.png"
                alt="PlayBeat Tools"
                className="h-6 w-auto hidden dark:block"
                width="120"
                height="28"
              />
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                / Admin
              </span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {Object.keys(overrides).length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <Layers className="w-3.5 h-3.5" />
                {Object.keys(overrides).length} Draft Overrides
              </span>
            )}
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {admin.email}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Role: {admin.role}
              </span>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Live Site <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={handleSignOutClick}
              className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside
          className={`md:w-56 shrink-0 ${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:block border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pr-0 md:pr-4 pb-4 md:pb-0`}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <OverviewTab
              draftCount={Object.keys(overrides).length}
              auditReport={auditReport}
              gscData={gscData}
              ga4Data={ga4Data}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              currentOverrides={overrides}
              onOverridesUpdated={(newOverrides) => {
                setOverrides(newOverrides);
                loadAllData();
              }}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'tools' && <ToolsTab />}

          {activeTab === 'blog' && <BlogTab />}

          {activeTab === 'seo' && <SeoTab />}

          {activeTab === 'audit' && (
            <AuditTab initialReport={auditReport} onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              gscData={gscData}
              ga4Data={ga4Data}
              onRefreshGsc={async () => {
                const res = await getGscData();
                setGscData(res);
              }}
              onRefreshGa4={async () => {
                const res = await getGa4Data();
                setGa4Data(res);
              }}
            />
          )}

          {activeTab === 'publish' && (
            <PublishTab
              currentOverrides={overrides}
              effectiveSettings={effective}
              onRefreshOverrides={loadAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
