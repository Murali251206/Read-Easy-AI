"use client";

import React from "react";
import {
  X,
  History,
  Trash2,
  ArrowRight,
  Database,
  Calendar,
  Languages,
  BookOpen,
} from "lucide-react";
import { SupportedLanguage } from "@/types";
import { getLanguageByCode } from "@/lib/ocr/languages";

export interface SavedReadingItem {
  _id: string;
  title: string;
  originalText: string;
  originalLanguage: {
    code: string;
    name: string;
    speechCode?: string;
  };
  explanationLanguage: {
    code: string;
    name: string;
    speechCode?: string;
  };
  explanation: string;
  keyPoints: string[];
  difficultWords: { word: string; meaning: string }[];
  sourceType: "ocr" | "text";
  modelUsed?: string;
  createdAt: string;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  readings: SavedReadingItem[];
  isLoading: boolean;
  onSelectReading: (reading: SavedReadingItem) => void;
  onDeleteReading: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  readings,
  isLoading,
  onSelectReading,
  onDeleteReading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="history-drawer-title"
                className="text-base font-bold text-slate-900 flex items-center gap-2"
              >
                Saved Readings
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800">
                  MongoDB
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {readings.length} {readings.length === 1 ? "entry" : "entries"} stored in database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close history drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading readings from MongoDB...
            </div>
          ) : readings.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No saved readings yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Whenever you generate an explanation, it is automatically persisted to MongoDB so you can revisit it anytime.
              </p>
            </div>
          ) : (
            readings.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-200 p-3.5 hover:border-brand-300 hover:shadow-xs transition-all bg-white group flex flex-col justify-between"
                >
                  <div>
                    {/* Top metadata tags */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60 font-semibold">
                          {item.originalLanguage?.name || "Original"}
                        </span>
                        <span>→</span>
                        <span className="px-2 py-0.5 rounded bg-accent-50 text-accent-700 border border-accent-200/60 font-semibold">
                          {item.explanationLanguage?.name || "Explanation"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Title / snippet */}
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {item.originalText}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onDeleteReading(item._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete from MongoDB"
                      aria-label="Delete saved reading"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectReading(item)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                      <span>Load Reading</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Connected to local MongoDB database (`readeasy_ai`)</span>
        </div>
      </div>
    </div>
  );
};
