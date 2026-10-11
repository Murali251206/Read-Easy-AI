/**
 * Web SpeechSynthesis helper service for ReadEasy AI
 * Manages audio playback, voices, sentence chunking, and playback states.
 */

export interface SpeechVoiceStatus {
  available: boolean;
  voiceName?: string;
  isExactMatch: boolean;
  message?: string;
}

/**
 * Clean markdown or formatting symbols before reading aloud
 */
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[#*_`~>[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split long text into speakable sentences to prevent browser speech synthesis timeouts
 */
export function splitIntoSentences(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];
  // Split on sentence boundaries (period, question mark, exclamation, or newline)
  const segments = cleaned.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [cleaned];
  return segments.map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Retrieve available browser voices
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }

    const handler = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(updatedVoices);
    };

    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Timeout fallback if voiceschanged doesn't fire
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 400);
  });
}

/**
 * Find the best matching voice for a given BCP 47 code (e.g. 'ta-IN', 'en-US', 'hi-IN')
 */
export async function findBestVoice(speechCode: string): Promise<{
  voice: SpeechSynthesisVoice | null;
  status: SpeechVoiceStatus;
}> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return {
      voice: null,
      status: {
        available: false,
        isExactMatch: false,
        message: "Speech synthesis is not supported by your browser.",
      },
    };
  }

  const voices = await getAvailableVoices();
  if (voices.length === 0) {
    return {
      voice: null,
      status: {
        available: true,
        isExactMatch: false,
        message: "Browser voices are still initializing or none are installed.",
      },
    };
  }

  const normalizedCode = speechCode.toLowerCase().replace("_", "-");
  const prefix = normalizedCode.split("-")[0];

  // 1. Try exact match (e.g., 'ta-in' === 'ta-in')
  const exact = voices.find(
    (v) => v.lang.toLowerCase().replace("_", "-") === normalizedCode
  );
  if (exact) {
    return {
      voice: exact,
      status: {
        available: true,
        voiceName: exact.name,
        isExactMatch: true,
      },
    };
  }

  // 2. Try prefix match (e.g. lang starts with 'ta')
  const prefixMatch = voices.find((v) =>
    v.lang.toLowerCase().replace("_", "-").startsWith(prefix)
  );
  if (prefixMatch) {
    return {
      voice: prefixMatch,
      status: {
        available: true,
        voiceName: prefixMatch.name,
        isExactMatch: false,
        message: `Using ${prefixMatch.name} (${prefixMatch.lang}) for ${speechCode}.`,
      },
    };
  }

  // 3. Fallback to default or first available voice
  const defaultVoice = voices.find((v) => v.default) || voices[0];
  return {
    voice: defaultVoice || null,
    status: {
      available: true,
      voiceName: defaultVoice ? defaultVoice.name : undefined,
      isExactMatch: false,
      message: `No specific voice found for "${speechCode}". Using system default voice (${defaultVoice?.name || "Standard"}).`,
    },
  };
}
