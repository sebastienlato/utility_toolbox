import { useCallback, useRef, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import PrimaryButton from "../../../components/PrimaryButton";
import {
  imageFiltersService,
  type FilterResult,
  type FilterSettings,
} from "../../../services/imageFiltersService";

type QueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  filters: FilterSettings;
  result?: FilterResult;
  status: "idle" | "processing" | "ready" | "error";
  error?: string;
};

const defaultSettings: FilterSettings = {
  grayscale: 0,
  sepia: 0,
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

const sliderConfig: Array<{
  key: keyof FilterSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}> = [
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, step: 5, unit: "%" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, step: 5, unit: "%" },
  { key: "blur", label: "Blur", min: 0, max: 10, step: 1, unit: "px" },
  { key: "brightness", label: "Brightness", min: 50, max: 150, step: 5, unit: "%" },
  { key: "contrast", label: "Contrast", min: 50, max: 150, step: 5, unit: "%" },
  { key: "saturation", label: "Saturation", min: 0, max: 200, step: 10, unit: "%" },
];

const ImageFiltersPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const accepted = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (!accepted.length) return;

    const newItems = accepted.map<QueueItem>((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      filters: { ...defaultSettings },
      status: "idle",
    }));

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

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

  const updateFilter = useCallback(
    (id: string, key: keyof FilterSettings, value: number) => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                filters: {
                  ...item.filters,
                  [key]: value,
                },
                status: "idle",
                result: undefined,
              }
            : item
        )
      );
    },
    []
  );

  const applyFilters = useCallback(async (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "processing", error: undefined } : item
      )
    );

    const target = queue.find((item) => item.id === id);
    if (!target) return;

    try {
      const result = await imageFiltersService.applyFilters(
        target.file,
        target.filters
      );
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "ready",
                result,
              }
            : item
        )
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to apply filters. Please try again.";
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "error",
                error: message,
                result: undefined,
              }
            : item
        )
      );
    }
  }, [queue]);

  const resetFilters = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              filters: { ...defaultSettings },
              status: "idle",
              result: undefined,
            }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.result) {
          URL.revokeObjectURL(target.result.url);
        }
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const downloadResult = useCallback((item: QueueItem) => {
    if (!item.result) return;
    const link = document.createElement("a");
    link.href = item.result.url;
    link.download = `${item.file.name.replace(/\.[^.]+$/, "")}-filtered.png`;
    link.click();
  }, []);

  const copyFilters = useCallback((id: string) => {
    const target = queue.find((item) => item.id === id);
    if (!target) return;
    const payload = JSON.stringify(target.filters, null, 2);
    navigator.clipboard.writeText(payload).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }, [queue]);

  return (
    <section className="space-y-10">
      <div className="card border-neutral-900 p-10">
        <PageHeader
          eyebrow="Effects"
          title="Apply filters and export stylized images"
          description="Queue multiple images, tweak visual filters, preview results, and download ready-to-use PNGs."
        />
      </div>

      <div className="card border-neutral-900 p-8">
        <div
          className="rounded-3xl border-2 border-dashed border-neutral-800 bg-neutral-950/40 p-10 text-center transition hover:border-neutral-600 hover:bg-neutral-950"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <div className="space-y-3">
            <p className="text-2xl font-semibold text-zinc-100">
              Drop images to start filtering
            </p>
            <p className="text-sm text-zinc-500">
              Works great with PNG, JPEG, and WebP. Everything stays on your device.
            </p>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">
            {queue.length ? `${queue.length} file(s) queued` : "Waiting for images"}
          </p>
        </div>
      </div>

      {queue.length ? (
        <div className="space-y-8">
          {queue.map((item) => (
            <div
              key={item.id}
              className="card border-neutral-900 p-6"
            >
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
                    <p className="text-base font-semibold text-zinc-100">
                      {item.file.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-neutral-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:border-neutral-600 hover:text-white disabled:opacity-40"
                        onClick={() => resetFilters(item.id)}
                        disabled={item.status === "processing"}
                      >
                        Reset filters
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-neutral-900 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:border-neutral-700 hover:text-white"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4">
                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className="flex-1 space-y-4">
                        {sliderConfig.map((slider) => (
                          <label key={slider.key} className="block text-xs text-zinc-400">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold uppercase tracking-[0.3em] text-zinc-500">
                                {slider.label}
                              </span>
                              <span className="text-zinc-300">
                                {item.filters[slider.key]}
                                {slider.unit}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={slider.min}
                              max={slider.max}
                              step={slider.step}
                              value={item.filters[slider.key]}
                              onChange={(event) =>
                                updateFilter(
                                  item.id,
                                  slider.key,
                                  Number(event.target.value)
                                )
                              }
                              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-emerald-400"
                            />
                          </label>
                        ))}
                      </div>

                      <div className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-900 bg-neutral-950/70 p-3">
                        <img
                          src={item.previewUrl}
                          alt={`${item.file.name} original preview`}
                          className="max-h-64 max-w-full rounded-xl object-contain"
                          style={{
                            filter: [
                              `grayscale(${item.filters.grayscale}%)`,
                              `sepia(${item.filters.sepia}%)`,
                              `blur(${item.filters.blur}px)`,
                              `brightness(${item.filters.brightness}%)`,
                              `contrast(${item.filters.contrast}%)`,
                              `saturate(${item.filters.saturation}%)`,
                            ].join(" "),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {item.error ? (
                    <p className="text-sm text-red-400">{item.error}</p>
                  ) : null}
                </div>

                <div className="space-y-4 rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4 text-sm text-zinc-400">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Output
                  </p>
                  <div className="rounded-xl border border-dashed border-neutral-900 p-4 text-center">
                    {item.status === "processing" ? (
                      <p>Processing…</p>
                    ) : item.result ? (
                      <img
                        src={item.result.url}
                        alt={`${item.file.name} filtered preview`}
                        className="max-h-64 w-full rounded-lg object-contain"
                      />
                    ) : (
                      <p className="text-zinc-500">Apply filters to view the result.</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <PrimaryButton
                      onClick={() => applyFilters(item.id)}
                      className="flex-1 justify-center"
                      disabled={item.status === "processing"}
                    >
                      {item.status === "processing" ? "Applying…" : "Apply filters"}
                    </PrimaryButton>
                    <button
                      type="button"
                      className="rounded-full border border-neutral-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:border-neutral-600 hover:text-white disabled:opacity-40"
                      onClick={() => downloadResult(item)}
                      disabled={!item.result}
                    >
                      Download
                    </button>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-neutral-900 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:border-neutral-700 hover:text-white disabled:opacity-40"
                    onClick={() => copyFilters(item.id)}
                    disabled={item.status === "processing"}
                  >
                    {copiedId === item.id ? "Copied settings" : "Copy settings"}
                  </button>
                  <p className="text-xs text-zinc-500">
                    Filter sets copy as JSON for easy reuse across images.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-neutral-900 p-12 text-center text-sm text-zinc-500">
          Drop an image to start transforming it with filters.
        </div>
      )}
    </section>
  );
};

export default ImageFiltersPage;
