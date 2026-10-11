"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Volume2,
  Sparkles,
  X,
  VolumeX,
} from "lucide-react";
import { SelectedTextRegion, SupportedLanguage } from "@/types";

interface LensToolbarProps {
  selection: SelectedTextRegion | null;
  originalLanguage: SupportedLanguage;
  explanationLanguage: SupportedLanguage;
  onReadSelected: (text: string, language: SupportedLanguage) => void;
  onExplainSelected: (text: string, selectionType: SelectedTextRegion["type"]) => void;
  onClearSelection: () => void;
  isReading?: boolean;
  onStopReading?: () => void;
  isExplaining?: boolean;
  className?: string;
  isFloating?: boolean;
}

export const LensToolbar: React.FC<LensToolbarProps> = ({
  selection,
  originalLanguage,
  explanationLanguage,
  onReadSelected,
  onExplainSelected,
  onClearSelection,
  isReading = false,
  onStopReading,
  isExplaining = false,
  className = "",
  isFloating = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!selection || !selection.text.trim()) {
    return null;
  }

  const isAll = selection.type === "all";
  const trimmed = selection.text.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback copy
      const textArea = document.createElement("textarea");
      textArea.value = trimmed;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleRead = () => {
    if (isReading && onStopReading) {
      onStopReading();
    } else {
      onReadSelected(trimmed, originalLanguage);
    }
  };

  const handleExplain = () => {
    onExplainSelected(trimmed, selection.type);
  };

  return (
    <div
      role="toolbar"
      aria-label="Selected text actions"
      className={`flex items-center gap-2 p-1.5 bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-2xl shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200 z-30 ${
        isFloating ? "absolute pointer-events-auto" : ""
      } ${className}`}
    >
      {/* Type badge */}
      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/20 shrink-0">
        {selection.type === "word"
          ? "Word"
          : selection.type === "line"
          ? "Line"
          : selection.type === "paragraph"
          ? "Paragraph"
          : selection.type === "all"
          ? "All Text"
          : `${wordCount} words`}
      </span>

      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-100 hover:text-white transition-all border border-slate-700/60"
        title="Copy selected text to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in" />
            <span className="text-emerald-400 font-semibold">✓ Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAll ? "Copy All" : "Copy"}</span>
          </>
        )}
      </button>

      {/* Read Aloud Button (in Original Language) */}
      <button
        type="button"
        onClick={handleRead}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl active:scale-95 transition-all border ${
          isReading
            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
            : "bg-slate-800/90 hover:bg-slate-700 text-slate-100 hover:text-white border-slate-700/60"
        }`}
        title={`Read aloud in original detected language (${originalLanguage.name})`}
      >
        {isReading ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAll ? "Read All" : "Read"}</span>
          </>
        )}
      </button>

      {/* Explain Button (in Selected Explanation Language) */}
      <button
        type="button"
        onClick={handleExplain}
        disabled={isExplaining}
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
        title={`Explain in ${explanationLanguage.name}`}
      >
        <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isExplaining ? "animate-spin" : ""}`} />
        <span>
          {isExplaining
            ? "Explaining..."
            : isAll
            ? "Explain All"
            : "Explain"}
        </span>
      </button>

      {/* Clear Button */}
      <button
        type="button"
        onClick={onClearSelection}
        className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition-colors"
        title="Deselect"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
