export interface UrduKeyDef {
  enKey: string;
  baseUrdu: string;
  baseLabel: string;
  shiftUrdu?: string;
  shiftLabel?: string;
}

export const URDU_KEYBOARD_ROWS: UrduKeyDef[][] = [
  [
    { enKey: 'q', baseUrdu: 'ق', baseLabel: 'ق', shiftUrdu: 'ْ', shiftLabel: 'جزم' },
    { enKey: 'w', baseUrdu: 'و', baseLabel: 'و', shiftUrdu: 'ؤ', shiftLabel: 'ؤ' },
    { enKey: 'e', baseUrdu: 'ع', baseLabel: 'ع', shiftUrdu: 'ۂ', shiftLabel: 'ۂ' },
    { enKey: 'r', baseUrdu: 'ر', baseLabel: 'ر', shiftUrdu: 'ڑ', shiftLabel: 'ڑ' },
    { enKey: 't', baseUrdu: 'ت', baseLabel: 'ت', shiftUrdu: 'ٹ', shiftLabel: 'ٹ' },
    { enKey: 'y', baseUrdu: 'ے', baseLabel: 'ے', shiftUrdu: 'ئ', shiftLabel: 'ئ' },
    { enKey: 'u', baseUrdu: 'ء', baseLabel: 'ء', shiftUrdu: 'پیش', shiftLabel: 'ُ' },
    { enKey: 'i', baseUrdu: 'ی', baseLabel: 'ی', shiftUrdu: 'ِ', shiftLabel: 'زیر' },
    { enKey: 'o', baseUrdu: 'ہ', baseLabel: 'ہ', shiftUrdu: 'ۃ', shiftLabel: 'ۃ' },
    { enKey: 'p', baseUrdu: 'پ', baseLabel: 'پ', shiftUrdu: 'ُ', shiftLabel: 'پیش' },
  ],
  [
    { enKey: 'a', baseUrdu: 'ا', baseLabel: 'ا', shiftUrdu: 'آ', shiftLabel: 'آ' },
    { enKey: 's', baseUrdu: 'س', baseLabel: 'س', shiftUrdu: 'ص', shiftLabel: 'ص' },
    { enKey: 'd', baseUrdu: 'د', baseLabel: 'د', shiftUrdu: 'ڈ', shiftLabel: 'ڈ' },
    { enKey: 'f', baseUrdu: 'ف', baseLabel: 'ف', shiftUrdu: 'ّ', shiftLabel: 'شد' },
    { enKey: 'g', baseUrdu: 'گ', baseLabel: 'گ', shiftUrdu: 'غ', shiftLabel: 'غ' },
    { enKey: 'h', baseUrdu: 'ھ', baseLabel: 'ھ', shiftUrdu: 'ح', shiftLabel: 'ح' },
    { enKey: 'j', baseUrdu: 'ج', baseLabel: 'ج', shiftUrdu: 'ض', shiftLabel: 'ض' },
    { enKey: 'k', baseUrdu: 'ک', baseLabel: 'ک', shiftUrdu: 'خ', shiftLabel: 'خ' },
    { enKey: 'l', baseUrdu: 'ل', baseLabel: 'ل', shiftUrdu: 'ً', shiftLabel: 'دو زبر' },
  ],
  [
    { enKey: 'z', baseUrdu: 'ز', baseLabel: 'ز', shiftUrdu: 'ذ', shiftLabel: 'ذ' },
    { enKey: 'x', baseUrdu: 'ش', baseLabel: 'ش', shiftUrdu: 'ژ', shiftLabel: 'ژ' },
    { enKey: 'c', baseUrdu: 'چ', baseLabel: 'چ', shiftUrdu: 'ث', shiftLabel: 'ث' },
    { enKey: 'v', baseUrdu: 'ط', baseLabel: 'ط', shiftUrdu: 'ظ', shiftLabel: 'ظ' },
    { enKey: 'b', baseUrdu: 'ب', baseLabel: 'ب', shiftUrdu: 'ٰ', shiftLabel: 'کھڑا زبر' },
    { enKey: 'n', baseUrdu: 'ن', baseLabel: 'ن', shiftUrdu: 'ں', shiftLabel: 'ں' },
    { enKey: 'm', baseUrdu: 'م', baseLabel: 'م', shiftUrdu: 'َ', shiftLabel: 'زبر' },
    { enKey: ',', baseUrdu: '،', baseLabel: '،', shiftUrdu: '؛', shiftLabel: '؛' },
    { enKey: '.', baseUrdu: '۔', baseLabel: '۔', shiftUrdu: '؟', shiftLabel: '؟' },
  ],
];

export const PHONETIC_MAP: Record<string, string> = {
  q: 'ق', Q: 'ْ',
  w: 'و', W: 'ؤ',
  e: 'ع', E: 'ۂ',
  r: 'ر', R: 'ڑ',
  t: 'ت', T: 'ٹ',
  y: 'ے', Y: 'ئ',
  u: 'ء', U: 'ُ',
  i: 'ی', I: 'ِ',
  o: 'ہ', O: 'ۃ',
  p: 'پ', P: 'ُ',
  a: 'ا', A: 'آ',
  s: 'س', S: 'ص',
  d: 'د', D: 'ڈ',
  f: 'ف', F: 'ّ',
  g: 'گ', G: 'غ',
  h: 'ھ', H: 'ح',
  j: 'ج', J: 'ض',
  k: 'ک', K: 'خ',
  l: 'ل', L: 'ً',
  z: 'ز', Z: 'ذ',
  x: 'ش', X: 'ژ',
  c: 'چ', C: 'ث',
  v: 'ط', V: 'ظ',
  b: 'ب', B: 'ٰ',
  n: 'ن', N: 'ں',
  m: 'م', M: 'َ',
  ',': '،',
  '<': '؛',
  '.': '۔',
  '?': '؟',
  '/': '؟',
  ';': '؛',
};

export interface TextEditOperationResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Pure helper to insert text at the current cursor or replace the active selection
 * while preserving exact cursor placement.
 */
export function insertAtSelection(
  currentText: string,
  selectionStart: number,
  selectionEnd: number,
  inserted: string
): TextEditOperationResult {
  const start = Math.max(0, Math.min(selectionStart, currentText.length));
  const end = Math.max(start, Math.min(selectionEnd, currentText.length));
  const nextText = currentText.slice(0, start) + inserted + currentText.slice(end);
  const nextCursor = start + inserted.length;
  return {
    text: nextText,
    selectionStart: nextCursor,
    selectionEnd: nextCursor,
  };
}

/**
 * Pure helper to handle on-screen Backspace with cursor or highlighted selection.
 */
export function backspaceAtSelection(
  currentText: string,
  selectionStart: number,
  selectionEnd: number
): TextEditOperationResult {
  const start = Math.max(0, Math.min(selectionStart, currentText.length));
  const end = Math.max(start, Math.min(selectionEnd, currentText.length));

  if (start !== end) {
    // Delete selected range
    const nextText = currentText.slice(0, start) + currentText.slice(end);
    return {
      text: nextText,
      selectionStart: start,
      selectionEnd: start,
    };
  }

  if (start === 0) {
    return { text: currentText, selectionStart: 0, selectionEnd: 0 };
  }

  const nextText = currentText.slice(0, start - 1) + currentText.slice(end);
  const nextCursor = start - 1;
  return {
    text: nextText,
    selectionStart: nextCursor,
    selectionEnd: nextCursor,
  };
}
