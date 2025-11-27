export type FilterSettings = {
  grayscale: number;
  sepia: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
};

export type FilterResult = {
  url: string;
  blob: Blob;
  width: number;
  height: number;
};

const defaultSettings: FilterSettings = {
  grayscale: 0,
  sepia: 0,
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

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

const buildFilterString = (settings: FilterSettings) =>
  [
    `grayscale(${settings.grayscale}%)`,
    `sepia(${settings.sepia}%)`,
    `blur(${settings.blur}px)`,
    `brightness(${settings.brightness}%)`,
    `contrast(${settings.contrast}%)`,
    `saturate(${settings.saturation}%)`,
  ].join(" ");

export const imageFiltersService = {
  async applyFilters(
    file: File,
    overrides: Partial<FilterSettings> = {}
  ): Promise<FilterResult> {
    const settings: FilterSettings = { ...defaultSettings, ...overrides };
    const image = await loadImage(file);

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas not supported in this browser.");
    }

    ctx.filter = buildFilterString(settings);
    ctx.drawImage(image, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) {
          reject(new Error("Failed to export filtered image."));
          return;
        }
        resolve(result);
      }, "image/png");
    });

    const url = URL.createObjectURL(blob);

    return {
      url,
      blob,
      width: image.width,
      height: image.height,
    };
  },
};

/**
 * TODO: Explore worker-based filter pipelines and advanced effects (e.g. LUTs,
 * custom shaders, batch processing) without blocking the main thread.
 */
