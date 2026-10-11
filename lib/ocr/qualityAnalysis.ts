import { ImageQualityMetrics, ResolutionTier } from "@/types";

/**
 * Detects if the client is a mobile device to prevent high memory exhaustion
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = navigator.userAgent || "";
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || isSmallScreen;
}

/**
 * Computes greatest common divisor for aspect ratio formatting
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function formatAspectRatio(width: number, height: number): string {
  const divisor = gcd(Math.round(width), Math.round(height));
  const w = Math.round(width / divisor);
  const h = Math.round(height / divisor);

  // Common aspect ratios
  if ((w === 16 && h === 9) || (w === 4 && h === 3) || (w === 1 && h === 1) || (w === 3 && h === 2)) {
    return `${w}:${h}`;
  }
  const ratio = (width / height).toFixed(2);
  return `${ratio}:1`;
}

/**
 * Fast visual metrics calculation (brightness, contrast, sharpness)
 * using an internal downscaled analysis canvas to keep processing instant.
 */
function analyzeVisualMetrics(img: HTMLImageElement): {
  brightnessScore: number;
  contrastScore: number;
  sharpnessScore: number;
} {
  try {
    const analysisSize = 256;
    const canvas = document.createElement("canvas");
    canvas.width = analysisSize;
    canvas.height = analysisSize;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { brightnessScore: 50, contrastScore: 50, sharpnessScore: 50 };

    ctx.drawImage(img, 0, 0, analysisSize, analysisSize);
    const imgData = ctx.getImageData(0, 0, analysisSize, analysisSize);
    const data = imgData.data;
    const totalPixels = analysisSize * analysisSize;

    let sumLum = 0;
    const lums = new Float32Array(totalPixels);

    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      lums[p] = lum;
      sumLum += lum;
    }

    const meanLum = sumLum / totalPixels;

    // Contrast: standard deviation of luminance
    let varianceLum = 0;
    for (let p = 0; p < totalPixels; p++) {
      const diff = lums[p] - meanLum;
      varianceLum += diff * diff;
    }
    const stdDevLum = Math.sqrt(varianceLum / totalPixels);

    // Sharpness: Laplacian variance approximation (3x3 kernel)
    let laplacianVar = 0;
    const w = analysisSize;
    for (let y = 1; y < analysisSize - 1; y++) {
      for (let x = 1; x < analysisSize - 1; x++) {
        const idx = y * w + x;
        const lap =
          -4 * lums[idx] +
          lums[idx - 1] +
          lums[idx + 1] +
          lums[idx - w] +
          lums[idx + w];
        laplacianVar += Math.abs(lap);
      }
    }
    const meanLaplacian = laplacianVar / ((analysisSize - 2) * (analysisSize - 2));

    // Normalize to 0-100 scores
    const brightnessScore = Math.min(100, Math.max(0, Math.round((meanLum / 255) * 100)));
    const contrastScore = Math.min(100, Math.max(0, Math.round((stdDevLum / 128) * 100)));
    const sharpnessScore = Math.min(100, Math.max(0, Math.round((meanLaplacian / 50) * 100)));

    return { brightnessScore, contrastScore, sharpnessScore };
  } catch {
    return { brightnessScore: 50, contrastScore: 50, sharpnessScore: 50 };
  }
}

/**
 * Analyzes image dimensions, quality, and calculates optimal adaptive target resolution
 * according to 1080p / 4K / 8K tiers and device capabilities.
 */
export function analyzeImageQuality(
  img: HTMLImageElement,
  fileSize: number
): ImageQualityMetrics {
  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;
  const longestSide = Math.max(origWidth, origHeight);
  const isMobile = isMobileDevice();
  const deviceTier: "mobile" | "desktop" = isMobile ? "mobile" : "desktop";

  // Maximum allowed limits
  // Mobile clamped to 4K (3840px), Desktop up to 8K (7680px)
  const maxAllowedResolution = isMobile ? 3840 : 7680;

  let targetLongestSide = longestSide;
  let resolutionTier: ResolutionTier = "Original";
  let isUpscaled = false;
  let statusMessage = "✓ High-resolution image preserved for OCR";

  // Adaptive Resolution Decision Rules
  if (longestSide < 1280) {
    // Low quality / small image: Target 1080p tier (longest side ~1920)
    targetLongestSide = 1920;
    resolutionTier = "1080p";
    isUpscaled = true;
    statusMessage = "✓ Image enlarged and enhanced for better text reading";
  } else if (longestSide < 3000) {
    // Medium quality image: Target up to 4K (longest side ~3840)
    targetLongestSide = Math.min(3840, Math.round(longestSide * 1.5));
    if (targetLongestSide > 3000) {
      targetLongestSide = 3840;
    }
    resolutionTier = "4K";
    isUpscaled = targetLongestSide > longestSide;
    statusMessage = isUpscaled
      ? "✓ Enhanced to 4K tier for improved text recognition"
      : "✓ Balanced resolution ready for text extraction";
  } else if (longestSide <= 6000) {
    // High-resolution image
    if (!isMobile) {
      // Desktop: Keep near original or optimize below 8K
      targetLongestSide = Math.min(longestSide, 7680);
      resolutionTier = longestSide >= 3840 ? "8K" : "4K";
      statusMessage = "✓ High-resolution document preserved for OCR";
    } else {
      // Mobile: clamp to 4K limit to avoid memory crashes
      targetLongestSide = Math.min(longestSide, 3840);
      resolutionTier = "4K";
      statusMessage = "✓ High-resolution image optimized for mobile OCR";
    }
  } else {
    // Extremely large image (>= 6000px): clamp to 8K limit on desktop, 4K on mobile
    targetLongestSide = maxAllowedResolution;
    resolutionTier = isMobile ? "4K" : "8K";
    statusMessage = isMobile
      ? "✓ Sized to 4K mobile safety limit for optimal memory usage"
      : "✓ Clamped to 8K maximum limit for optimal OCR speed";
  }

  // Ensure target never exceeds maxAllowedResolution
  targetLongestSide = Math.min(targetLongestSide, maxAllowedResolution);

  // Preserve exact aspect ratio
  const scale = targetLongestSide / longestSide;
  const targetWidth = Math.round(origWidth * scale);
  const targetHeight = Math.round(origHeight * scale);

  // Compute visual quality scores
  const { brightnessScore, contrastScore, sharpnessScore } = analyzeVisualMetrics(img);

  return {
    originalWidth: origWidth,
    originalHeight: origHeight,
    targetWidth,
    targetHeight,
    aspectRatio: formatAspectRatio(origWidth, origHeight),
    fileSizeBytes: fileSize,
    resolutionTier,
    brightnessScore,
    contrastScore,
    sharpnessScore,
    isUpscaled,
    statusMessage,
    deviceTier,
  };
}
