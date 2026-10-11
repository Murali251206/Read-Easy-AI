"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  StructuredOCRData,
  SelectedTextRegion,
  SelectionType,
  SupportedLanguage,
} from "@/types";
import { LensImageViewer } from "./LensImageViewer";
import { SynchronizedTextPanel } from "./SynchronizedTextPanel";
import { LensSearchBox } from "./LensSearchBox";
import { Layers, Search, Sparkles } from "lucide-react";

interface LensScannerContainerProps {
  imageUrl: string;
  structuredData?: StructuredOCRData | null;
  extractedText: string;
  onTextUpdate?: (text: string) => void;
  confidenceScore?: number | null;
  confidenceLevel?: "high" | "medium" | "low" | null;
  originalLanguage: SupportedLanguage;
  explanationLanguage: SupportedLanguage;
  onReadText: (text: string, language: SupportedLanguage) => void;
  onExplainText: (text: string, selectionType: SelectionType) => void;
  isReading?: boolean;
  onStopReading?: () => void;
  isExplaining?: boolean;
  className?: string;
}

export const LensScannerContainer: React.FC<LensScannerContainerProps> = ({
  imageUrl,
  structuredData,
  extractedText,
  onTextUpdate,
  confidenceScore,
  confidenceLevel,
  originalLanguage,
  explanationLanguage,
  onReadText,
  onExplainText,
  isReading,
  onStopReading,
  isExplaining,
  className = "",
}) => {
  // Selection state
  const [selectedRegion, setSelectedRegion] = useState<SelectedTextRegion | null>(null);
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // Mobile layout tab: "scanner" or "text"
  const [mobileTab, setMobileTab] = useState<"scanner" | "text">("scanner");

  // Calculate search matches across detected words
  const searchMatchWordIds = useMemo(() => {
    if (!searchQuery.trim() || !structuredData) return [];
    const query = searchQuery.trim().toLowerCase();

    // Direct word matches
    const matchedIds: string[] = [];
    for (const word of structuredData.words) {
      if (word.text.toLowerCase().includes(query)) {
        matchedIds.push(word.id);
      }
    }

    return matchedIds;
  }, [searchQuery, structuredData]);

  // Active highlighted word ID from search
  const activeSearchWordId = useMemo(() => {
    if (searchMatchWordIds.length === 0) return null;
    return searchMatchWordIds[currentMatchIndex % searchMatchWordIds.length] || null;
  }, [searchMatchWordIds, currentMatchIndex]);

  const handleNextMatch = useCallback(() => {
    if (searchMatchWordIds.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % searchMatchWordIds.length);
  }, [searchMatchWordIds]);

  const handlePrevMatch = useCallback(() => {
    if (searchMatchWordIds.length === 0) return;
    setCurrentMatchIndex((prev) =>
      prev === 0 ? searchMatchWordIds.length - 1 : prev - 1
    );
  }, [searchMatchWordIds]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentMatchIndex(0);
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Top Header with In-Image Search Bar and Mode Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Google Lens-Style Visual Text Scanner
            </h2>
            <p className="text-xs text-slate-400">
              Tap or drag any word, line, or paragraph to highlight, read aloud, or explain.
            </p>
          </div>
        </div>

        {/* Search text in image */}
        <LensSearchBox
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          matchesCount={searchMatchWordIds.length}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
        />
      </div>

      {/* Mobile view toggle tabs (hidden on lg screens) */}
      <div className="flex lg:hidden items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setMobileTab("scanner")}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
            mobileTab === "scanner"
              ? "bg-blue-600 text-white font-semibold shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Visual Scanner
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("text")}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
            mobileTab === "text"
              ? "bg-blue-600 text-white font-semibold shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Extracted Text Panel
        </button>
      </div>

      {/* Split layout on desktop / Tabbed on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Interactive Image Viewer (Col 7 on lg) */}
        <div
          className={`lg:col-span-7 w-full ${
            mobileTab === "scanner" ? "block" : "hidden lg:block"
          }`}
        >
          <LensImageViewer
            imageUrl={imageUrl}
            structuredData={structuredData}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            hoveredWordId={hoveredWordId}
            onHoverWord={setHoveredWordId}
            originalLanguage={originalLanguage}
            explanationLanguage={explanationLanguage}
            onReadSelected={onReadText}
            onExplainSelected={onExplainText}
            isReading={isReading}
            onStopReading={onStopReading}
            isExplaining={isExplaining}
            searchMatches={searchMatchWordIds}
            activeSearchWordId={activeSearchWordId}
          />
        </div>

        {/* Right: Synchronized Text Panel (Col 5 on lg) */}
        <div
          className={`lg:col-span-5 w-full ${
            mobileTab === "text" ? "block" : "hidden lg:block"
          }`}
        >
          <SynchronizedTextPanel
            structuredData={structuredData}
            rawText={extractedText}
            onTextUpdate={onTextUpdate}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            hoveredWordId={hoveredWordId}
            onHoverWord={setHoveredWordId}
            confidenceScore={confidenceScore}
            confidenceLevel={confidenceLevel}
            originalLanguage={originalLanguage}
            explanationLanguage={explanationLanguage}
            onReadSelected={onReadText}
            onExplainSelected={onExplainText}
            isReading={isReading}
            isExplaining={isExplaining}
          />
        </div>
      </div>
    </div>
  );
};
