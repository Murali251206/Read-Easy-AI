"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  MousePointer,
  Sparkles,
  Layers,
  CheckSquare,
  Search,
} from "lucide-react";
import {
  StructuredOCRData,
  SelectedTextRegion,
  SelectionType,
  OCRWord,
  OCRLine,
  OCRParagraph,
  SupportedLanguage,
} from "@/types";
import { LensToolbar } from "./LensToolbar";

interface LensImageViewerProps {
  imageUrl: string;
  structuredData?: StructuredOCRData | null;
  selectedRegion: SelectedTextRegion | null;
  onSelectRegion: (region: SelectedTextRegion | null) => void;
  hoveredWordId: string | null;
  onHoverWord: (wordId: string | null) => void;
  originalLanguage: SupportedLanguage;
  explanationLanguage: SupportedLanguage;
  onReadSelected: (text: string, language: SupportedLanguage) => void;
  onExplainSelected: (text: string, type: SelectionType) => void;
  isReading?: boolean;
  onStopReading?: () => void;
  isExplaining?: boolean;
  searchMatches?: string[]; // word IDs matching search
  activeSearchWordId?: string | null;
  className?: string;
}

export const LensImageViewer: React.FC<LensImageViewerProps> = ({
  imageUrl,
  structuredData,
  selectedRegion,
  onSelectRegion,
  hoveredWordId,
  onHoverWord,
  originalLanguage,
  explanationLanguage,
  onReadSelected,
  onExplainSelected,
  isReading,
  onStopReading,
  isExplaining,
  searchMatches = [],
  activeSearchWordId,
  className = "",
}) => {
  // View mode: "lens" (interactive text selection) or "image" (clean view)
  const [viewMode, setViewMode] = useState<"lens" | "image">("lens");
  // Selection granularity: "word" | "line" | "paragraph"
  const [granularity, setGranularity] = useState<"word" | "line" | "paragraph">("word");

  // Transform state: zoom & pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch pinch-to-zoom tracking
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const origW = structuredData?.originalWidth || 1000;
  const origH = structuredData?.originalHeight || 800;

  // Set of currently selected word IDs for O(1) lookup
  const selectedWordIdSet = useMemo(() => {
    return new Set(selectedRegion?.wordIds || []);
  }, [selectedRegion]);

  // Set of search match word IDs
  const searchMatchSet = useMemo(() => {
    return new Set(searchMatches);
  }, [searchMatches]);

  // ==========================================================
  // Zoom & Pan Handlers
  // ==========================================================
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFitImage = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.5), 4));
  };

  // Mouse pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking on empty space / image background, not on a clickable box
    if ((e.target as HTMLElement).closest("[data-ocr-clickable]")) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan & pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if ((e.target as HTMLElement).closest("[data-ocr-clickable]")) {
        return;
      }
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 2) {
      // Pinch start
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDistRef.current;
      const newZoom = Math.min(Math.max(touchStartZoomRef.current * scale, 0.5), 4);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Double tap to zoom toggle
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      setZoom((prev) => (prev > 1.2 ? 1 : 2));
      setPan({ x: 0, y: 0 });
    }
    lastTapRef.current = now;
  };

  // Center on active search match when it changes
  useEffect(() => {
    if (!activeSearchWordId || !structuredData) return;
    const word = structuredData.words.find((w) => w.id === activeSearchWordId);
    if (!word) return;

    // Center viewport on this word's bounding box
    const centerX = (word.bbox.x + word.bbox.width / 2) / origW;
    const centerY = (word.bbox.y + word.bbox.height / 2) / origH;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const targetPanX = rect.width / 2 - centerX * rect.width * zoom;
      const targetPanY = rect.height / 2 - centerY * rect.height * zoom;
      setPan({ x: targetPanX, y: targetPanY });
    }
  }, [activeSearchWordId, structuredData, origW, origH, zoom]);

  // ==========================================================
  // Selection Actions
  // ==========================================================
  const handleWordClick = (word: OCRWord, e: React.MouseEvent) => {
    e.stopPropagation();

    if (granularity === "line") {
      // Select the line this word belongs to
      const line = structuredData?.lines.find((l) => l.id === word.lineId);
      if (line) {
        handleLineClick(line, e);
        return;
      }
    } else if (granularity === "paragraph") {
      // Select the paragraph this word belongs to
      const para = structuredData?.paragraphs.find((p) => p.id === word.paragraphId);
      if (para) {
        handleParagraphClick(para, e);
        return;
      }
    }

    // Single Word selection (toggle if already selected)
    if (selectedRegion?.wordIds.length === 1 && selectedRegion.wordIds[0] === word.id) {
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

  const handleLineClick = (line: OCRLine, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleParagraphClick = (para: OCRParagraph, e: React.MouseEvent) => {
    e.stopPropagation();
    const allWordIds = para.lineIds.flatMap((lId) => {
      const line = structuredData?.lines.find((l) => l.id === lId);
      return line ? line.wordIds : [];
    });

    onSelectRegion({
      text: para.text,
      wordIds: allWordIds,
      lineIds: para.lineIds,
      type: "paragraph",
      boundingBox: para.bbox,
    });
  };

  const handleSelectAll = () => {
    if (!structuredData || structuredData.words.length === 0) return;
    const allText = structuredData.paragraphs.map((p) => p.text).join("\n\n");
    const allWordIds = structuredData.words.map((w) => w.id);
    const allLineIds = structuredData.lines.map((l) => l.id);

    onSelectRegion({
      text: allText,
      wordIds: allWordIds,
      lineIds: allLineIds,
      type: "all",
      boundingBox: { x: 0, y: 0, width: origW, height: origH },
    });
  };

  return (
    <div
      className={`relative flex flex-col bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden ${className}`}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 z-20">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("lens")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewMode === "lens"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Interactive Lens text scanner mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Lens Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("image")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewMode === "image"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Clean image view without overlays"
          >
            <span>Clean Image</span>
          </button>
        </div>

        {/* Center: Granularity Selector (When in Lens mode) */}
        {viewMode === "lens" && (
          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-semibold uppercase px-1.5">Select:</span>
            <button
              type="button"
              onClick={() => setGranularity("word")}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                granularity === "word"
                  ? "bg-blue-600/80 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Word
            </button>
            <button
              type="button"
              onClick={() => setGranularity("line")}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                granularity === "line"
                  ? "bg-blue-600/80 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Line
            </button>
            <button
              type="button"
              onClick={() => setGranularity("paragraph")}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                granularity === "paragraph"
                  ? "bg-blue-600/80 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paragraph
            </button>
          </div>
        )}

        {/* Right: Zoom controls & Select All */}
        <div className="flex items-center gap-1">
          {viewMode === "lens" && structuredData && structuredData.words.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors border border-slate-700/60 font-medium"
              title="Select all detected text in image"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Select All</span>
            </button>
          )}

          <div className="flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              title="Zoom out"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              title="Reset zoom to 100%"
              className="px-1.5 py-0.5 text-[11px] font-mono text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              title="Zoom in"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitImage}
              title="Fit image to screen"
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors ml-0.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas / Viewport */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
        className={`relative w-full h-[450px] sm:h-[540px] md:h-[600px] overflow-hidden bg-slate-950 select-none flex items-center justify-center ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* Transform container holding the image AND bounding boxes synchronously */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.12s ease-out",
          }}
          className="relative inline-block max-w-full max-h-full"
        >
          {/* Base Original Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="OCR Target Document"
            className="block max-h-[440px] sm:max-h-[530px] md:max-h-[590px] w-auto h-auto object-contain pointer-events-none rounded-lg shadow-2xl"
            draggable={false}
          />

          {/* Interactive Text Overlay Layer (Non-destructive!) */}
          {viewMode === "lens" && structuredData && (
            <div
              className="absolute inset-0 pointer-events-auto"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              {/* Line selection overlays when in Line mode */}
              {granularity === "line" &&
                structuredData.lines.map((line) => {
                  const isSelected = selectedRegion?.lineIds.includes(line.id);
                  const leftPct = (line.bbox.x / origW) * 100;
                  const topPct = (line.bbox.y / origH) * 100;
                  const widthPct = (line.bbox.width / origW) * 100;
                  const heightPct = (line.bbox.height / origH) * 100;

                  return (
                    <div
                      key={line.id}
                      data-ocr-clickable="true"
                      onClick={(e) => handleLineClick(line, e)}
                      title={`Line: "${line.text}"`}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                      className={`absolute cursor-pointer transition-all rounded-[3px] pointer-events-auto ${
                        isSelected
                          ? "bg-blue-600/60 border-2 border-blue-300 shadow-md shadow-blue-500/50 z-20"
                          : "bg-blue-500/10 hover:bg-blue-500/30 border border-blue-400/25 hover:border-blue-400/60 z-10"
                      }`}
                    />
                  );
                })}

              {/* Word-level bounding boxes */}
              {structuredData.words.map((word) => {
                const isSelected = selectedWordIdSet.has(word.id);
                const isHovered = hoveredWordId === word.id;
                const isSearchMatch = searchMatchSet.has(word.id);
                const isActiveSearchMatch = activeSearchWordId === word.id;

                const leftPct = (word.bbox.x / origW) * 100;
                const topPct = (word.bbox.y / origH) * 100;
                const widthPct = (word.bbox.width / origW) * 100;
                const heightPct = (word.bbox.height / origH) * 100;

                // Color styling logic
                let boxClass = "bg-blue-500/15 hover:bg-blue-500/35 border border-blue-400/30";
                if (isActiveSearchMatch) {
                  boxClass = "bg-amber-500/80 border-2 border-yellow-200 ring-2 ring-yellow-400 z-30 animate-bounce";
                } else if (isSearchMatch) {
                  boxClass = "bg-amber-400/50 border-2 border-amber-300 z-20 animate-pulse";
                } else if (isSelected) {
                  boxClass = "bg-blue-600/70 border-2 border-blue-300 shadow-sm shadow-blue-500/50 z-20";
                } else if (isHovered) {
                  boxClass = "bg-blue-500/40 border border-blue-300 z-15";
                }

                return (
                  <div
                    key={word.id}
                    data-ocr-clickable="true"
                    onClick={(e) => handleWordClick(word, e)}
                    onMouseEnter={() => onHoverWord(word.id)}
                    onMouseLeave={() => onHoverWord(null)}
                    title={`"${word.text}" (Confidence: ${word.confidence}%)`}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                    }}
                    className={`absolute cursor-pointer transition-colors duration-100 rounded-[2px] pointer-events-auto ${boxClass}`}
                  >
                    {/* Expand touch target for small mobile screens without changing visual box */}
                    <div className="absolute -inset-1 sm:-inset-0.5 pointer-events-auto" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Action Toolbar (Lens Toolbar) */}
        {selectedRegion && selectedRegion.text.trim() && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95%]">
            <LensToolbar
              selection={selectedRegion}
              originalLanguage={originalLanguage}
              explanationLanguage={explanationLanguage}
              onReadSelected={onReadSelected}
              onExplainSelected={onExplainSelected}
              onClearSelection={() => onSelectRegion(null)}
              isReading={isReading}
              onStopReading={onStopReading}
              isExplaining={isExplaining}
            />
          </div>
        )}

        {/* Scanner Indicator Badge */}
        {viewMode === "lens" && structuredData && (
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px] font-medium text-slate-300 pointer-events-none flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {structuredData.words.length} words detected
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
