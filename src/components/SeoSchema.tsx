import React, { useEffect } from 'react';
import { buildCanonicalUrl, siteConfig } from '../config/siteConfig';
import { BreadcrumbItem } from './Breadcrumbs';

interface SeoSchemaProps {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumbs?: BreadcrumbItem[];
  webAppTool?: {
    name: string;
    description: string;
    category: string;
  };
  articleData?: {
    headline: string;
    description: string;
    datePublished: string;
    dateModified: string;
  };
  isHomepage?: boolean;
}

export const SeoSchema: React.FC<SeoSchemaProps> = ({
  title,
  description,
  canonicalPath,
  breadcrumbs,
  webAppTool,
  articleData,
  isHomepage,
}) => {
  const canonicalUrl = buildCanonicalUrl(canonicalPath);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = title;

    const setMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    let linkCanonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
  }, [title, description, canonicalUrl]);

  const schemas: Record<string, unknown>[] = [];

  if (isHomepage) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.siteName,
      url: `${siteConfig.siteUrl}/`,
      logo: `${siteConfig.siteUrl}/favicon.svg`,
      description: siteConfig.brandPromise,
    });
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.siteName,
      url: `${siteConfig.siteUrl}/`,
      description:
        'Free browser-based online utilities to compress photos, resize images, prepare passport-size prints, merge and reduce PDFs, calculate age, count words, generate QR codes, and type Urdu.',
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    const itemListElement = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteConfig.siteUrl}/`,
      },
      ...breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 2,
        name: b.label,
        item: buildCanonicalUrl(b.href),
      })),
    ];

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    });
  }

  if (webAppTool) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${webAppTool.name} – ${siteConfig.siteName}`,
      url: canonicalUrl,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript and HTML5 Canvas support',
      description: webAppTool.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });
  }

  if (articleData) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: articleData.headline,
      description: articleData.description,
      datePublished: articleData.datePublished,
      dateModified: articleData.dateModified,
      mainEntityOfPage: canonicalUrl,
      author: {
        '@type': 'Organization',
        name: siteConfig.siteName,
        url: `${siteConfig.siteUrl}/`,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.siteUrl}/favicon.svg`,
        },
      },
    });
  }

  return (
    <>
      {siteConfig.gscVerification ? (
        <meta name="google-site-verification" content={siteConfig.gscVerification} />
      ) : null}
      {schemas.map((schemaObj, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObj) }}
        />
      ))}
    </>
  );
};
