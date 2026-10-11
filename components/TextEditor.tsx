"use client";

import React, { useMemo } from "react";
import { FileText, Trash2, Copy, Check, Edit3 } from "lucide-react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  direction?: "ltr" | "rtl";
  disabled?: boolean;
  placeholder?: string;
  title?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  onClear,
  direction = "ltr",
  disabled = false,
  placeholder = "Extracted text will appear here. Feel free to type, paste, or correct OCR mistakes...",
  title = "Extracted Text",
}) => {
  const [copied, setCopied] = React.useState(false);

  // Compute character and word counts
  const { charCount, wordCount } = useMemo(() => {
    const trimmed = value.trim();
    const chars = value.length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    return { charCount: chars, wordCount: words };
  }, [value]);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Editable — correct OCR typos, add missing words, or adjust punctuation
            </p>
          </div>
        </div>

        {/* Counter & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            <span>{wordCount} words</span>
            <span className="mx-1 text-slate-300">•</span>
            <span>{charCount} chars</span>
          </div>

          {value && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title={copied ? "Copied!" : "Copy text"}
                aria-label="Copy extracted text"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Clear text"
                aria-label="Clear extracted text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editable Area */}
      <div className="relative">
        <textarea
          dir={direction}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          rows={8}
          className="w-full resize-y rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed font-sans"
          aria-label="Extracted text content"
        />
      </div>
    </div>
  );
};
