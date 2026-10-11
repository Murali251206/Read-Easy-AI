"use client";

import React from "react";
import { BookMarked } from "lucide-react";
import { DifficultWord } from "@/types";

interface DifficultWordsProps {
  words: DifficultWord[];
}

export const DifficultWords: React.FC<DifficultWordsProps> = ({ words }) => {
  if (!words || words.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
          <BookMarked className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          Difficult Words & Vocabulary
        </h3>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="px-4 py-2.5 w-1/3">
                Word / Phrase
              </th>
              <th scope="col" className="px-4 py-2.5 w-2/3">
                Meaning / Concept
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {words.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-2.5 font-medium text-slate-900 align-top">
                  {item.word}
                </td>
                <td className="px-4 py-2.5 text-slate-600 leading-relaxed align-top">
                  {item.meaning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
