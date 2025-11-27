export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";

export type FormatConvertOptions = {
  targetFormat: ImageFormat;
  quality?: number; // 0 - 1 range for lossy formats
};

export type FormatConvertResult = {
  blob: Blob;
  url: string;
  mimeType: ImageFormat;
  extension: string;
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

const toBlob = async (
  canvas: HTMLCanvasElement,
  mimeType: ImageFormat,
  quality?: number
): Promise<Blob> => {
  const effectiveQuality =
    mimeType === "image/jpeg" || mimeType === "image/webp"
      ? typeof quality === "number"
        ? Math.min(1, Math.max(0, quality))
        : 0.9
      : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to produce converted blob."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      effectiveQuality
    );
  });
};

const getExtension = (mimeType: ImageFormat) => {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
};

export const imageFormatService = {
  async convert(
    file: File,
    options: FormatConvertOptions
  ): Promise<FormatConvertResult> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Unsupported file type.");
    }

    // TODO: Support vector formats like SVG by parsing XML and rasterizing safely.
    if (file.type === "image/svg+xml") {
      throw new Error("SVG conversion is not supported yet.");
    }

    const image = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas not supported in this browser.");
    }

    ctx.drawImage(image, 0, 0, image.width, image.height);

    const blob = await toBlob(canvas, options.targetFormat, options.quality);
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      mimeType: options.targetFormat,
      extension: getExtension(options.targetFormat),
    };
  },
};

/**
 * TODO: Explore moving conversion to a Web Worker or leveraging WASM codecs
 * for formats like AVIF or HEIC when the browser adds native support.
 */
