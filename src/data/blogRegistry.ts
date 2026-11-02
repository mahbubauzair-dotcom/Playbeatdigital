import { ToolSlug } from './toolsRegistry';

export interface BlogArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedDate: string;
  updatedDate: string;
  readingTimeMinutes: number;
  category: string;
  summary: string;
  relatedToolSlugs: ToolSlug[];
  sections: {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'reduce-photo-to-50kb-online-application',
    title: 'How to reduce a photo to 50KB for an online application',
    metaTitle: 'How to Reduce a Photo to 50KB for an Online Application',
    metaDescription: 'Step-by-step guide to compressing a portrait or passport photo under 50KB without blurry text or faces, plus pixel dimension tips for online portals.',
    publishedDate: '2026-11-01',
    updatedDate: '2026-11-01',
    readingTimeMinutes: 5,
    category: 'Application Guides',
    summary: 'Learn why online examination and job portals reject large smartphone photos and how to reduce your portrait under 50KB while keeping your face clear.',
    relatedToolSlugs: ['compress-image', 'passport-photo-maker', 'resize-image'],
    sections: [
      {
        heading: 'Why Online Application Portals Enforce a 50KB Photo Limit',
        paragraphs: [
          'When you apply for a university admission test, public service commission exam, or government job in Pakistan or India, the application portal often receives hundreds of thousands of submissions in the final forty-eight hours before the deadline. Also, examination centers print admit cards and attendance sheets in bulk for every registered candidate.',
          'To keep server storage manageable and ensure admit card PDFs generate rapidly, portals commonly restrict candidate portrait uploads to a maximum file size such as 50KB (and often 20KB for scanned signatures). Meanwhile, a typical smartphone camera takes 12-megapixel photos that weigh between 2,500KB (2.5MB) and 6,000KB (6MB). Uploading an unedited phone photo triggers an immediate file-size rejection.'
        ]
      },
      {
        heading: 'Step 1: Crop to Portrait Proportions First',
        paragraphs: [
          'The single biggest mistake applicants make is trying to compress an entire uncropped room photo down to 50KB. If your head occupies only 15% of the frame and the rest of the image is wall, furniture, and shirt, the JPEG encoder wastes most of your 50KB budget on background pixels.',
          'Before compressing, crop your photograph to a standard passport frame—such as 35 × 45 mm or 2 × 2 inches—using the PlayBeat Tools Passport Photo Maker. Cropping removes unnecessary background areas and sets the resolution to 300 DPI (for example, 413 × 531 pixels for 35 × 45 mm), which immediately reduces file size while keeping facial detail sharp.'
        ]
      },
      {
        heading: 'Step 2: Compress the Image to 50KB in Your Browser',
        paragraphs: [
          'Once your portrait is properly cropped, open the Compress Image tool on PlayBeat Tools and upload your file. Select the 50KB target preset. The tool performs a bounded search across JPEG compression levels right inside your browser without uploading your personal photograph to any external server.',
          'Check the output size shown in the result summary. If the compressed file measures, for example, 44.2 KB or 47.8 KB, it safely satisfies a "Maximum 50KB" upload requirement. Never use tools that promise an exact 50.0 KB byte count by appending junk data to the end of a file, as strict government and university portals validate JPEG headers and may reject artificially padded files.'
        ],
        bullets: [
          'Upload your cropped portrait (JPEG, PNG, or WebP) to the Compress Image tool.',
          'Select the 50KB preset (or 20KB if preparing a signature scan).',
          'If your original file was a transparent PNG, leave the background fill set to White.',
          'Inspect the side-by-side preview at 100% zoom to confirm your eyes, nose, and ears are crisp.',
          'Download the resulting JPEG and verify its filename ends in .jpg.'
        ]
      },
      {
        heading: 'What to Do When a Portal Specifies Both KB Range and Pixel Dimensions',
        paragraphs: [
          'Some recruitment portals specify two rules at once—for example, "Photo must be 300 × 400 pixels and between 20KB and 50KB." If your photo is already cropped to the right shape, open the Resize Image tool, choose "Resize by Width & Height", enter the required pixel dimensions, and export as JPEG.',
          'If the file comes out at 14KB when the portal demands a minimum of 20KB, increase the JPEG quality slider slightly (for example, from 75% to 90%) in the Compress Image or Resize Image tool until the file sits comfortably around 35KB to 45KB. Always double-check the official guidelines of your specific examining body before final submission.'
        ]
      }
    ]
  }
];

export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}
