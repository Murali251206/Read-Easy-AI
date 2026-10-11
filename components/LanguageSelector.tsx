"use client";

import React, { useState } from "react";
import { SupportedLanguage, LanguageDetectionResult } from "@/types";
import { SUPPORTED_LANGUAGES } from "@/lib/ocr/languages";
import {
  Globe,
  CheckCircle,
  HelpCircle,
  ArrowRightLeft,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface LanguageSelectorProps {
  originalLanguage: SupportedLanguage;
  explanationLanguage: SupportedLanguage;
  detectionResult: LanguageDetectionResult | null;
  isManualOriginalOverride: boolean;
  onOriginalLanguageChange: (lang: SupportedLanguage, isManual: boolean) => void;
  onExplanationLanguageChange: (lang: SupportedLanguage) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  originalLanguage,
  explanationLanguage,
  detectionResult,
  isManualOriginalOverride,
  onOriginalLanguageChange,
  onExplanationLanguageChange,
  disabled = false,
}) => {
  const [isChangingOriginalManually, setIsChangingOriginalManually] = useState(false);

  const isLowConfidence =
    detectionResult !== null && detectionResult.confidence === "low";

  const handleSwap = () => {
    if (disabled) return;
    const prevOriginal = originalLanguage;
    const prevExplanation = explanationLanguage;
    onOriginalLanguageChange(prevExplanation, true);
    onExplanationLanguageChange(prevOriginal);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Original Language Column */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="original-language-select"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              Original Language
            </label>

            {/* Badge status */}
            {detectionResult && !isManualOriginalOverride && (
              <div>
                {!isLowConfidence ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Detected: {detectionResult.detectedLanguage?.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <HelpCircle className="w-3 h-3 text-amber-600" />
                    Uncertain detection
                  </span>
                )}
              </div>
            )}

            {isManualOriginalOverride && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                Manual selection
              </span>
            )}
          </div>

          {/* Select or Badge Button */}
          {isLowConfidence || isChangingOriginalManually || isManualOriginalOverride ? (
            <div className="relative">
              <select
                id="original-language-select"
                value={originalLanguage.code}
                onChange={(e) => {
                  const selected = SUPPORTED_LANGUAGES.find(
                    (l) => l.code === e.target.value
                  );
                  if (selected) {
                    onOriginalLanguageChange(selected, true);
                    setIsChangingOriginalManually(false);
                  }
                }}
                disabled={disabled}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50 pr-9"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {originalLanguage.name}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    ({originalLanguage.nativeName})
                  </span>
                </span>
                <span className="text-xs font-normal text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingOriginalManually(true)}
                disabled={disabled}
                className="text-xs text-brand-600 hover:text-brand-700 hover:underline px-2 py-1 font-medium whitespace-nowrap"
              >
                Change
              </button>
            </div>
          )}

          {isLowConfidence && !isManualOriginalOverride && (
            <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
              Language could not be confidently detected. Please select the original language above.
            </p>
          )}
        </div>

        {/* Explanation Language Column */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="explanation-language-select"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-600" />
              Explain In
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              AI output language
            </span>
          </div>

          <div className="relative">
            <select
              id="explanation-language-select"
              value={explanationLanguage.code}
              onChange={(e) => {
                const selected = SUPPORTED_LANGUAGES.find(
                  (l) => l.code === e.target.value
                );
                if (selected) {
                  onExplanationLanguageChange(selected);
                }
              }}
              disabled={disabled}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50 pr-9"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Language Swap Indicator */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px] text-slate-500">
          Note: Read Aloud always reads in the <strong className="text-slate-700">Original Language</strong>.
        </span>
        <button
          type="button"
          onClick={handleSwap}
          disabled={disabled}
          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
          title="Swap original and explanation languages (does not alter text)"
          aria-label="Swap original and explanation languages"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Swap Languages</span>
        </button>
      </div>
    </div>
  );
};
