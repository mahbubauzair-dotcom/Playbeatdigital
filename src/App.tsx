/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ConsentControls } from './components/ConsentControls';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ToolLayout } from './components/ToolLayout';
import { getBlogArticleBySlug } from './data/blogRegistry';
import { TOOL_BY_SLUG, ToolSlug } from './data/toolsRegistry';
import { BlogArticlePage, BlogIndexPage } from './pages/BlogPages';
import { HomePage } from './pages/HomePage';
import {
  AboutPage,
  ContactPage,
  DisclaimerPage,
  NotFoundPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/StaticPages';

// Lazy-loaded interactive tool workspaces so heavy PDF/QR libraries are never bundled into the homepage
const MergePdfTool = lazy(() =>
  import('./tools/MergePdfTool').then((m) => ({ default: m.MergePdfTool }))
);
const CompressPdfTool = lazy(() =>
  import('./tools/CompressPdfTool').then((m) => ({ default: m.CompressPdfTool }))
);
const CompressImageTool = lazy(() =>
  import('./tools/CompressImageTool').then((m) => ({ default: m.CompressImageTool }))
);
const JpgToPdfTool = lazy(() =>
  import('./tools/JpgToPdfTool').then((m) => ({ default: m.JpgToPdfTool }))
);
const PassportPhotoMakerTool = lazy(() =>
  import('./tools/PassportPhotoMakerTool').then((m) => ({
    default: m.PassportPhotoMakerTool,
  }))
);
const QrCodeGeneratorTool = lazy(() =>
  import('./tools/QrCodeGeneratorTool').then((m) => ({
    default: m.QrCodeGeneratorTool,
  }))
);
const AgeCalculatorTool = lazy(() =>
  import('./tools/AgeCalculatorTool').then((m) => ({
    default: m.AgeCalculatorTool,
  }))
);
const WordCounterTool = lazy(() =>
  import('./tools/WordCounterTool').then((m) => ({
    default: m.WordCounterTool,
  }))
);
const ResizeImageTool = lazy(() =>
  import('./tools/ResizeImageTool').then((m) => ({
    default: m.ResizeImageTool,
  }))
);
const UrduKeyboardTool = lazy(() =>
  import('./tools/UrduKeyboardTool').then((m) => ({
    default: m.UrduKeyboardTool,
  }))
);
const AdminPage = lazy(() =>
  import('./admin/AdminPage').then((m) => ({ default: m.AdminPage }))
);

export function normalizePathname(rawPath: string): string {
  const withoutHashOrQuery = rawPath.split('#')[0].split('?')[0] || '/';
  if (withoutHashOrQuery === '/') return '/';
  return `${withoutHashOrQuery.replace(/\/+$/, '')}/`;
}

function renderToolWorkspace(slug: ToolSlug) {
  switch (slug) {
    case 'merge-pdf':
      return <MergePdfTool />;
    case 'compress-pdf':
      return <CompressPdfTool />;
    case 'compress-image':
      return <CompressImageTool />;
    case 'jpg-to-pdf':
      return <JpgToPdfTool />;
    case 'passport-photo-maker':
      return <PassportPhotoMakerTool />;
    case 'qr-code-generator':
      return <QrCodeGeneratorTool />;
    case 'age-calculator':
      return <AgeCalculatorTool />;
    case 'word-counter':
      return <WordCounterTool />;
    case 'resize-image':
      return <ResizeImageTool />;
    case 'urdu-keyboard':
      return <UrduKeyboardTool />;
  }
}

export interface AppProps {
  initialPath?: string;
}

export default function App({ initialPath }: AppProps) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialPath) return normalizePathname(initialPath);
    if (typeof window !== 'undefined') {
      return normalizePathname(window.location.pathname);
    }
    return '/';
  });

  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setCurrentPath(normalizePathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (
    href: string,
    e?: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (e) {
      // Allow Ctrl/Cmd click to open in new tab naturally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
    }

    if (typeof window === 'undefined') return;

    // Handle hash anchor on homepage (e.g., /#tools-directory)
    if (href.startsWith('/#')) {
      const hash = href.slice(1);
      if (currentPath !== '/') {
        window.history.pushState({}, '', '/');
        setCurrentPath('/');
        setTimeout(() => {
          const el = document.querySelector(hash);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const nextNormalized = normalizePathname(href);
    window.history.pushState({}, '', nextNormalized);
    setCurrentPath(nextNormalized);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const renderRoute = () => {
    if (currentPath === '/') {
      return <HomePage onNavigate={handleNavigate} />;
    }

    // Check if route matches one of the 10 tools in TOOLS_REGISTRY
    const trimmedSlug = currentPath.replace(/^\/+|\/+$/g, '') as ToolSlug;
    const matchedTool = TOOL_BY_SLUG[trimmedSlug];
    if (matchedTool) {
      return (
        <ToolLayout tool={matchedTool} onNavigate={handleNavigate}>
          <Suspense
            fallback={
              <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                Loading {matchedTool.name} workspace...
              </div>
            }
          >
            {renderToolWorkspace(matchedTool.slug)}
          </Suspense>
        </ToolLayout>
      );
    }

    if (currentPath === '/blog/') {
      return <BlogIndexPage onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith('/blog/')) {
      const articleSlug = currentPath.replace(/^\/blog\/|\/+$/g, '');
      const article = getBlogArticleBySlug(articleSlug);
      if (article) {
        return <BlogArticlePage article={article} onNavigate={handleNavigate} />;
      }
    }

    if (currentPath === '/about/') {
      return <AboutPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/contact/') {
      return <ContactPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/privacy-policy/') {
      return <PrivacyPolicyPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/terms/') {
      return <TermsPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/disclaimer/') {
      return <DisclaimerPage onNavigate={handleNavigate} />;
    }

    if (currentPath === '/admin/' || currentPath.startsWith('/admin/')) {
      return (
        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xs text-slate-500">
              Loading Admin Portal...
            </div>
          }
        >
          <AdminPage />
        </Suspense>
      );
    }

    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  const isAdminRoute = currentPath === '/admin/' || currentPath.startsWith('/admin/');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {renderRoute()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-indigo-600 focus:text-white focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>

      <Header currentPath={currentPath} onNavigate={handleNavigate} />

      <main id="main-content" className="flex-1">
        {renderRoute()}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenConsentModal={() => setShowConsentModal(true)}
      />

      <ConsentControls
        showManageModal={showConsentModal}
        onCloseManageModal={() => setShowConsentModal(false)}
      />
    </div>
  );
}
