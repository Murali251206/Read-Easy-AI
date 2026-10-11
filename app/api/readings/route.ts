import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Reading } from "@/lib/db/models/Reading";

export async function GET() {
  try {
    await connectToDatabase();
    const readings = await Reading.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      readings,
    });
  } catch (error: unknown) {
    console.error("Failed to fetch readings from MongoDB:", error);
    const msg = error instanceof Error ? error.message : "Failed to load readings";
    return NextResponse.json(
      {
        success: false,
        error: msg,
        readings: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      originalText,
      originalLanguage,
      explanationLanguage,
      explanation,
      keyPoints,
      difficultWords,
      sourceType,
      modelUsed,
    } = body;

    if (!originalText || !explanation) {
      return NextResponse.json(
        { success: false, error: "originalText and explanation are required." },
        { status: 400 }
      );
    }

    // Generate descriptive short title from first words
    const cleanSnippet = originalText.replace(/\s+/g, " ").trim();
    const title =
      cleanSnippet.length > 50
        ? cleanSnippet.slice(0, 47) + "..."
        : cleanSnippet || "Untitled Reading";

    const reading = await Reading.create({
      title,
      originalText,
      originalLanguage,
      explanationLanguage,
      explanation,
      keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      difficultWords: Array.isArray(difficultWords) ? difficultWords : [],
      sourceType: sourceType || "text",
      modelUsed: modelUsed || "local",
    });

    return NextResponse.json({
      success: true,
      reading,
    });
  } catch (error: unknown) {
    console.error("Failed to save reading to MongoDB:", error);
    const msg = error instanceof Error ? error.message : "Failed to save reading";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Reading ID is required for deletion." },
        { status: 400 }
      );
    }

    await Reading.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Reading deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Failed to delete reading from MongoDB:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete reading";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
