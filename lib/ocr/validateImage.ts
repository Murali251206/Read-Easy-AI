export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  width: number;
  height: number;
  isLowRes: boolean;
  format: string;
}

const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MIN_DIMENSION_PX = 150;
const RECOMMENDED_MIN_DIMENSION_PX = 600;

/**
 * Validates image format, resolution, and dimensions before OCR
 */
export async function validateImage(file: File): Promise<ImageValidationResult> {
  // 1. Check supported MIME type
  const format = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const isSupportedExtension =
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".webp");

  if (!SUPPORTED_FORMATS.includes(format) && !isSupportedExtension) {
    return {
      isValid: false,
      error: "Unsupported image format. Please upload a JPG, JPEG, PNG, or WEBP image.",
      width: 0,
      height: 0,
      isLowRes: false,
      format,
    };
  }

  // 2. Read natural dimensions using HTML Image object
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (!width || !height || width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
        resolve({
          isValid: false,
          error: `Image resolution is too small (${width}x${height}px) to read text reliably. Minimum resolution is ${MIN_DIMENSION_PX}x${MIN_DIMENSION_PX}px.`,
          width,
          height,
          isLowRes: true,
          format,
        });
        return;
      }

      const isLowRes = width < RECOMMENDED_MIN_DIMENSION_PX || height < RECOMMENDED_MIN_DIMENSION_PX;

      resolve({
        isValid: true,
        width,
        height,
        isLowRes,
        format,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: "The image file appears to be corrupted or cannot be decoded. Please try another image.",
        width: 0,
        height: 0,
        isLowRes: false,
        format,
      });
    };

    img.src = objectUrl;
  });
}
