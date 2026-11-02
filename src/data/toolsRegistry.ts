export type ToolCategory = 'PDF Tools' | 'Image Tools' | 'Utility Tools';

export type ToolSlug =
  | 'merge-pdf'
  | 'compress-pdf'
  | 'compress-image'
  | 'jpg-to-pdf'
  | 'passport-photo-maker'
  | 'qr-code-generator'
  | 'age-calculator'
  | 'word-counter'
  | 'resize-image'
  | 'urdu-keyboard';

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface SizeExampleRow {
  useCase: string;
  exampleRange: string;
  recommendedFormat: string;
  notes: string;
}

export interface ToolGuideContent {
  heading: string;
  paragraphs: string[];
  steps: string[];
  tipsAndMistakes: string[];
  exampleTableTitle?: string;
  exampleTableDisclaimer?: string;
  exampleTable?: SizeExampleRow[];
}

export interface ToolDefinition {
  slug: ToolSlug;
  name: string;
  shortDescription: string;
  category: ToolCategory;
  iconName: string;
  searchAliases: string[];
  targetKeyword: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  acceptsFiles: boolean;
  acceptedFormatsLabel?: string;
  limitsSummary?: string;
  relatedTools: ToolSlug[];
  faqs: ToolFAQ[];
  guide: ToolGuideContent;
}

export const TOOLS_REGISTRY: ToolDefinition[] = [
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    shortDescription: 'Combine multiple PDF documents into one ordered file directly in your browser.',
    category: 'PDF Tools',
    iconName: 'Files',
    searchAliases: [
      'PDF joiner',
      'combine PDF',
      'join PDF files',
      'merge PDF online free',
      'stitch PDF pages',
      'application documents PDF'
    ],
    targetKeyword: 'merge PDF online free',
    title: 'Merge PDF Online Free – Combine PDF Files in Browser',
    metaDescription: 'Merge PDF online free without uploading your documents. Reorder files, check page counts, and combine PDFs privately in your browser with PlayBeat Tools.',
    h1: 'Merge PDF Online Free',
    intro: 'Combine academic transcripts, identity documents, and application attachments into a single PDF file in the exact order you need. Your files are processed locally on your device.',
    acceptsFiles: true,
    acceptedFormatsLabel: 'PDF files (.pdf)',
    limitsSummary: 'Up to 25 PDF files, max 50 MB per file, up to 300 total pages.',
    relatedTools: ['compress-pdf', 'jpg-to-pdf', 'compress-image'],
    faqs: [
      {
        question: 'Are my PDF documents uploaded to a server when I merge them?',
        answer: 'No. PlayBeat Tools merges your PDF files inside your web browser using local memory. Your documents never leave your phone or computer.'
      },
      {
        question: 'Can I change the order of PDF files before merging?',
        answer: 'Yes. You can drag and drop files in the list or use the accessible Move Up and Move Down buttons next to each document before clicking Merge PDF.'
      },
      {
        question: 'Why does an encrypted or password-protected PDF fail to merge?',
        answer: 'Password-protected or restricted PDFs lock their page structure. Remove the password in your PDF viewer or print the file to an unlocked PDF before merging.'
      },
      {
        question: 'Will digital signatures or interactive form fields stay valid after merging?',
        answer: 'No. Merging copies pages into a newly generated PDF container, which invalidates cryptographic digital signatures and may flatten or omit interactive form scripts and bookmarks.'
      }
    ],
    guide: {
      heading: 'How to Combine Multiple PDFs for Online Applications and Submissions',
      paragraphs: [
        'University admissions portals, scholarship applications, and job recruitment systems in Pakistan and India frequently ask applicants to upload a single combined PDF for all educational certificates or experience letters. When you have separate scans for your matriculation certificate, intermediate mark sheet, degree transcript, and domicile, uploading them one by one into a single-file slot is impossible. Using a browser-based tool to merge PDF online free lets you assemble a single organized file in seconds.',
        'Because official documents contain sensitive personal numbers, grades, and home addresses, privacy matters. Traditional cloud converters upload your files to remote servers where they may sit in temporary storage queues. PlayBeat Tools performs the entire merge workflow locally inside your browser tab. Once your files are selected, the application reads the page structures in memory, copies the pages in your chosen sequence, and builds a clean downloadable PDF without using network bandwidth for file transfers.',
        'Before finalizing a combined document for an online portal, always pay attention to sequence and readability. Recruitment reviewers typically expect documents in chronological or reverse-chronological order—for example, placing your highest degree first, followed by earlier transcripts and identity records. Reviewing the page count and file size of each item before merging helps ensure that no page was accidentally skipped or duplicated.'
      ],
      steps: [
        'Click the upload area or drag and drop two or more PDF files from your device.',
        'Review each file card to verify its filename, file size, and detected page count.',
        'Drag items or use the Move Up and Move Down buttons to arrange the exact reading order.',
        'Add more PDFs if needed, or remove any file you included by mistake.',
        'Click "Merge PDFs" and download your combined PDF document immediately.'
      ],
      tipsAndMistakes: [
        'Do not merge digitally signed legal certificates if the recipient validates cryptographic signatures—merging creates a new document and breaks signature validation.',
        'Check whether the merged file exceeds your portal upload limit (for example, 1 MB or 2 MB). If it is too large, run the merged output through our Compress PDF tool.',
        'Rotate upside-down scans before merging so reviewers do not have to tilt their screen when reading your application.',
        'Always open the downloaded PDF once to confirm all pages appear in the right order before uploading to an examination or job portal.'
      ]
    }
  },
  {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    shortDescription: 'Reduce PDF file size for strict portal upload limits by re-encoding pages.',
    category: 'PDF Tools',
    iconName: 'FileArchive',
    searchAliases: [
      'compress PDF to 100KB',
      'compress PDF to 200KB',
      'reduce PDF size',
      'shrink PDF file',
      'PDF size reducer in KB'
    ],
    targetKeyword: 'compress PDF to 100KB',
    title: 'Compress PDF to 100KB, 200KB Online – Free PDF Reducer',
    metaDescription: 'Reduce PDF file size in your browser with target presets like 100KB, 200KB, and 500KB. Private local processing with clear quality controls.',
    h1: 'Compress PDF Online to Target KB Size',
    intro: 'Shrink scanned PDFs to fit strict upload limits such as 100KB, 200KB, or 500KB. Pages are rendered and re-encoded locally in your browser so your documents stay private.',
    acceptsFiles: true,
    acceptedFormatsLabel: 'Single PDF file (.pdf)',
    limitsSummary: 'Max 50 MB, up to 50 pages per PDF.',
    relatedTools: ['merge-pdf', 'jpg-to-pdf', 'compress-image'],
    faqs: [
      {
        question: 'How does browser-based PDF compression reduce file size?',
        answer: 'This tool renders each PDF page to a canvas at controlled resolution and JPEG quality, then rebuilds a new PDF. This is especially effective for heavy scanned documents.'
      },
      {
        question: 'Will text in my PDF remain selectable after compression?',
        answer: 'No. Because pages are converted into compressed images, text is no longer selectable or searchable, and interactive links, bookmarks, or forms are removed.'
      },
      {
        question: 'Can every PDF be compressed to 100KB?',
        answer: 'No. A 15-page scanned document cannot fit into 100KB without becoming completely unreadable. If your target cannot be met within readable quality limits, the tool reports this honestly and provides the smallest version generated.'
      },
      {
        question: 'Why did a text-only PDF get slightly larger?',
        answer: 'Pure vector text PDFs are already very small. Converting vector text into page images can sometimes increase file size. In that case, the tool advises keeping your original file.'
      }
    ],
    guide: {
      heading: 'Understanding PDF Size Reduction for Online Application Portals',
      paragraphs: [
        'Many scholarship portals, civil service forms, and university admission systems enforce strict attachment caps—often requiring candidates to compress PDF to 100KB, 200KB, or 500KB. When you scan a certificate with a phone camera app or flatbed scanner at 300 DPI in full color, a single page can easily reach 2 MB to 5 MB. Attempting to upload that raw file triggers an immediate size rejection error.',
        'PlayBeat Tools reduces scanned PDF sizes by rendering each page through PDF.js inside your browser and re-encoding it as an optimized image before assembling a fresh PDF with pdf-lib. You can pick a practical preset (100KB, 200KB, 500KB, 1MB) or enter a custom target in kilobytes. The tool iteratively adjusts rendering scale and image compression quality within safe readability bounds, processing pages one by one to keep memory usage low on phones and laptops.',
        'It is important to understand the trade-off of image-based PDF compression before you start. Converting pages into compressed images removes selectable text layers, hyperlinks, and interactive form fields. In addition, multi-page documents have a physical floor: squeezing ten detailed pages into 100KB leaves only 10KB per page, which lowers visual sharpness. When a target is too small for the number of pages, our tool never fakes the file size—it shows the smallest readable result achieved and lets you decide whether to download it or split your document.'
      ],
      steps: [
        'Select your PDF file from your computer or phone.',
        'Read the notice explaining that pages are converted into images and text will no longer be selectable.',
        'Choose a target size preset (100KB, 200KB, 500KB, 1MB) or type a custom KB goal.',
        'Click "Compress PDF" and watch the page-by-page progress bar (you can cancel anytime).',
        'Compare the original size, output size, and percentage change before downloading.'
      ],
      tipsAndMistakes: [
        'Keep a backup of your original PDF because compressed pages are rasterized into images and cannot be edited as text later.',
        'If your PDF was exported directly from Microsoft Word or Google Docs and contains no photos, export it using "Minimum size" in your word processor first.',
        'For a multi-page PDF that cannot reach 100KB cleanly, verify whether the portal only needs the front page or transcript summary page.',
        'Open the compressed file and zoom to 100% to ensure roll numbers, dates, and stamps are still clearly legible.'
      ],
      exampleTableTitle: 'Example PDF Upload Ranges on Common Application Forms',
      exampleTableDisclaimer: 'These figures are general examples only, not universal official rules. Always verify the exact instructions on your receiving organization portal.',
      exampleTable: [
        { useCase: 'Single-page ID card or domicile scan', exampleRange: '100 KB – 200 KB', recommendedFormat: 'PDF (1 page)', notes: 'Crop excess table margins before converting.' },
        { useCase: 'Single-page degree or mark sheet', exampleRange: '200 KB – 500 KB', recommendedFormat: 'PDF (1 page)', notes: 'Keep text sharp enough to read small serial numbers.' },
        { useCase: 'Combined academic certificates (3–5 pages)', exampleRange: '500 KB – 2 MB', recommendedFormat: 'Merged PDF', notes: 'Use 500KB or 1MB target to preserve legibility across pages.' }
      ]
    }
  },
  {
    slug: 'compress-image',
    name: 'Compress Image',
    shortDescription: 'Compress JPEG, PNG, and WebP photos down to 20KB, 50KB, or 100KB in JPEG format.',
    category: 'Image Tools',
    iconName: 'ImageDown',
    searchAliases: [
      'Photo to 50KB',
      'compress image to 50KB',
      'compress image to 20KB',
      'reduce photo size in KB',
      'picture compressor for form',
      'JPEG size reducer'
    ],
    targetKeyword: 'compress image to 50KB',
    title: 'Compress Image to 50KB, 20KB Online – Free Photo Reducer',
    metaDescription: 'Compress image to 50KB, 20KB, or 100KB online in your browser. Compare before and after quality, adjust dimensions, and download clean JPEGs privately.',
    h1: 'Compress Image to 50KB or 20KB Online',
    intro: 'Reduce photograph and signature scan file sizes to fit strict online form limits like 20KB, 50KB, or 100KB. Preview the exact output quality and dimensions before downloading.',
    acceptsFiles: true,
    acceptedFormatsLabel: 'JPEG, PNG, WebP images',
    limitsSummary: 'Max 25 MB file size, up to 8000 × 8000 px.',
    relatedTools: ['resize-image', 'passport-photo-maker', 'jpg-to-pdf'],
    faqs: [
      {
        question: 'How does the tool reach a target like 50KB or 20KB?',
        answer: 'It runs a bounded binary search over JPEG quality settings first. If the image is still larger than your target and dimension reduction is enabled, it gradually scales down pixel dimensions until the file is at or below the target.'
      },
      {
        question: 'Why is the output file slightly below 50KB (for example, 46.8 KB) instead of exactly 50.0 KB?',
        answer: 'Online forms require files to be under the maximum limit (e.g., "up to 50KB"). We never artificially pad files with junk bytes, because padding can corrupt images or trigger security rejections on portals.'
      },
      {
        question: 'What happens if I upload a PNG with a transparent background?',
        answer: 'Because the compressed output is a standard JPEG—which does not support transparency—transparent pixels are filled with your chosen background color (white by default).'
      },
      {
        question: 'Are my personal photographs uploaded anywhere?',
        answer: 'Never. Image decoding, canvas rendering, and JPEG compression happen 100% locally in your web browser.'
      }
    ],
    guide: {
      heading: 'How to Compress a Photo to 50KB or 20KB Without Ruining Clarity',
      paragraphs: [
        'Almost every online examination form, public service commission portal, and university admission system in South Asia specifies a tight file size ceiling for candidate photographs and scanned signatures. Commonly, portals ask applicants to compress image to 50KB for portraits or 20KB for signatures. A modern smartphone camera captures photos between 2 MB and 8 MB—roughly fifty to one hundred times larger than allowed.',
        'When you reduce a photograph’s file size, two factors control the final byte count: JPEG encoding quality and pixel dimensions (width and height). Lowering JPEG quality alone removes invisible high-frequency data first, keeping the photo crisp. However, if you try to squeeze a 4000 × 3000 pixel smartphone picture into 20KB purely by lowering quality, it will show blocky artifacts unless the pixel dimensions are also scaled down to a practical size.',
        'Our browser-based compressor handles both steps intelligently. First, it tests JPEG quality levels using a fast binary search to keep maximum sharpness at your current resolution. If the file still exceeds your target KB limit and optional dimension reduction is active, the tool steps down the image dimensions proportionally until the file lands safely under your target threshold. You can inspect the side-by-side before and after preview, verify the exact pixel dimensions, and download your optimized JPEG immediately.'
      ],
      steps: [
        'Upload a JPEG, PNG, or WebP image from your phone or computer.',
        'Select a target size preset (20KB, 50KB, 100KB, 200KB) or enter a custom KB value.',
        'If your input has transparency, choose a fill color (such as white) since JPEG does not support transparent pixels.',
        'Keep "Allow dimension reduction if needed" checked for very small targets like 20KB or 50KB, or adjust manual quality settings.',
        'Inspect the before/after preview and download the compressed JPEG.'
      ],
      tipsAndMistakes: [
        'Crop tightly around your face and shoulders (or signature) before compressing so you do not waste kilobytes on empty background wall space.',
        'Do not expect a file to equal 50.0 KB to the exact byte—any file between 35 KB and 49 KB safely satisfies a "Max 50KB" portal rule.',
        'If a form specifies both a minimum and maximum range (for example, 20KB to 50KB), set your target near 45KB so the output stays comfortably above 20KB.',
        'Avoid re-compressing an already tiny image multiple times, as repeated lossy saves reduce sharpness.'
      ],
      exampleTableTitle: 'Example Photo & Signature Size Limits on Application Portals',
      exampleTableDisclaimer: 'These are common illustrative examples only. Always check the official instructions for the specific form you are filling out.',
      exampleTable: [
        { useCase: 'Scanned signature image', exampleRange: '10 KB – 20 KB', recommendedFormat: 'JPEG', notes: 'Sign with black or dark blue ink on plain white paper.' },
        { useCase: 'Passport-style candidate portrait', exampleRange: '20 KB – 50 KB', recommendedFormat: 'JPEG', notes: 'Standard portrait crop with plain light background.' },
        { useCase: 'High-detail ID card or thumb impression', exampleRange: '50 KB – 100 KB', recommendedFormat: 'JPEG', notes: 'Ensure text and ridges remain clear at 100% zoom.' }
      ]
    }
  },
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    shortDescription: 'Convert one or multiple JPEG, PNG, and WebP images into a clean multi-page PDF.',
    category: 'PDF Tools',
    iconName: 'FileImage',
    searchAliases: [
      'JPG to PDF converter',
      'image to PDF',
      'photo to PDF online',
      'PNG to PDF',
      'combine photos into PDF'
    ],
    targetKeyword: 'JPG to PDF converter',
    title: 'JPG to PDF Converter Online – Combine Images to PDF Free',
    metaDescription: 'Convert JPG, PNG, and WebP images to PDF in your browser. Reorder photos, choose A4, Letter, or Fit-to-Image pages, set margins, and download free.',
    h1: 'JPG to PDF Converter Online',
    intro: 'Turn phone camera photos of certificates, receipts, or handwritten pages into a neatly formatted PDF document. Arrange page order, orientation, and margins in your browser.',
    acceptsFiles: true,
    acceptedFormatsLabel: 'JPEG, PNG, WebP images',
    limitsSummary: 'Up to 40 images, max 20 MB per image.',
    relatedTools: ['merge-pdf', 'compress-pdf', 'compress-image'],
    faqs: [
      {
        question: 'Can I combine multiple photos into a single PDF file?',
        answer: 'Yes. Upload up to 40 images, arrange their order using drag-and-drop or the Move Up/Down buttons, and the converter will place one image on each page of the resulting PDF.'
      },
      {
        question: 'Will my photos be stretched or distorted to fill the page?',
        answer: 'No. Images are always scaled proportionally ("contain" mode) within the page printable area so aspect ratios are never stretched.'
      },
      {
        question: 'How does the "Fit to image" page size work?',
        answer: 'Fit-to-image sets each PDF page size to match the image dimensions assuming a standard 96 DPI screen-to-point conversion (1 pixel = 0.75 PDF points), plus any margin you select.'
      },
      {
        question: 'What does Automatic orientation do?',
        answer: 'When you choose A4 or Letter with Auto orientation, wide images are placed on landscape pages and tall images are placed on portrait pages automatically.'
      }
    ],
    guide: {
      heading: 'Converting Document Photos into Clean, Printable PDFs',
      paragraphs: [
        'Many students and job applicants photograph their degrees, CNIC/Aadhaar cards, or bank challans using a smartphone camera, only to discover that the submission portal accepts exclusively `.pdf` files. Using a reliable JPG to PDF converter lets you package one or more photos into a standard document that opens consistently on any desktop or mobile PDF viewer.',
        'When converting images to PDF, page geometry matters. If you intend to print the resulting file on standard office paper, selecting A4 (210 × 297 mm) or US Letter (8.5 × 11 inches) with a clean margin ensures that printers do not clip the edges of your document. Furthermore, setting orientation to Automatic lets the tool rotate the page canvas to landscape for wide certificates and portrait for vertical letters, maximizing readable size without stretching or squishing your image.',
        'If your PDF is only meant for on-screen viewing and you want zero white space around the edges, choose the "Fit to image" page size with No Margin. In Fit-to-image mode, each PDF page is sized directly from the image’s pixel width and height using a consistent 96 DPI physical sizing assumption (72 PDF points per inch divided by 96 pixels per inch = 0.75 points per pixel). As with all PlayBeat Tools, every image is processed locally inside your browser.'
      ],
      steps: [
        'Select one or more JPEG, PNG, or WebP images from your device.',
        'Use drag-and-drop or the Move Up and Move Down buttons to put pages in the right sequence.',
        'Pick your page size: A4, US Letter, or Fit to Image.',
        'Select page orientation (Auto, Portrait, or Landscape) and margin size (None, Small, or Normal).',
        'Click "Convert to PDF" and download your finished PDF document.'
      ],
      tipsAndMistakes: [
        'Take document photos in good daylight directly from above to avoid dark shadows across text.',
        'Use A4 with Small margins when preparing documents that may be printed by an admission office.',
        'If you upload 10 high-resolution phone photos, the resulting PDF may be several megabytes; you can compress images first or use Compress PDF afterward.',
        'Check each thumbnail before converting to make sure no image is sideways or upside down.'
      ]
    }
  },
  {
    slug: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    shortDescription: 'Crop photos to 35×45mm, 2×2 inch, or custom sizes at 300 DPI and generate printable A4 or 4×6 sheets.',
    category: 'Image Tools',
    iconName: 'Contact',
    searchAliases: [
      'Passport picture',
      'passport size photo maker online',
      '35x45mm photo maker',
      '2x2 inch photo crop',
      'printable passport photo sheet A4 4x6'
    ],
    targetKeyword: 'passport size photo maker online',
    title: 'Passport Size Photo Maker Online – 35x45mm, 2x2 & Print Sheet',
    metaDescription: 'Create passport size photos online (35x45mm, 2x2 inch, custom) at 300 DPI. Download a single JPEG or printable A4 and 4x6 inch PDF sheets in your browser.',
    h1: 'Passport Size Photo Maker Online',
    intro: 'Crop and position your portrait to standard passport and application dimensions at 300 DPI. Download a single high-resolution JPEG or generate an accurately scaled 4×6 inch or A4 multi-photo print sheet.',
    acceptsFiles: true,
    acceptedFormatsLabel: 'JPEG, PNG, WebP portrait photo',
    limitsSummary: 'Max 25 MB image file.',
    relatedTools: ['compress-image', 'resize-image', 'jpg-to-pdf'],
    faqs: [
      {
        question: 'Does this tool automatically remove the background behind my head?',
        answer: 'No. Automatic background removal is not included. The background fill color option only fills transparent areas (such as in a pre-cut transparent PNG) or canvas margins if you zoom out. Take your photo against a plain wall first.'
      },
      {
        question: 'How are pixel dimensions calculated for 35×45 mm or 2×2 inches?',
        answer: 'All physical presets are converted to pixels at standard 300 DPI print resolution (1 inch = 25.4 mm = 300 pixels). For example, 2×2 inches produces a 600 × 600 px image, and 35×45 mm produces a 413 × 531 px image.'
      },
      {
        question: 'How do I print the 4×6 inch or A4 PDF sheet at the exact physical size?',
        answer: 'In your PDF viewer print dialog, select "Actual size" or set Custom Scale to "100%". Disable "Fit to page" or "Shrink oversized pages", which would alter the physical millimeter measurements.'
      },
      {
        question: 'Is my photo guaranteed to be accepted by every embassy or exam board?',
        answer: 'No tool can guarantee acceptance. Every passport office, embassy, and examination board has strict rules regarding lighting, head height, glasses, facial expression, and background shade. Always verify the latest official instructions of your receiving organization.'
      }
    ],
    guide: {
      heading: 'How to Prepare Accurate Passport-Size Photos and Printable Sheets',
      paragraphs: [
        'Whether you are applying for a national ID, university enrollment card, civil service exam, or visa, providing a properly proportioned portrait is essential. Using a passport size photo maker online lets you frame your head and shoulders to exact physical measurements—such as 35 × 45 mm (widely used in Pakistan, the UK, and Schengen applications), 2 × 2 inches (51 × 51 mm, used for US visas and many Indian forms), or 25 × 35 mm—without needing desktop photo editing software.',
        'Our tool calculates output dimensions using accurate physical geometry at 300 dots per inch (DPI), the standard resolution for sharp photo lab printing. Under this conversion, 1 inch equals 300 pixels and 1 millimeter equals 300 / 25.4 (approximately 11.811) pixels. As you pan and zoom your portrait inside the fixed-aspect-ratio crop frame, the tool shows the exact output pixel dimensions you will receive when downloading your single JPEG.',
        'If you need physical prints, you can also generate a ready-to-print PDF sheet formatted for either a 4 × 6 inch photo card or an A4 page. The generator calculates exact PDF points (where 1 inch = 72 points and 1 mm = 72 / 25.4 points) so that each copy on the sheet measures the exact millimeter or inch size you selected, complete with optional trim guides. Please note that automatic AI background removal is not included—if your photo has a busy room behind you, stand in front of a plain, evenly lit wall or sheet before taking the picture.'
      ],
      steps: [
        'Upload a clear, front-facing portrait taken against a plain background.',
        'Choose a preset size (35×45 mm, 2×2 inches, 25×35 mm, 40×60 mm) or enter custom millimeters/inches.',
        'Drag the image and adjust the zoom slider so your head is centered with appropriate headroom.',
        'Download the single 300 DPI JPEG for online portals, or generate a 4×6 inch / A4 PDF sheet for printing.',
        'When printing the PDF sheet, select "Print at Actual size / 100%. Disable Fit to page."'
      ],
      tipsAndMistakes: [
        'Stand about half a meter away from a plain white or off-white wall in diffused daylight to prevent harsh shadows behind your ears.',
        'Remember that canvas background color only fills transparent PNG regions—it will not erase an existing wall or curtain in a normal JPEG.',
        'When printing a 4×6 or A4 PDF sheet, always uncheck "Fit to printable area" in your printer settings so a 35×45 mm photo prints at exactly 35×45 mm.',
        'If your online application form also requires the cropped JPEG to be under 50KB or 20KB, open our Compress Image tool right after downloading.'
      ],
      exampleTableTitle: 'Common Passport & Application Photo Dimension Presets (300 DPI)',
      exampleTableDisclaimer: 'Always check the current photo specifications of your specific passport authority, embassy, or exam board before submitting.',
      exampleTable: [
        { useCase: 'Standard Passport / CNIC / Visa (35 × 45 mm)', exampleRange: '413 × 531 px', recommendedFormat: '300 DPI JPEG / PDF', notes: 'Common across Pakistan, UK, EU, and many exam forms.' },
        { useCase: 'Square Visa & Application Photo (2 × 2 inches)', exampleRange: '600 × 600 px', recommendedFormat: '300 DPI JPEG / PDF', notes: 'Used for US visa forms and several Indian portals.' },
        { useCase: 'Small Admit Card / Stamp Size (25 × 35 mm)', exampleRange: '295 × 413 px', recommendedFormat: '300 DPI JPEG / PDF', notes: 'Frequently used on physical admit cards and ID badges.' },
        { useCase: 'Large Application Portrait (40 × 60 mm)', exampleRange: '472 × 709 px', recommendedFormat: '300 DPI JPEG / PDF', notes: 'Used by select institutional and certificate forms.' }
      ]
    }
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortDescription: 'Generate static, non-expiring QR codes for URLs, text, WiFi, phone numbers, and emails.',
    category: 'Utility Tools',
    iconName: 'QrCode',
    searchAliases: [
      'free QR code generator',
      'WiFi QR code maker',
      'URL to QR code',
      'download QR code SVG PNG',
      'static QR code'
    ],
    targetKeyword: 'free QR code generator',
    title: 'Free QR Code Generator – Static URL, WiFi & Text QR Codes',
    metaDescription: 'Create static QR codes for URLs, WiFi, text, phone, and email in your browser. Customize size, colors, and error correction, and download PNG or SVG free.',
    h1: 'Free Static QR Code Generator',
    intro: 'Create scannable static QR codes for links, plain text, WiFi networks, phone numbers, and email addresses. Download crisp PNG or vector SVG files with no tracking redirects or expiration.',
    acceptsFiles: false,
    relatedTools: ['word-counter', 'compress-image', 'jpg-to-pdf'],
    faqs: [
      {
        question: 'Do QR codes created here ever expire?',
        answer: 'No. These are 100% static QR codes that encode your text, URL, or WiFi credentials directly into the pattern. They do not route through any tracking server and will work forever as long as your destination link remains active.'
      },
      {
        question: 'Can I change the destination URL after printing a static QR code?',
        answer: 'No. Because static QR codes encode the data directly without a hosted redirect service, you must generate a new QR code if your link or WiFi password changes.'
      },
      {
        question: 'Are my WiFi passwords or QR contents logged or sent to a server?',
        answer: 'Never. QR matrix calculation and PNG/SVG rendering happen entirely inside your browser. Nothing you type is transmitted or logged.'
      },
      {
        question: 'Why did a low-contrast warning appear when I changed the colors?',
        answer: 'Phone cameras need strong luminance contrast (dark foreground modules on a light background with a visible quiet zone) to scan reliably. Light foreground colors or dark backgrounds can fail on many scanners.'
      }
    ],
    guide: {
      heading: 'How to Create Reliable Static QR Codes for CVs, Posters, and WiFi',
      paragraphs: [
        'Adding a QR code to a printed resume, academic portfolio, event banner, or shop counter lets people open a webpage, dial a number, or join a WiFi network without typing long characters by hand. However, many online generators secretly wrap your link inside a proprietary redirect URL and deactivate the code after a free trial ends. Using a truthful, browser-based free QR code generator creates genuine static codes that encode your payload directly into the black-and-white modules.',
        'PlayBeat Tools supports five standard QR payload modes: Website URL, Plain Text, WiFi Network (`WIFI:T:...`), Phone Call (`tel:...`), and Email (`mailto:...`). For WiFi codes, special characters such as semicolons, colons, backslashes, and quotes in your network name (SSID) or password are properly escaped according to standard WiFi QR syntax so Android and iOS cameras can parse them accurately.',
        'To make sure your code scans quickly in real-world lighting, pay attention to three settings: quiet zone margin, color contrast, and error correction level. A visible quiet zone (the blank border around the outer squares) helps camera software separate the code from surrounding text. High contrast—always a dark foreground on a light background—is critical, and our tool alerts you immediately if your color picker choices lack sufficient luminance contrast.'
      ],
      steps: [
        'Choose your QR code mode: URL, Text, WiFi, Phone, or Email.',
        'Enter the required details (such as full https:// URL or WiFi SSID and security type).',
        'Adjust output pixel size, error correction level (L, M, Q, or H), and foreground/background colors.',
        'Check that no low-contrast warning is active and test scanning the preview with your phone camera.',
        'Download a high-resolution PNG for documents or a scalable vector SVG for print design.'
      ],
      tipsAndMistakes: [
        'Always include https:// at the start of website links so phone cameras recognize the text as a clickable web address.',
        'Do not invert colors (light modules on a dark background), as many older barcode and phone scanners cannot read inverted QR codes.',
        'Keep the quiet zone margin visible—cropping right up to the black finder squares makes a QR code unreadable.',
        'Use SVG format if a graphic designer will place the QR code onto a large printed banner or brochure.'
      ]
    }
  },
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    shortDescription: 'Calculate exact completed years, months, and days on any cutoff date for job and exam forms.',
    category: 'Utility Tools',
    iconName: 'Calendar',
    searchAliases: [
      'Date of birth calculator',
      'age calculator by date of birth',
      'calculate age on specific cutoff date',
      'exam age limit calculator',
      'years months days calculator'
    ],
    targetKeyword: 'age calculator by date of birth',
    title: 'Age Calculator by Date of Birth – Exact Years, Months & Days',
    metaDescription: 'Calculate exact age in completed years, months, and days by date of birth or on any application cutoff date. Accurate leap-year and calendar math.',
    h1: 'Age Calculator by Date of Birth',
    intro: 'Find your exact age in completed years, months, and days as of today or any official application closing date. Includes total elapsed days, birth weekday, and next birthday countdown.',
    acceptsFiles: false,
    relatedTools: ['word-counter', 'compress-image', 'passport-photo-maker'],
    faqs: [
      {
        question: 'Can I calculate my age as of an exam or job advertisement closing date?',
        answer: 'Yes. Change the "Calculate age on" date from today to the exact cutoff date mentioned in your job or admission notice (for example, 31 December or the application deadline).'
      },
      {
        question: 'How does the calculator avoid timezone and daylight-saving bugs?',
        answer: 'All calculations use pure date-only calendar arithmetic (year, month, and day integers) rather than browser timestamps, so your result never shifts by a day due to UTC offsets or daylight-saving transitions.'
      },
      {
        question: 'How are February 29 (leap-day) birthdays handled in non-leap years?',
        answer: 'For a person born on February 29, in a non-leap year their birthday is treated as completed on February 28 for age progression and next-birthday countdowns. On March 1 of a non-leap year, a Feb 29 birth date counts as 1 full year and 1 day.'
      },
      {
        question: 'How are month-end dates like January 31 to February 28 calculated?',
        answer: 'When borrowing days across uneven month lengths, calendar month progression clamps to the end of the target month so completed months and remaining days remain consistent and never produce negative numbers.'
      }
    ],
    guide: {
      heading: 'How to Calculate Your Exact Age for Job, Admission, and Exam Forms',
      paragraphs: [
        'Public service commissions (such as FPSC, PPSC, SPSC, UPSC, and SSC), armed forces recruitment portals, and university admission forms frequently require candidates to enter their exact age in completed years, months, and days as of a specific cutoff date. Trying to count months and days manually on a wall calendar—especially across 30-day months, 31-day months, and February leap years—often leads to off-by-one mistakes.',
        'Using an accurate age calculator by date of birth eliminates guesswork. You simply enter your date of birth from your matriculation certificate or national ID card and select the target calculation date (which defaults to today, or can be set to any past or future closing date). The tool immediately computes your completed years, completed months, and remaining days, along with the total number of elapsed calendar days since birth, the day of the week you were born, and a countdown to your next birthday.',
        'Under the hood, PlayBeat Tools uses strict calendar-date arithmetic rather than raw millisecond subtraction. Browser `Date` objects often suffer from timezone shifts around midnight or daylight-saving changes. By operating directly on validated calendar tuples `(year, month, day)` and explicitly documenting our February 29 non-leap-year convention (treating Feb 28 as the non-leap birthday milestone), the calculator delivers deterministic, verifiable results.'
      ],
      steps: [
        'Enter your Date of Birth (Year, Month, and Day) exactly as printed on your official documents.',
        'Keep "Calculate age on" set to Today, or pick the specific cutoff date listed in your application advertisement.',
        'View your exact completed Years, Months, and Days in the primary result card.',
        'Check the secondary breakdown for Total Elapsed Days, Day of Birth weekday, and Next Birthday countdown.'
      ],
      tipsAndMistakes: [
        'Always verify whether an advertisement measures age on the application closing date or on a fixed date like January 1 or July 1.',
        'Use the date of birth written on your Matriculation / Secondary School certificate, as official recruitment boards treat that record as final.',
        'Check whether a portal asks for "completed years" only or the full "years, months, and days" breakdown.',
        'If your birth date is February 29, check the specific legal convention of your examining body when you are within one day of the upper age limit.'
      ]
    }
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, sentences, paragraphs, reading time, and top keyword density live.',
    category: 'Utility Tools',
    iconName: 'FileText',
    searchAliases: [
      'word counter online',
      'character counter with spaces',
      'essay word count checker',
      'SOP character limit counter',
      'keyword density checker'
    ],
    targetKeyword: 'word counter online',
    title: 'Word Counter Online – Count Words, Characters & Paragraphs',
    metaDescription: 'Free online word counter and character counter. Check words, characters with and without spaces, sentences, paragraphs, reading time, and top keywords.',
    h1: 'Word Counter & Character Counter Online',
    intro: 'Check live word and character counts while drafting personal statements, scholarship essays, cover letters, and online form responses. Your text stays in your browser and is never stored.',
    acceptsFiles: false,
    relatedTools: ['urdu-keyboard', 'age-calculator', 'qr-code-generator'],
    faqs: [
      {
        question: 'Is the text I paste or type into the word counter saved anywhere?',
        answer: 'No. We do not save your text in localStorage, cookies, databases, or analytics logs. When you clear the box or close the tab, your text is gone.'
      },
      {
        question: 'Does this word counter work with non-English scripts like Urdu or Hindi?',
        answer: 'Yes. The word and keyword analyzer uses Unicode-aware character property matching (`\\p{L}` and `\\p{N}`) so words in Latin, Arabic/Urdu, Devanagari, and other scripts are counted accurately.'
      },
      {
        question: 'How are sentence counts and reading time calculated?',
        answer: 'Sentence counts and reading time (based on ~200 words per minute) are practical estimates. Abbreviations like "Dr." or bulleted lists without periods can cause slight variations compared to human counting.'
      },
      {
        question: 'How does the Top 10 Keywords list work?',
        answer: 'It tokenizes your text using Unicode word boundaries, filters out common English and basic stop words (such as "the", "and", "of", "to"), and ranks the 10 most frequent meaningful words along with their percentage share.'
      }
    ],
    guide: {
      heading: 'Staying Within Word and Character Limits on Essays and Forms',
      paragraphs: [
        'Scholarship applications (such as Chevening, Fulbright, Erasmus, and HEC portals), university statements of purpose (SOPs), and freelance project proposals almost always enforce strict length boundaries. Some forms specify a maximum word count (such as 500 words per essay question), while others truncate text boxes at an exact character ceiling (such as 2,000 characters including spaces). Checking your draft in a fast word counter online prevents your final sentences from being cut off on submission.',
        'PlayBeat Tools updates six core metrics in real time as you type or paste: total words, characters including spaces, characters excluding all whitespace, estimated sentences, non-empty paragraphs, and estimated reading time. Alongside the summary numbers, a live Top 10 Keywords table reveals which terms appear most frequently in your draft after filtering out common stop words, helping you spot repetitive phrasing in essays or cover letters.',
        'Because users in Pakistan and India frequently work with multilingual text, our counter uses Unicode-aware regular expressions rather than basic ASCII letter ranges. It handles long documents smoothly without locking up the browser, and it intentionally avoids saving your drafts to localStorage so shared library or lab computers never retain your private application essays.'
      ],
      steps: [
        'Type directly into the editor or paste your draft text from your word processor.',
        'Review live counts for Words, Characters (with spaces), Characters (no spaces), Sentences, and Paragraphs.',
        'Check the Top 10 Keywords panel to see your most repeated words and their percentage density.',
        'Use the "Copy Text" button to copy your edited draft back to your application form, or click "Clear" when finished.'
      ],
      tipsAndMistakes: [
        'Pay close attention to whether an online portal specifies a "Word Limit" or a "Character Limit (including spaces)"—they differ by roughly a factor of 5 to 6.',
        'Remember that sentence counts and reading times are estimates; abbreviations or unpunctuated headings are counted heuristically.',
        'Draft your essay offline and paste it here to trim extra words before pasting into portals that time out after 15 minutes of inactivity.',
        'Always click "Clear" after using a public or shared computer.'
      ]
    }
  },
  {
    slug: 'resize-image',
    name: 'Resize Image',
    shortDescription: 'Resize images by exact pixels, percentage, or target file size in JPEG, PNG, or WebP.',
    category: 'Image Tools',
    iconName: 'Scaling',
    searchAliases: [
      'resize image in KB',
      'change image dimensions px',
      'photo resizer width height',
      'scale image by percentage',
      'resize PNG JPEG WebP'
    ],
    targetKeyword: 'resize image in KB',
    title: 'Resize Image in KB & Pixels Online – Width, Height & Size',
    metaDescription: 'Resize images by pixel width and height, percentage, or target KB size in your browser. Aspect-ratio lock, JPEG/PNG/WebP export, and live preview.',
    h1: 'Resize Image by Pixels, Percentage, or KB',
    intro: 'Change photo width and height in pixels, scale by percentage, or reduce an image toward a target KB size. Supports JPEG, PNG, and WebP output with real browser format detection.',
    acceptsFiles: true,
    acceptedFormatsLabel: 'JPEG, PNG, WebP images',
    limitsSummary: 'Max 25 MB image file, output up to 8000 × 8000 px.',
    relatedTools: ['compress-image', 'passport-photo-maker', 'jpg-to-pdf'],
    faqs: [
      {
        question: 'What is the difference between pixel dimensions and file size in KB?',
        answer: 'Pixel dimensions (such as 600 × 800 px) describe the width and height of the image grid on screen. File size (such as 45 KB) measures how much storage space the encoded file uses. Both affect whether an upload portal accepts your photo.'
      },
      {
        question: 'Why does changing the quality slider not shrink a PNG file?',
        answer: 'Standard canvas PNG export is a lossless format and ignores lossy quality sliders. To hit a small KB limit like 50KB, switch the output format to JPEG or WebP, or reduce the pixel width and height.'
      },
      {
        question: 'What happens if my browser does not support encoding WebP?',
        answer: 'The tool detects the actual MIME type produced by your browser canvas (`blob.type`) and reports the real format generated rather than falsely renaming a PNG or JPEG file.'
      },
      {
        question: 'Why should I keep Aspect Ratio Lock enabled?',
        answer: 'Keeping aspect ratio locked ensures that when you change the width, the height updates proportionally so faces and text do not look stretched or squashed.'
      }
    ],
    guide: {
      heading: 'How to Resize Image Dimensions and File Size for Online Uploads',
      paragraphs: [
        'Online application systems often reject uploaded images for two separate reasons: either the pixel dimensions are wrong (for example, "image width must not exceed 800 pixels") or the storage size is too high (for example, "resize image in KB to under 50KB"). Understanding the difference between pixel resolution and byte size makes fixing upload errors straightforward.',
        'Pixel dimensions measure how many dots wide and tall an image is, such as 1200 × 1600 px. File size (measured in KB or MB) depends on both those pixel dimensions and the compression format used (JPEG, WebP, or PNG). PlayBeat Tools gives you three dedicated modes in one workspace: Resize by Width & Height (in pixels), Resize by Percentage (such as 50% or 25%), and Reduce to Target File Size (in KB). By default, the aspect-ratio lock is active so changing width automatically adjusts height without distorting your photo.',
        'Format choice also plays a major role. Lossless PNG files preserve transparency and sharp graphics, but they do not respond to a lossy quality slider like JPEG or WebP. If you need to meet a small KB cap, converting to JPEG (with a chosen background color for any transparent areas) or reducing pixel dimensions is the right approach. Moreover, our tool inspects the actual output blob generated by your browser and honestly reports both the real format and the exact resulting dimensions and file size.'
      ],
      steps: [
        'Upload your JPEG, PNG, or WebP image file.',
        'Select your resize mode: By Width & Height (px), By Percentage (%), or Target File Size (KB).',
        'Keep "Lock aspect ratio" checked for proportional scaling, or uncheck it if a form demands exact non-proportional dimensions.',
        'Select your desired export format (JPEG, PNG, or WebP) and background fill color if converting transparency to JPEG.',
        'Click "Resize Image", inspect the before/after dimensions and file sizes, and download.'
      ],
      tipsAndMistakes: [
        'Unlock aspect ratio only if an image is already cropped close to the target shape—otherwise faces will appear stretched.',
        'Do not use PNG when trying to hit a strict 30KB or 50KB portal limit for a photograph; use JPEG instead.',
        'Avoid enlarging a tiny image to huge pixel dimensions, as scaling up cannot invent new detail and makes edges blurry.',
        'Check both the resulting pixel dimensions and KB size shown in the result summary before downloading.'
      ]
    }
  },
  {
    slug: 'urdu-keyboard',
    name: 'Urdu Keyboard',
    shortDescription: 'Type Urdu online using an on-screen keyboard or phonetic English key mapping and export UTF-8 text.',
    category: 'Utility Tools',
    iconName: 'Keyboard',
    searchAliases: [
      'Urdu typing',
      'Urdu keyboard online',
      'phonetic Urdu keyboard',
      'type in Urdu on English keyboard',
      'Urdu text editor copy download'
    ],
    targetKeyword: 'Urdu keyboard online',
    title: 'Urdu Keyboard Online – Phonetic Urdu Typing & Text Editor',
    metaDescription: 'Type Urdu online with an interactive on-screen keyboard and optional phonetic English key mapping. Copy UTF-8 Urdu text or download as a .txt file free.',
    h1: 'Urdu Keyboard Online (Phonetic & On-Screen)',
    intro: 'Type in right-to-left Urdu using either your physical keyboard with phonetic letter mapping (for example, a → ا, b → ب, p → پ) or by clicking the on-screen Urdu keys. Copy clean UTF-8 text or save as a `.txt` file.',
    acceptsFiles: false,
    relatedTools: ['word-counter', 'qr-code-generator', 'age-calculator'],
    faqs: [
      {
        question: 'Is this a phonetic keyboard or a sentence translator?',
        answer: 'This is a character-by-character phonetic Urdu keyboard, not a word transliterator or English-to-Urdu translator. Pressing an English key inserts its corresponding Urdu letter (for example, pressing "k" inserts "ک" and Shift+"K" inserts "خ").'
      },
      {
        question: 'Can I turn off phonetic mapping to type normal English or use my OS Urdu keyboard?',
        answer: 'Yes. Toggle off "Phonetic Physical Keyboard Mapping" above the editor at any time to type standard English letters, numbers, or use your operating system’s native Urdu/IME layout.'
      },
      {
        question: 'Do keyboard shortcuts like Ctrl+C, Ctrl+V, Ctrl+Z, and text selection still work?',
        answer: 'Yes. All modifier shortcuts (Ctrl/Cmd/Alt), arrow keys, Backspace, Enter newlines, cursor placement, and text selection replacement work naturally.'
      },
      {
        question: 'Can I use the Urdu text in Word, WhatsApp, or online forms?',
        answer: 'Yes. The editor produces standard Unicode UTF-8 Urdu characters that you can copy and paste into any modern browser form, messaging app, or document editor.'
      }
    ],
    guide: {
      heading: 'How to Type Urdu Online Using Phonetic Key Mapping and On-Screen Keys',
      paragraphs: [
        'Many desktop and laptop computers in offices, university labs, and homes only have standard QWERTY English keyboards configured. When you need to fill out an Urdu field on a registration form, draft an application in Urdu, or write a notice without installing system language packs, an Urdu keyboard online provides immediate access to the full Urdu alphabet right inside your browser.',
        'PlayBeat Tools offers two ways to type that work seamlessly together. First, you can enable Phonetic Physical Keyboard Mapping, which maps familiar English letter sounds to Urdu characters—such as `a` for الف (`ا`), `b` for ب (`ب`), `p` for پ (`پ`), `s` for س (`س`), and `Shift + S` for ص (`ص`). Second, you can click or tap any button on the visual on-screen Urdu keyboard, which switches between Base keys and Shift keys so every standard Urdu letter, vowel mark, and punctuation symbol (such as the Urdu full stop `۔` and question mark `؟`) is within easy reach.',
        'Please note that a phonetic keyboard maps individual keystrokes to Urdu letters; it does not translate English sentences or convert Roman Urdu words automatically. Our right-to-left editor uses a self-hosted Noto Naskh Arabic typeface with generous line height for clear legibility, preserves cursor position and highlighted text selection when inserting letters, respects IME composition on mobile phones, and lets you copy or download your work as a UTF-8 `.txt` file.'
      ],
      steps: [
        'Click inside the right-to-left Urdu text editor box.',
        'Type on your physical keyboard with Phonetic Mapping enabled, or click letters on the on-screen Urdu keyboard below.',
        'Hold Shift on your keyboard (or toggle the on-screen Shift button) to access secondary Urdu letters like ٹ, ڈ, ڑ, ص, ط, and غ.',
        'Refer to the Phonetic Key Mapping Chart whenever you need to check which English key produces a specific Urdu letter.',
        'Click "Copy Urdu Text" to paste into your destination, or click "Download .txt" to save a UTF-8 text file.'
      ],
      tipsAndMistakes: [
        'Remember that phonetic mapping works letter by letter (e.g., to write پاکستان, press p - a - k - s - t - a - n).',
        'Toggle off "Phonetic Mapping" if you want to insert an English word, email address, or reference number inside your Urdu paragraph.',
        'Use the Spacebar between words and the Urdu full stop (`۔`, mapped to `.`) at the end of sentences.',
        'Download your text as a `.txt` file before closing the browser tab, because entered text is never stored on a server or in localStorage.'
      ]
    }
  }
];

export const TOOL_BY_SLUG: Record<ToolSlug, ToolDefinition> = TOOLS_REGISTRY.reduce(
  (acc, tool) => {
    acc[tool.slug] = tool;
    return acc;
  },
  {} as Record<ToolSlug, ToolDefinition>
);

export function getRelatedTools(slug: ToolSlug): ToolDefinition[] {
  const current = TOOL_BY_SLUG[slug];
  if (!current) return [];
  return current.relatedTools
    .map((relSlug) => TOOL_BY_SLUG[relSlug])
    .filter((t): t is ToolDefinition => Boolean(t));
}
