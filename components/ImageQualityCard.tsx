"use client";

import React from "react";
import {
  Camera,
  Zap,
  CheckCircle2,
  Maximize2,
  Layers,
  Smartphone,
  Monitor,
  Sparkles,
} from "lucide-react";
import { ImageQualityMetrics } from "@/types";

interface ImageQualityCardProps {
  metrics: ImageQualityMetrics | null;
  isProcessing?: boolean;
}

export const ImageQualityCard: React.FC<ImageQualityCardProps> = ({
  metrics,
  isProcessing = false,
}) => {
  if (!metrics) return null;

  const {
    originalWidth,
    originalHeight,
    targetWidth,
    targetHeight,
    aspectRatio,
    resolutionTier,
    isUpscaled,
    statusMessage,
    deviceTier,
    brightnessScore,
    contrastScore,
    sharpnessScore,
  } = metrics;

  return (
    <div className="w-full my-3.5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isUpscaled
                ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                : "bg-brand-50 text-brand-600 border border-brand-200/60"
            }`}
          >
            {isUpscaled ? <Zap className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>{isUpscaled ? "Adaptive Image Enhancement" : "Image Quality Analysis"}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  resolutionTier === "8K"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : resolutionTier === "4K"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {resolutionTier} Tier
              </span>
            </h3>
          </div>
        </div>

        {/* Device safety badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
          {deviceTier === "mobile" ? (
            <>
              <Smartphone className="w-3 h-3 text-slate-400" />
              <span>Mobile Mode (4K Limit)</span>
            </>
          ) : (
            <>
              <Monitor className="w-3 h-3 text-slate-400" />
              <span>Desktop Mode (Up to 8K)</span>
            </>
          )}
        </div>
      </div>

      {/* Resolution Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3.5">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
            Original
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-0.5">
            {originalWidth} × {originalHeight}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{aspectRatio}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100">
          <span className="text-[10px] font-medium text-brand-600 block uppercase tracking-wider">
            OCR Processing
          </span>
          <span className="text-xs sm:text-sm font-bold text-brand-900 block mt-0.5">
            {targetWidth} × {targetHeight}
          </span>
          <span className="text-[10px] text-brand-600 mt-0.5 block">
            {isUpscaled ? "Adaptive Upscaled" : "Native Resolution"}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
            Contrast / Sharpness
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-semibold text-slate-700">
              {contrastScore}%
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-700">
              {sharpnessScore}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Pre-OCR Clarity</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
            Multi-Pass Pipeline
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-0.5">
            4 Versions
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Color • Gray • High-Cont • Otsu
          </span>
        </div>
      </div>

      {/* Status banner */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Original image preserved separately
        </span>
      </div>
    </div>
  );
};
