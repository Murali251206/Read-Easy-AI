import { createWorker } from "tesseract.js";
import { validateImage } from "./validateImage";
import { generatePreprocessedVersions } from "./preprocess";
import { cleanupOcrText } from "./cleanupText";
import { ImageQualityMetrics, StructuredOCRData } from "@/types";
import { buildStructuredOCRData } from "./extractStructuredData";

export interface OCROptions {
  language?: string; // e.g., 'eng', 'tam', 'hin'
  onProgress?: (progress: number, stage: string) => void;
  onQualityMetrics?: (metrics: ImageQualityMetrics) => void;
  signal?: AbortSignal;
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface AdvancedOCRResult {
  text: string;
  rawText: string;
  confidence: number; // 0 to 100
  confidenceLevel: ConfidenceLevel;
  statusMessage: string;
  attemptsCount: number;
  isLowQuality: boolean;
  metrics?: ImageQualityMetrics;
  suggestions?: string[];
  structuredData?: StructuredOCRData;
}

/**
 * Maps selected language code to optimal Tesseract models
 * Combining non-English scripts with 'eng' enables reading bilingual documents,
 * numbers, and English headings (like 'MEWP' or 'WHEN TO COMPLETE').
 */
export function resolveTesseractLanguages(langCode?: string): string {
  if (!langCode || langCode === "en" || langCode === "eng") {
    return "eng";
  }

  const cleanCode = langCode.toLowerCase().trim();
  const mapping: Record<string, string> = {
    ta: "tam+eng",
    tam: "tam+eng",
    hi: "hin+eng",
    hin: "hin+eng",
    te: "tel+eng",
    tel: "tel+eng",
    ml: "mal+eng",
    mal: "mal+eng",
    kn: "kan+eng",
    kan: "kan+eng",
    bn: "ben+eng",
    ben: "ben+eng",
    mr: "mar+eng",
    mar: "mar+eng",
    gu: "guj+eng",
    guj: "guj+eng",
    pa: "pan+eng",
    pan: "pan+eng",
    ar: "ara+eng",
    ara: "ara+eng",
    fr: "fra+eng",
    fra: "fra+eng",
    de: "deu+eng",
    deu: "deu+eng",
    es: "spa+eng",
    spa: "spa+eng",
  };

  return mapping[cleanCode] || `${cleanCode}+eng`;
}

/**
 * Calculates a composite reliability score for an OCR pass
 */
function scoreOCRResult(text: string, confidence: number): number {
  if (!text || text.trim().length === 0) return 0;

  const trimmed = text.trim();
  const charCount = trimmed.length;

  // Ratio of meaningful characters (letters, numbers, basic punctuation)
  const meaningfulMatch = trimmed.match(new RegExp("[\\p{L}\\p{N}\\s.,!?'\"()-]", "gu"));
  const meaningfulRatio = meaningfulMatch ? meaningfulMatch.length / charCount : 0.5;

  return confidence * 0.7 + meaningfulRatio * 30;
}

/**
 * Multi-Step Advanced OCR Pipeline with Adaptive 1080p / 4K / 8K Processing
 */
export async function extractTextFromImage(
  imageFile: File,
  options: OCROptions = {}
): Promise<AdvancedOCRResult> {
  const { signal } = options;
  if (signal?.aborted) throw new Error("Processing was cancelled by user.");

  // ============================================================
  // Step 1: Image Validation
  // ============================================================
  options.onProgress?.(5, "Analyzing image dimensions and quality...");

  const validation = await validateImage(imageFile);
  if (!validation.isValid) {
    throw new Error(validation.error || "The image is not valid for text extraction.");
  }

  if (signal?.aborted) throw new Error("Processing was cancelled by user.");

  // ============================================================
  // Step 2: Adaptive Resolution Enhancement & Multi-Version Preprocessing
  // ============================================================
  options.onProgress?.(15, "Adapting resolution (1080p/4K/8K) & generating OCR versions...");

  let preprocessed;
  try {
    preprocessed = await generatePreprocessedVersions(imageFile, imageFile.size, signal);
    if (options.onQualityMetrics && preprocessed.metrics) {
      options.onQualityMetrics(preprocessed.metrics);
    }
  } catch (prepErr: unknown) {
    if (signal?.aborted) throw new Error("Processing was cancelled by user.");
    console.warn("Canvas preprocessing fallback:", prepErr);
    preprocessed = null;
  }

  if (signal?.aborted) throw new Error("Processing was cancelled by user.");

  // ============================================================
  // Step 3: OCR Language Selection
  // ============================================================
  const tesseractLang = resolveTesseractLanguages(options.language);
  options.onProgress?.(30, `Loading OCR language models (${tesseractLang})...`);

  // Initialize Tesseract worker
  const worker = await createWorker(tesseractLang, 1, {
    logger: (message) => {
      if (message.status === "recognizing text") {
        const pct = Math.min(95, Math.round(35 + (message.progress || 0) * 55));
        options.onProgress?.(
          pct,
          `Recognizing text (${Math.round((message.progress || 0) * 100)}%)...`
        );
      }
    },
    errorHandler: (err) => console.error("Worker error:", err),
  });

  try {
    if (signal?.aborted) throw new Error("Processing was cancelled by user.");

    // ============================================================
    // Step 4: Multi-Pass OCR Attempts across Preprocessed Versions
    // ============================================================
    options.onProgress?.(45, "Running OCR Pass 1 (High-contrast enhanced)...");

    // Attempt 1: High Contrast & Sharpened
    const pass1Source = preprocessed ? preprocessed.highContrast : imageFile;
    const result1 = await worker.recognize(pass1Source);
    const text1 = result1.data.text || "";
    const conf1 = result1.data.confidence || 0;
    const score1 = scoreOCRResult(text1, conf1);

    let bestText = text1;
    let bestConf = conf1;
    let bestScore = score1;
    let bestData = result1.data;
    let attemptsCount = 1;

    if (signal?.aborted) throw new Error("Processing was cancelled by user.");

    // If Pass 1 confidence is below 78% or text is short, run Pass 2 (Adaptive Thresholded)
    if (preprocessed && (conf1 < 78 || text1.trim().length < 25)) {
      options.onProgress?.(70, "Running OCR Pass 2 (Adaptive Otsu thresholding)...");
      attemptsCount++;

      const result2 = await worker.recognize(preprocessed.thresholded);
      const text2 = result2.data.text || "";
      const conf2 = result2.data.confidence || 0;
      const score2 = scoreOCRResult(text2, conf2);

      if (score2 > bestScore) {
        bestText = text2;
        bestConf = conf2;
        bestScore = score2;
        bestData = result2.data;
      }
    }

    if (signal?.aborted) throw new Error("Processing was cancelled by user.");

    // ============================================================
    // Step 5: Post-OCR Text Cleanup
    // ============================================================
    options.onProgress?.(95, "Cleaning OCR artifacts & verifying structure...");
    const cleanedText = cleanupOcrText(bestText);

    // ============================================================
    // Step 6: Build Structured OCR Data (Words, Lines, Paragraphs)
    // ============================================================
    const origW = preprocessed?.metrics.originalWidth || validation.width;
    const origH = preprocessed?.metrics.originalHeight || validation.height;
    const procW = preprocessed?.metrics.targetWidth || validation.width;
    const procH = preprocessed?.metrics.targetHeight || validation.height;

    const structuredData = buildStructuredOCRData(bestData, origW, origH, procW, procH);

    // ============================================================
    // Step 7: OCR Confidence Assessment
    // ============================================================
    let confidenceLevel: ConfidenceLevel = "high";
    let statusMessage = "Text extracted successfully.";
    let isLowQuality = false;
    const suggestions: string[] = [];

    if (bestConf >= 75 && cleanedText.length > 10) {
      confidenceLevel = "high";
      statusMessage = "Text extracted successfully.";
    } else if (bestConf >= 50 && cleanedText.length > 5) {
      confidenceLevel = "medium";
      statusMessage = "Text extracted. Please check the text for possible OCR mistakes.";
    } else {
      confidenceLevel = "low";
      statusMessage =
        "We could not read this image clearly. Please check the text or upload a clearer photo.";
      isLowQuality = true;
      suggestions.push(
        "Upload a sharper, higher-resolution image",
        "Take the photo in bright, even lighting to eliminate shadows",
        "Keep the camera straight and parallel to the document",
        "Move closer so the text fills the frame",
        "Avoid severe camera angles or blurry focus"
      );
    }

    options.onProgress?.(100, statusMessage);
    await worker.terminate();

    return {
      text: cleanedText,
      rawText: bestText,
      confidence: Math.round(bestConf),
      confidenceLevel,
      statusMessage,
      attemptsCount,
      isLowQuality,
      metrics: preprocessed?.metrics,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      structuredData,
    };
  } catch (err: unknown) {
    await worker.terminate();
    if (signal?.aborted) {
      throw new Error("OCR Processing was cancelled.");
    }
    console.error("Advanced OCR pipeline error:", err);
    const msg = err instanceof Error ? err.message : "Failed to extract text from the image.";
    throw new Error(`OCR Processing Failed: ${msg}`);
  }
}
