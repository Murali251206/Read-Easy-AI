"use client";

import React from "react";
import { BookOpen, ShieldCheck, RotateCcw, Database, History } from "lucide-react";

interface HeaderProps {
  onNewReading: () => void;
  hasContent: boolean;
  onOpenHistory: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewReading,
  hasContent,
  onOpenHistory,
  savedCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                ReadEasy AI
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                100% Private
              </span>
              <span className="text-[11px] font-semibold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full hidden sm:flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                MongoDB
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Educational Reading & Language Assistant
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* History / MongoDB Saved Readings */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
            title="View saved readings stored in MongoDB"
            aria-label="View saved readings in MongoDB"
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span className="hidden xs:inline">History</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* New Reading */}
          <button
            type="button"
            onClick={onNewReading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              hasContent
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100 cursor-pointer"
            }`}
            title="Start a new reading session"
            aria-label="Start a new reading session"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">New Reading</span>
          </button>
        </div>
      </div>
    </header>
  );
};
