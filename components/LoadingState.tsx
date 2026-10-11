"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Generating explanation...",
  subMessage = "Reading and analyzing text with your local Ollama AI model",
}) => {
  return (
    <div className="w-full rounded-2xl border border-brand-100 bg-brand-50/40 p-8 text-center flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-brand-200 shadow-sm flex items-center justify-center text-brand-600">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin absolute -bottom-1 -right-1" />
      </div>

      <h3 className="text-sm font-semibold text-slate-800">{message}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{subMessage}</p>
    </div>
  );
};
