"use client";

import React from "react";
import { CheckCircle2, ListOrdered } from "lucide-react";

interface KeyPointsProps {
  points: string[];
}

export const KeyPoints: React.FC<KeyPointsProps> = ({ points }) => {
  if (!points || points.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-accent-50 text-accent-600 flex items-center justify-center">
          <ListOrdered className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Key Points</h3>
      </div>

      <ul className="space-y-2">
        {points.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-2.5 text-sm text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
