export interface SupportedLanguage {
  code: string;           // ISO 639-1 code (e.g., 'ta', 'en')
  iso639_3: string;       // ISO 639-3 code (e.g., 'tam', 'eng')
  name: string;           // Display name (e.g., 'Tamil')
  nativeName: string;     // Native script name (e.g., 'தமிழ்')
  speechCode: string;     // BCP 47 language tag for SpeechSynthesis (e.g., 'ta-IN')
  tesseractCode: string;  // Tesseract language code (e.g., 'tam')
  direction?: 'ltr' | 'rtl';
}

export interface LanguageDetectionResult {
  detectedLanguage: SupportedLanguage | null;
  confidence: 'high' | 'medium' | 'low';
  score: number; // 0.0 to 1.0
  reason?: string;
}

export interface OCRProgressState {
  status: string;
  progress: number; // 0 to 100
  isProcessing: boolean;
  stageMessage: string;
}

export interface DifficultWord {
  word: string;
  meaning: string;
}

export interface ExplanationResponse {
  success: boolean;
  explanation: string;
  keyPoints: string[];
  difficultWords: DifficultWord[];
  error?: string;
  modelUsed?: string;
  wordMeaning?: string;
  wordExample?: string;
}

export interface SpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  currentUtteranceText: string | null;
  activeLanguageCode: string | null;
  speechType: 'original' | 'explanation' | null;
}

export type ResolutionTier = '1080p' | '4K' | '8K' | 'Original';

export interface ImageQualityMetrics {
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  aspectRatio: string;
  fileSizeBytes: number;
  resolutionTier: ResolutionTier;
  brightnessScore: number; // 0 to 100
  contrastScore: number;   // 0 to 100
  sharpnessScore: number;  // 0 to 100
  isUpscaled: boolean;
  statusMessage: string;
  deviceTier: 'mobile' | 'desktop';
}

// ========================================================
// Lens-Style Structured OCR Data Model
// ========================================================
export interface BoundingBox {
  x: number; // In natural original image pixels
  y: number;
  width: number;
  height: number;
}

export interface OCRWord {
  id: string;
  text: string;
  confidence: number;
  bbox: BoundingBox;
  lineId: string;
  paragraphId: string;
  wordIndex: number;
}

export interface OCRLine {
  id: string;
  text: string;
  wordIds: string[];
  bbox: BoundingBox;
  paragraphId: string;
  lineIndex: number;
}

export interface OCRParagraph {
  id: string;
  text: string;
  lineIds: string[];
  bbox: BoundingBox;
  paragraphIndex: number;
}

export interface StructuredOCRData {
  words: OCRWord[];
  lines: OCRLine[];
  paragraphs: OCRParagraph[];
  originalWidth: number;
  originalHeight: number;
}

export type SelectionType = 'word' | 'line' | 'paragraph' | 'custom' | 'all';

export interface SelectedTextRegion {
  text: string;
  wordIds: string[];
  lineIds: string[];
  type: SelectionType;
  boundingBox?: BoundingBox;
}
