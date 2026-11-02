import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';

interface FooterProps {
  onNavigate: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
  onOpenConsentModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenConsentModal }) => {
  const pdfTools = TOOLS_REGISTRY.filter((t) => t.category === 'PDF Tools');
  const imageTools = TOOLS_REGISTRY.filter((t) => t.category === 'Image Tools');
  const utilityTools = TOOLS_REGISTRY.filter((t) => t.category === 'Utility Tools');

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand */}
          <div className="lg:col-span-2">
            <a
              href="/"
              onClick={(e) => onNavigate('/', e)}
              className="inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 rounded-md py-0.5 group"
              aria-label="PlayBeat Tools Home"
            >
              <img
                src="/logo.png"
                alt="PlayBeat Tools"
                className="h-8 w-auto object-contain dark:hidden transition-transform duration-200 group-hover:scale-[1.02]"
                width="144"
                height="32"
              />
              <img
                src="/logo-dark.png"
                alt="PlayBeat Tools"
                className="h-8 w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-[1.02]"
                width="144"
                height="32"
              />
            </a>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {siteConfig.brandPromise}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {siteConfig.privacyNotice} Built for students, job seekers, and applicants preparing online forms in Pakistan, India, and beyond.
            </p>
          </div>

          {/* Column 2: PDF & Image Tools */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">
              PDF &amp; Image Tools
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {[...pdfTools, ...imageTools].map((tool) => (
                <li key={tool.slug}>
                  <a
                    href={`/${tool.slug}/`}
                    onClick={(e) => onNavigate(`/${tool.slug}/`, e)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {tool.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Utility Tools & Guides */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Utility Tools &amp; Guides
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {utilityTools.map((tool) => (
                <li key={tool.slug}>
                  <a
                    href={`/${tool.slug}/`}
                    onClick={(e) => onNavigate(`/${tool.slug}/`, e)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {tool.name}
                  </a>
                </li>
              ))}
              <li className="pt-1">
                <a
                  href="/blog/"
                  onClick={(e) => onNavigate('/blog/', e)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                >
                  Application Guides (Blog)
                </a>
              </li>
              <li>
                <a
                  href="/blog/reduce-photo-to-50kb-online-application/"
                  onClick={(e) => onNavigate('/blog/reduce-photo-to-50kb-online-application/', e)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Photo to 50KB Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Company */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">
              About &amp; Legal
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="/about/"
                  onClick={(e) => onNavigate('/about/', e)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  About PlayBeat Tools
                </a>
              </li>
              <li>
                <a
                  href="/contact/"
                  onClick={(e) => onNavigate('/contact/', e)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy/"
                  onClick={(e) => onNavigate('/privacy-policy/', e)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms/"
                  onClick={(e) => onNavigate('/terms/', e)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="/disclaimer/"
                  onClick={(e) => onNavigate('/disclaimer/', e)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Disclaimer
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenConsentModal}
                  className="text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline cursor-pointer"
                >
                  Analytics Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.siteName} (playbeatdigital.store). Free browser-based utilities.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/sitemap.xml" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              Sitemap XML
            </a>
            <span aria-hidden="true">·</span>
            <a href="/robots.txt" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              robots.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
