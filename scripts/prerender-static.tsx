import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import { buildCanonicalUrl, siteConfig } from '../src/config/siteConfig';
import { BLOG_ARTICLES } from '../src/data/blogRegistry';
import { TOOLS_REGISTRY } from '../src/data/toolsRegistry';

interface RouteMeta {
  routePath: string;
  title: string;
  description: string;
  includeInSitemap: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildRoutesList(): RouteMeta[] {
  const routes: RouteMeta[] = [
    {
      routePath: '/',
      title: 'PlayBeat Tools – Free Online PDF, Photo & Form Utilities',
      description:
        'Free browser-based tools to compress photos to 50KB, resize passport pictures, merge and reduce PDFs, calculate age, count words, make QR codes and type Urdu.',
      includeInSitemap: true,
    },
  ];

  for (const tool of TOOLS_REGISTRY) {
    routes.push({
      routePath: `/${tool.slug}/`,
      title: tool.title,
      description: tool.metaDescription,
      includeInSitemap: true,
    });
  }

  routes.push({
    routePath: '/blog/',
    title: 'Application & File Preparation Guides – PlayBeat Tools Blog',
    description:
      'Practical step-by-step guides on preparing photos, signatures, and PDF documents for online application forms in Pakistan and India.',
    includeInSitemap: true,
  });

  for (const article of BLOG_ARTICLES) {
    routes.push({
      routePath: `/blog/${article.slug}/`,
      title: article.metaTitle,
      description: article.metaDescription,
      includeInSitemap: true,
    });
  }

  routes.push(
    {
      routePath: '/about/',
      title: 'About PlayBeat Tools – Free Browser Utilities',
      description:
        'Learn about PlayBeat Tools (playbeatdigital.store), a free browser-based utility website built for students, job seekers, and online form applicants.',
      includeInSitemap: true,
    },
    {
      routePath: '/contact/',
      title: 'Contact PlayBeat Tools – Feedback & Bug Reports',
      description:
        'Get in touch with PlayBeat Tools regarding tool feedback, browser compatibility reports, or general questions.',
      includeInSitemap: true,
    },
    {
      routePath: '/privacy-policy/',
      title: 'Privacy Policy – PlayBeat Tools',
      description:
        'Read how PlayBeat Tools handles local browser file processing, hosting logs, optional analytics consent, local preferences, and future advertising.',
      includeInSitemap: true,
    },
    {
      routePath: '/terms/',
      title: 'Terms of Use – PlayBeat Tools',
      description:
        'Review the Terms of Use for PlayBeat Tools (playbeatdigital.store), covering acceptable use, service limitations, and user responsibilities.',
      includeInSitemap: true,
    },
    {
      routePath: '/disclaimer/',
      title: 'Disclaimer – PlayBeat Tools',
      description:
        'Important disclaimers regarding government portal affiliation, file compression trade-offs, passport photo rules, and age calculation conventions.',
      includeInSitemap: true,
    },
    {
      routePath: '/admin/',
      title: 'Admin Portal – PlayBeat Tools',
      description:
        'Administrative portal for PlayBeat Tools settings, tool content, SEO metadata, and publishing pipeline.',
      includeInSitemap: false,
    }
  );

  return routes;
}

function injectRouteHtml(templateHtml: string, route: RouteMeta, appHtml: string): string {
  const canonicalUrl = buildCanonicalUrl(route.routePath);
  const safeTitle = escapeHtml(route.title);
  const safeDesc = escapeHtml(route.description);
  const safeCanonical = escapeHtml(canonicalUrl);

  let html = templateHtml;
  html = html.replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<link rel="canonical" href=".*?"\s*\/?>/,
    `<link rel="canonical" href="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta property="og:title" content=".*?"\s*\/?>/,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?"\s*\/?>/,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?"\s*\/?>/,
    `<meta property="og:url" content="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?"\s*\/?>/,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?"\s*\/?>/,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );

  if (!route.includeInSitemap) {
    html = html.replace(
      '</head>',
      '    <meta name="robots" content="noindex, nofollow" />\n  </head>'
    );
  }

  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  return html;
}

function main() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const outDir = path.resolve(process.cwd(), 'out');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found. Run vite build first.');
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  const routes = buildRoutesList();

  for (const route of routes) {
    const renderedApp = renderToString(<App initialPath={route.routePath} />);
    const fullHtml = injectRouteHtml(templateHtml, route, renderedApp);

    const targetDir =
      route.routePath === '/'
        ? distDir
        : path.join(distDir, route.routePath.replace(/^\/+|\/+$/g, ''));

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), fullHtml, 'utf-8');
  }

  // Generate custom 404.html
  const notFoundApp = renderToString(<App initialPath="/404/" />);
  const notFoundHtml = injectRouteHtml(
    templateHtml,
    {
      routePath: '/404/',
      title: 'Page Not Found (404) – PlayBeat Tools',
      description:
        'The requested page could not be found on PlayBeat Tools. Explore our 10 free browser-based PDF, image, and utility tools.',
      includeInSitemap: false,
    },
    notFoundApp
  );
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf-8');

  // Generate sitemap.xml
  const today = '2026-11-01';
  const sitemapUrls = routes
    .filter((r) => r.includeInSitemap)
    .map((r) => {
      const loc = buildCanonicalUrl(r.routePath);
      return `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`;
    })
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  // Generate robots.txt referencing the sitemap
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.siteUrl}/sitemap.xml\n`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');

  // Copy dist/ to out/ so Vercel static outputDirectory `out` is 100% ready
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.cpSync(distDir, outDir, { recursive: true });

  console.log(
    `[prerender-static] Exported ${routes.length} static routes + 404.html + sitemap.xml + robots.txt to dist/ and out/`
  );
}

main();
