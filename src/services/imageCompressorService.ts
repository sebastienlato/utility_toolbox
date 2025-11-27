export type CompressionFormat = "image/jpeg" | "image/webp";

export type CompressionOptions = {
  quality: number; // 0.1 - 1.0
  maxWidth: number | null;
  maxHeight: number | null;
  format: CompressionFormat;
};

export type CompressionResult = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
};

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = (event) => {
      URL.revokeObjectURL(objectUrl);
      reject(event);
    };
    image.src = objectUrl;
  });

const getTargetDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number | null,
  maxHeight: number | null
) => {
  let width = originalWidth;
  let height = originalHeight;

  if (maxWidth && width > maxWidth) {
    const ratio = maxWidth / width;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  if (maxHeight && height > maxHeight) {
    const ratio = maxHeight / height;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: CompressionFormat,
  quality: number
) =>
  new Promise<Blob>((resolve, reject) => {
    const safeQuality = Math.min(1, Math.max(0.1, quality));
    if (canvas.toBlob) {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to produce compressed blob."));
            return;
          }
          resolve(blob);
        },
        format,
        safeQuality
      );
      return;
    }

    try {
      const dataUrl = canvas.toDataURL(format, safeQuality);
      fetch(dataUrl)
        .then((response) => response.blob())
        .then(resolve)
        .catch((error) =>
          reject(
            error instanceof Error
              ? error
              : new Error("Unable to create blob from canvas.")
          )
        );
    } catch (error) {
      reject(
        error instanceof Error
          ? error
          : new Error("Canvas conversion failed.")
      );
    }
  });

export const imageCompressorService = {
  async compress(
    file: File,
    options: CompressionOptions
  ): Promise<CompressionResult> {
    const image = await loadImage(file);
    const originalSize = file.size;
    const { width, height } = getTargetDimensions(
      image.width,
      image.height,
      options.maxWidth,
      options.maxHeight
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not supported in this browser.");
    }

    ctx.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, options.format, options.quality);
    const compressedSize = blob.size;
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      width,
      height,
      originalSize,
      compressedSize,
    };
  },
};

/**
 * TODO: Future enhancements could leverage Web Workers or WASM codecs
 * for parallel compression, plus chunked zip downloads for large batches.
 */
