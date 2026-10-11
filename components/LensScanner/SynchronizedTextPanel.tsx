"use client";

import React, { useState } from "react";
import {
  FileText,
  AlertTriangle,
  Edit3,
  Check,
  Sparkles,
  Volume2,
  Copy,
  RotateCcw,
} from "lucide-react";
import {
  StructuredOCRData,
  SelectedTextRegion,
  OCRWord,
  OCRLine,
  SupportedLanguage,
  SelectionType,
} from "@/types";

interface SynchronizedTextPanelProps {
  structuredData?: StructuredOCRData | null;
  rawText: string;
  onTextUpdate?: (newText: string) => void;
  selectedRegion: SelectedTextRegion | null;
  onSelectRegion: (region: SelectedTextRegion | null) => void;
  hoveredWordId: string | null;
  onHoverWord: (wordId: string | null) => void;
  confidenceScore?: number | null;
  confidenceLevel?: "high" | "medium" | "low" | null;
  originalLanguage: SupportedLanguage;
  explanationLanguage: SupportedLanguage;
  onReadSelected: (text: string, language: SupportedLanguage) => void;
  onExplainSelected: (text: string, type: SelectionType) => void;
  isReading?: boolean;
  isExplaining?: boolean;
  className?: string;
}

export const SynchronizedTextPanel: React.FC<SynchronizedTextPanelProps> = ({
  structuredData,
  rawText,
  onTextUpdate,
  selectedRegion,
  onSelectRegion,
  hoveredWordId,
  onHoverWord,
  confidenceScore,
  confidenceLevel,
  originalLanguage,
  explanationLanguage,
  onReadSelected,
  onExplainSelected,
  isReading,
  isExplaining,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableText, setEditableText] = useState<string>(rawText);
  const [copied, setCopied] = useState<boolean>(false);

  // Set of selected word IDs
  const selectedWordIds = new Set(selectedRegion?.wordIds || []);

  const handleWordClick = (word: OCRWord) => {
    if (selectedWordIds.has(word.id) && selectedRegion?.wordIds.length === 1) {
      onSelectRegion(null);
    } else {
      onSelectRegion({
        text: word.text,
        wordIds: [word.id],
        lineIds: [word.lineId],
        type: "word",
        boundingBox: word.bbox,
      });
    }
  };

  const handleLineClick = (line: OCRLine) => {
    if (selectedRegion?.lineIds.length === 1 && selectedRegion.lineIds[0] === line.id) {
      onSelectRegion(null);
    } else {
      onSelectRegion({
        text: line.text,
        wordIds: line.wordIds,
        lineIds: [line.id],
        type: "line",
        boundingBox: line.bbox,
      });
    }
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onTextUpdate && editableText.trim() !== rawText.trim()) {
      onTextUpdate(editableText);
    }
  };

  const handleCancelEdit = () => {
    setEditableText(rawText);
    setIsEditing(false);
  };

  const handleCopyAll = async () => {
    const textToCopy = isEditing ? editableText : rawText;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLowConfidence = confidenceLevel === "low" || (confidenceScore !== null && confidenceScore !== undefined && confidenceScore < 50);

  return (
    <div
      className={`flex flex-col bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Synchronized Text Stream
          </h3>
          {confidenceScore !== null && confidenceScore !== undefined && (
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                confidenceScore >= 75
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : confidenceScore >= 50
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {confidenceScore}% confidence
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Copy entire text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy All</span>
              </>
            )}
          </button>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setEditableText(rawText);
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Edit extracted text"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2 py-1 text-xs rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Low confidence warning banner if applicable */}
      {isLowConfidence && !isEditing && (
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">⚠ Low OCR Confidence:</span> Some words might have recognition errors. Click <button type="button" onClick={() => setIsEditing(true)} className="underline font-semibold hover:text-amber-200">Edit</button> above to correct any words before explaining.
          </div>
        </div>
      )}

      {/* Synchronized Content View / Edit Mode */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[380px] sm:max-h-[460px] text-sm leading-relaxed">
        {isEditing ? (
          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            rows={12}
            className="w-full h-full min-h-[220px] bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Edit extracted text..."
          />
        ) : structuredData && structuredData.paragraphs.length > 0 ? (
          <div className="space-y-4">
            {structuredData.paragraphs.map((para) => (
              <div
                key={para.id}
                className="p-2.5 rounded-xl transition-colors hover:bg-slate-800/40 border border-transparent hover:border-slate-800/80"
              >
                {para.lineIds.map((lineId) => {
                  const line = structuredData.lines.find((l) => l.id === lineId);
                  if (!line) return null;

                  return (
                    <div
                      key={line.id}
                      className="group flex flex-wrap items-baseline gap-1.5 py-1 px-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
                    >
                      {/* Line Selector pill */}
                      <button
                        type="button"
                        onClick={() => handleLineClick(line)}
                        title="Click to select entire line"
                        className="text-[10px] text-slate-500 group-hover:text-blue-400 font-mono px-1 py-0.5 rounded bg-slate-950/40 select-none cursor-pointer"
                      >
                        L{line.lineIndex + 1}
                      </button>

                      {line.wordIds.map((wordId) => {
                        const word = structuredData.words.find((w) => w.id === wordId);
                        if (!word) return null;

                        const isSelected = selectedWordIds.has(word.id);
                        const isHovered = hoveredWordId === word.id;

                        return (
                          <span
                            key={word.id}
                            onClick={() => handleWordClick(word)}
                            onMouseEnter={() => onHoverWord(word.id)}
                            onMouseLeave={() => onHoverWord(null)}
                            title={`"${word.text}" (Tap to select)`}
                            className={`inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all duration-150 ${
                              isSelected
                                ? "bg-blue-600 text-white font-medium ring-2 ring-blue-400 shadow-sm shadow-blue-500/50"
                                : isHovered
                                ? "bg-blue-500/30 text-blue-200"
                                : "text-slate-200 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            {word.text}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-300 whitespace-pre-wrap">{rawText}</p>
        )}
      </div>

      {/* Bottom Selected Text Action Bar in Panel */}
      {selectedRegion && selectedRegion.text.trim() && (
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-hidden w-full sm:w-auto">
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 shrink-0">
              Selected
            </span>
            <span className="text-slate-300 truncate max-w-[260px] font-medium italic">
              &quot;{selectedRegion.text.trim()}&quot;
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onReadSelected(selectedRegion.text.trim(), originalLanguage)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700/60"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Read</span>
            </button>
            <button
              type="button"
              onClick={() => onExplainSelected(selectedRegion.text.trim(), selectedRegion.type)}
              disabled={isExplaining}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isExplaining ? "Explaining..." : "Explain"}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectRegion(null)}
              className="px-2 py-1 text-slate-400 hover:text-slate-200"
            >
              Deselect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
