import { ImageQualityMetrics } from "@/types";
import { analyzeImageQuality } from "./qualityAnalysis";

/**
 * Multiple OCR-ready variations generated from the adaptive resolution enhancement
 */
export interface PreprocessedVersions {
  metrics: ImageQualityMetrics;
  enhancedColor: Blob;
  grayscale: Blob;
  highContrast: Blob;
  thresholded: Blob;
}

/**
 * Load image file into an HTMLImageElement
 */
export function loadImage(file: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for preprocessing"));

    if (typeof file === "string") {
      img.src = file;
    } else {
      img.src = URL.createObjectURL(file);
    }
  });
}

/**
 * Convert canvas to Blob with resource cleanup
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas to Blob conversion failed"));
      },
      "image/png",
      0.95
    );
  });
}

/**
 * Calculate Otsu's threshold for optimal binarization
 */
function calculateOtsuThreshold(grayData: Uint8ClampedArray): number {
  const histogram = new Array(256).fill(0);
  const total = grayData.length;

  for (let i = 0; i < total; i++) {
    histogram[grayData[i]]++;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;

    wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);

    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * Preprocess image with Adaptive Resolution Enhancement (1080p / 4K / 8K)
 * Generates 4 OCR-ready versions while keeping the original image completely intact.
 */
export async function generatePreprocessedVersions(
  imageSource: File | Blob | string,
  fileSize: number = 0,
  signal?: AbortSignal
): Promise<PreprocessedVersions> {
  if (signal?.aborted) {
    throw new Error("Image processing was cancelled");
  }

  const img = await loadImage(imageSource);
  const metrics = analyzeImageQuality(img, fileSize);

  const { targetWidth, targetHeight } = metrics;

  // 1. Base Canvas with High-Quality Smoothing (Bicubic / Lanczos emulation)
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = targetWidth;
  baseCanvas.height = targetHeight;
  const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  if (signal?.aborted) throw new Error("Image processing was cancelled");

  const baseImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const totalPixels = targetWidth * targetHeight;
  const rawData = baseImageData.data;

  // Compute Luminance array and dynamic range min/max
  const grayArray = new Uint8ClampedArray(totalPixels);
  let minLum = 255;
  let maxLum = 0;

  for (let i = 0, p = 0; i < rawData.length; i += 4, p++) {
    const lum = Math.round(0.299 * rawData[i] + 0.587 * rawData[i + 1] + 0.114 * rawData[i + 2]);
    grayArray[p] = lum;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  const lumRange = Math.max(1, maxLum - minLum);

  // -------------------------------------------------------------
  // Version 1: Enhanced High-Resolution Color (Normalized)
  // -------------------------------------------------------------
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = targetWidth;
  colorCanvas.height = targetHeight;
  const colorCtx = colorCanvas.getContext("2d", { willReadFrequently: true })!;

  const colorImageData = new ImageData(
    new Uint8ClampedArray(rawData),
    targetWidth,
    targetHeight
  );
  const cData = colorImageData.data;

  // Mild contrast enhancement on color channels
  for (let i = 0; i < cData.length; i += 4) {
    cData[i] = Math.min(255, Math.max(0, Math.round(((cData[i] - minLum) / lumRange) * 255)));
    cData[i + 1] = Math.min(255, Math.max(0, Math.round(((cData[i + 1] - minLum) / lumRange) * 255)));
    cData[i + 2] = Math.min(255, Math.max(0, Math.round(((cData[i + 2] - minLum) / lumRange) * 255)));
  }
  colorCtx.putImageData(colorImageData, 0, 0);

  if (signal?.aborted) throw new Error("Image processing was cancelled");

  // -------------------------------------------------------------
  // Version 2: High-Resolution Grayscale
  // -------------------------------------------------------------
  const grayCanvas = document.createElement("canvas");
  grayCanvas.width = targetWidth;
  grayCanvas.height = targetHeight;
  const grayCtx = grayCanvas.getContext("2d", { willReadFrequently: true })!;

  const grayImageData = grayCtx.createImageData(targetWidth, targetHeight);
  const gData = grayImageData.data;

  for (let i = 0, p = 0; i < gData.length; i += 4, p++) {
    const g = grayArray[p];
    gData[i] = g;
    gData[i + 1] = g;
    gData[i + 2] = g;
    gData[i + 3] = 255;
  }
  grayCtx.putImageData(grayImageData, 0, 0);

  // -------------------------------------------------------------
  // Version 3: High-Contrast & Sharpened
  // -------------------------------------------------------------
  const contrastCanvas = document.createElement("canvas");
  contrastCanvas.width = targetWidth;
  contrastCanvas.height = targetHeight;
  const contrastCtx = contrastCanvas.getContext("2d", { willReadFrequently: true })!;

  const contrastImageData = contrastCtx.createImageData(targetWidth, targetHeight);
  const contData = contrastImageData.data;

  for (let i = 0, p = 0; i < contData.length; i += 4, p++) {
    let stretched = Math.round(((grayArray[p] - minLum) / lumRange) * 255);
    // Sigmoid contrast curve: darken shadows, brighten highlights
    stretched = stretched < 128 ? stretched * 0.8 : Math.min(255, stretched * 1.15);

    contData[i] = stretched;
    contData[i + 1] = stretched;
    contData[i + 2] = stretched;
    contData[i + 3] = 255;
  }
  contrastCtx.putImageData(contrastImageData, 0, 0);

  if (signal?.aborted) throw new Error("Image processing was cancelled");

  // -------------------------------------------------------------
  // Version 4: Adaptive Thresholded (Otsu Binarization)
  // -------------------------------------------------------------
  const threshCanvas = document.createElement("canvas");
  threshCanvas.width = targetWidth;
  threshCanvas.height = targetHeight;
  const threshCtx = threshCanvas.getContext("2d", { willReadFrequently: true })!;

  const otsuThreshold = calculateOtsuThreshold(grayArray);
  const threshImageData = threshCtx.createImageData(targetWidth, targetHeight);
  const tData = threshImageData.data;

  for (let i = 0, p = 0; i < tData.length; i += 4, p++) {
    const val = grayArray[p] > otsuThreshold ? 255 : 0;
    tData[i] = val;
    tData[i + 1] = val;
    tData[i + 2] = val;
    tData[i + 3] = 255;
  }
  threshCtx.putImageData(threshImageData, 0, 0);

  // Convert canvases to Blobs
  const [enhancedColorBlob, grayscaleBlob, highContrastBlob, thresholdedBlob] =
    await Promise.all([
      canvasToBlob(colorCanvas),
      canvasToBlob(grayCanvas),
      canvasToBlob(contrastCanvas),
      canvasToBlob(threshCanvas),
    ]);

  // Clean up canvas objects to release memory immediately
  baseCanvas.width = 0;
  baseCanvas.height = 0;
  colorCanvas.width = 0;
  colorCanvas.height = 0;
  grayCanvas.width = 0;
  grayCanvas.height = 0;
  contrastCanvas.width = 0;
  contrastCanvas.height = 0;
  threshCanvas.width = 0;
  threshCanvas.height = 0;

  return {
    metrics,
    enhancedColor: enhancedColorBlob,
    grayscale: grayscaleBlob,
    highContrast: highContrastBlob,
    thresholded: thresholdedBlob,
  };
}
