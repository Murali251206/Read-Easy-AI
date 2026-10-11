"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import { ImageQualityCard } from "@/components/ImageQualityCard";
import { OCRProgress } from "@/components/OCRProgress";
import { TextEditor } from "@/components/TextEditor";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { ExplanationButton } from "@/components/ExplanationButton";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { LoadingState } from "@/components/LoadingState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { HistoryDrawer, SavedReadingItem } from "@/components/HistoryDrawer";
import {
  DEFAULT_ORIGINAL_LANGUAGE,
  DEFAULT_EXPLANATION_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
} from "@/lib/ocr/languages";
import { extractTextFromImage } from "@/lib/ocr/extractText";
import { detectLanguage } from "@/lib/language/detect";
import {
  SupportedLanguage,
  LanguageDetectionResult,
  OCRProgressState,
  ExplanationResponse,
  ImageQualityMetrics,
  StructuredOCRData,
  SelectionType,
} from "@/types";
import { Sparkles, BookOpen, Camera, FileEdit, Eye } from "lucide-react";
import { LensScannerContainer } from "@/components/LensScanner/LensScannerContainer";

export default function Home() {
  // Input method mode: "upload" or "text"
  const [activeInputMethod, setActiveInputMethod] = useState<"upload" | "text">("upload");

  // Image & OCR state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OCRProgressState>({
    status: "",
    progress: 0,
    isProcessing: false,
    stageMessage: "",
  });
  const [ocrCompletedMessage, setOcrCompletedMessage] = useState<string | null>(null);

  // Text state
  const [originalText, setOriginalText] = useState<string>("");

  // Language state
  const [originalLanguage, setOriginalLanguage] = useState<SupportedLanguage>(
    DEFAULT_ORIGINAL_LANGUAGE
  );
  const [explanationLanguage, setExplanationLanguage] = useState<SupportedLanguage>(
    DEFAULT_EXPLANATION_LANGUAGE
  );
  const [detectionResult, setDetectionResult] = useState<LanguageDetectionResult | null>(null);
  const [isManualOriginalOverride, setIsManualOriginalOverride] = useState<boolean>(false);

  // Explanation AI state
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [explanationData, setExplanationData] = useState<ExplanationResponse | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isOllamaError, setIsOllamaError] = useState<boolean>(false);

  // MongoDB History state
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedReadings, setSavedReadings] = useState<SavedReadingItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isSavedToDb, setIsSavedToDb] = useState<boolean>(false);

  // Sample presets for quick testing (Test 1, Test 2, Test 3, Test 4)
  const SAMPLE_PRESETS = [
    {
      label: "Tamil Passage",
      langCode: "ta",
      targetExpCode: "en",
      text: "கல்வி என்பது ஒரு மனிதனின் வாழ்க்கையை மாற்றும் மிகச் சிறந்த ஆயுதமாகும். இது சிந்தனையை வளர்த்து உலகை நல்வழியில் வழிநடத்துகிறது.",
    },
    {
      label: "English Passage",
      langCode: "en",
      targetExpCode: "ta",
      text: "Photosynthesis is the fundamental biological process by which green plants and certain organisms convert sunlight, water, and carbon dioxide into oxygen and chemical energy.",
    },
    {
      label: "Hindi Passage",
      langCode: "hi",
      targetExpCode: "en",
      text: "शिक्षा मनुष्य का सबसे मूल्यवान आभूषण है। यह न केवल हमारे विचारों को प्रकाशित करती है बल्कि समाज के समग्र विकास का मार्ग प्रशस्त करती है।",
    },
    {
      label: "Tamil to Malayalam",
      langCode: "ta",
      targetExpCode: "ml",
      text: "இயற்கை நமது நண்பன். மரங்களையும் நீர்நிலைகளையும் பாதுகாப்பது நமது தலையாய கடமையாகும்.",
    },
  ];

  // Fetch saved readings from MongoDB on mount
  const fetchSavedReadings = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/readings");
      const data = await res.json();
      if (data.success && Array.isArray(data.readings)) {
        setSavedReadings(data.readings);
      }
    } catch (err) {
      console.warn("Could not load readings from MongoDB:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedReadings();
  }, [fetchSavedReadings]);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Language detection trigger when original text updates
  const handleTextChange = useCallback(
    (newText: string) => {
      setOriginalText(newText);
      setGeneralError(null);
      setIsSavedToDb(false);

      if (!newText.trim()) {
        setDetectionResult(null);
        setIsManualOriginalOverride(false);
        return;
      }

      if (!isManualOriginalOverride) {
        const result = detectLanguage(newText);
        setDetectionResult(result);

        if (result.detectedLanguage && result.confidence !== "low") {
          setOriginalLanguage(result.detectedLanguage);
        }
      }
    },
    [isManualOriginalOverride]
  );

  // Advanced OCR confidence & suggestions state
  const [ocrConfidenceScore, setOcrConfidenceScore] = useState<number | null>(null);
  const [ocrConfidenceLevel, setOcrConfidenceLevel] = useState<"high" | "medium" | "low" | null>(null);
  const [ocrSuggestions, setOcrSuggestions] = useState<string[]>([]);
  const [imageQualityMetrics, setImageQualityMetrics] = useState<ImageQualityMetrics | null>(null);

  // Google Lens Scanner State
  const [structuredOcrData, setStructuredOcrData] = useState<StructuredOCRData | null>(null);
  const [lensViewMode, setLensViewMode] = useState<"lens" | "editor">("lens");
  const [isLensReading, setIsLensReading] = useState<boolean>(false);

  // AbortController ref for cancelling processing
  const ocrAbortControllerRef = useRef<AbortController | null>(null);

  // Cancel in-flight OCR / enhancement
  const handleCancelProcessing = () => {
    if (ocrAbortControllerRef.current) {
      ocrAbortControllerRef.current.abort();
      ocrAbortControllerRef.current = null;
    }
    setOcrProgress({
      status: "cancelled",
      progress: 0,
      isProcessing: false,
      stageMessage: "Processing cancelled by user.",
    });
    setOcrCompletedMessage("Processing cancelled.");
  };

  // Handle image selection and launch Advanced Multi-Step OCR
  const handleImageSelected = async (file: File) => {
    setGeneralError(null);
    setOcrCompletedMessage(null);
    setOcrConfidenceScore(null);
    setOcrConfidenceLevel(null);
    setOcrSuggestions([]);
    setImageQualityMetrics(null);

    // Cancel any previous in-flight OCR
    if (ocrAbortControllerRef.current) {
      ocrAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    ocrAbortControllerRef.current = controller;

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setImagePreviewUrl(previewUrl);

    setOcrProgress({
      status: "validating",
      progress: 5,
      isProcessing: true,
      stageMessage: "Analyzing image dimensions and quality...",
    });

    try {
      const langHint = originalLanguage.code;

      const result = await extractTextFromImage(file, {
        language: langHint,
        signal: controller.signal,
        onQualityMetrics: (metrics) => {
          setImageQualityMetrics(metrics);
        },
        onProgress: (pct, stage) => {
          setOcrProgress({
            status: "processing",
            progress: pct,
            isProcessing: true,
            stageMessage: stage,
          });
        },
      });

      setOcrProgress({
        status: "complete",
        progress: 100,
        isProcessing: false,
        stageMessage: result.statusMessage,
      });

      setOcrCompletedMessage(result.statusMessage);
      setOcrConfidenceScore(result.confidence);
      setOcrConfidenceLevel(result.confidenceLevel);
      if (result.metrics) {
        setImageQualityMetrics(result.metrics);
      }
      if (result.suggestions) {
        setOcrSuggestions(result.suggestions);
      }
      if (result.structuredData) {
        setStructuredOcrData(result.structuredData);
      }

      if (result.text && result.text.trim()) {
        handleTextChange(result.text);
      } else {
        setGeneralError(
          "We could not read clear text from this image. Please ensure the document is flat, well-lit, and in focus, or type the text manually."
        );
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return; // User cancelled cleanly
      }
      console.error("Advanced OCR error:", err);
      setOcrProgress({
        status: "error",
        progress: 0,
        isProcessing: false,
        stageMessage: "OCR failed",
      });
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to extract text from the image. Please try another image.";
      setGeneralError(msg);
    } finally {
      if (ocrAbortControllerRef.current === controller) {
        ocrAbortControllerRef.current = null;
      }
    }
  };

  // Handle removing uploaded image
  const handleImageRemoved = () => {
    if (ocrAbortControllerRef.current) {
      ocrAbortControllerRef.current.abort();
      ocrAbortControllerRef.current = null;
    }
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsLensReading(false);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImageQualityMetrics(null);
    setStructuredOcrData(null);
    setOcrProgress({
      status: "",
      progress: 0,
      isProcessing: false,
      stageMessage: "",
    });
    setOcrCompletedMessage(null);
    setOcrConfidenceScore(null);
    setOcrConfidenceLevel(null);
    setOcrSuggestions([]);
  };

  // Handle manual or automatic original language change
  const handleOriginalLanguageChange = (
    lang: SupportedLanguage,
    isManual: boolean
  ) => {
    setOriginalLanguage(lang);
    if (isManual) {
      setIsManualOriginalOverride(true);
    }
  };

  // Handle explanation language change
  const handleExplanationLanguageChange = (lang: SupportedLanguage) => {
    setExplanationLanguage(lang);
  };

  // Automatically save reading to MongoDB
  const saveReadingToMongo = async (
    textToSave: string,
    expResult: ExplanationResponse
  ) => {
    try {
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: textToSave,
          originalLanguage: {
            code: originalLanguage.code,
            name: originalLanguage.name,
            speechCode: originalLanguage.speechCode,
          },
          explanationLanguage: {
            code: explanationLanguage.code,
            name: explanationLanguage.name,
            speechCode: explanationLanguage.speechCode,
          },
          explanation: expResult.explanation,
          keyPoints: expResult.keyPoints,
          difficultWords: expResult.difficultWords,
          sourceType: selectedImageFile ? "ocr" : "text",
          modelUsed: expResult.modelUsed || "local",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSavedToDb(true);
        fetchSavedReadings();
      }
    } catch (dbErr) {
      console.warn("MongoDB auto-save notice:", dbErr);
    }
  };

  // Lens Speech Handlers
  const handleLensRead = useCallback((textToRead: string, lang: SupportedLanguage) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang.speechCode;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsLensReading(true);
    utterance.onend = () => setIsLensReading(false);
    utterance.onerror = () => setIsLensReading(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const handleLensStopReading = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsLensReading(false);
  }, []);

  // Handle AI Explanation Request (Supports whole text or selected word/line/paragraph)
  const handleExplain = async (
    customText?: string,
    selectionType: SelectionType = "paragraph"
  ) => {
    const textToExplain = (customText || originalText).trim();
    if (!textToExplain) {
      setGeneralError("Please provide some text to explain.");
      return;
    }

    setGeneralError(null);
    setIsOllamaError(false);
    setIsExplaining(true);
    setIsSavedToDb(false);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToExplain,
          originalLanguage: originalLanguage.name,
          explanationLanguage: explanationLanguage.name,
          selectionType,
        }),
      });

      const responseText = await response.text();
      let data: ExplanationResponse;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "The server encountered a temporary issue. Please try clicking Explain again."
        );
      }

      if (!response.ok || !data.success) {
        const errorText =
          data.error || "Failed to generate explanation.";
        setGeneralError(errorText);
        return;
      }

      setExplanationData(data);
      // Persist to MongoDB
      await saveReadingToMongo(textToExplain, data);
    } catch (err: unknown) {
      console.error("Explanation request failed:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while generating the explanation.";
      setGeneralError(msg);
    } finally {
      setIsExplaining(false);
    }
  };

  // Handle New Reading Session Reset
  const handleNewReading = () => {
    const hasSubstantialData =
      originalText.length > 50 || explanationData !== null;

    if (hasSubstantialData) {
      const confirmReset = window.confirm(
        "Are you sure you want to start a new reading session? This will clear your current text and explanation."
      );
      if (!confirmReset) return;
    }

    handleImageRemoved();
    setOriginalText("");
    setExplanationData(null);
    setGeneralError(null);
    setIsOllamaError(false);
    setDetectionResult(null);
    setIsManualOriginalOverride(false);
    setIsSavedToDb(false);
    setOriginalLanguage(DEFAULT_ORIGINAL_LANGUAGE);
    setExplanationLanguage(DEFAULT_EXPLANATION_LANGUAGE);
  };

  // Load sample preset
  const handleLoadSample = (sample: (typeof SAMPLE_PRESETS)[0]) => {
    handleImageRemoved();
    const orig = getLanguageByCode(sample.langCode) || DEFAULT_ORIGINAL_LANGUAGE;
    const exp = getLanguageByCode(sample.targetExpCode) || DEFAULT_EXPLANATION_LANGUAGE;
    setOriginalLanguage(orig);
    setExplanationLanguage(exp);
    setIsManualOriginalOverride(true);
    handleTextChange(sample.text);
    setActiveInputMethod("text");
  };

  // Load a reading from MongoDB history
  const handleSelectSavedReading = (reading: SavedReadingItem) => {
    handleImageRemoved();
    setOriginalText(reading.originalText);
    const orig =
      getLanguageByCode(reading.originalLanguage.code) || DEFAULT_ORIGINAL_LANGUAGE;
    const exp =
      getLanguageByCode(reading.explanationLanguage.code) || DEFAULT_EXPLANATION_LANGUAGE;
    setOriginalLanguage(orig);
    setExplanationLanguage(exp);
    setIsManualOriginalOverride(true);

    setExplanationData({
      success: true,
      explanation: reading.explanation,
      keyPoints: reading.keyPoints || [],
      difficultWords: reading.difficultWords || [],
      modelUsed: reading.modelUsed,
    });

    setIsSavedToDb(true);
    setIsHistoryOpen(false);
    setActiveInputMethod("text");
  };

  // Delete a reading from MongoDB
  const handleDeleteSavedReading = async (id: string) => {
    try {
      const res = await fetch(`/api/readings?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSavedReadings((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete reading:", err);
    }
  };

  const hasContent = Boolean(originalText.trim() || selectedImageFile);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header with New Reading, MongoDB History & Privacy */}
      <Header
        onNewReading={handleNewReading}
        hasContent={hasContent}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedReadings.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error notification banner if any */}
        <ErrorMessage
          message={generalError}
          onDismiss={() => setGeneralError(null)}
          isOllamaError={isOllamaError}
        />

        {/* Hero & Method Selector (Always visible or compact) */}
        {!hasContent && (
          <EmptyState
            activeMethod={activeInputMethod}
            onSelectUpload={() => setActiveInputMethod("upload")}
            onSelectManualText={() => setActiveInputMethod("text")}
          />
        )}

        {/* Input Controls Tabs (when content exists) */}
        {hasContent && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveInputMethod("upload")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeInputMethod === "upload"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-brand-600" />
                <span>Image OCR</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInputMethod("text")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeInputMethod === "text"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileEdit className="w-3.5 h-3.5 text-accent-600" />
                <span>Manual Text</span>
              </button>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-medium text-slate-400 mr-1">
                Try Example:
              </span>
              {SAMPLE_PRESETS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700 whitespace-nowrap transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Input Method Box */}
        {activeInputMethod === "upload" && (
          <div className="mb-6">
            <ImageUploader
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              selectedImage={selectedImageFile}
              imagePreviewUrl={imagePreviewUrl}
              disabled={ocrProgress.isProcessing}
            />

            {/* Image Quality & Adaptive Resolution Card */}
            <ImageQualityCard
              metrics={imageQualityMetrics}
              isProcessing={ocrProgress.isProcessing}
            />

            {/* OCR Live Progress Bar & Confidence Feedback */}
            <OCRProgress
              progressState={ocrProgress}
              completedMessage={ocrCompletedMessage}
              confidenceScore={ocrConfidenceScore}
              confidenceLevel={ocrConfidenceLevel}
              suggestions={ocrSuggestions}
              onCancel={handleCancelProcessing}
            />
          </div>
        )}

        {/* Quick Sample Presets when page is fresh empty */}
        {!hasContent && (
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-medium mb-3">
              Or instantly try one of these multilingual test cases:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SAMPLE_PRESETS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:border-brand-300 hover:text-brand-700 hover:shadow-xs transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Work Area (Only visible when user has text or selected image) */}
        {hasContent && (
          <div className="space-y-6">
            {/* Top Toolbar: Language Controls Card & Lens Scanner View Switcher */}
            <div className="flex flex-col gap-3">
              {/* Optional Lens View Switcher when image is loaded */}
              {imagePreviewUrl && (
                <div className="flex items-center justify-between bg-slate-900/90 text-white p-2 rounded-2xl border border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 pl-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      View Mode:
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setLensViewMode("lens")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        lensViewMode === "lens"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                      <span>Google Lens Scanner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLensViewMode("editor")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        lensViewMode === "editor"
                          ? "bg-slate-800 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileEdit className="w-3.5 h-3.5 text-slate-300" />
                      <span>Standard Text Editor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Language Controls Card */}
              <LanguageSelector
                originalLanguage={originalLanguage}
                explanationLanguage={explanationLanguage}
                detectionResult={detectionResult}
                isManualOriginalOverride={isManualOriginalOverride}
                onOriginalLanguageChange={handleOriginalLanguageChange}
                onExplanationLanguageChange={handleExplanationLanguageChange}
                disabled={ocrProgress.isProcessing || isExplaining}
              />
            </div>

            {/* Mode 1: Interactive Google Lens Scanner (Active when image exists & in lens mode) */}
            {imagePreviewUrl && lensViewMode === "lens" ? (
              <div className="space-y-6">
                <LensScannerContainer
                  imageUrl={imagePreviewUrl}
                  structuredData={structuredOcrData}
                  extractedText={originalText}
                  onTextUpdate={handleTextChange}
                  confidenceScore={ocrConfidenceScore}
                  confidenceLevel={ocrConfidenceLevel}
                  originalLanguage={originalLanguage}
                  explanationLanguage={explanationLanguage}
                  onReadText={handleLensRead}
                  onExplainText={(textToExplain, type) => handleExplain(textToExplain, type)}
                  isReading={isLensReading}
                  onStopReading={handleLensStopReading}
                  isExplaining={isExplaining}
                />

                {/* Explanation Output Panel beneath the scanner */}
                <div>
                  {isExplaining ? (
                    <LoadingState
                      message={`Explaining in ${explanationLanguage.name}...`}
                      subMessage={`Analyzing "${originalLanguage.name}" text and generating educational breakdown`}
                    />
                  ) : explanationData ? (
                    <ExplanationPanel
                      explanationData={explanationData}
                      explanationLanguage={explanationLanguage}
                      onRegenerate={() => handleExplain()}
                      isRegenerating={isExplaining}
                      isSavedToDb={isSavedToDb}
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Interactive Educational Explanations
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                        Tap or select any word, line, or paragraph in the image scanner above, then click <strong className="text-blue-600">Explain</strong> to get tailored student-friendly explanations in <strong className="text-slate-700">{explanationLanguage.name}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mode 2: Standard 2-Column Responsive Layout */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Column: Original Text Editor & Primary Action Buttons */}
                <div className="space-y-4">
                  <TextEditor
                    title="Extracted Text"
                    value={originalText}
                    onChange={handleTextChange}
                    onClear={() => handleTextChange("")}
                    direction={originalLanguage.direction || "ltr"}
                    disabled={ocrProgress.isProcessing}
                  />

                  {/* Primary Action Buttons Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Read Aloud Original Text */}
                    <div className="flex-1">
                      <ReadAloudButton
                        text={originalText}
                        language={originalLanguage}
                        label={`Read Aloud (${originalLanguage.name})`}
                      />
                    </div>

                    {/* Explain Button */}
                    <ExplanationButton
                      onClick={() => handleExplain()}
                      isLoading={isExplaining}
                      disabled={!originalText.trim() || ocrProgress.isProcessing}
                    />
                  </div>
                </div>

                {/* Right Column: Explanation Panel / Loading State / Instruction Card */}
                <div>
                  {isExplaining ? (
                    <LoadingState
                      message={`Explaining in ${explanationLanguage.name}...`}
                      subMessage={`Analyzing "${originalLanguage.name}" text and generating educational breakdown`}
                    />
                  ) : explanationData ? (
                    <ExplanationPanel
                      explanationData={explanationData}
                      explanationLanguage={explanationLanguage}
                      onRegenerate={() => handleExplain()}
                      isRegenerating={isExplaining}
                      isSavedToDb={isSavedToDb}
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                        <Sparkles className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-700">
                        Ready for Explanation
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">
                        Click <strong className="text-brand-600">“Explain”</strong> above to generate a simple breakdown, key takeaways, and vocabulary definitions in{" "}
                        <span className="font-semibold text-slate-700">
                          {explanationLanguage.name}
                        </span>
                        .
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Drawer Modal */}
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          readings={savedReadings}
          isLoading={isLoadingHistory}
          onSelectReading={handleSelectSavedReading}
          onDeleteReading={handleDeleteSavedReading}
        />

        {/* Privacy Notice Footer */}
        <PrivacyNotice />
      </main>
    </div>
  );
}
