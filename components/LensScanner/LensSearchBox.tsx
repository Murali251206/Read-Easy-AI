"use client";

import React from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";

interface LensSearchBoxProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchesCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  className?: string;
}

export const LensSearchBox: React.FC<LensSearchBoxProps> = ({
  searchQuery,
  onSearchChange,
  matchesCount,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg text-sm ${className}`}
    >
      <Search className="w-4 h-4 text-blue-400 shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search text in image..."
        className="bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none w-36 sm:w-48 text-xs sm:text-sm"
      />

      {searchQuery && (
        <>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0 whitespace-nowrap">
            {matchesCount > 0
              ? `${currentMatchIndex + 1} of ${matchesCount}`
              : "0 found"}
          </span>

          <div className="flex items-center gap-0.5 border-l border-slate-700/80 pl-1 shrink-0">
            <button
              type="button"
              onClick={onPrevMatch}
              disabled={matchesCount === 0}
              title="Previous match"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onNextMatch}
              disabled={matchesCount === 0}
              title="Next match"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSearchChange("")}
              title="Clear search"
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors ml-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
