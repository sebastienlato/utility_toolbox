import { useCallback, useRef, useState } from "react";
import BackToTools from "../../../components/BackToTools";
import PageHeader from "../../../components/PageHeader";
import PrimaryButton from "../../../components/PrimaryButton";
import {
  colorPaletteService,
  type PaletteColor,
} from "../../../services/colorPaletteService";

type Status = "idle" | "loading" | "ready" | "error";

const ColorPaletteExtractorPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<PaletteColor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1200);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    setStatus("loading");
    setError(null);
    setColors([]);
    setPreviewUrl(null);
    try {
      const result = await colorPaletteService.extractPalette(file, 8);
      setColors(result.colors);
      setPreviewUrl(result.previewUrl);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the image. Try another file.");
      setStatus("error");
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      void processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <section className="space-y-10">
      <div className="card border-neutral-900 p-10">
        <BackToTools />
        <PageHeader
          eyebrow="Color"
          title="Extract palettes from any image"
          description="Upload a photo or screenshot to capture its dominant colors. Copy HEX or RGB codes for quick reuse."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div
            className="card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-neutral-800 bg-neutral-950/40 p-10 text-center transition hover:border-neutral-600 hover:bg-neutral-950"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-zinc-100">
                Drop an image to extract its palette
              </p>
              <p className="text-sm text-zinc-500">
                Ideal for product shots, web inspiration, and brand lockups.
              </p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">
              {status === "loading"
                ? "Analyzing…"
                : previewUrl
                ? "Palette ready"
                : "Waiting for image"}
            </p>
          </div>

          <div className="card border-neutral-900 bg-neutral-950/60 p-8">
            <h2 className="text-lg font-semibold text-zinc-100">Preview</h2>
            {previewUrl ? (
              <div className="mt-4 rounded-3xl border border-neutral-900 bg-neutral-950 p-4">
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="max-h-[360px] w-full rounded-2xl object-contain"
                />
              </div>
            ) : (
              <div className="mt-4 grid min-h-[260px] place-items-center rounded-3xl border border-dashed border-neutral-900 text-sm text-zinc-500">
                No image yet — drop a file to get a live preview.
              </div>
            )}
          </div>
        </div>

        <div className="card border-neutral-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Palette</h2>
              <p className="text-sm text-zinc-500">
                Extracted dominant colors, with copy-ready hex codes.
              </p>
            </div>
            <PrimaryButton
              onClick={() => inputRef.current?.click()}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload image
            </PrimaryButton>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          ) : null}

          {status === "loading" ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl border border-neutral-900 bg-neutral-950/80"
                />
              ))}
            </div>
          ) : null}

          {status === "ready" && colors.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {colors.map((color) => (
                <div
                  key={color.hex}
                  className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4"
                >
                  <div
                    className="h-24 w-full rounded-2xl border border-neutral-900"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="mt-4 space-y-1 text-sm text-zinc-400">
                    <p className="font-semibold text-zinc-100">{color.hex}</p>
                    <p>
                      rgb({color.r}, {color.g}, {color.b})
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full border border-neutral-800 px-4 py-2 text-sm text-zinc-100 transition hover:border-neutral-600 hover:text-white"
                    onClick={() => void handleCopy(color.hex)}
                  >
                    {copiedHex === color.hex ? "Copied!" : "Copy HEX"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {status === "idle" && !colors.length ? (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-900 p-8 text-center text-sm text-zinc-500">
              Drop an image to extract a palette. Ideal size: under 5MB.
            </div>
          ) : null}

          {status === "error" ? (
            <div className="mt-8 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-6 text-sm text-zinc-300">
              <p>Something went wrong.</p>
              <button
                type="button"
                className="mt-3 rounded-full border border-neutral-700 px-4 py-2 text-sm text-zinc-100 hover:border-neutral-500"
                onClick={() => {
                  setStatus("idle");
                  setColors([]);
                  setPreviewUrl(null);
                  setError(null);
                }}
              >
                Reset and try again
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default ColorPaletteExtractorPage;
