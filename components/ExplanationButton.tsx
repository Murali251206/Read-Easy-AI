"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface ExplanationButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ExplanationButton: React.FC<ExplanationButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
        isLoading
          ? "bg-brand-400 text-white cursor-wait"
          : disabled
          ? "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed"
          : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 hover:shadow-brand-500/35 hover:-translate-y-0.5 active:translate-y-0"
      }`}
      title="Generate educational explanation using local Ollama AI"
      aria-label="Explain original text"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Generating explanation…</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 text-white" />
          <span>Explain</span>
        </>
      )}
    </button>
  );
};
