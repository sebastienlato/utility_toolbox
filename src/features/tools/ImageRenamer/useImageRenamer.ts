import { useCallback, useEffect, useMemo, useState } from "react";

type PatternState = {
  baseName: string;
  startIndex: number;
  delimiter: string;
};

export type OutputFormat = "original" | "image/png" | "image/jpeg";

type InternalFile = {
  id: string;
  file: File;
  originalName: string;
  previewUrl: string;
};

export type RenamedFile = InternalFile & {
  newName: string;
  targetFormat: OutputFormat;
};

const defaultPattern: PatternState = {
  baseName: "asset",
  startIndex: 1,
  delimiter: "-",
};

const defaultFormat: OutputFormat = "original";

const sanitizeBaseName = (value: string) => value.trim().replace(/\s+/g, "-");

const getExtension = (name: string) => {
  const match = name.match(/(\.[a-zA-Z0-9]+)$/);
  return match ? match[1] : "";
};

const generateId = () => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const useImageRenamer = () => {
  const [pattern, setPattern] = useState<PatternState>(defaultPattern);
  const [files, setFiles] = useState<InternalFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(defaultFormat);

  const addFiles = useCallback((list: FileList | File[] | null | undefined) => {
    if (!list) return;
    const array = Array.isArray(list) ? list : Array.from(list);
    const accepted = array.filter((file) => file.type.startsWith("image/"));
    if (!accepted.length) return;

    setFiles((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        id: generateId(),
        file,
        originalName: file.name,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }, []);

  const renamedFiles = useMemo<RenamedFile[]>(() => {
    const base = sanitizeBaseName(pattern.baseName) || "asset";
    const delimiter = pattern.delimiter ?? "";
    return files.map((entry, index) => {
      const numericIndex = pattern.startIndex + index;
      const ext =
        outputFormat === "original"
          ? getExtension(entry.originalName) || inferExtension(entry.file.type)
          : outputFormat === "image/png"
          ? ".png"
          : ".jpg";
      const newName = `${base}${
        delimiter ? delimiter : ""
      }${numericIndex}${ext}`;

      return {
        ...entry,
        newName,
        targetFormat: outputFormat,
      };
    });
  }, [
    files,
    outputFormat,
    pattern.baseName,
    pattern.delimiter,
    pattern.startIndex,
  ]);

  const updatePattern = useCallback(
    (key: keyof PatternState, value: string | number) => {
      setPattern((prev) => ({
        ...prev,
        [key]:
          key === "startIndex"
            ? Math.max(0, Number(value) || 0)
            : String(value),
      }));
    },
    []
  );

  const downloadFile = useCallback(async (entry: RenamedFile) => {
    let url = entry.previewUrl;
    let revokeAfter = false;

    if (entry.targetFormat !== "original") {
      const blob = await convertFormat(entry.file, entry.targetFormat);
      url = URL.createObjectURL(blob);
      revokeAfter = true;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = entry.newName;
    link.click();

    if (revokeAfter) {
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
  }, []);

  const downloadAll = useCallback(async () => {
    for (const entry of renamedFiles) {
      await downloadFile(entry);
    }
  }, [renamedFiles, downloadFile]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const entry = prev.find((item) => item.id === id);
      if (entry) {
        URL.revokeObjectURL(entry.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  useEffect(
    () => () => {
      files.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [files]
  );

  return {
    pattern,
    renamedFiles,
    addFiles,
    updatePattern,
    downloadFile,
    downloadAll,
    outputFormat,
    setOutputFormat,
    clearFiles,
    removeFile,
  };
};

const inferExtension = (type: string) => {
  if (type === "image/png") return ".png";
  if (type === "image/jpeg") return ".jpg";
  return ".png";
};

const convertFormat = async (
  file: File,
  format: Exclude<OutputFormat, "original">
) => {
  const dataUrl = URL.createObjectURL(file);
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(image, 0, 0);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Failed to convert image"));
          return;
        }
        resolve(result);
      },
      format,
      format === "image/jpeg" ? 0.92 : undefined
    );
  });

  URL.revokeObjectURL(dataUrl);
  return blob;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });

export default useImageRenamer;
