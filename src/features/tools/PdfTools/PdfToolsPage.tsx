import { useCallback, useEffect, useRef, useState } from "react";
import BackToTools from "../../../components/BackToTools";
import PageHeader from "../../../components/PageHeader";
import PrimaryButton from "../../../components/PrimaryButton";
import { pdfToolsService, type PdfResult } from "../../../services/pdfToolsService";

type QueueItem = {
  id: string;
  file: File;
  pageCount: number | null;
  metaStatus: "loading" | "ready" | "error";
  metaError?: string;
};

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

const PdfToolsPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergedResult, setMergedResult] = useState<PdfResult | null>(null);

  const [extractTarget, setExtractTarget] = useState<string | null>(null);
  const [extractFrom, setExtractFrom] = useState<string>("1");
  const [extractTo, setExtractTo] = useState<string>("1");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<PdfResult | null>(null);

  useEffect(
    () => () => {
      if (mergedResult) {
        URL.revokeObjectURL(mergedResult.url);
      }
      if (extractedResult) {
        URL.revokeObjectURL(extractedResult.url);
      }
    },
    [mergedResult, extractedResult]
  );

  const addFiles = useCallback((list: FileList | null) => {
    if (!list?.length) return;
    const accepted = Array.from(list).filter((file) =>
      file.type === "application/pdf"
    );
    if (!accepted.length) return;

    const newItems = accepted.map<QueueItem>((file) => ({
      id: crypto.randomUUID(),
      file,
      pageCount: null,
      metaStatus: "loading",
    }));

    setQueue((prev) => [...prev, ...newItems]);

    newItems.forEach(async (item) => {
      try {
        const count = await pdfToolsService.getPageCount(item.file);
        setQueue((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, pageCount: count, metaStatus: "ready" }
              : entry
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to read PDF metadata.";
        setQueue((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, metaStatus: "error", metaError: message }
              : entry
          )
        );
      }
    });
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      addFiles(event.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    if (extractTarget === id) {
      setExtractTarget(null);
    }
  }, [extractTarget]);

  const moveItem = useCallback((id: string, direction: "up" | "down") => {
    setQueue((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      const newQueue = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= prev.length) return prev;
      [newQueue[index], newQueue[swapIndex]] = [newQueue[swapIndex], newQueue[index]];
      return newQueue;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setMergeError(null);
    setExtractTarget(null);
  }, []);

  const handleMerge = useCallback(async () => {
    if (queue.length < 2) return;
    setIsMerging(true);
    setMergeError(null);
    if (mergedResult) {
      URL.revokeObjectURL(mergedResult.url);
      setMergedResult(null);
    }
    try {
      const result = await pdfToolsService.mergePdfs(queue.map((item) => item.file));
      setMergedResult(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Merging failed unexpectedly.";
      setMergeError(message);
    } finally {
      setIsMerging(false);
    }
  }, [queue, mergedResult]);

  const handleDownload = useCallback((result: PdfResult | null, filename: string) => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = filename;
    link.click();
  }, []);

  const handleExtract = useCallback(async () => {
    if (!extractTarget) return;
    const file = queue.find((item) => item.id === extractTarget)?.file;
    if (!file) return;
    const from = Number(extractFrom);
    const to = Number(extractTo);
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      setExtractError("Enter valid page numbers.");
      return;
    }
    if (from <= 0 || to <= 0 || to < from) {
      setExtractError("Range must be positive and ascending.");
      return;
    }

    setExtractError(null);
    setIsExtracting(true);
    if (extractedResult) {
      URL.revokeObjectURL(extractedResult.url);
      setExtractedResult(null);
    }

    try {
      const result = await pdfToolsService.extractPages(file, from, to);
      setExtractedResult(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Extraction failed unexpectedly.";
      setExtractError(message);
    } finally {
      setIsExtracting(false);
    }
  }, [extractTarget, extractFrom, extractTo, queue, extractedResult]);

  const canMerge = queue.length >= 2 && !isMerging;
  const canExtract = Boolean(extractTarget && !isExtracting);

  return (
    <section className="space-y-10">
      <div className="card border-neutral-900 p-10">
        <BackToTools />
        <PageHeader
          eyebrow="Documents"
          title="Merge PDFs without leaving the browser"
          description="Queue multiple PDFs, reorder them, and export a combined file. Extract page ranges for a quick split when needed."
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
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-zinc-100">
                Drop PDFs to build your stack
              </p>
              <p className="text-sm text-zinc-500">
                Arrange the queue on the right, then merge or extract pages client-side.
              </p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">
              {queue.length
                ? `${queue.length} file${queue.length === 1 ? "" : "s"} ready`
                : "Waiting for files"}
            </p>
          </div>

          <div className="card border-neutral-900 p-8">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">
              Extract pages (optional)
            </h2>
            <p className="text-sm text-zinc-500">
              Choose a single PDF, enter a range, and download just those pages.
            </p>
            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-xs text-zinc-400">
                <span className="label text-[0.6rem] text-zinc-400">Select file</span>
                <select
                  className="input"
                  value={extractTarget ?? ""}
                  onChange={(event) =>
                    setExtractTarget(event.target.value || null)
                  }
                >
                  <option value="">Choose a PDF</option>
                  {queue.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.file.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-xs text-zinc-400">
                  <span className="label text-[0.6rem] text-zinc-400">
                    From page
                  </span>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={extractFrom}
                    onChange={(event) => setExtractFrom(event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-xs text-zinc-400">
                  <span className="label text-[0.6rem] text-zinc-400">
                    To page
                  </span>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={extractTo}
                    onChange={(event) => setExtractTo(event.target.value)}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <PrimaryButton
                  onClick={handleExtract}
                  disabled={!canExtract || !extractTarget}
                  className="disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isExtracting ? "Extracting…" : "Extract pages"}
                </PrimaryButton>
                <button
                  type="button"
                  className="rounded-full border border-neutral-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-neutral-600 hover:text-white"
                  onClick={() => {
                    setExtractTarget(null);
                    setExtractFrom("1");
                    setExtractTo("1");
                    setExtractError(null);
                    if (extractedResult) {
                      URL.revokeObjectURL(extractedResult.url);
                      setExtractedResult(null);
                    }
                  }}
                >
                  Reset
                </button>
              </div>
              {extractError ? (
                <p className="text-sm text-red-400">{extractError}</p>
              ) : null}
              {extractedResult ? (
                <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4 text-sm text-zinc-300">
                  <p className="font-medium text-zinc-100">Extraction ready</p>
                  <p>{extractedResult.pageCount} page(s)</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <PrimaryButton
                      onClick={() =>
                        handleDownload(
                          extractedResult,
                          "pdf-extract.pdf"
                        )
                      }
                    >
                      Download extract
                    </PrimaryButton>
                    <button
                      type="button"
                      className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-zinc-300 hover:border-neutral-500 hover:text-white"
                      onClick={() => {
                        URL.revokeObjectURL(extractedResult.url);
                        setExtractedResult(null);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="card border-neutral-900 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Merge queue</h2>
              <p className="text-sm text-zinc-500">
                {queue.length
                  ? `${queue.length} PDF${queue.length === 1 ? "" : "s"} loaded`
                  : "Drop PDFs to start merging."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                onClick={handleMerge}
                disabled={!canMerge}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isMerging ? "Merging…" : "Merge PDFs"}
              </PrimaryButton>
              <button
                type="button"
                className="rounded-full border border-neutral-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                onClick={clearQueue}
                disabled={!queue.length}
              >
                Clear list
              </button>
            </div>
          </div>

          {mergeError ? (
            <p className="mt-4 text-sm text-red-400">{mergeError}</p>
          ) : null}

          {mergedResult ? (
            <div className="mt-6 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4 text-sm text-zinc-300">
              <p className="font-medium text-zinc-50">Merged PDF ready</p>
              <p>{mergedResult.pageCount} page(s)</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton
                  onClick={() => handleDownload(mergedResult, "merged.pdf")}
                >
                  Download merged PDF
                </PrimaryButton>
                <button
                  type="button"
                  className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-zinc-300 hover:border-neutral-500 hover:text-white"
                  onClick={() => {
                    URL.revokeObjectURL(mergedResult.url);
                    setMergedResult(null);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {queue.length ? (
            <div className="mt-6 space-y-4">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4 text-sm text-zinc-300"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-zinc-50">{item.file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {formatBytes(item.file.size)}
                        {item.pageCount !== null
                          ? ` • ${item.pageCount} page${item.pageCount === 1 ? "" : "s"}`
                          : null}
                      </p>
                      {item.metaStatus === "loading" ? (
                        <p className="text-xs text-zinc-500">Reading metadata…</p>
                      ) : null}
                      {item.metaStatus === "error" ? (
                        <p className="text-xs text-red-400">{item.metaError}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-neutral-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:border-neutral-600 hover:text-white disabled:opacity-30"
                        onClick={() => moveItem(item.id, "up")}
                        disabled={index === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-neutral-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:border-neutral-600 hover:text-white disabled:opacity-30"
                        onClick={() => moveItem(item.id, "down")}
                        disabled={index === queue.length - 1}
                      >
                        Down
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
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-900 p-10 text-center text-sm text-zinc-500">
              No PDFs yet — drop files on the left to get started.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PdfToolsPage;
