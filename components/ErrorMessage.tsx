"use client";

import React from "react";
import { AlertTriangle, Terminal, X, ExternalLink } from "lucide-react";

interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
  title?: string;
  isOllamaError?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  title = "Something went wrong",
  isOllamaError = false,
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="w-full rounded-2xl border border-rose-200 bg-rose-50/90 p-4 sm:p-5 shadow-sm text-rose-900 animate-in fade-in duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
            <p className="text-sm text-rose-800 leading-relaxed">{message}</p>

            {isOllamaError && (
              <div className="mt-3 p-3 bg-white/80 rounded-xl border border-rose-200/80 text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-brand-600" />
                  Quick local Ollama check:
                </p>
                <div className="bg-slate-900 text-slate-100 p-2 rounded-lg font-mono text-[11px] select-all">
                  ollama serve
                </div>
                <p className="text-slate-600">
                  Ensure Ollama is running and has your configured model pulled:
                </p>
                <div className="bg-slate-900 text-slate-100 p-2 rounded-lg font-mono text-[11px] select-all">
                  ollama pull llama3
                </div>
                <p className="text-[11px] text-slate-500">
                  You can still use OCR and text-to-speech reading even while Ollama is offline!
                </p>
              </div>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition-colors"
            aria-label="Dismiss error message"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
