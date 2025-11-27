export type FaviconOptions = {
  sizes: number[];
  backgroundColor: string;
  padding: number;
};

export type FaviconResult = {
  size: number;
  url: string;
  blob: Blob;
};

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = (event) => {
      URL.revokeObjectURL(url);
      reject(event);
    };
    image.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to export favicon."));
        return;
      }
      resolve(blob);
    });
  });

const drawWithPadding = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  size: number,
  padding: number,
  backgroundColor: string
) => {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  const paddedSize = size - padding * 2;
  const ratio = Math.min(paddedSize / image.width, paddedSize / image.height);
  const renderWidth = image.width * ratio;
  const renderHeight = image.height * ratio;
  const offsetX = (size - renderWidth) / 2;
  const offsetY = (size - renderHeight) / 2;

  ctx.clearRect(padding, padding, paddedSize, paddedSize);
  ctx.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);
};

export const faviconGeneratorService = {
  async generateFavicons(
    file: File,
    options: FaviconOptions
  ): Promise<FaviconResult[]> {
    const image = await loadImage(file);
    const results: FaviconResult[] = [];

    for (const size of options.sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas not supported in this browser.");
      }

      drawWithPadding(
        ctx,
        image,
        size,
        Math.min(options.padding, size / 2),
        options.backgroundColor
      );

      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      results.push({ size, url, blob });
    }

    return results;
  },
};

/**
 * TODO: Offer ICO/ICNS packaging and ZIP bundling for multi-size downloads,
 * potentially using a lightweight zip helper or Web Worker for heavier work.
 */
