import {
  BoundingBox,
  OCRWord,
  OCRLine,
  OCRParagraph,
  StructuredOCRData,
} from "@/types";

interface TesseractBBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface TesseractWord {
  text: string;
  confidence: number;
  bbox?: TesseractBBox;
}

interface TesseractLine {
  text: string;
  confidence: number;
  bbox?: TesseractBBox;
  words?: TesseractWord[];
}

interface TesseractParagraph {
  text: string;
  confidence: number;
  bbox?: TesseractBBox;
  lines?: TesseractLine[];
}

interface TesseractData {
  text: string;
  confidence: number;
  words?: TesseractWord[];
  lines?: TesseractLine[];
  paragraphs?: TesseractParagraph[];
}

/**
 * Maps bounding boxes from processing resolution back to original image dimensions
 */
function mapBox(
  bbox: TesseractBBox | undefined,
  scaleX: number,
  scaleY: number
): BoundingBox {
  if (!bbox) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const x = Math.max(0, Math.round(bbox.x0 * scaleX));
  const y = Math.max(0, Math.round(bbox.y0 * scaleY));
  const width = Math.max(1, Math.round((bbox.x1 - bbox.x0) * scaleX));
  const height = Math.max(1, Math.round((bbox.y1 - bbox.y0) * scaleY));
  return { x, y, width, height };
}

/**
 * Builds clean structured OCR data (words, lines, paragraphs) with bounding boxes
 * normalized to original image pixel coordinates.
 */
export function buildStructuredOCRData(
  data: TesseractData,
  origWidth: number,
  origHeight: number,
  procWidth: number,
  procHeight: number
): StructuredOCRData {
  const scaleX = procWidth > 0 ? origWidth / procWidth : 1;
  const scaleY = procHeight > 0 ? origHeight / procHeight : 1;

  const ocrWords: OCRWord[] = [];
  const ocrLines: OCRLine[] = [];
  const ocrParagraphs: OCRParagraph[] = [];

  let globalWordIndex = 0;
  let globalLineIndex = 0;
  let globalParagraphIndex = 0;

  // If Tesseract provided structured paragraphs
  if (data.paragraphs && data.paragraphs.length > 0) {
    for (const para of data.paragraphs) {
      const pId = `para-${globalParagraphIndex}`;
      const lineIdsForPara: string[] = [];

      if (para.lines && para.lines.length > 0) {
        for (const line of para.lines) {
          const lId = `line-${globalLineIndex}`;
          lineIdsForPara.push(lId);
          const wordIdsForLine: string[] = [];

          if (line.words && line.words.length > 0) {
            for (const word of line.words) {
              const cleanWordText = (word.text || "").trim();
              if (!cleanWordText) continue;

              const wId = `word-${globalWordIndex}`;
              wordIdsForLine.push(wId);

              ocrWords.push({
                id: wId,
                text: cleanWordText,
                confidence: Math.round(word.confidence || 0),
                bbox: mapBox(word.bbox, scaleX, scaleY),
                lineId: lId,
                paragraphId: pId,
                wordIndex: globalWordIndex++,
              });
            }
          }

          const cleanLineText = (line.text || "").trim();
          if (cleanLineText) {
            ocrLines.push({
              id: lId,
              text: cleanLineText,
              wordIds: wordIdsForLine,
              bbox: mapBox(line.bbox, scaleX, scaleY),
              paragraphId: pId,
              lineIndex: globalLineIndex++,
            });
          }
        }
      }

      const cleanParaText = (para.text || "").trim();
      if (cleanParaText) {
        ocrParagraphs.push({
          id: pId,
          text: cleanParaText,
          lineIds: lineIdsForPara,
          bbox: mapBox(para.bbox, scaleX, scaleY),
          paragraphIndex: globalParagraphIndex++,
        });
      }
    }
  }

  // Fallback if paragraphs weren't populated but lines were
  if (ocrLines.length === 0 && data.lines && data.lines.length > 0) {
    const pId = "para-0";
    const lineIds: string[] = [];

    for (const line of data.lines) {
      const lId = `line-${globalLineIndex}`;
      lineIds.push(lId);
      const wordIds: string[] = [];

      if (line.words && line.words.length > 0) {
        for (const word of line.words) {
          const cleanWordText = (word.text || "").trim();
          if (!cleanWordText) continue;
          const wId = `word-${globalWordIndex}`;
          wordIds.push(wId);

          ocrWords.push({
            id: wId,
            text: cleanWordText,
            confidence: Math.round(word.confidence || 0),
            bbox: mapBox(word.bbox, scaleX, scaleY),
            lineId: lId,
            paragraphId: pId,
            wordIndex: globalWordIndex++,
          });
        }
      }

      const cleanLineText = (line.text || "").trim();
      if (cleanLineText) {
        ocrLines.push({
          id: lId,
          text: cleanLineText,
          wordIds,
          bbox: mapBox(line.bbox, scaleX, scaleY),
          paragraphId: pId,
          lineIndex: globalLineIndex++,
        });
      }
    }

    if (ocrLines.length > 0) {
      ocrParagraphs.push({
        id: pId,
        text: data.text || "",
        lineIds,
        bbox: { x: 0, y: 0, width: origWidth, height: origHeight },
        paragraphIndex: 0,
      });
    }
  }

  // Fallback if neither was populated but words were
  if (ocrWords.length === 0 && data.words && data.words.length > 0) {
    for (const word of data.words) {
      const cleanWordText = (word.text || "").trim();
      if (!cleanWordText) continue;
      const wId = `word-${globalWordIndex}`;

      ocrWords.push({
        id: wId,
        text: cleanWordText,
        confidence: Math.round(word.confidence || 0),
        bbox: mapBox(word.bbox, scaleX, scaleY),
        lineId: "line-0",
        paragraphId: "para-0",
        wordIndex: globalWordIndex++,
      });
    }

    if (ocrWords.length > 0) {
      ocrLines.push({
        id: "line-0",
        text: data.text || "",
        wordIds: ocrWords.map((w) => w.id),
        bbox: { x: 0, y: 0, width: origWidth, height: origHeight },
        paragraphId: "para-0",
        lineIndex: 0,
      });
      ocrParagraphs.push({
        id: "para-0",
        text: data.text || "",
        lineIds: ["line-0"],
        bbox: { x: 0, y: 0, width: origWidth, height: origHeight },
        paragraphIndex: 0,
      });
    }
  }

  return {
    words: ocrWords,
    lines: ocrLines,
    paragraphs: ocrParagraphs,
    originalWidth: origWidth,
    originalHeight: origHeight,
  };
}
