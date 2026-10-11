import { SUPPORTED_LANGUAGES, getLanguageByCode } from "@/lib/ocr/languages";
import { LanguageDetectionResult, SupportedLanguage } from "@/types";
import { franc } from "franc-min";

// Unicode ranges for non-Latin writing systems
const SCRIPT_PATTERNS = [
  { code: "ta", regex: /[\u0B80-\u0BFF]/g, name: "Tamil" },
  { code: "te", regex: /[\u0C00-\u0C7F]/g, name: "Telugu" },
  { code: "ml", regex: /[\u0D00-\u0D7F]/g, name: "Malayalam" },
  { code: "kn", regex: /[\u0C80-\u0CFF]/g, name: "Kannada" },
  { code: "bn", regex: /[\u0980-\u09FF]/g, name: "Bengali" },
  { code: "gu", regex: /[\u0A80-\u0AFF]/g, name: "Gujarati" },
  { code: "pa", regex: /[\u0A00-\u0A7F]/g, name: "Punjabi" },
  { code: "ar", regex: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, name: "Arabic" },
  { code: "devanagari", regex: /[\u0900-\u097F]/g, name: "Devanagari" },
];

// Marathi vs Hindi distinctive markers
const MARATHI_MARKERS = [
  "आहे", "नाही", "आहेत", "होते", "झाले", "केले", "मला", "तुम्ही",
  "आम्ही", "यांचा", "त्यांचे", "म्हणून", "मध्ये", "होता", "कसे", "काय",
  "करायचे", "केला", "झाला"
];

const HINDI_MARKERS = [
  "है", "हैं", "था", "थी", "थे", "होगा", "होगी", "के", "में", "का",
  "की", "को", "से", "पर", "और", "लेकिन", "यह", "वह", "किया", "गया",
  "नहीं", "बहुत", "आप", "हम"
];

// Latin script vocabulary markers
const GERMAN_MARKERS = [
  "und", "der", "die", "das", "ist", "nicht", "ein", "eine", "sie", "wir",
  "für", "mit", "den", "auf", "dem", "sich", "von", "zu", "im", "als", "es"
];
const GERMAN_CHARS = /[äöüßÄÖÜ]/;

const FRENCH_MARKERS = [
  "le", "la", "les", "des", "est", "dans", "pour", "avec", "qui", "que",
  "une", "un", "ce", "cette", "sur", "pas", "nous", "vous", "ils", "sont"
];
const FRENCH_CHARS = /[éèêëçàâôûùœÉÈÊËÇÀÂÔÛÙŒ]/;

const SPANISH_MARKERS = [
  "el", "la", "los", "las", "del", "es", "en", "para", "con", "por",
  "que", "una", "un", "como", "más", "pero", "este", "esta", "son", "sus"
];
const SPANISH_CHARS = /[ñáéíóú¿¡ÑÁÉÍÓÚ]/;

const ENGLISH_MARKERS = [
  "the", "and", "is", "in", "it", "you", "that", "he", "was", "for",
  "on", "are", "as", "with", "his", "they", "at", "be", "this", "have",
  "from", "or", "one", "had", "by", "word", "but", "not", "what", "all",
  "were", "we", "when", "your", "can", "said", "there", "use", "an", "each"
];

/**
 * Clean and normalize text for detection
 */
function cleanText(text: string): string {
  return text.trim();
}

/**
 * Detect language of the input text
 */
export function detectLanguage(rawText: string): LanguageDetectionResult {
  const text = cleanText(rawText);

  // If text is empty or has fewer than 2 letters
  if (!text || text.length < 2) {
    return {
      detectedLanguage: null,
      confidence: "low",
      score: 0,
      reason: "Text is too short for language detection.",
    };
  }

  // Count letters/characters excluding whitespaces & punctuation
  const meaningfulChars = text.replace(/[\s\d.,!?;:()'"\-_/\\@#$%^&*+=<>~`[\]{}|]/g, "");
  if (meaningfulChars.length < 2) {
    return {
      detectedLanguage: null,
      confidence: "low",
      score: 0,
      reason: "Not enough textual characters.",
    };
  }

  // 1. Check non-Latin Unicode scripts
  for (const script of SCRIPT_PATTERNS) {
    const matches = text.match(script.regex);
    if (matches && matches.length > 0) {
      const ratio = matches.length / meaningfulChars.length;
      if (ratio > 0.25) {
        // High script match
        if (script.code === "devanagari") {
          // Distinguish Hindi vs Marathi
          const lower = text.toLowerCase();
          let marathiScore = 0;
          let hindiScore = 0;

          for (const marker of MARATHI_MARKERS) {
            if (lower.includes(marker)) marathiScore += 1;
          }
          for (const marker of HINDI_MARKERS) {
            if (lower.includes(marker)) hindiScore += 1;
          }

          if (marathiScore > hindiScore) {
            return {
              detectedLanguage: getLanguageByCode("mr") || null,
              confidence: marathiScore >= 2 || matches.length > 10 ? "high" : "medium",
              score: Math.min(0.95, 0.6 + ratio * 0.35),
            };
          }

          // Default Devanagari to Hindi
          return {
            detectedLanguage: getLanguageByCode("hi") || null,
            confidence: hindiScore >= 1 || matches.length >= 4 ? "high" : "medium",
            score: Math.min(0.98, 0.65 + ratio * 0.33),
          };
        }

        // Direct script match for Tamil, Telugu, Malayalam, Kannada, Bengali, Gujarati, Punjabi, Arabic
        const detected = getLanguageByCode(script.code);
        if (detected) {
          const confidence = matches.length >= 3 ? "high" : "medium";
          return {
            detectedLanguage: detected,
            confidence,
            score: Math.min(0.99, 0.7 + ratio * 0.29),
          };
        }
      }
    }
  }

  // 2. Latin script detection (English, French, German, Spanish)
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).map((w) => w.replace(/[.,!?;:()'"\-]/g, "")).filter(Boolean);

  let deScore = 0;
  let frScore = 0;
  let esScore = 0;
  let enScore = 0;

  // Diacritic / special char checks
  if (GERMAN_CHARS.test(text)) deScore += 3;
  if (FRENCH_CHARS.test(text)) frScore += 3;
  if (SPANISH_CHARS.test(text)) esScore += 3;

  for (const word of words) {
    if (GERMAN_MARKERS.includes(word)) deScore += 2;
    if (FRENCH_MARKERS.includes(word)) frScore += 2;
    if (SPANISH_MARKERS.includes(word)) esScore += 2;
    if (ENGLISH_MARKERS.includes(word)) enScore += 2;
  }

  // Statistical fallback using franc
  let francIso = "";
  try {
    francIso = franc(text, { minLength: 3 });
  } catch {
    // ignore
  }

  if (francIso === "deu") deScore += 3;
  if (francIso === "fra") frScore += 3;
  if (francIso === "spa") esScore += 3;
  if (francIso === "eng") enScore += 3;

  const maxScore = Math.max(deScore, frScore, esScore, enScore);

  if (maxScore > 0) {
    if (deScore === maxScore) {
      return {
        detectedLanguage: getLanguageByCode("de") || null,
        confidence: maxScore >= 4 ? "high" : "medium",
        score: Math.min(0.95, 0.5 + maxScore * 0.08),
      };
    }
    if (frScore === maxScore) {
      return {
        detectedLanguage: getLanguageByCode("fr") || null,
        confidence: maxScore >= 4 ? "high" : "medium",
        score: Math.min(0.95, 0.5 + maxScore * 0.08),
      };
    }
    if (esScore === maxScore) {
      return {
        detectedLanguage: getLanguageByCode("es") || null,
        confidence: maxScore >= 4 ? "high" : "medium",
        score: Math.min(0.95, 0.5 + maxScore * 0.08),
      };
    }
    if (enScore === maxScore) {
      return {
        detectedLanguage: getLanguageByCode("en") || null,
        confidence: maxScore >= 4 ? "high" : "medium",
        score: Math.min(0.95, 0.5 + maxScore * 0.08),
      };
    }
  }

  // If franc returned another supported language ISO
  if (francIso && francIso !== "und") {
    const match = SUPPORTED_LANGUAGES.find((l) => l.iso639_3 === francIso);
    if (match) {
      return {
        detectedLanguage: match,
        confidence: "medium",
        score: 0.65,
      };
    }
  }

  // Low confidence / uncertain fallback
  // If there are words and it looks like English/Latin without markers, provide English with low confidence
  if (/^[a-zA-Z\s\d.,!?'"-]+$/.test(text) && text.length >= 6) {
    return {
      detectedLanguage: getLanguageByCode("en") || null,
      confidence: "low",
      score: 0.4,
      reason: "Language could not be confidently detected.",
    };
  }

  return {
    detectedLanguage: null,
    confidence: "low",
    score: 0.1,
    reason: "Language could not be confidently detected.",
  };
}
