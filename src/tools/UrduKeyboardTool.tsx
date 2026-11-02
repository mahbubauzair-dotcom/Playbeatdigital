import React, { useRef, useState } from 'react';
import { Check, Copy, Download, HelpCircle, Trash2 } from 'lucide-react';
import {
  PHONETIC_MAP,
  URDU_KEYBOARD_ROWS,
  backspaceAtSelection,
  insertAtSelection,
} from '../lib/urduKeyboardMap';

export const UrduKeyboardTool: React.FC = () => {
  const [text, setText] = useState('');
  const [phoneticEnabled, setPhoneticEnabled] = useState(true);
  const [shiftActive, setShiftActive] = useState(false);
  const [showMappingHelp, setShowMappingHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const isComposingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applyInsertion = (insertedChar: string) => {
    const el = textareaRef.current;
    const selStart = el ? el.selectionStart ?? text.length : text.length;
    const selEnd = el ? el.selectionEnd ?? text.length : text.length;

    const updated = insertAtSelection(text, selStart, selEnd, insertedChar);
    setText(updated.text);
    if (el) {
      el.value = updated.text;
      el.setSelectionRange(updated.selectionStart, updated.selectionEnd);
    }

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          updated.selectionStart,
          updated.selectionEnd
        );
      }
    });
  };

  const applyBackspace = () => {
    const el = textareaRef.current;
    const selStart = el ? el.selectionStart ?? text.length : text.length;
    const selEnd = el ? el.selectionEnd ?? text.length : text.length;

    const updated = backspaceAtSelection(text, selStart, selEnd);
    setText(updated.text);
    if (el) {
      el.value = updated.text;
      el.setSelectionRange(updated.selectionStart, updated.selectionEnd);
    }

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          updated.selectionStart,
          updated.selectionEnd
        );
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Respect IME composition, disabled mapping mode, and clipboard/system shortcuts
    if (!phoneticEnabled || isComposingRef.current || e.nativeEvent.isComposing) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Preserve Backspace, Enter, Tab, Arrow keys, etc.
    if (e.key.length !== 1) {
      return;
    }

    const mappedUrdu = PHONETIC_MAP[e.key];
    if (mappedUrdu) {
      e.preventDefault();
      applyInsertion(mappedUrdu);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadTxt = () => {
    if (!text) return;
    // Include UTF-8 BOM so Windows Notepad opens Urdu characters properly
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urdu-text.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-5">
      {/* Notice & Phonetic Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
        <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">
          <input
            type="checkbox"
            checked={phoneticEnabled}
            onChange={(e) => setPhoneticEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
          />
          <span>Enable Phonetic Physical Keyboard Mapping (e.g., a → ا, b → ب, p → پ)</span>
        </label>

        <button
          type="button"
          onClick={() => setShowMappingHelp((prev) => !prev)}
          aria-expanded={showMappingHelp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{showMappingHelp ? 'Hide Key Mapping' : 'Show Key Mapping Help'}</span>
        </button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        <strong>Note:</strong> This is a character-by-character phonetic Urdu keyboard, not full sentence transliteration or translation. Disable phonetic mapping above whenever you want to type English letters or use your device&rsquo;s native Urdu keyboard.
      </p>

      {/* Collapsible Phonetic Mapping Reference Table */}
      {showMappingHelp && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
            Phonetic English-to-Urdu Key Mapping Reference
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-10 gap-2 text-center">
            {URDU_KEYBOARD_ROWS.flat().map((k) => (
              <div
                key={k.enKey}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="font-mono text-slate-500 dark:text-slate-400">
                  {k.enKey} / {k.enKey.toUpperCase()}
                </div>
                <div className="font-urdu text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {k.baseUrdu} {k.shiftUrdu ? `· ${k.shiftUrdu}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right-to-Left Editor */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label
            htmlFor="urdu-editor-textarea"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Urdu Editor (Right-to-Left · Noto Naskh Arabic)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Urdu Text</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download .txt</span>
            </button>
            <button
              type="button"
              onClick={() => setText('')}
              disabled={!text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          id="urdu-editor-textarea"
          dir="rtl"
          lang="ur"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          placeholder="یہاں اردو لکھیں..."
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 font-urdu text-lg sm:text-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y"
        />
      </div>

      {/* Interactive On-Screen Urdu Keyboard */}
      <div
        aria-label="On-screen Urdu keyboard"
        className="p-3 sm:p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-2"
      >
        {URDU_KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex flex-wrap justify-center gap-1.5">
            {row.map((keyDef) => {
              const charToInsert =
                shiftActive && keyDef.shiftUrdu ? keyDef.shiftUrdu : keyDef.baseUrdu;
              const displayLabel =
                shiftActive && keyDef.shiftLabel ? keyDef.shiftLabel : keyDef.baseLabel;
              const keyHint = shiftActive
                ? keyDef.enKey.toUpperCase()
                : keyDef.enKey;

              return (
                <button
                  key={keyDef.enKey}
                  type="button"
                  onClick={() => {
                    applyInsertion(charToInsert);
                    if (shiftActive) setShiftActive(false);
                  }}
                  className="min-w-[38px] sm:min-w-[48px] h-12 sm:h-14 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 active:scale-95 transition-all flex flex-col items-center justify-center shadow-2xs cursor-pointer"
                >
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 leading-none">
                    {keyHint}
                  </span>
                  <span className="font-urdu text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
                    {displayLabel}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Bottom Modifier Row: Shift, Spacebar, Full Stop, Enter, Backspace */}
        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setShiftActive((prev) => !prev)}
            aria-pressed={shiftActive}
            className={`px-3.5 h-11 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              shiftActive
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            Shift {shiftActive ? '(Active)' : ''}
          </button>

          <button
            type="button"
            onClick={() => applyInsertion(' ')}
            className="flex-1 max-w-xs min-w-[120px] h-11 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            Space (فاصلہ)
          </button>

          <button
            type="button"
            onClick={() => applyInsertion('۔')}
            className="px-3.5 h-11 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-urdu text-base font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
            title="Urdu Full Stop"
          >
            ۔
          </button>

          <button
            type="button"
            onClick={() => applyInsertion('\n')}
            className="px-3.5 h-11 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            Enter ↵
          </button>

          <button
            type="button"
            onClick={applyBackspace}
            className="px-3.5 h-11 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-500 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            ⌫ Backspace
          </button>
        </div>
      </div>
    </div>
  );
};
