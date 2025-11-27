export type PaletteColor = {
  hex: string;
  r: number;
  g: number;
  b: number;
};

const toHex = (value: number) =>
  value.toString(16).padStart(2, "0").toUpperCase();

const rgbToHex = (r: number, g: number, b: number) =>
  `#${toHex(r)}${toHex(g)}${toHex(b)}`;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
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

const analyzePalette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colorCount: number
): PaletteColor[] => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  const samples: Array<{ r: number; g: number; b: number }> = [];
  const SAMPLE_RATE = 10; // skip pixels for perf

  for (let i = 0; i < data.length; i += 4 * SAMPLE_RATE) {
    const alpha = data[i + 3];
    if (alpha < 50) continue;
    samples.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    });
  }

  if (!samples.length) {
    return [{ hex: "#000000", r: 0, g: 0, b: 0 }];
  }

  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  const bucketSize = 24; // reduce color space for approximate grouping

  for (const sample of samples) {
    const rBucket = Math.round(sample.r / bucketSize) * bucketSize;
    const gBucket = Math.round(sample.g / bucketSize) * bucketSize;
    const bBucket = Math.round(sample.b / bucketSize) * bucketSize;
    const key = `${rBucket}-${gBucket}-${bBucket}`;
    const existing = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
    existing.r += sample.r;
    existing.g += sample.g;
    existing.b += sample.b;
    existing.count += 1;
    buckets.set(key, existing);
  }

  const sorted = Array.from(buckets.values()).sort(
    (a, b) => b.count - a.count
  );

  return sorted.slice(0, colorCount).map((bucket) => {
    const r = Math.round(bucket.r / bucket.count);
    const g = Math.round(bucket.g / bucket.count);
    const b = Math.round(bucket.b / bucket.count);
    return {
      hex: rgbToHex(r, g, b),
      r,
      g,
      b,
    };
  });
};

export const colorPaletteService = {
  async extractPalette(
    file: File,
    paletteSize = 6
  ): Promise<{ colors: PaletteColor[]; previewUrl: string }> {
    const image = await loadImage(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas not supported in this browser.");
    }

    const maxDimension = 400;
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.width, image.height)
    );
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, 0, 0, width, height);

    const colors = analyzePalette(ctx, width, height, paletteSize);
    const previewUrl = canvas.toDataURL("image/png");

    return {
      colors,
      previewUrl,
    };
  },
};

/**
 * TODO: Consider replacing this simple bucketing approach with a more robust
 * median-cut or k-means implementation, possibly offloaded to a Web Worker
 * for large images.
 */
