import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';
import { ThemeToggle } from './ThemeToggle';
import { ToolIcon } from './ToolIcon';

interface HeaderProps {
  currentPath: string;
  onNavigate: (href: string, e?: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const filteredTools = quickQuery.trim()
    ? TOOLS_REGISTRY.filter((t) => {
        const q = quickQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.searchAliases.some((a) => a.toLowerCase().includes(q))
        );
      })
    : TOOLS_REGISTRY;

  const handleLinkClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    onNavigate(href, e);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand title */}
        <a
          href="/"
          onClick={(e) => handleLinkClick('/', e)}
          className="inline-flex items-center gap-2 text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 rounded-md"
        >
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center font-bold text-xs sm:text-sm">
            P
          </span>
          <span>PlayBeat Tools</span>
        </a>

        {/* Zone 2: Concise navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href="/#tools-directory"
            onClick={(e) => handleLinkClick('/#tools-directory', e)}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            All Tools
          </a>
          <a
            href="/compress-image/"
            onClick={(e) => handleLinkClick('/compress-image/', e)}
            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
              currentPath.startsWith('/compress-image') ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Compress Image
          </a>
          <a
            href="/merge-pdf/"
            onClick={(e) => handleLinkClick('/merge-pdf/', e)}
            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
              currentPath.startsWith('/merge-pdf') ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Merge PDF
          </a>
          <a
            href="/passport-photo-maker/"
            onClick={(e) => handleLinkClick('/passport-photo-maker/', e)}
            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
              currentPath.startsWith('/passport-photo-maker') ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Passport Photo
          </a>
          <a
            href="/blog/"
            onClick={(e) => handleLinkClick('/blog/', e)}
            className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 ${
              currentPath.startsWith('/blog') ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Guides
          </a>
        </nav>

        {/* Zone 3: Search, Theme Toggle & Mobile Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-expanded={searchOpen}
            aria-label="Find a tool"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <span>Search</span>
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <>
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Menu className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Menu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Search Dropdown Panel */}
      {searchOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Search tools (e.g., Photo to 50KB, PDF joiner, Passport picture, Urdu typing)..."
                aria-label="Search PlayBeat Tools"
                autoFocus
                className="w-full pl-10 pr-20 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              {quickQuery && (
                <button
                  type="button"
                  onClick={() => setQuickQuery('')}
                  className="absolute right-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-2.5 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTools.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No tools matched &ldquo;{quickQuery}&rdquo;.{' '}
                  <button
                    type="button"
                    onClick={() => setQuickQuery('')}
                    className="text-indigo-600 dark:text-indigo-400 font-medium underline ml-1 cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                filteredTools.map((tool) => (
                  <a
                    key={tool.slug}
                    href={`/${tool.slug}/`}
                    onClick={(e) => handleLinkClick(`/${tool.slug}/`, e)}
                    className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <ToolIcon name={tool.iconName} className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {tool.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {tool.shortDescription}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                      {tool.category}
                    </span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accessible Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-3"
        >
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            All 10 Tools
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {TOOLS_REGISTRY.map((tool) => (
              <a
                key={tool.slug}
                href={`/${tool.slug}/`}
                onClick={(e) => handleLinkClick(`/${tool.slug}/`, e)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ToolIcon name={tool.iconName} className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{tool.name}</span>
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <a href="/blog/" onClick={(e) => handleLinkClick('/blog/', e)} className="hover:text-indigo-600">
              Guides &amp; Blog
            </a>
            <a href="/about/" onClick={(e) => handleLinkClick('/about/', e)} className="hover:text-indigo-600">
              About
            </a>
            <a href="/contact/" onClick={(e) => handleLinkClick('/contact/', e)} className="hover:text-indigo-600">
              Contact
            </a>
            <a href="/privacy-policy/" onClick={(e) => handleLinkClick('/privacy-policy/', e)} className="hover:text-indigo-600">
              Privacy Policy
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
