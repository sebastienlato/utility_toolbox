import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BackToTools from "../../../components/BackToTools";
import PageHeader from "../../../components/PageHeader";
import PrimaryButton from "../../../components/PrimaryButton";
import {
  imageFormatService,
  type FormatConvertOptions,
  type FormatConvertResult,
  type ImageFormat,
} from "../../../services/imageFormatService";

type QueueStatus = "pending" | "converting" | "done" | "error";

type QueueItem = {
  id: string;
  file: File;
  status: QueueStatus;
  result?: FormatConvertResult;
  error?: string;
};

const formatChoices: Array<{ label: string; value: ImageFormat }> = [
  { label: "PNG", value: "image/png" },
  { label: "JPEG", value: "image/jpeg" },
  { label: "WEBP", value: "image/webp" },
];

const defaultOptions: FormatConvertOptions = {
  targetFormat: "image/png",
  quality: 0.9,
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

const formatLabel = (format: ImageFormat) =>
  formatChoices.find((choice) => choice.value === format)?.label ?? "Unknown";

const ImageFormatConverterPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [options, setOptions] = useState<FormatConvertOptions>(defaultOptions);
  const [isBulkConverting, setIsBulkConverting] = useState(false);
  const hasFiles = queue.length > 0;

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => {
        if (item.result) {
          URL.revokeObjectURL(item.result.url);
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
        status: "pending" as QueueStatus,
      })),
    ]);
  }, []);

  const updateFormat = useCallback((value: string) => {
    setOptions((prev) => ({
      ...prev,
      targetFormat: value as ImageFormat,
    }));
  }, []);

  const updateQuality = useCallback((value: string) => {
    setOptions((prev) => ({
      ...prev,
      quality: Math.min(1, Math.max(0, Number(value) / 100)),
    }));
  }, []);

  const revokeResult = useCallback((item: QueueItem) => {
    if (item.result) {
      URL.revokeObjectURL(item.result.url);
    }
  }, []);

  const removeItem = useCallback(
    (id: string) => {
      setQueue((prev) => {
        const target = prev.find((item) => item.id === id);
        if (target) revokeResult(target);
        return prev.filter((item) => item.id !== id);
      });
    },
    [revokeResult]
  );

  const clearQueue = useCallback(() => {
    setQueue((prev) => {
      prev.forEach((item) => revokeResult(item));
      return [];
    });
  }, [revokeResult]);

  const convertItem = useCallback(
    async (id: string) => {
      const target = queueRef.current.find((item) => item.id === id);
      if (!target) return;
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "converting", error: undefined }
            : item
        )
      );
      try {
        const result = await imageFormatService.convert(target.file, options);
        setQueue((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item;
            if (item.result) {
              URL.revokeObjectURL(item.result.url);
            }
            return {
              ...item,
              status: "done" as QueueStatus,
              result,
              error: undefined,
            };
          })
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Conversion failed unexpectedly.";
        setQueue((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "error", error: message } : item
          )
        );
      }
    },
    [options]
  );

  const convertAll = useCallback(async () => {
    if (!queueRef.current.length) return;
    setIsBulkConverting(true);
    try {
      for (const item of queueRef.current) {
        await convertItem(item.id);
      }
    } finally {
      setIsBulkConverting(false);
    }
  }, [convertItem]);

  const downloadItem = useCallback((item: QueueItem) => {
    if (!item.result) return;
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    const link = document.createElement("a");
    link.href = item.result.url;
    link.download = `${baseName}.${item.result.extension}`;
    link.click();
  }, []);

  const showQualitySlider =
    options.targetFormat === "image/jpeg" ||
    options.targetFormat === "image/webp";

  const qualityDisplay = Math.round((options.quality ?? 0.9) * 100);

  const statusLabel = (status: QueueStatus) => {
    if (status === "converting") return "Converting…";
    if (status === "done") return "Converted";
    if (status === "error") return "Error";
    return "Pending";
  };

  const totalConverted = useMemo(
    () => queue.filter((item) => item.status === "done").length,
    [queue]
  );

  return (
    <section className="space-y-10">
      <div className="card border-neutral-900 p-10">
        <BackToTools />
        <PageHeader
          eyebrow="Formats"
          title="Convert images between PNG, JPEG, and WEBP"
          description="Upload files, choose a format, and export the converted results with optional quality tuning for lossy outputs."
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
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-zinc-100">
                Drop images to convert
              </p>
              <p className="text-sm text-zinc-500">
                Works best with PNG, JPEG, and WEBP. Everything stays client
                side.
              </p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">
              {hasFiles
                ? `${queue.length} file${queue.length === 1 ? "" : "s"} loaded`
                : "Waiting for files"}
            </p>
          </div>

          <div className="card border-neutral-900 p-8">
            <h2 className="mb-6 text-lg font-semibold text-zinc-100">
              Conversion settings
            </h2>
            <div className="space-y-6">
              <label className="space-y-2 text-xs text-zinc-400">
                <span className="label text-[0.6rem] text-zinc-400">
                  Target format
                </span>
                <select
                  className="input"
                  value={options.targetFormat}
                  onChange={(event) => updateFormat(event.target.value)}
                >
                  {formatChoices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </label>

              {showQualitySlider ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="label text-[0.6rem] text-zinc-400">
                      Quality
                    </span>
                    <span>{qualityDisplay}%</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    step={5}
                    value={qualityDisplay}
                    onChange={(event) => updateQuality(event.target.value)}
                    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-emerald-400"
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    Applies to JPEG and WEBP conversions only.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  Lossless output selected — quality slider is disabled.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card border-neutral-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Conversion queue
              </h2>
              <p className="text-sm text-zinc-500">
                {hasFiles
                  ? `${queue.length} file${
                      queue.length === 1 ? "" : "s"
                    } queued • ${totalConverted} converted`
                  : "Add files to begin conversion."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                onClick={convertAll}
                disabled={!hasFiles || isBulkConverting}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBulkConverting ? "Converting…" : "Convert all"}
              </PrimaryButton>
              <button
                type="button"
                className={secondaryButtonClasses}
                onClick={clearQueue}
                disabled={!hasFiles}
              >
                Clear list
              </button>
            </div>
          </div>

          {queue.length ? (
            <div className="mt-6 space-y-4">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p className="font-medium text-zinc-100">
                        {item.file.name}
                      </p>
                      <p>
                        Original:{" "}
                        <span className="text-zinc-100">
                          {item.file.type || "Unknown"} ·{" "}
                          {formatBytes(item.file.size)}
                        </span>
                      </p>
                      <p>
                        Target:{" "}
                        <span className="text-zinc-100">
                          {item.result
                            ? formatLabel(item.result.mimeType)
                            : formatLabel(options.targetFormat)}
                        </span>
                      </p>
                      <p>Status: {statusLabel(item.status)}</p>
                      {item.error ? (
                        <p className="text-xs text-red-400">{item.error}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <button
                        type="button"
                        className={tertiaryButtonClasses}
                        onClick={() => convertItem(item.id)}
                        disabled={
                          item.status === "converting" || isBulkConverting
                        }
                      >
                        {item.status === "converting"
                          ? "Converting…"
                          : "Convert"}
                      </button>
                      <button
                        type="button"
                        className={tertiaryButtonClasses}
                        onClick={() => downloadItem(item)}
                        disabled={!item.result}
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

export default ImageFormatConverterPage;
