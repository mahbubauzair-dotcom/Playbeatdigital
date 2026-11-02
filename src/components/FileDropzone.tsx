import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  label: string;
  sublabel: string;
  limitsText: string;
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  multiple = false,
  label,
  sublabel,
  limitsText,
  disabled = false,
  onFilesSelected,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTriggerClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      onFilesSelected(Array.from(fileList));
    }
    // Reset input value so selecting the same file again works
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer?.files;
    if (dropped && dropped.length > 0) {
      const arr = Array.from(dropped);
      onFilesSelected(multiple ? arr : [arr[0]]);
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={`${label}. ${sublabel}. ${limitsText}`}
      onClick={handleTriggerClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors select-none ${
        disabled
          ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
          : isDragging
          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 cursor-pointer'
          : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-900/50 cursor-pointer'
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
      <div className="mx-auto w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-xs">
        <Upload className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </div>
      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        {sublabel}
      </p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {limitsText}
      </p>
    </div>
  );
};
