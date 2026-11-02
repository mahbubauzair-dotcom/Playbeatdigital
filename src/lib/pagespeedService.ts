export interface PageSpeedReport {
  url: string;
  strategy: 'mobile' | 'desktop';
  fetchTime: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    firstContentfulPaint: string;
    largestContentfulPaint: string;
    totalBlockingTime: string;
    cumulativeLayoutShift: string;
    speedIndex: string;
  };
  fieldDataAvailable: boolean;
  fieldMetrics?: {
    lcp?: string;
    fid?: string;
    cls?: string;
    inp?: string;
  };
}

export async function runPageSpeedAudit(
  url: string = 'https://playbeatdigital.store',
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<{ success: boolean; report?: PageSpeedReport; error?: string }> {
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=${strategy}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error:
          errJson.error?.message ||
          `PageSpeed API responded with status ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const lighthouse = data.lighthouseResult;
    const cats = lighthouse?.categories || {};
    const audits = lighthouse?.audits || {};

    const scores = {
      performance: Math.round((cats.performance?.score || 0) * 100),
      accessibility: Math.round((cats.accessibility?.score || 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
      seo: Math.round((cats.seo?.score || 0) * 100),
    };

    const metrics = {
      firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
      largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
      totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
      cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
      speedIndex: audits['speed-index']?.displayValue || 'N/A',
    };

    const loadingExperience = data.loadingExperience;
    const fieldDataAvailable =
      loadingExperience &&
      loadingExperience.metrics &&
      Object.keys(loadingExperience.metrics).length > 0;

    let fieldMetrics = undefined;
    if (fieldDataAvailable) {
      fieldMetrics = {
        lcp: loadingExperience.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile
          ? `${(loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000).toFixed(1)}s`
          : undefined,
        inp: loadingExperience.metrics?.INTERACTION_TO_NEXT_PAINT?.percentile
          ? `${loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.percentile}ms`
          : undefined,
        cls: loadingExperience.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile
          ? `${(loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100).toFixed(2)}`
          : undefined,
      };
    }

    return {
      success: true,
      report: {
        url,
        strategy,
        fetchTime: lighthouse.fetchTime || new Date().toISOString(),
        scores,
        metrics,
        fieldDataAvailable: !!fieldDataAvailable,
        fieldMetrics,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
