"use client";

import React from "react";
import { Camera, FileEdit } from "lucide-react";

interface EmptyStateProps {
  onSelectUpload: () => void;
  onSelectManualText: () => void;
  activeMethod: "upload" | "text";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectUpload,
  onSelectManualText,
  activeMethod,
}) => {
  return (
    <div className="w-full text-center py-4">
      {/* Hero Title & Subtitle */}
      <div className="max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-200/60 inline-block mb-3">
          Read. Understand. Learn.
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          ReadEasy AI
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
          Upload an image or enter text. Read it in its original language and understand it in your preferred language.
        </p>
      </div>

      {/* Two Input Method Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto items-stretch">
        {/* Method A: Upload Image */}
        <button
          type="button"
          onClick={onSelectUpload}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
            activeMethod === "upload"
              ? "border-brand-500 bg-brand-50/40 shadow-sm"
              : "border-slate-200 bg-white hover:border-brand-300 hover:shadow-md"
          }`}
          aria-label="Upload Image method"
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
              activeMethod === "upload"
                ? "bg-brand-600 text-white shadow-brand-500/30 shadow-md"
                : "bg-brand-50 text-brand-600"
            }`}
          >
            <Camera className="w-7 h-7" />
          </div>
          <span className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
            Upload Image
          </span>
          <span className="text-xs text-slate-500 mt-1 max-w-[200px]">
            Extract text from a photo or scanned document
          </span>
        </button>

        {/* Method B: Enter Text */}
        <button
          type="button"
          onClick={onSelectManualText}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 ${
            activeMethod === "text"
              ? "border-accent-500 bg-accent-50/40 shadow-sm"
              : "border-slate-200 bg-white hover:border-accent-300 hover:shadow-md"
          }`}
          aria-label="Enter Text method"
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
              activeMethod === "text"
                ? "bg-accent-600 text-white shadow-accent-500/30 shadow-md"
                : "bg-accent-50 text-accent-600"
            }`}
          >
            <FileEdit className="w-7 h-7" />
          </div>
          <span className="text-base font-bold text-slate-900 group-hover:text-accent-600 transition-colors">
            Enter Text
          </span>
          <span className="text-xs text-slate-500 mt-1 max-w-[200px]">
            Paste or type a paragraph directly
          </span>
        </button>
      </div>
    </div>
  );
};
