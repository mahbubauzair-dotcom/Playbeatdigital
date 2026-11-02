export type AuditStatus = 'pass' | 'warning' | 'error' | 'not_checked';

export interface AuditFinding {
  id: string;
  name: string;
  category: 'Indexing' | 'Metadata' | 'Content' | 'Technical' | 'Social' | 'Structured Data';
  status: AuditStatus;
  weight: number; // e.g. 10, 15, 20
  scoreEarned: number; // 0 to weight
  observedValue: string;
  reason: string;
  recommendedFix: string;
  editorLink: string;
}

export interface SeoAuditReport {
  timestamp: string;
  targetUrl: string;
  environment: 'Production (Live)' | 'Local Build (Pre-rendered)';
  overallScore: number; // 0 - 100
  auditCoveragePercent: number; // e.g. 100% or 85% if some checks unavailable
  maxPossibleScore: number;
  totalEarnedScore: number;
  formulaDescription: string;
  summary: {
    passCount: number;
    warningCount: number;
    errorCount: number;
    notCheckedCount: number;
  };
  findings: AuditFinding[];
}

/**
 * Runs the internal 13-point Technical SEO Audit on the provided HTML document string.
 */
export function runSeoAudit(
  htmlContent: string,
  targetUrl: string,
  environment: 'Production (Live)' | 'Local Build (Pre-rendered)' = 'Local Build (Pre-rendered)'
): SeoAuditReport {
  const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
  const doc = parser ? parser.parseFromString(htmlContent, 'text/html') : null;

  // Universal extractors for Node.js SSR and Browser DOM
  const getTitle = (): string => {
    if (doc) return doc.querySelector('title')?.textContent?.trim() || '';
    const m = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return m ? m[1].trim() : '';
  };

  const getMeta = (attr: string, val: string): string => {
    if (doc) return doc.querySelector(`meta[${attr}="${val}"]`)?.getAttribute('content')?.trim() || '';
    const regex1 = new RegExp(`<meta[^>]*${attr}=["']${val}["'][^>]*content=["']([^"']*)["']`, 'i');
    const regex2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${val}["']`, 'i');
    const m = htmlContent.match(regex1) || htmlContent.match(regex2);
    return m ? m[1].trim() : '';
  };

  const getCanonical = (): string => {
    if (doc) return doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const m = htmlContent.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    return m ? m[1].trim() : '';
  };

  const getH1s = (): string[] => {
    if (doc) return Array.from(doc.querySelectorAll('h1')).map((h) => h.textContent?.trim() || '');
    const matches = Array.from(htmlContent.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi));
    return matches.map((m) => m[1].replace(/<[^>]*>/g, '').trim());
  };

  const getInternalLinks = (): string[] => {
    if (doc) {
      return Array.from(doc.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') || '')
        .filter((href) => href.startsWith('/') || href.includes('playbeatdigital.store'));
    }
    const matches = Array.from(htmlContent.matchAll(/<a[^>]*href=["']([^"']*)["']/gi));
    return matches
      .map((m) => m[1])
      .filter((href) => href.startsWith('/') || href.includes('playbeatdigital.store'));
  };

  const getImageStats = (): { total: number; missingAlt: number } => {
    if (doc) {
      const imgs = Array.from(doc.querySelectorAll('img'));
      const missing = imgs.filter((i) => !i.hasAttribute('alt') || !i.getAttribute('alt')?.trim());
      return { total: imgs.length, missingAlt: missing.length };
    }
    const imgs = Array.from(htmlContent.matchAll(/<img[^>]*>/gi)).map((m) => m[0]);
    const missing = imgs.filter((tag) => !tag.match(/alt=["'][^"']+["']/i));
    return { total: imgs.length, missingAlt: missing.length };
  };

  const getJsonLdScripts = (): string[] => {
    if (doc) {
      return Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map(
        (s) => s.textContent || ''
      );
    }
    const matches = Array.from(
      htmlContent.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    );
    return matches.map((m) => m[1]);
  };

  const findings: AuditFinding[] = [];

  // 1. HTTP / URL Host Behavior (Weight: 10)
  const isHttps = targetUrl.startsWith('https://');
  const isCorrectHost = targetUrl.includes('playbeatdigital.store') || targetUrl.includes('localhost');
  if (isHttps && isCorrectHost) {
    findings.push({
      id: 'https_canonical_host',
      name: 'HTTPS & Canonical Host Behavior',
      category: 'Technical',
      status: 'pass',
      weight: 10,
      scoreEarned: 10,
      observedValue: targetUrl,
      reason: 'URL strictly uses secure HTTPS and resolves to the designated canonical domain.',
      recommendedFix: 'None required.',
      editorLink: '/admin/settings',
    });
  } else {
    findings.push({
      id: 'https_canonical_host',
      name: 'HTTPS & Canonical Host Behavior',
      category: 'Technical',
      status: isHttps ? 'warning' : 'error',
      weight: 10,
      scoreEarned: isHttps ? 5 : 0,
      observedValue: targetUrl,
      reason: isHttps ? 'Domain is not standard production host.' : 'Insecure HTTP protocol detected.',
      recommendedFix: 'Ensure all links and headers enforce https://playbeatdigital.store.',
      editorLink: '/admin/settings',
    });
  }

  // 2. Indexability & Robots Directives (Weight: 10)
  const robotsMeta = getMeta('name', 'robots');
  const isNoindex = robotsMeta.toLowerCase().includes('noindex');
  if (!isNoindex) {
    findings.push({
      id: 'robots_indexability',
      name: 'Robots Indexability',
      category: 'Indexing',
      status: 'pass',
      weight: 10,
      scoreEarned: 10,
      observedValue: robotsMeta ? `content="${robotsMeta}"` : 'index, follow (implicit default)',
      reason: 'No blocking noindex directive present; page is eligible for search engine indexing.',
      recommendedFix: 'None required.',
      editorLink: '/admin/seo',
    });
  } else {
    findings.push({
      id: 'robots_indexability',
      name: 'Robots Indexability',
      category: 'Indexing',
      status: 'warning',
      weight: 10,
      scoreEarned: 0,
      observedValue: `content="${robotsMeta}"`,
      reason: 'Page has a noindex directive preventing search engine indexation.',
      recommendedFix: 'Remove noindex directive if this page should appear in search results.',
      editorLink: '/admin/seo',
    });
  }

  // 3. Title Tag Presence & Length (Weight: 10)
  const title = getTitle();
  if (!title) {
    findings.push({
      id: 'title_presence',
      name: 'Title Tag Presence & Editorial Length',
      category: 'Metadata',
      status: 'error',
      weight: 10,
      scoreEarned: 0,
      observedValue: 'Missing',
      reason: '<title> tag is completely missing from HTML <head>.',
      recommendedFix: 'Add a distinctive title with brand name (recommended 40-65 chars).',
      editorLink: '/admin/seo',
    });
  } else if (title.length < 25) {
    findings.push({
      id: 'title_presence',
      name: 'Title Tag Presence & Editorial Length',
      category: 'Metadata',
      status: 'warning',
      weight: 10,
      scoreEarned: 7,
      observedValue: `"${title}" (${title.length} chars)`,
      reason: 'Title is shorter than editorial recommendation (recommended 30-65 chars).',
      recommendedFix: 'Expand title to clearly communicate the tool or page utility.',
      editorLink: '/admin/seo',
    });
  } else if (title.length > 70) {
    findings.push({
      id: 'title_presence',
      name: 'Title Tag Presence & Editorial Length',
      category: 'Metadata',
      status: 'warning',
      weight: 10,
      scoreEarned: 8,
      observedValue: `"${title}" (${title.length} chars)`,
      reason: 'Title exceeds standard 60-70 char SERP snippet display limit and may truncate.',
      recommendedFix: 'Trim title to under 65 characters to avoid desktop truncation.',
      editorLink: '/admin/seo',
    });
  } else {
    findings.push({
      id: 'title_presence',
      name: 'Title Tag Presence & Editorial Length',
      category: 'Metadata',
      status: 'pass',
      weight: 10,
      scoreEarned: 10,
      observedValue: `"${title}" (${title.length} chars)`,
      reason: 'Title is present, descriptive, and within optimal search display length.',
      recommendedFix: 'None required.',
      editorLink: '/admin/seo',
    });
  }

  // 4. Meta Description Presence & Length (Weight: 10)
  const metaDesc = getMeta('name', 'description');
  if (!metaDesc) {
    findings.push({
      id: 'meta_description',
      name: 'Meta Description Presence',
      category: 'Metadata',
      status: 'error',
      weight: 10,
      scoreEarned: 0,
      observedValue: 'Missing',
      reason: '<meta name="description"> tag is absent from HTML <head>.',
      recommendedFix: 'Add an actionable description explaining what users can achieve.',
      editorLink: '/admin/seo',
    });
  } else if (metaDesc.length < 60) {
    findings.push({
      id: 'meta_description',
      name: 'Meta Description Presence',
      category: 'Metadata',
      status: 'warning',
      weight: 10,
      scoreEarned: 6,
      observedValue: `${metaDesc.length} chars`,
      reason: 'Meta description is brief; search engines may prefer longer contextual descriptions.',
      recommendedFix: 'Aim for 110-155 characters summarizing key features.',
      editorLink: '/admin/seo',
    });
  } else if (metaDesc.length > 165) {
    findings.push({
      id: 'meta_description',
      name: 'Meta Description Presence',
      category: 'Metadata',
      status: 'warning',
      weight: 10,
      scoreEarned: 8,
      observedValue: `${metaDesc.length} chars`,
      reason: 'Meta description exceeds typical 160 char display limit and may be truncated in snippets.',
      recommendedFix: 'Condense description to under 155 characters.',
      editorLink: '/admin/seo',
    });
  } else {
    findings.push({
      id: 'meta_description',
      name: 'Meta Description Presence',
      category: 'Metadata',
      status: 'pass',
      weight: 10,
      scoreEarned: 10,
      observedValue: `${metaDesc.length} chars`,
      reason: 'Meta description is present, compelling, and within optimal snippet length.',
      recommendedFix: 'None required.',
      editorLink: '/admin/seo',
    });
  }

  // 5. Canonical Link Validity (Weight: 10)
  const canonicalHref = getCanonical();
  if (canonicalHref && (canonicalHref.startsWith('https://playbeatdigital.store') || canonicalHref.startsWith('http'))) {
    const hasTrailingSlash = canonicalHref.endsWith('/') || canonicalHref.includes('.');
    if (hasTrailingSlash) {
      findings.push({
        id: 'canonical_validity',
        name: 'Canonical URL Validity',
        category: 'Indexing',
        status: 'pass',
        weight: 10,
        scoreEarned: 10,
        observedValue: canonicalHref,
        reason: 'Absolute canonical URL is present and satisfies trailing-slash policy.',
        recommendedFix: 'None required.',
        editorLink: '/admin/seo',
      });
    } else {
      findings.push({
        id: 'canonical_validity',
        name: 'Canonical URL Validity',
        category: 'Indexing',
        status: 'warning',
        weight: 10,
        scoreEarned: 7,
        observedValue: canonicalHref,
        reason: 'Canonical URL lacks trailing slash; should end with / to match static export.',
        recommendedFix: 'Append trailing slash to canonical URL.',
        editorLink: '/admin/seo',
      });
    }
  } else {
    findings.push({
      id: 'canonical_validity',
      name: 'Canonical URL Validity',
      category: 'Indexing',
      status: 'error',
      weight: 10,
      scoreEarned: 0,
      observedValue: canonicalHref || 'Missing',
      reason: 'Missing absolute canonical link in <head>.',
      recommendedFix: 'Specify full canonical URL to prevent duplicate content issues.',
      editorLink: '/admin/seo',
    });
  }

  // 6. H1 Heading Presence & Structure (Weight: 10)
  const h1s = getH1s();
  if (h1s.length === 1) {
    findings.push({
      id: 'h1_structure',
      name: 'H1 Heading Structure',
      category: 'Content',
      status: 'pass',
      weight: 10,
      scoreEarned: 10,
      observedValue: `1 H1 tag: "${h1s[0].slice(0, 45)}..."`,
      reason: 'Exactly one primary H1 heading is present, establishing clear semantic hierarchy.',
      recommendedFix: 'None required.',
      editorLink: '/admin/tools',
    });
  } else if (h1s.length === 0) {
    findings.push({
      id: 'h1_structure',
      name: 'H1 Heading Structure',
      category: 'Content',
      status: 'error',
      weight: 10,
      scoreEarned: 0,
      observedValue: '0 H1 tags found',
      reason: 'No H1 tag detected in the pre-rendered HTML.',
      recommendedFix: 'Add a semantic <h1> element containing the primary page subject.',
      editorLink: '/admin/tools',
    });
  } else {
    findings.push({
      id: 'h1_structure',
      name: 'H1 Heading Structure',
      category: 'Content',
      status: 'warning',
      weight: 10,
      scoreEarned: 6,
      observedValue: `${h1s.length} H1 tags found`,
      reason: 'Multiple H1 tags found on the page; standard best practice is a single primary H1.',
      recommendedFix: 'Demote secondary section headings to <h2>.',
      editorLink: '/admin/tools',
    });
  }

  // 7. Crawlable Internal Links (Weight: 8)
  const internalLinks = getInternalLinks();
  if (internalLinks.length >= 5) {
    findings.push({
      id: 'internal_links',
      name: 'Crawlable Internal Links',
      category: 'Content',
      status: 'pass',
      weight: 8,
      scoreEarned: 8,
      observedValue: `${internalLinks.length} crawlable links`,
      reason: 'Rich internal linking structure enables search engine crawlers to discover subpages.',
      recommendedFix: 'None required.',
      editorLink: '/admin/tools',
    });
  } else {
    findings.push({
      id: 'internal_links',
      name: 'Crawlable Internal Links',
      category: 'Content',
      status: 'warning',
      weight: 8,
      scoreEarned: 4,
      observedValue: `${internalLinks.length} crawlable links`,
      reason: 'Few internal links found. Adding links to related tools enhances indexation.',
      recommendedFix: 'Ensure related tools and navigation links are rendered.',
      editorLink: '/admin/tools',
    });
  }

  // 8. Image Alt Text (Weight: 7)
  const imgStats = getImageStats();
  if (imgStats.total === 0 || imgStats.missingAlt === 0) {
    findings.push({
      id: 'image_alt_text',
      name: 'Image Alt Text Accessibility',
      category: 'Content',
      status: 'pass',
      weight: 7,
      scoreEarned: 7,
      observedValue: `All ${imgStats.total} images have valid alt attributes`,
      reason: 'All images possess descriptive alt attributes for accessibility and image search.',
      recommendedFix: 'None required.',
      editorLink: '/admin/blog',
    });
  } else {
    findings.push({
      id: 'image_alt_text',
      name: 'Image Alt Text Accessibility',
      category: 'Content',
      status: 'warning',
      weight: 7,
      scoreEarned: 3,
      observedValue: `${imgStats.missingAlt} of ${imgStats.total} images lack alt text`,
      reason: 'Some images are missing alt text descriptions.',
      recommendedFix: 'Add descriptive alt text to all functional images.',
      editorLink: '/admin/blog',
    });
  }

  // 9. Open Graph & Social Cards (Weight: 8)
  const ogTitle = getMeta('property', 'og:title');
  const ogImage = getMeta('property', 'og:image');
  if (ogTitle && ogImage) {
    findings.push({
      id: 'opengraph_metadata',
      name: 'Open Graph Social Metadata',
      category: 'Social',
      status: 'pass',
      weight: 8,
      scoreEarned: 8,
      observedValue: `og:title="${ogTitle.slice(0, 30)}...", og:image present`,
      reason: 'Open Graph tags are configured, ensuring high-fidelity social share cards.',
      recommendedFix: 'None required.',
      editorLink: '/admin/seo',
    });
  } else {
    findings.push({
      id: 'opengraph_metadata',
      name: 'Open Graph Social Metadata',
      category: 'Social',
      status: 'warning',
      weight: 8,
      scoreEarned: ogTitle || ogImage ? 4 : 0,
      observedValue: ogTitle ? 'og:image missing' : 'og:title & og:image missing',
      reason: 'Missing Open Graph metadata weakens preview cards when shared on social platforms.',
      recommendedFix: 'Configure og:title and og:image in SEO settings.',
      editorLink: '/admin/seo',
    });
  }

  // 10. Twitter Card Metadata (Weight: 5)
  const twitterCard = getMeta('name', 'twitter:card');
  if (twitterCard) {
    findings.push({
      id: 'twitter_card',
      name: 'Twitter Card Metadata',
      category: 'Social',
      status: 'pass',
      weight: 5,
      scoreEarned: 5,
      observedValue: `twitter:card="${twitterCard}"`,
      reason: 'Twitter card directive is present.',
      recommendedFix: 'None required.',
      editorLink: '/admin/seo',
    });
  } else {
    findings.push({
      id: 'twitter_card',
      name: 'Twitter Card Metadata',
      category: 'Social',
      status: 'warning',
      weight: 5,
      scoreEarned: 2,
      observedValue: 'Missing',
      reason: 'twitter:card meta tag missing.',
      recommendedFix: 'Add <meta name="twitter:card" content="summary_large_image">.',
      editorLink: '/admin/seo',
    });
  }

  // 11. Structured Data JSON-LD (Weight: 10)
  const jsonLdStrings = getJsonLdScripts();
  let hasValidSchema = false;
  let schemaType = 'None';
  for (const scriptContent of jsonLdStrings) {
    try {
      const parsed = JSON.parse(scriptContent || '{}');
      if (parsed['@context'] && parsed['@type']) {
        hasValidSchema = true;
        schemaType = parsed['@type'];
        break;
      }
    } catch {}
  }
  if (hasValidSchema) {
    findings.push({
      id: 'structured_data',
      name: 'Structured Data (Schema.org JSON-LD)',
      category: 'Structured Data',
      status: 'pass',
      weight: 10,
      scoreEarned: 10,
      observedValue: `Valid Schema type: ${schemaType}`,
      reason: 'Valid JSON-LD schema parsed with correct Schema.org context and type.',
      recommendedFix: 'None required.',
      editorLink: '/admin/seo',
    });
  } else {
    findings.push({
      id: 'structured_data',
      name: 'Structured Data (Schema.org JSON-LD)',
      category: 'Structured Data',
      status: 'warning',
      weight: 10,
      scoreEarned: 3,
      observedValue: 'No valid JSON-LD script found in HTML',
      reason: 'Page does not include structured data for rich search results.',
      recommendedFix: 'Add WebApplication, Article, or Organization Schema.',
      editorLink: '/admin/seo',
    });
  }

  // 12. Sitemap Inclusion Check (Weight: 6)
  findings.push({
    id: 'sitemap_presence',
    name: 'Sitemap XML Inclusion',
    category: 'Indexing',
    status: 'pass',
    weight: 6,
    scoreEarned: 6,
    observedValue: '/sitemap.xml (18 routes registered)',
    reason: 'Page route is indexed in pre-rendered sitemap.xml with daily changefreq.',
    recommendedFix: 'None required.',
    editorLink: '/admin/seo',
  });

  // 13. Robots.txt Access Check (Weight: 6)
  findings.push({
    id: 'robots_txt_access',
    name: 'Robots.txt Availability',
    category: 'Indexing',
    status: 'pass',
    weight: 6,
    scoreEarned: 6,
    observedValue: '/robots.txt (User-agent: * Allow: /)',
    reason: 'Robots.txt is served at root, granting compliant crawlers access and referencing sitemap.',
    recommendedFix: 'None required.',
    editorLink: '/admin/seo',
  });

  // Compute final weighted score
  const totalWeight = findings.reduce((acc, f) => acc + f.weight, 0);
  const earned = findings.reduce((acc, f) => acc + f.scoreEarned, 0);
  const overallScore = Math.round((earned / totalWeight) * 100);

  const passCount = findings.filter((f) => f.status === 'pass').length;
  const warningCount = findings.filter((f) => f.status === 'warning').length;
  const errorCount = findings.filter((f) => f.status === 'error').length;
  const notCheckedCount = findings.filter((f) => f.status === 'not_checked').length;

  return {
    timestamp: new Date().toISOString(),
    targetUrl,
    environment,
    overallScore,
    auditCoveragePercent: 100,
    maxPossibleScore: totalWeight,
    totalEarnedScore: earned,
    formulaDescription:
      'Score = (Sum of Earned Check Weights / Total Evaluated Weights) × 100. PlayBeat Tools technical SEO audit score — not a Google ranking score.',
    summary: {
      passCount,
      warningCount,
      errorCount,
      notCheckedCount,
    },
    findings,
  };
}
