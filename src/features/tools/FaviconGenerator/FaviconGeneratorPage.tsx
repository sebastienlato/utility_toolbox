import { useCallback, useRef, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import PrimaryButton from "../../../components/PrimaryButton";
import {
  faviconGeneratorService,
  type FaviconOptions,
  type FaviconResult,
} from "../../../services/faviconGeneratorService";

const defaultSizes = [16, 32, 48, 64, 128, 256];

const FaviconGeneratorPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [options, setOptions] = useState<FaviconOptions>({
    sizes: defaultSizes,
    backgroundColor: "#00000000",
    padding: 4,
  });
  const [status, setStatus] = useState<"idle" | "processing" | "ready" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [favicons, setFavicons] = useState<FaviconResult[]>([]);
  const [copiedSize, setCopiedSize] = useState<number | null>(null);

  const revokeFavicons = useCallback(() => {
    setFavicons((prev) => {
      prev.forEach((icon) => URL.revokeObjectURL(icon.url));
      return [];
    });
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG, JPG, SVG).");
        return;
      }
      revokeFavicons();
      setFileName(file.name.replace(/\.[^.]+$/, ""));
      setStatus("processing");
      setError(null);
      faviconGeneratorService
        .generateFavicons(file, options)
        .then((results) => {
          setFavicons(results);
          setStatus("ready");
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to generate favicons. Try a different image.");
          setStatus("error");
        });
    },
    [options, revokeFavicons]
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

  const downloadIcon = useCallback(
    (icon: FaviconResult) => {
      const link = document.createElement("a");
      link.href = icon.url;
      link.download = `${fileName ?? "favicon"}-${icon.size}x${icon.size}.png`;
      link.click();
    },
    [fileName]
  );

  const copySizeLabel = useCallback((size: number) => {
    setCopiedSize(size);
    setTimeout(() => setCopiedSize(null), 1200);
  }, []);

  const handleBackgroundChange = useCallback(
    (value: string) => {
      setOptions((prev) => ({ ...prev, backgroundColor: value }));
    },
    []
  );

  const handlePaddingChange = useCallback((value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    setOptions((prev) => ({
      ...prev,
      padding: Math.max(0, Math.min(64, parsed)),
    }));
  }, []);

  const toggleSize = useCallback((size: number) => {
    setOptions((prev) => {
      const exists = prev.sizes.includes(size);
      const sizes = exists
        ? prev.sizes.filter((value) => value !== size)
        : [...prev.sizes, size].sort((a, b) => a - b);
      return { ...prev, sizes };
    });
  }, []);

  return (
    <section className="space-y-10">
      <div className="card border-neutral-900 p-10">
        <PageHeader
          eyebrow="Branding"
          title="Generate crisp favicons in multiple sizes"
          description="Upload a base image, tweak padding or background, and export ready-to-ship PNGs for every platform."
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
                Drop an image to begin
              </p>
              <p className="text-sm text-zinc-500">
                Transparent PNGs work best. SVGs are rasterized in-browser.
              </p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">
              {status === "processing"
                ? "Generating…"
                : fileName
                ? "Ready to download"
                : "Waiting for upload"}
            </p>
          </div>

          <div className="card border-neutral-900 p-8">
            <h2 className="text-lg font-semibold text-zinc-100">
              Favicon options
            </h2>
            <div className="mt-6 space-y-6 text-sm text-zinc-400">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Background color
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={options.backgroundColor}
                    onChange={(event) => handleBackgroundChange(event.target.value)}
                    className="h-10 w-16 rounded-full border border-neutral-800 bg-neutral-950 p-1"
                  />
                  <input
                    type="text"
                    value={options.backgroundColor}
                    onChange={(event) => handleBackgroundChange(event.target.value)}
                    className="input max-w-[180px]"
                  />
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Padding (px)
                </span>
                <input
                  type="number"
                  min={0}
                  max={64}
                  value={options.padding}
                  onChange={(event) => handlePaddingChange(event.target.value)}
                  className="input max-w-[200px]"
                />
              </label>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Sizes
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {defaultSizes.map((size) => {
                    const active = options.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`rounded-full border px-4 py-2 text-xs font-medium tracking-[0.2em] transition ${
                          active
                            ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-200"
                            : "border-neutral-800 text-zinc-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        {size}×{size}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  Toggle sizes to include in the export set.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-neutral-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Preview & downloads
              </h2>
              <p className="text-sm text-zinc-500">
                Generated PNGs per size. Download individually now.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                disabled={!favicons.length || status === "processing"}
                onClick={() => {
                  // TODO: Bundle all icons into a zip archive.
                }}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download all (TODO)
              </PrimaryButton>
              <button
                type="button"
                className="rounded-full border border-neutral-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!favicons.length}
                onClick={() => {
                  revokeFavicons();
                  setFileName(null);
                  setStatus("idle");
                }}
              >
                Clear set
              </button>
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          ) : null}

          {status === "processing" ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl border border-neutral-900 bg-neutral-950/80"
                />
              ))}
            </div>
          ) : null}

          {favicons.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {favicons.map((icon) => (
                <div
                  key={icon.size}
                  className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4 text-sm text-zinc-400"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-100">
                      {icon.size}×{icon.size}
                    </span>
                    <button
                      type="button"
                      className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500 transition hover:text-zinc-200"
                      onClick={() => copySizeLabel(icon.size)}
                    >
                      {copiedSize === icon.size ? "Copied" : "Copy label"}
                    </button>
                  </div>
                  <div className="mt-4 grid place-items-center">
                    <img
                      src={icon.url}
                      alt={`${icon.size} favicon preview`}
                      className="rounded-xl border border-neutral-900 bg-neutral-900 p-3"
                      width={72}
                      height={72}
                    />
                  </div>
                  <PrimaryButton
                    className="mt-4 w-full justify-center"
                    onClick={() => downloadIcon(icon)}
                  >
                    Download PNG
                  </PrimaryButton>
                </div>
              ))}
            </div>
          ) : null}

          {!favicons.length && status !== "processing" ? (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-900 p-8 text-center text-sm text-zinc-500">
              Upload an image and generate favicons to see previews here.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FaviconGeneratorPage;
