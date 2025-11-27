import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PageHeader from "../../../components/PageHeader";
import PrimaryButton from "../../../components/PrimaryButton";
import {
  imageCompressorService,
  type CompressionOptions,
  type CompressionResult,
} from "../../../services/imageCompressorService";

type QueueStatus = "idle" | "compressing" | "done" | "error";

type QueueItem = {
  id: string;
  file: File;
  status: QueueStatus;
  compressed?: CompressionResult;
  error?: string;
};

const formatOptions: Array<{ label: string; value: CompressionOptions["format"] }> =
  [
    { label: "JPEG", value: "image/jpeg" },
    { label: "WEBP", value: "image/webp" },
  ];

const defaultOptions: CompressionOptions = {
  quality: 0.7,
  maxWidth: 1920,
  maxHeight: 1080,
  format: "image/jpeg",
};

const pillButtonBase =
  "rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20";
const secondaryButtonClasses = `${pillButtonBase} border-neutral-800 text-zinc-300 hover:border-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40`;
const tertiaryButtonClasses = `${pillButtonBase} border-neutral-900 bg-neutral-950/40 text-zinc-200 hover:border-neutral-700 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40`;
const ghostButtonClasses =
  "rounded-full px-4 py-2 text-sm font-medium text-zinc-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40";

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
};

const ImageCompressorPage = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [options, setOptions] = useState<CompressionOptions>(defaultOptions);
  const [isCompressingAll, setIsCompressingAll] = useState(false);
  const hasQueue = queue.length > 0;

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => {
        if (item.compressed) {
          URL.revokeObjectURL(item.compressed.url);
        }
      });
    };
  }, []);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list?.length) return;
    const accepted = Array.from(list).filter((file) =>
      file.type.startsWith("image/")
    );
    if (!accepted.length) return;
    setQueue((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "idle" as QueueStatus,
      })),
    ]);
  }, []);

  const updateOption = useCallback(
    (key: keyof CompressionOptions, value: string) => {
      setOptions((prev) => {
        if (key === "quality") {
          const parsed = Number(value);
          return {
            ...prev,
            quality: Math.min(1, Math.max(0.1, parsed / 100)),
          };
        }

        if (key === "format") {
          return { ...prev, format: value as CompressionOptions["format"] };
        }

        const numeric = value === "" ? null : Number(value);
        return { ...prev, [key]: numeric };
      });
    },
    []
  );

  const revokeCompressedUrl = useCallback((item: QueueItem) => {
    if (item.compressed) {
      URL.revokeObjectURL(item.compressed.url);
    }
  }, []);

  const removeItem = useCallback(
    (id: string) => {
      setQueue((prev) => {
        const target = prev.find((item) => item.id === id);
        if (target) {
          revokeCompressedUrl(target);
        }
        return prev.filter((item) => item.id !== id);
      });
    },
    [revokeCompressedUrl]
  );

  const clearQueue = useCallback(() => {
    setQueue((prev) => {
      prev.forEach((item) => revokeCompressedUrl(item));
      return [];
    });
  }, [revokeCompressedUrl]);

  const processItem = useCallback(
    async (id: string) => {
      const target = queueRef.current.find((item) => item.id === id);
      if (!target) return;
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "compressing", error: undefined }
            : item
        )
      );

      try {
        const result = await imageCompressorService.compress(
          target.file,
          options
        );
        setQueue((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item;
            if (item.compressed) {
              URL.revokeObjectURL(item.compressed.url);
            }
            return {
              ...item,
              status: "done" as QueueStatus,
              compressed: result,
              error: undefined,
            };
          })
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Compression failed unexpectedly.";
        setQueue((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "error", error: message }
              : item
          )
        );
      }
    },
    [options]
  );

  const handleCompressAll = useCallback(async () => {
    if (!queueRef.current.length) return;
    setIsCompressingAll(true);
    try {
      const ids = queueRef.current.map((item) => item.id);
      for (const id of ids) {
        await processItem(id);
      }
    } finally {
      setIsCompressingAll(false);
    }
  }, [processItem]);

  const downloadItem = useCallback((item: QueueItem) => {
    if (!item.compressed) return;
    const extension =
      item.compressed.blob.type === "image/webp" ? "webp" : "jpg";
    const link = document.createElement("a");
    link.href = item.compressed.url;
    link.download = `${item.file.name.replace(/\.[^.]+$/, "")}-compressed.${extension}`;
    link.click();
  }, []);

  const queueStats = useMemo(() => {
    const totals = queue.reduce(
      (acc, item) => {
        acc.original += item.file.size;
        if (item.compressed) {
          acc.compressed += item.compressed.compressedSize;
        }
        return acc;
      },
      { original: 0, compressed: 0 }
    );
    const savings =
      totals.compressed > 0
        ? Math.max(
            0,
            ((totals.original - totals.compressed) / totals.original) * 100
          )
        : 0;
    return {
      totalOriginal: totals.original,
      totalCompressed: totals.compressed,
      savings: Number.isFinite(savings) ? savings : 0,
    };
  }, [queue]);

  const statusLabel = (item: QueueItem) => {
    if (item.status === "compressing") return "Compressing…";
    if (item.status === "done") return "Ready";
    if (item.status === "error") return "Error";
    return "Queued";
  };

  const qualityValue = Math.round(options.quality * 100);

  return (
    <section className="space-y-10">
      <div className="card border-neutral-900 p-10">
        <PageHeader
          eyebrow="Optimize"
          title="Shrink images without leaving the browser"
          description="Queue multiple files, tweak quality, and export lightweight JPEG or WEBP versions while keeping everything client-side."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div
            className="card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-neutral-800 bg-neutral-950/40 p-10 text-center transition hover:border-neutral-600 hover:bg-neutral-950"
            onDrop={(event) => {
              event.preventDefault();
              addFiles(event.dataTransfer.files);
            }}
            onDragOver={(event) => event.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-zinc-100">
                Drop images to compress
              </p>
              <p className="text-sm text-zinc-500">
                Supports PNG, JPG, and WebP. Processing stays on-device.
              </p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">
              {hasQueue
                ? `${queue.length} file${queue.length === 1 ? "" : "s"} ready`
                : "Waiting for files"}
            </p>
          </div>

          <div className="card border-neutral-900 p-8">
            <h2 className="mb-6 text-lg font-semibold text-zinc-100">
              Compression settings
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="label text-[0.6rem] text-zinc-400">
                    Quality
                  </span>
                  <span>{qualityValue}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={qualityValue}
                  onChange={(event) =>
                    updateOption("quality", event.target.value)
                  }
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-emerald-400"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Lower values shrink file sizes further at the expense of
                  fidelity.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-xs text-zinc-400">
                  <span className="label text-[0.6rem] text-zinc-400">
                    Max width (px)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={options.maxWidth ?? ""}
                    onChange={(event) =>
                      updateOption("maxWidth", event.target.value)
                    }
                    placeholder="e.g. 1920"
                    className="input"
                  />
                </label>
                <label className="space-y-2 text-xs text-zinc-400">
                  <span className="label text-[0.6rem] text-zinc-400">
                    Max height (px)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={options.maxHeight ?? ""}
                    onChange={(event) =>
                      updateOption("maxHeight", event.target.value)
                    }
                    placeholder="e.g. 1080"
                    className="input"
                  />
                </label>
              </div>

              <label className="space-y-2 text-xs text-zinc-400">
                <span className="label text-[0.6rem] text-zinc-400">
                  Output format
                </span>
                <select
                  value={options.format}
                  onChange={(event) =>
                    updateOption("format", event.target.value)
                  }
                  className="input"
                >
                  {formatOptions.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="card border-neutral-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Compression queue
              </h2>
              <p className="text-sm text-zinc-500">
                {queue.length
                  ? `${queue.length} file${queue.length === 1 ? "" : "s"} loaded`
                  : "Add images to begin compressing."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                onClick={handleCompressAll}
                disabled={!hasQueue || isCompressingAll}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompressingAll ? "Compressing…" : "Compress all"}
              </PrimaryButton>
              <button
                type="button"
                className={secondaryButtonClasses}
                onClick={clearQueue}
                disabled={!hasQueue}
              >
                Clear list
              </button>
            </div>
          </div>

          {queue.length ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4 text-sm text-zinc-400">
                <p>
                  Total original:{" "}
                  <span className="text-zinc-100">
                    {formatBytes(queueStats.totalOriginal)}
                  </span>
                </p>
                <p>
                  Total compressed:{" "}
                  <span className="text-zinc-100">
                    {queueStats.totalCompressed
                      ? formatBytes(queueStats.totalCompressed)
                      : "—"}
                  </span>
                </p>
                {queueStats.totalCompressed ? (
                  <p>
                    Savings:{" "}
                    <span className="text-emerald-300">
                      {queueStats.savings.toFixed(1)}%
                    </span>
                  </p>
                ) : null}
              </div>

              {queue.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-100">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Original: {formatBytes(item.file.size)}
                      </p>
                      {item.compressed ? (
                        <p className="text-xs text-emerald-300">
                          Compressed:{" "}
                          {formatBytes(item.compressed.compressedSize)} (
                          {(
                            (1 -
                              item.compressed.compressedSize /
                                item.file.size) *
                            100
                          ).toFixed(1)}
                          % smaller)
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500">
                          Status: {statusLabel(item)}
                        </p>
                      )}
                      {item.error ? (
                        <p className="text-xs text-red-400">{item.error}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <button
                        type="button"
                        className={tertiaryButtonClasses}
                        onClick={() => processItem(item.id)}
                        disabled={
                          item.status === "compressing" || isCompressingAll
                        }
                      >
                        {item.status === "compressing"
                          ? "Compressing…"
                          : "Compress"}
                      </button>
                      <button
                        type="button"
                        className={tertiaryButtonClasses}
                        onClick={() => downloadItem(item)}
                        disabled={!item.compressed}
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        className={ghostButtonClasses}
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-900 p-10 text-center text-sm text-zinc-500">
              No files queued yet — drop images on the left panel to begin.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ImageCompressorPage;
