"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  Pause,
  Play,
  Square,
  AlertCircle,
  VolumeX,
} from "lucide-react";
import { SupportedLanguage } from "@/types";
import { findBestVoice, splitIntoSentences } from "@/lib/speech/speech";

interface ReadAloudButtonProps {
  text: string;
  language: SupportedLanguage;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  text,
  language,
  label = "Read Aloud",
  className = "",
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const sentencesRef = useRef<string[]>([]);
  const currentSentenceIndexRef = useRef<number>(0);
  const isCancelledRef = useRef<boolean>(false);
  const activeVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Stop speech when component unmounts or text changes
  const stopPlayback = useCallback(() => {
    isCancelledRef.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setStatusMessage(null);
  }, []);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  // Read sentence-by-sentence to handle long paragraphs and prevent timeouts
  const speakNextSentence = useCallback(() => {
    if (isCancelledRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (currentSentenceIndexRef.current >= sentencesRef.current.length) {
      // Completed reading all sentences
      setIsPlaying(false);
      setIsPaused(false);
      setStatusMessage(null);
      return;
    }

    const sentence = sentencesRef.current[currentSentenceIndexRef.current];
    const utterance = new SpeechSynthesisUtterance(sentence);

    utterance.lang = language.speechCode;
    if (activeVoiceRef.current) {
      utterance.voice = activeVoiceRef.current;
    }

    utterance.rate = 0.95; // slightly slower for educational clarity
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        currentSentenceIndexRef.current += 1;
        speakNextSentence();
      }
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      if (!isCancelledRef.current) {
        currentSentenceIndexRef.current += 1;
        speakNextSentence();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [language.speechCode]);

  const handleStartPlay = async () => {
    setWarningMessage(null);

    if (!text || !text.trim()) {
      setWarningMessage("No text available to read.");
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setWarningMessage("Speech synthesis is not supported in this browser.");
      return;
    }

    stopPlayback();
    isCancelledRef.current = false;

    // Split text into chunks
    const sentences = splitIntoSentences(text);
    if (sentences.length === 0) {
      setWarningMessage("Text has no speakable words.");
      return;
    }

    sentencesRef.current = sentences;
    currentSentenceIndexRef.current = 0;

    // Check voice support
    const { voice, status } = await findBestVoice(language.speechCode);
    activeVoiceRef.current = voice;

    if (!status.available) {
      setWarningMessage(status.message || "Speech synthesis is unavailable.");
      return;
    }

    if (!status.isExactMatch && status.message) {
      // Show subtle notification but still speak
      setWarningMessage(status.message);
    }

    setIsPlaying(true);
    setIsPaused(false);
    setStatusMessage(`Reading in ${language.name}`);

    speakNextSentence();
  };

  const handlePause = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setStatusMessage(`Paused (${language.name})`);
    }
  };

  const handleResume = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setStatusMessage(`Reading in ${language.name}`);
    }
  };

  const hasText = Boolean(text && text.trim());

  if (compact) {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <div className="flex items-center gap-1.5">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handleStartPlay}
              disabled={!hasText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all disabled:opacity-50"
              title={`Read aloud in ${language.name}`}
            >
              <Volume2 className="w-3.5 h-3.5 text-brand-600" />
              <span>{label}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="p-1 hover:bg-slate-200 rounded text-slate-700"
                  title="Resume"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="p-1 hover:bg-slate-200 rounded text-slate-700"
                  title="Pause"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={stopPlayback}
                className="p-1 hover:bg-rose-100 rounded text-rose-600"
                title="Stop"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            </div>
          )}
        </div>
        {statusMessage && (
          <span className="text-[11px] text-brand-600 font-medium mt-1">
            {statusMessage}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button
            type="button"
            onClick={handleStartPlay}
            disabled={!hasText}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm transition-all hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Read aloud original text in ${language.name}`}
            aria-label={`Read aloud in ${language.name}`}
          >
            <Volume2 className="w-4 h-4 text-brand-600" />
            <span>{label}</span>
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-between bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600"></span>
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate">
                {statusMessage || `Reading in ${language.name}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-xs transition-colors"
                  title="Resume"
                  aria-label="Resume reading"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-xs transition-colors"
                  title="Pause"
                  aria-label="Pause reading"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={stopPlayback}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-700 shadow-xs transition-colors"
                title="Stop reading"
                aria-label="Stop reading"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice notice / status message */}
      {statusMessage && !isPlaying && (
        <p className="text-xs text-brand-600 font-medium flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5" />
          {statusMessage}
        </p>
      )}

      {warningMessage && (
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
          <span className="flex-1">{warningMessage}</span>
          <button
            type="button"
            onClick={() => setWarningMessage(null)}
            className="text-amber-500 hover:text-amber-800 text-[10px]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
