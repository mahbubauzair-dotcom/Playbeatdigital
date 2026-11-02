export interface KeywordStat {
  word: string;
  count: number;
  densityPercent: number;
}

export interface WordCounterResult {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  readingTimeFormatted: string;
  topKeywords: KeywordStat[];
}

const STOP_WORDS = new Set([
  'the', 'and', 'to', 'of', 'in', 'is', 'for', 'that', 'with', 'on', 'as', 'are',
  'this', 'by', 'be', 'at', 'or', 'from', 'an', 'it', 'not', 'have', 'has', 'was',
  'were', 'but', 'which', 'you', 'your', 'we', 'our', 'they', 'their', 'can', 'will',
  'all', 'if', 'more', 'when', 'into', 'up', 'out', 'so', 'what', 'about', 'who',
  'get', 'which', 'go', 'me', 'make', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'year', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'work', 'first', 'well', 'way', 'even', 'new',
  'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'been', 'had',
  'do', 'does', 'did', 'should', 'would', 'may', 'might', 'must', 'am', 'he', 'she',
  'his', 'her', 'my', 'i', 'a', 'کی', 'کے', 'کا', 'میں', 'ہے', 'ہیں', 'کو', 'سے',
  'پر', 'اور', 'نے', 'تھا', 'تھی', 'تھے', 'بھی', 'یہ', 'وہ', 'اس', 'ان', 'ایک', 'تو'
]);

// Unicode-aware word token matcher (supports Latin, Urdu/Arabic, Devanagari, numbers, internal apostrophes/hyphens)
const WORD_REGEX = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

export function analyzeText(input: string): WordCounterResult {
  if (!input) {
    return {
      words: 0,
      charactersWithSpaces: 0,
      charactersWithoutSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      readingTimeFormatted: '0 sec',
      topKeywords: [],
    };
  }

  // Use Array.from to count Unicode code points accurately
  const charactersWithSpaces = input.length;
  const charactersWithoutSpaces = input.replace(/\s+/gu, '').length;

  const matchedWords = input.match(WORD_REGEX) ?? [];
  const words = matchedWords.length;

  const trimmed = input.trim();
  let sentences = 0;
  if (trimmed.length > 0) {
    // Match sentence-ending punctuation (. ! ? ۔ ؟ ।) followed by whitespace or end of string
    const sentenceMatches = trimmed.match(/[.!?۔؟।]+(?=\s|$)/gu);
    sentences = sentenceMatches ? sentenceMatches.length : (words > 0 ? 1 : 0);
  }

  const paragraphs = trimmed.length === 0
    ? 0
    : trimmed
        .split(/\r?\n\s*\r?\n|\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0).length;

  // Reading time based on 200 words per minute
  const readingTimeMinutes = words / 200;
  let readingTimeFormatted = '0 sec';
  if (words > 0) {
    const totalSeconds = Math.max(1, Math.ceil((words / 200) * 60));
    if (totalSeconds < 60) {
      readingTimeFormatted = `~${totalSeconds} sec`;
    } else {
      const mins = Math.ceil(words / 200);
      readingTimeFormatted = `~${mins} min`;
    }
  }

  // Keyword frequency analysis
  const freqMap = new Map<string, number>();
  for (const rawWord of matchedWords) {
    const normalized = rawWord.toLowerCase();
    // Skip single-character tokens and common stop words
    if (normalized.length < 2) continue;
    if (STOP_WORDS.has(normalized)) continue;
    if (/^\d+$/.test(normalized)) continue;
    freqMap.set(normalized, (freqMap.get(normalized) ?? 0) + 1);
  }

  const topKeywords: KeywordStat[] = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      densityPercent: words > 0 ? Number(((count / words) * 100).toFixed(1)) : 0,
    }));

  return {
    words,
    charactersWithSpaces,
    charactersWithoutSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    readingTimeFormatted,
    topKeywords,
  };
}
