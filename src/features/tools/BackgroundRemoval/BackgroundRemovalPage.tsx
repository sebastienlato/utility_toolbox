import { useCallback, useMemo, useRef, useState } from "react";
import PrimaryButton from "../../../components/PrimaryButton";
import PageHeader from "../../../components/PageHeader";
import { backgroundRemovalService } from "../../../services/backgroundRemovalService";

type Status = "idle" | "processing" | "ready" | "error";

const BackgroundRemovalPage = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const resetState = () => {
    setError(null);
    setProcessedPreview(null);
    setStatus("idle");
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    resetState();

    const file = files[0];
    setOriginalPreview(URL.createObjectURL(file));

    try {
      setStatus("processing");
      const result = await backgroundRemovalService.process(file);
      setProcessedPreview(result.processedUrl);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while processing the image.");
      setStatus("error");
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const statusLabel = useMemo(() => {
    if (status === "processing") return "Processing…";
    if (status === "ready") return "Done";
    if (status === "error") return "Error";
    return "Waiting for upload";
  }, [status]);

  return (
    <section className="space-y-10">
      <div className="card border-neutral-900 p-10">
        <PageHeader
          eyebrow="Images"
          title="Background Removal"
          description="Upload an image, preview the original, and download a processed cutout. A mock service simulates the pipeline until a real API is connected."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-neutral-800 bg-neutral-950/40 p-10 text-center transition hover:border-neutral-600 hover:bg-neutral-950"
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
            <p className="text-2xl font-semibold text-zinc-100">Drag & drop</p>
            <p className="text-sm text-zinc-500">or click to browse files</p>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-zinc-500">
            {statusLabel}
          </p>
        </div>

        <div className="space-y-6">
          <PreviewPanel
            title="Original"
            imageUrl={originalPreview}
            status={status}
          />
          <PreviewPanel
            title="Processed"
            imageUrl={processedPreview}
            status={status}
            footer={
              status === "ready" ? (
                <PrimaryButton
                  onClick={() => {
                    if (!processedPreview) return;
                    const link = document.createElement("a");
                    link.href = processedPreview;
                    link.download = "processed-image.png";
                    link.click();
                  }}
                >
                  Download result
                </PrimaryButton>
              ) : null
            }
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>
      </div>
    </section>
  );
};

type PreviewPanelProps = {
  title: string;
  imageUrl: string | null;
  status: Status;
  footer?: React.ReactNode;
};

const PreviewPanel = ({
  title,
  imageUrl,
  status,
  footer,
}: PreviewPanelProps) => {
  const renderState = () => {
    if (status === "processing") {
      return (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-neutral-900 bg-neutral-900/60 text-zinc-500">
          Processing…
        </div>
      );
    }

    if (imageUrl) {
      return (
        <div className="relative flex min-h-[220px] items-center justify-center rounded-2xl border border-neutral-900 bg-neutral-950 p-3">
          <img
            src={imageUrl}
            alt={`${title} preview`}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>
      );
    }

    return (
      <div className="grid min-h-[220px] place-items-center rounded-2xl border border-dashed border-neutral-900 text-sm text-zinc-600">
        No image yet
      </div>
    );
  };

  return (
    <div className="card space-y-3 border-neutral-900 p-6">
      <div className="flex items-center justify-between text-sm">
        <p className="text-zinc-100">{title}</p>
        <span className="rounded-full border border-neutral-900 px-3 py-1 text-xs text-zinc-500">
          {status}
        </span>
      </div>
      {renderState()}
      {footer ?? null}
    </div>
  );
};

export default BackgroundRemovalPage;
