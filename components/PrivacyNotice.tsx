"use client";

import React from "react";
import { ShieldCheck, HardDrive, Cpu, Lock } from "lucide-react";

export const PrivacyNotice: React.FC = () => {
  return (
    <footer className="mt-12 pt-6 border-t border-slate-200/80 text-xs text-slate-500">
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                100% Free, Open Source & Private
              </p>
              <p className="text-slate-500 text-[11px] sm:text-xs">
                Your image is processed locally for text extraction. AI explanations use your locally running Ollama model.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              Client-side Tesseract.js
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              Local Ollama
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Zero Cloud Telemetry
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
