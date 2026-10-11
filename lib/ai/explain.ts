import { OLLAMA_CONFIG } from "./config";
import { ExplanationResponse, DifficultWord } from "@/types";
import { generateEducationalFallback } from "./fallbackExplain";

export interface ExplainRequestPayload {
  text: string;
  originalLanguage: string;
  explanationLanguage: string;
  selectionType?: "word" | "line" | "paragraph" | "all" | "custom";
}

const SYSTEM_INSTRUCTION = `You are a simple educational text explanation assistant.

Your task is to read the provided paragraph and explain its main meaning in the selected explanation language.

Rules:
Understand the complete paragraph before explaining it.
Give only the important ideas from the paragraph.
Use simple, easy-to-understand language.
Do not copy the paragraph sentence by sentence.
Do not give a detailed essay.
Do not add information that is not present in the original paragraph.
Keep each explanation point short.
Create approximately 5–10 important points depending on the length of the paragraph.
Use bullet points only.
Each bullet point should normally be one short sentence.
Keep the explanation suitable for students.
Preserve the original meaning.
Write the explanation ONLY in the selected explanation language.
Do not translate the original text unless explicitly requested.
Do not include headings, introductions, conclusions, or extra commentary.
Do not number the points.
Start every point with - .

Required output format:
Return ONLY the explanation as bullet points starting with - .`;

/**
 * Parse bullet points starting with -
 */
function parseBulletPoints(rawText: string): string[] {
  const lines = rawText.split("\n");
  const points: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Strip bullet symbol if present or normalize
    if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) {
      const cleanPoint = trimmed.replace(/^[-•*]\s*/, "").trim();
      if (cleanPoint) points.push(cleanPoint);
    } else if (/^\d+[.)]\s*/.test(trimmed)) {
      const cleanPoint = trimmed.replace(/^\d+[.)]\s*/, "").trim();
      if (cleanPoint) points.push(cleanPoint);
    } else if (trimmed.length > 5 && !trimmed.toLowerCase().includes("bullet point")) {
      points.push(trimmed);
    }
  }

  return points;
}

/**
 * Request educational explanation using local Ollama, with automatic fallback
 */
export async function requestExplanation(
  payload: ExplainRequestPayload
): Promise<ExplanationResponse> {
  const { text, originalLanguage, explanationLanguage, selectionType } = payload;
  const baseUrl = OLLAMA_CONFIG.baseUrl.replace(/\/+$/, "");
  const model = OLLAMA_CONFIG.model;

  let promptInstruction = "Return ONLY the explanation as 5-10 simple bullet points. Start every point with - .";
  if (selectionType === "word") {
    promptInstruction = "Provide a short 1-2 sentence explanation suitable for students explaining the meaning of this word and a simple example. Keep it brief.";
  } else if (selectionType === "line") {
    promptInstruction = "Provide a short, simple 1-sentence explanation of what this line means. Keep it direct and clear.";
  }

  const userPrompt = `Original language: ${originalLanguage}

Explanation language: ${explanationLanguage}

Original text: ${text}

${promptInstruction}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds check

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        system: SYSTEM_INSTRUCTION,
        prompt: userPrompt,
        stream: false,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    const rawOutput = (data.response || "").trim();

    if (!rawOutput) {
      throw new Error("Ollama returned an empty response.");
    }

    if (selectionType === "word" || selectionType === "line") {
      return {
        success: true,
        explanation: rawOutput,
        keyPoints: [rawOutput],
        difficultWords: [],
        modelUsed: `Ollama (${model})`,
      };
    }

    const points = parseBulletPoints(rawOutput);
    const bulletText = points.map((p) => `- ${p}`).join("\n");

    return {
      success: true,
      explanation: bulletText || rawOutput,
      keyPoints: points,
      difficultWords: [],
      modelUsed: `Ollama (${model})`,
    };
  } catch (error: unknown) {
    console.warn("Ollama is unavailable, switching to Built-in Educational Engine fallback:", error);

    // Automatically generate explanation using Built-in Educational Engine fallback
    const fallbackResponse = generateEducationalFallback(
      text,
      originalLanguage,
      explanationLanguage,
      selectionType
    );

    return fallbackResponse;
  }
}
