"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, RotateCw, Database, Cpu } from "lucide-react";
import { ExplanationResponse, SupportedLanguage } from "@/types";
import { DifficultWords } from "./DifficultWords";
import { ReadAloudButton } from "./ReadAloudButton";

interface ExplanationPanelProps {
  explanationData: ExplanationResponse | null;
  explanationLanguage: SupportedLanguage;
  onRegenerate: () => void;
  isRegenerating: boolean;
  isSavedToDb?: boolean;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  explanationData,
  explanationLanguage,
  onRegenerate,
  isRegenerating,
  isSavedToDb = true,
}) => {
  const [copied, setCopied] = useState(false);

  if (!explanationData || !explanationData.success) {
    return null;
  }

  const { explanation, keyPoints, difficultWords, modelUsed } = explanationData;

  const handleCopy = async () => {
    let fullText = `Explanation (${explanationLanguage.name}):\n${explanation}\n`;
    if (keyPoints && keyPoints.length > 0) {
      fullText += `\nKey Points:\n` + keyPoints.map((p) => `• ${p}`).join("\n") + "\n";
    }
    if (difficultWords && difficultWords.length > 0) {
      fullText += `\nDifficult Words:\n` + difficultWords.map((d) => `• ${d.word}: ${d.meaning}`).join("\n");
    }

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy explanation:", err);
    }
  };

  // Compile readable text for explanation text-to-speech
  const speechText = [
    explanation,
    keyPoints && keyPoints.length > 0 ? "Key points: " + keyPoints.join(". ") : "",
  ]
    .filter(Boolean)
    .join(". ");

  const isOllamaModel = modelUsed?.toLowerCase().includes("ollama");

  return (
    <section
      aria-labelledby="explanation-card-heading"
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all animate-in fade-in duration-300"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="explanation-card-heading" className="text-base font-semibold text-slate-900">
                Explanation
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100/70 text-accent-800 border border-accent-200">
                {explanationLanguage.name}
              </span>
              {isSavedToDb && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  Saved to MongoDB
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>{modelUsed || "Educational Assistant"}</span>
            </p>
          </div>
        </div>

        {/* Panel Action Controls */}
        <div className="flex items-center gap-2">
          {/* Read Explanation Aloud (Uses Explanation Language Speech Code!) */}
          <ReadAloudButton
            text={speechText}
            language={explanationLanguage}
            label="Read Explanation"
            compact={true}
          />

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Copy explanation"
            aria-label="Copy explanation to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            title="Regenerate explanation"
            aria-label="Regenerate explanation"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Explanation Bullet Points / Content */}
      <div className="mt-4">
        {explanationData.wordMeaning && (
          <div className="mb-3 p-3 rounded-xl bg-blue-50/80 border border-blue-200/60 text-sm">
            <span className="font-semibold text-blue-900">Meaning: </span>
            <span className="text-blue-800">{explanationData.wordMeaning}</span>
          </div>
        )}

        <ul className="space-y-2">
          {explanation
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line, idx) => {
              const textContent = line.replace(/^[-•*]\s*/, "");
              return (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-normal"
                >
                  <span className="font-bold text-brand-600 select-none mt-0.5">-</span>
                  <span>{textContent}</span>
                </li>
              );
            })}
        </ul>

        {explanationData.wordExample && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-sm">
            <span className="font-semibold text-emerald-900">Example: </span>
            <span className="text-emerald-800">{explanationData.wordExample}</span>
          </div>
        )}
      </div>

      {/* Difficult Words if any */}
      {difficultWords && difficultWords.length > 0 && (
        <DifficultWords words={difficultWords} />
      )}
    </section>
  );
};
