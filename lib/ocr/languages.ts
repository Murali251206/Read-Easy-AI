import { SupportedLanguage } from "@/types";

/**
 * ReadEasy AI - Central Language Configuration Registry
 * Easily extendable list of supported languages for OCR, Language Detection,
 * Web SpeechSynthesis, and Ollama AI Explanations.
 */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: "en",
    iso639_3: "eng",
    name: "English",
    nativeName: "English",
    speechCode: "en-US",
    tesseractCode: "eng",
    direction: "ltr",
  },
  {
    code: "ta",
    iso639_3: "tam",
    name: "Tamil",
    nativeName: "தமிழ்",
    speechCode: "ta-IN",
    tesseractCode: "tam",
    direction: "ltr",
  },
  {
    code: "hi",
    iso639_3: "hin",
    name: "Hindi",
    nativeName: "हिन्दी",
    speechCode: "hi-IN",
    tesseractCode: "hin",
    direction: "ltr",
  },
  {
    code: "te",
    iso639_3: "tel",
    name: "Telugu",
    nativeName: "తెలుగు",
    speechCode: "te-IN",
    tesseractCode: "tel",
    direction: "ltr",
  },
  {
    code: "ml",
    iso639_3: "mal",
    name: "Malayalam",
    nativeName: "മലയാളം",
    speechCode: "ml-IN",
    tesseractCode: "mal",
    direction: "ltr",
  },
  {
    code: "kn",
    iso639_3: "kan",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    speechCode: "kn-IN",
    tesseractCode: "kan",
    direction: "ltr",
  },
  {
    code: "bn",
    iso639_3: "ben",
    name: "Bengali",
    nativeName: "বাংলা",
    speechCode: "bn-IN",
    tesseractCode: "ben",
    direction: "ltr",
  },
  {
    code: "mr",
    iso639_3: "mar",
    name: "Marathi",
    nativeName: "मराठी",
    speechCode: "mr-IN",
    tesseractCode: "mar",
    direction: "ltr",
  },
  {
    code: "gu",
    iso639_3: "guj",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    speechCode: "gu-IN",
    tesseractCode: "guj",
    direction: "ltr",
  },
  {
    code: "pa",
    iso639_3: "pan",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    speechCode: "pa-IN",
    tesseractCode: "pan",
    direction: "ltr",
  },
  {
    code: "fr",
    iso639_3: "fra",
    name: "French",
    nativeName: "Français",
    speechCode: "fr-FR",
    tesseractCode: "fra",
    direction: "ltr",
  },
  {
    code: "de",
    iso639_3: "deu",
    name: "German",
    nativeName: "Deutsch",
    speechCode: "de-DE",
    tesseractCode: "deu",
    direction: "ltr",
  },
  {
    code: "es",
    iso639_3: "spa",
    name: "Spanish",
    nativeName: "Español",
    speechCode: "es-ES",
    tesseractCode: "spa",
    direction: "ltr",
  },
  {
    code: "ar",
    iso639_3: "ara",
    name: "Arabic",
    nativeName: "العربية",
    speechCode: "ar-SA",
    tesseractCode: "ara",
    direction: "rtl",
  },
];

export const DEFAULT_ORIGINAL_LANGUAGE = SUPPORTED_LANGUAGES[0]; // English
export const DEFAULT_EXPLANATION_LANGUAGE = SUPPORTED_LANGUAGES[0]; // English

export function getLanguageByCode(code: string): SupportedLanguage | undefined {
  if (!code) return undefined;
  const normalized = code.toLowerCase().trim();
  return SUPPORTED_LANGUAGES.find(
    (lang) =>
      lang.code.toLowerCase() === normalized ||
      lang.iso639_3.toLowerCase() === normalized ||
      lang.speechCode.toLowerCase().startsWith(normalized)
  );
}

export function getLanguageByName(name: string): SupportedLanguage | undefined {
  if (!name) return undefined;
  const normalized = name.toLowerCase().trim();
  return SUPPORTED_LANGUAGES.find(
    (lang) =>
      lang.name.toLowerCase() === normalized ||
      lang.nativeName.toLowerCase() === normalized
  );
}
