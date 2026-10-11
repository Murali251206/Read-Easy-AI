import { NextRequest, NextResponse } from "next/server";
import { requestExplanation } from "@/lib/ai/explain";
import { getLanguageByCode, getLanguageByName } from "@/lib/ocr/languages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, originalLanguage, explanationLanguage, selectionType } = body;

    // 1. Validate text
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Text cannot be empty. Please provide text to explain.",
          explanation: "",
          keyPoints: [],
          difficultWords: [],
        },
        { status: 400 }
      );
    }

    if (text.trim().length > 15000) {
      return NextResponse.json(
        {
          success: false,
          error: "Text is too long. Please provide a paragraph or passage under 15,000 characters.",
          explanation: "",
          keyPoints: [],
          difficultWords: [],
        },
        { status: 400 }
      );
    }

    // 2. Validate original language
    if (!originalLanguage || typeof originalLanguage !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Original language is required.",
          explanation: "",
          keyPoints: [],
          difficultWords: [],
        },
        { status: 400 }
      );
    }

    // 3. Validate explanation language
    if (!explanationLanguage || typeof explanationLanguage !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Explanation language is required.",
          explanation: "",
          keyPoints: [],
          difficultWords: [],
        },
        { status: 400 }
      );
    }

    // Resolve language names
    const resolvedOriginal =
      getLanguageByCode(originalLanguage)?.name ||
      getLanguageByName(originalLanguage)?.name ||
      originalLanguage;

    const resolvedExplanation =
      getLanguageByCode(explanationLanguage)?.name ||
      getLanguageByName(explanationLanguage)?.name ||
      explanationLanguage;

    // 4. Call Ollama
    const result = await requestExplanation({
      text: text.trim(),
      originalLanguage: resolvedOriginal,
      explanationLanguage: resolvedExplanation,
      selectionType,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 502 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("API explain route error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error occurred while generating explanation.";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        explanation: "",
        keyPoints: [],
        difficultWords: [],
      },
      { status: 500 }
    );
  }
}
