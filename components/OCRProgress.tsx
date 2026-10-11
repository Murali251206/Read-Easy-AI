"use client";

import React from "react";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Layers,
  Lightbulb,
  XCircle,
} from "lucide-react";
import { OCRProgressState } from "@/types";
import { ConfidenceLevel } from "@/lib/ocr/extractText";

interface OCRProgressProps {
  progressState: OCRProgressState;
  completedMessage?: string | null;
  confidenceScore?: number | null;
  confidenceLevel?: ConfidenceLevel | null;
  suggestions?: string[];
  onCancel?: () => void;
}

export const OCRProgress: React.FC<OCRProgressProps> = ({
  progressState,
  completedMessage,
  confidenceScore,
  confidenceLevel,
  suggestions,
  onCancel,
}) => {
  const { isProcessing, progress, stageMessage } = progressState;

  if (!isProcessing && !completedMessage) {
    return null;
  }

  // Determine badge styling based on confidence level
  const isHigh = confidenceLevel === "high";
  const isMedium = confidenceLevel === "medium";
  const isLow = confidenceLevel === "low";

  return (
    <div
      role="status"
      className={`w-full my-4 rounded-2xl border p-4 sm:p-5 transition-all animate-in fade-in duration-300 ${
        isProcessing
          ? "border-brand-200 bg-brand-50/50"
          : isLow
          ? "border-amber-200 bg-amber-50/60"
          : isMedium
          ? "border-amber-200/80 bg-amber-50/40"
          : "border-emerald-200/80 bg-emerald-50/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          {isProcessing ? (
            <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : isLow ? (
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : isMedium ? (
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <HelpCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}

          <div>
            <span className="text-sm font-bold text-slate-800 block">
              {isProcessing
                ? "Enhancing image & extracting text..."
                : completedMessage || "Text extracted successfully."}
            </span>
            <span className="text-[11px] text-slate-500">
              {isProcessing
                ? stageMessage || "Processing image..."
                : "Multi-pass OCR completed. Review and edit text below."}
            </span>
          </div>
        </div>

        {/* Live progress percentage & Cancel button OR confidence badge */}
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <>
              <span className="text-xs font-mono font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-lg">
                {progress}%
              </span>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  title="Cancel OCR processing"
                  aria-label="Cancel OCR processing"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Processing</span>
                </button>
              )}
            </>
          ) : confidenceScore !== null && confidenceScore !== undefined ? (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                isHigh
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : isMedium
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-rose-100 text-rose-800 border-rose-200"
              }`}
            >
              <span>Confidence: {confidenceScore}%</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Progress Bar during active OCR */}
      {isProcessing && (
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden my-2.5">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(6, progress)}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {/* Pipeline Status Line */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60 mt-2 gap-2">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Layers className="w-3.5 h-3.5 text-brand-500" />
          <span>Adaptive Enhancement (1080p / 4K / 8K) • Grayscale • Contrast • Otsu</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>In-Browser Tesseract</span>
        </div>
      </div>

      {/* Helpful Tips if Difficult Image / Low or Medium Confidence */}
      {suggestions && suggestions.length > 0 && !isProcessing && (
        <div className="mt-3.5 pt-3 border-t border-amber-200/80 bg-white/70 rounded-xl p-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1.5">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Tips for improved text clarity:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] pl-1">
            {suggestions.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
