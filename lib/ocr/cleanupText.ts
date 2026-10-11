/**
 * Post-OCR Text Cleanup
 * Removes OCR specks, isolated noise artifacts, and character stutters
 * while strictly preserving paragraphs, line breaks, numbers, bullet points,
 * headings, and authentic wording.
 *
 * RULE: Never translates, rewrites, or summarizes the original text.
 */

export function cleanupOcrText(rawText: string): string {
  if (!rawText || !rawText.trim()) return "";

  const lines = rawText.split("\n");
  const cleanedLines: string[] = [];

  for (const rawLine of lines) {
    let line = rawLine;

    // 1. Remove isolated OCR noise lines (e.g. lone "~", "|", "_", "`", "^" or random single non-alphanumeric chars)
    const trimmed = line.trim();
    if (
      trimmed.length <= 2 &&
      /^[|~_`^'\\\/<>=+*#–—-]+$/.test(trimmed)
    ) {
      continue;
    }

    // 2. Remove isolated OCR margin artifacts at the start or end of lines (e.g. "| Text" or "Text |")
    line = line.replace(/^\s*[|~_`^]\s+/, "");
    line = line.replace(/\s+[|~_`^]\s*$/, "");

    // 3. Remove character stutter glitches caused by scanner noise (e.g. "thiiiis" or "=======" or "||||||")
    // Keep double letters like "ll", "ee", "oo", but reduce 4+ identical characters in a row to 2
    line = line.replace(/([a-zA-Z])\1{3,}/g, "$1$1");
    line = line.replace(/([_\-~=|=])\1{3,}/g, "");

    // 4. Normalize multiple spaces within a line while preserving indentation/bullet style
    const leadingWhitespaceMatch = line.match(/^\s*/);
    const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : "";
    const content = line.trim().replace(/[ \t]{2,}/g, " ");

    if (content) {
      cleanedLines.push(leadingWhitespace + content);
    } else {
      // Preserve single empty line between paragraphs, but avoid 3+ consecutive blank lines
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== "") {
        cleanedLines.push("");
      }
    }
  }

  // Remove trailing and leading blank lines
  while (cleanedLines.length > 0 && cleanedLines[0] === "") {
    cleanedLines.shift();
  }
  while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === "") {
    cleanedLines.pop();
  }

  return cleanedLines.join("\n");
}
