import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, Mail } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoSchema } from '../components/SeoSchema';
import { ToolCard } from '../components/ToolCard';
import { siteConfig } from '../config/siteConfig';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';

interface PageNavProps {
  onNavigate: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const AboutPage: React.FC<PageNavProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoSchema
        title="About PlayBeat Tools – Free Browser Utilities"
        description="Learn about PlayBeat Tools (playbeatdigital.store), a free browser-based utility website built for students, job seekers, and online form applicants."
        canonicalPath="/about/"
        breadcrumbs={[{ label: 'About', href: '/about/' }]}
      />

      <Breadcrumbs items={[{ label: 'About', href: '/about/' }]} onNavigate={onNavigate} />

      <article className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          About PlayBeat Tools
        </h1>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong>PlayBeat Tools</strong> (hosted at <code>playbeatdigital.store</code>) is an independent collection of free online utilities built for students, job seekers, and people filling out online admission, scholarship, and recruitment forms in Pakistan, India, and worldwide.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          Our Core Promise: &ldquo;{siteConfig.brandPromise}&rdquo;
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Preparing digital attachments for an online application often requires several small steps: cropping a portrait to 35×45 mm or 2×2 inches, shrinking a photo under 50KB or a signature under 20KB, combining academic transcripts into a single PDF, checking exact age on a closing date, or typing Urdu text on an English keyboard. PlayBeat Tools brings these ten everyday tasks together in a fast, distraction-free interface.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          How Browser-Based Processing Protects Your Privacy
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Unlike server-based converters that upload your identity cards, degrees, and photographs to remote cloud storage, every tool on PlayBeat Tools runs locally inside your web browser using standard Web APIs (HTML5 Canvas, Web Workers, PDF.js, and pdf-lib). Your files stay on your phone or computer and are never transmitted to our servers.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          Honest Limitations
        </h2>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          We build practical utilities and explain their technical trade-offs honestly. For example, browser-based PDF compression converts pages into images (making text non-selectable), passport canvas background fill only colors transparent regions rather than performing automatic background removal, and no third-party utility can guarantee that a government or university portal will approve your submission. Always check the official requirements of your receiving organization.
        </p>
      </article>
    </div>
  );
};

export const ContactPage: React.FC<PageNavProps> = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const configuredEmail = siteConfig.contactEmail.trim();

  const handleCopyEmail = async () => {
    if (!configuredEmail) return;
    try {
      await navigator.clipboard.writeText(configuredEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoSchema
        title="Contact PlayBeat Tools – Feedback & Bug Reports"
        description="Get in touch with PlayBeat Tools regarding tool feedback, browser compatibility reports, or general questions."
        canonicalPath="/contact/"
        breadcrumbs={[{ label: 'Contact', href: '/contact/' }]}
      />

      <Breadcrumbs items={[{ label: 'Contact', href: '/contact/' }]} onNavigate={onNavigate} />

      <article className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Contact Us
        </h1>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Have a question about one of our browser utilities, or noticed an issue on a specific mobile device or browser? You can contact us directly by email. Because PlayBeat Tools is a static, privacy-first website with no backend server, we do not use server-side contact forms.
        </p>

        {configuredEmail ? (
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Contact Email Address
              </div>
              <div className="mt-1 text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
                {configuredEmail}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>Email Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Copy email</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${configuredEmail}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Open email app</span>
              </a>
            </div>
          </div>
        ) : (
          <div
            role="status"
            className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 space-y-2 text-xs sm:text-sm text-amber-900 dark:text-amber-200"
          >
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <span>Configuration Notice: Contact Email Not Yet Configured</span>
            </div>
            <p className="leading-relaxed">
              The build-time environment variable <code>NEXT_PUBLIC_CONTACT_EMAIL</code> (or <code>VITE_CONTACT_EMAIL</code>) has not been set for this deployment yet. Set your verified mailbox in your Vercel Project Settings environment variables and rebuild the site to activate the Copy Email and &ldquo;Open email app&rdquo; controls here.
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
          <p>
            <strong>Privacy Reminder:</strong> Please do not attach sensitive identity documents, original mark sheets, or passwords when sending an email. If reporting a bug with a file tool, simply mention your device model, browser version, and the file format/size you tested.
          </p>
        </div>
      </article>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC<PageNavProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoSchema
        title="Privacy Policy – PlayBeat Tools"
        description="Read how PlayBeat Tools handles local browser file processing, hosting logs, optional analytics consent, local preferences, and future advertising."
        canonicalPath="/privacy-policy/"
        breadcrumbs={[{ label: 'Privacy Policy', href: '/privacy-policy/' }]}
      />

      <Breadcrumbs
        items={[{ label: 'Privacy Policy', href: '/privacy-policy/' }]}
        onNavigate={onNavigate}
      />

      <article className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last updated: November 1, 2026
        </p>

        <p>
          This Privacy Policy explains how <strong>PlayBeat Tools</strong> (<code>https://playbeatdigital.store</code>) processes information when you visit our website and use our online utilities. We separate local browser tool processing from standard web hosting logs, optional analytics, and local preference storage so you know exactly what happens with your data.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          1. Local Browser File &amp; Input Processing
        </h2>
        <p>
          When you select or drop PDF files, photographs, or images into our tools—or when you enter dates of birth, essays, Urdu text, WiFi credentials, or QR code payloads—all processing occurs locally inside your web browser on your device. We do not operate file-upload endpoints, and your files, document contents, filenames, birth dates, typed text, and QR payloads are never uploaded to our servers or stored in any database.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          2. Web Hosting Request Logs
        </h2>
        <p>
          Like all websites on the internet, our static hosting provider (Vercel) automatically processes standard HTTP request metadata when your browser fetches our HTML, CSS, JavaScript, and font files. These infrastructure logs may include your IP address, browser user-agent string, requested page URL, timestamp, and referrer header for security, DDoS mitigation, and content delivery.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          3. Optional Analytics &amp; User Consent
        </h2>
        <p>
          If Google Analytics (GA4) is configured for this website, analytics scripts are loaded <strong>only</strong> after you explicitly click &ldquo;Accept analytics&rdquo; in our preference banner. Dismissing or closing the banner does not grant consent. When accepted, Google Analytics collects aggregated page-view and navigation metrics using cookies or browser identifiers. We never transmit filenames, file contents, birth dates, typed text, or QR payloads to analytics. You can change or withdraw your consent at any time using the &ldquo;Analytics Preferences&rdquo; link in the site footer.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          4. Local Preference Storage
        </h2>
        <p>
          We use your browser&rsquo;s <code>localStorage</code> strictly to remember your interface preferences:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <code>playbeat_theme_pref</code>: Remembers whether you selected Light or Dark mode.
          </li>
          <li>
            <code>playbeat_analytics_consent</code>: Remembers whether you accepted or rejected optional analytics.
          </li>
        </ul>
        <p>
          We never store your uploaded files or typed tool text in <code>localStorage</code> or <code>IndexedDB</code>.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          5. Future Advertising
        </h2>
        <p>
          PlayBeat Tools includes reserved layout slots for potential future display advertising (such as Google AdSense). Currently, third-party ad network scripts are disabled by default. If third-party advertising is enabled in the future, ad providers may use cookies or web beacons to serve ads and measure performance in accordance with their respective privacy policies and applicable consent controls.
        </p>
      </article>
    </div>
  );
};

export const TermsPage: React.FC<PageNavProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoSchema
        title="Terms of Use – PlayBeat Tools"
        description="Review the Terms of Use for PlayBeat Tools (playbeatdigital.store), covering acceptable use, service limitations, and user responsibilities."
        canonicalPath="/terms/"
        breadcrumbs={[{ label: 'Terms of Use', href: '/terms/' }]}
      />

      <Breadcrumbs
        items={[{ label: 'Terms of Use', href: '/terms/' }]}
        onNavigate={onNavigate}
      />

      <article className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Terms of Use
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last updated: November 1, 2026
        </p>

        <p>
          By accessing and using <strong>PlayBeat Tools</strong> (<code>https://playbeatdigital.store</code>), you agree to these Terms of Use. If you do not agree with these terms, please discontinue use of the website.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          1. Description of Service
        </h2>
        <p>
          PlayBeat Tools provides free, client-side web utilities for compressing and resizing images, preparing passport-sized photo crops, merging and compressing PDFs, converting images to PDF, calculating calendar age, counting words, generating static QR codes, and typing Urdu text. All tools run in your browser on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          2. User Responsibility &amp; Backup of Originals
        </h2>
        <p>
          You are solely responsible for the files, photographs, and text you process using PlayBeat Tools, and for verifying that any generated output meets the specific technical, visual, and legal requirements of your receiving organization, admission board, embassy, or employer. Always keep an unmodified backup copy of your original files before compressing, resizing, or merging documents.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          3. No Guarantee of Portal Acceptance or Target Sizes
        </h2>
        <p>
          PlayBeat Tools does not guarantee that any output file will be accepted by any government portal, examination authority, passport office, or third-party system. Furthermore, because image and PDF compression depend on source complexity, page count, and readability limits, we do not guarantee that every file can be reduced to a specific kilobyte target.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          4. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by applicable law, PlayBeat Tools and its operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from missed application deadlines, rejected form submissions, loss of document features (such as digital signatures or selectable text), or reliance on calculations provided by the site.
        </p>
      </article>
    </div>
  );
};

export const DisclaimerPage: React.FC<PageNavProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoSchema
        title="Disclaimer – PlayBeat Tools"
        description="Important disclaimers regarding government portal affiliation, file compression trade-offs, passport photo rules, and age calculation conventions."
        canonicalPath="/disclaimer/"
        breadcrumbs={[{ label: 'Disclaimer', href: '/disclaimer/' }]}
      />

      <Breadcrumbs
        items={[{ label: 'Disclaimer', href: '/disclaimer/' }]}
        onNavigate={onNavigate}
      />

      <article className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Disclaimer
        </h1>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          1. No Government or Institutional Affiliation
        </h2>
        <p>
          PlayBeat Tools is an independent utility website and is not affiliated with, endorsed by, or connected to any government agency, passport authority, embassy, public service commission (such as FPSC, PPSC, UPSC, SSC, NADRA), or university. Example upload sizes (such as 20KB, 50KB, or 100KB) and photo dimensions (such as 35×45 mm or 2×2 inches) are provided strictly for general convenience and illustration.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          2. Document Integrity &amp; Digital Signatures
        </h2>
        <p>
          Merging PDFs or compressing PDFs by rendering pages as images creates a new PDF file structure. This process invalidates cryptographic digital signatures, flattens or removes interactive form fields, and (in the case of PDF compression) converts selectable vector text into raster images. Always inspect your downloaded file before submitting it.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">
          3. Passport Photo Compliance
        </h2>
        <p>
          Our Passport Photo Maker crops images to user-selected physical proportions at 300 DPI and generates printable PDF sheets. It does not remove existing photo backgrounds or verify biometric compliance (such as head height ratios, eye level, lighting uniformity, or expression rules). Users must check the latest official specifications of their receiving organization.
        </p>
      </article>
    </div>
  );
};

export const NotFoundPage: React.FC<PageNavProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <SeoSchema
        title="Page Not Found (404) – PlayBeat Tools"
        description="The requested page could not be found on PlayBeat Tools. Explore our 10 free browser-based PDF, image, and utility tools."
        canonicalPath="/404/"
      />

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
          404 · Page Not Found
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          We couldn&rsquo;t find that page
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          The link you followed may be mistyped or outdated. Choose any of our free browser tools below or return to the homepage.
        </p>
        <div>
          <a
            href="/"
            onClick={(e) => onNavigate('/', e)}
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Back to PlayBeat Tools Homepage
          </a>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Popular Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS_REGISTRY.slice(0, 6).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
