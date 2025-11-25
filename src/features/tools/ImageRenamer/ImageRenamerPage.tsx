import { useCallback, useRef } from "react";
import PageHeader from "../../../components/PageHeader";
import PrimaryButton from "../../../components/PrimaryButton";
import useImageRenamer, { type OutputFormat } from "./useImageRenamer";

const ImageRenamerPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    pattern,
    renamedFiles,
    addFiles,
    updatePattern,
    downloadFile,
    downloadAll,
    removeFile,
    clearFiles,
    outputFormat,
    setOutputFormat,
  } = useImageRenamer();

  const hasFiles = renamedFiles.length > 0;

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const filesFromEntries = await extractFilesFromDataTransfer(
        event.dataTransfer
      );
      if (filesFromEntries.length) {
        addFiles(filesFromEntries);
      } else {
        addFiles(event.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <section className="space-y-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/30 p-10 shadow-[0_15px_80px_rgba(2,6,23,0.85)] backdrop-blur">
        <PageHeader
          eyebrow="Batch rename"
          title="Rename images with consistent patterns"
          description="Drop multiple assets, configure naming rules, and download files with new names. All processing happens locally in the browser."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div
            className="glass-card flex flex-col items-center justify-center border-2 border-dashed border-white/15 p-10 text-center transition hover:border-emerald-400/60 hover:bg-white/10"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={(node) => {
                inputRef.current = node;
                if (node) {
                  node.setAttribute("webkitdirectory", "");
                  node.setAttribute("directory", "");
                }
              }}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => addFiles(event.target.files ?? undefined)}
            />
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-white">
                Drop your images or folders
              </p>
              <p className="text-sm text-slate-400">
                PNG, JPG, WebP supported — drag entire folders or pick files.
              </p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-emerald-300/80">
              {hasFiles
                ? `${renamedFiles.length} file(s) ready`
                : "Waiting for files"}
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="mb-6 text-lg font-semibold text-white">
              Naming pattern
            </h2>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  Base name
                  <input
                    type="text"
                    value={pattern.baseName}
                    onChange={(event) =>
                      updatePattern("baseName", event.target.value)
                    }
                    placeholder="holiday-photo"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  />
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  Starting index
                  <input
                    type="number"
                    min={0}
                    value={pattern.startIndex}
                    onChange={(event) =>
                      updatePattern("startIndex", Number(event.target.value))
                    }
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  />
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  Delimiter
                  <input
                    type="text"
                    value={pattern.delimiter}
                    onChange={(event) =>
                      updatePattern("delimiter", event.target.value)
                    }
                    placeholder="-"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  />
                </label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-slate-300">
                  Output format
                  <select
                    value={outputFormat}
                    onChange={(event) =>
                      setOutputFormat(event.target.value as OutputFormat)
                    }
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  >
                    <option value="original">Keep original</option>
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPEG</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton
                onClick={() => void downloadAll()}
                disabled={!hasFiles}
              >
                Download all
              </PrimaryButton>
              <button
                type="button"
                onClick={clearFiles}
                disabled={!hasFiles}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm text-slate-300 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
              >
                Clear list
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Preview & queue
              </h3>
              <p className="text-sm text-slate-400">
                Original vs. generated filenames
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
              {hasFiles ? `${renamedFiles.length} files` : "Empty"}
            </span>
          </div>

          {hasFiles ? (
            <ul className="space-y-4">
              {renamedFiles.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4 md:flex-row md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={file.previewUrl}
                      alt={file.originalName}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm text-slate-400">Original</p>
                      <p className="font-medium text-white">
                        {file.originalName}
                      </p>
                      <p className="mt-1 text-xs text-emerald-300">
                        → {file.newName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col items-stretch justify-center gap-2 md:items-end">
                    <PrimaryButton onClick={() => void downloadFile(file)}>
                      Download
                    </PrimaryButton>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-xs text-slate-400 underline-offset-2 hover:text-white hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
              Drop files to see previews
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ImageRenamerPage;

const extractFilesFromDataTransfer = async (
  dataTransfer: DataTransfer
): Promise<File[]> => {
  const items = Array.from(dataTransfer.items ?? []);
  const entryPromises = items
    .map((item) =>
      (
        item as DataTransferItem & {
          webkitGetAsEntry?: () => FileSystemEntry | null;
        }
      ).webkitGetAsEntry?.()
    )
    .filter((entry): entry is FileSystemEntry => entry != null)
    .map((entry) => readEntry(entry));

  if (!entryPromises.length) {
    return Array.from(dataTransfer.files ?? []);
  }

  const nested = await Promise.all(entryPromises);
  return nested.flat();
};

const readEntry = (entry: FileSystemEntry): Promise<File[]> => {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    return new Promise((resolve, reject) => {
      fileEntry.file(
        (file) => resolve([file]),
        (error) => reject(error)
      );
    });
  }

  if (entry.isDirectory) {
    return readDirectory(entry as FileSystemDirectoryEntry);
  }

  return Promise.resolve([]);
};

const readDirectory = (entry: FileSystemDirectoryEntry): Promise<File[]> =>
  new Promise((resolve, reject) => {
    const reader = entry.createReader();
    const files: File[] = [];

    const readEntries = () => {
      reader.readEntries(
        (entries) => {
          if (!entries.length) {
            resolve(files);
            return;
          }

          Promise.all(entries.map(readEntry))
            .then((results) => {
              results.forEach((batch) => files.push(...batch));
              readEntries();
            })
            .catch((error) => reject(error));
        },
        (error) => reject(error)
      );
    };

    readEntries();
  });
