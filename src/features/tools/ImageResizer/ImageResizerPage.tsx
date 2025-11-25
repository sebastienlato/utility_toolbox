import { useCallback, useMemo, useRef, useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import PrimaryButton from '../../../components/PrimaryButton'
import { imageResizeService, type ResizeOptions, type ResizeResult } from '../../../services/imageResizeService'

type QueueItem = {
  id: string
  file: File
  originalUrl: string
  originalWidth: number | null
  originalHeight: number | null
  resized?: ResizeResult
}

const defaultOptions: ResizeOptions = {
  width: 1024,
  height: null,
  preserveAspectRatio: true,
  format: 'image/png',
}

const formats = [
  { label: 'PNG', value: 'image/png' },
  { label: 'JPEG', value: 'image/jpeg' },
] as const

const ImageResizerPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [options, setOptions] = useState<ResizeOptions>(defaultOptions)
  const [isProcessing, setIsProcessing] = useState(false)
  const hasFiles = queue.length > 0

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return
    const accepted = Array.from(list).filter((file) => file.type.startsWith('image/'))
    if (!accepted.length) return

    accepted.forEach((file) => {
      const id = crypto.randomUUID()
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        setQueue((prev) => [
          ...prev,
          {
            id,
            file,
            originalUrl: url,
            originalWidth: img.width,
            originalHeight: img.height,
          },
        ])
      }
      img.src = url
    })
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      addFiles(event.dataTransfer.files)
    },
    [addFiles],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const updateOption = useCallback((key: keyof ResizeOptions, value: string | number | boolean) => {
    setOptions((prev) => ({
      ...prev,
      [key]:
        key === 'preserveAspectRatio'
          ? Boolean(value)
          : key === 'format'
            ? (value as ResizeOptions['format'])
            : value === '' ? null : Number(value),
    }))
  }, [])

  const processQueue = useCallback(async () => {
    if (!queue.length) return
    setIsProcessing(true)
    try {
      const results: QueueItem[] = []
      for (const item of queue) {
        const result = await imageResizeService.resize(item.file, options)
        results.push({
          ...item,
          resized: result,
        })
      }
      setQueue(results)
    } finally {
      setIsProcessing(false)
    }
  }, [queue, options])

  const downloadFile = useCallback((item: QueueItem) => {
    if (!item.resized) return
    const link = document.createElement('a')
    link.href = item.resized.url
    link.download = `${item.file.name.replace(/\.[^.]+$/, '')}-${item.resized.width}x${item.resized.height}.${options.format === 'image/png' ? 'png' : 'jpg'}`
    link.click()
  }, [options.format])

  const clearQueue = useCallback(() => {
    setQueue((prev) => {
      prev.forEach((item) => {
        URL.revokeObjectURL(item.originalUrl)
        if (item.resized) {
          URL.revokeObjectURL(item.resized.url)
        }
      })
      return []
    })
  }, [])

  const processedCount = useMemo(() => queue.filter((item) => item.resized).length, [queue])

  return (
    <section className="space-y-10">
      <div className="glass-card p-10">
        <PageHeader
          eyebrow="Resize"
          title="Resize images directly in your browser"
          description="Adjust dimensions, maintain aspect ratios, and download optimized PNG or JPEG outputs. Everything stays on the client."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div
            className="glass-card flex flex-col items-center justify-center border-2 border-dashed border-white/15 p-10 text-center transition hover:border-emerald-400/60 hover:bg-white/10"
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
              onChange={(event) => addFiles(event.target.files)}
            />
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-white">Drop images to resize</p>
              <p className="text-sm text-slate-400">Handles PNG, JPG, WebP — stays entirely client-side.</p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-emerald-300/80">
              {hasFiles ? `${queue.length} file(s) queued` : 'Waiting for files'}
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="mb-6 text-lg font-semibold text-white">Resize options</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-300">
                  Width (px)
                  <input
                    type="number"
                    min={1}
                    value={options.width ?? ''}
                    onChange={(event) => updateOption('width', event.target.value)}
                    placeholder="e.g., 1024"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  />
                </label>
              </div>
              <div>
                <label className="text-sm text-slate-300">
                  Height (px)
                  <input
                    type="number"
                    min={1}
                    value={options.height ?? ''}
                    onChange={(event) => updateOption('height', event.target.value)}
                    placeholder="auto"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={options.preserveAspectRatio}
                  onChange={(event) => updateOption('preserveAspectRatio', event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-emerald-400 focus:ring-emerald-400/80"
                />
                <span className="text-sm text-slate-300">Preserve aspect ratio</span>
              </div>
              <div>
                <label className="text-sm text-slate-300">
                  Output format
                  <select
                    value={options.format}
                    onChange={(event) => updateOption('format', event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  >
                    {formats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton onClick={processQueue} disabled={!hasFiles || isProcessing}>
                {isProcessing ? 'Processing…' : 'Resize images'}
              </PrimaryButton>
              <button
                type="button"
                onClick={clearQueue}
                disabled={!hasFiles}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm text-slate-300 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
              >
                Clear queue
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Preview</h3>
              <p className="text-sm text-slate-400">Original vs resized dimensions</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
              {processedCount}/{queue.length || 0} processed
            </span>
          </div>

          {hasFiles ? (
            <ul className="space-y-4">
              {queue.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4 md:flex-row md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.originalUrl}
                      alt={item.file.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm text-slate-400">{item.file.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.originalWidth && item.originalHeight
                          ? `${item.originalWidth} × ${item.originalHeight}`
                          : 'Detecting size…'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col items-stretch justify-center gap-2 md:items-end">
                    {item.resized ? (
                      <>
                        <p className="text-xs text-emerald-300">
                          → {item.resized.width} × {item.resized.height}
                        </p>
                        <PrimaryButton onClick={() => downloadFile(item)}>
                          Download ({options.format === 'image/png' ? 'PNG' : 'JPEG'})
                        </PrimaryButton>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {isProcessing ? 'Processing…' : 'Awaiting resize'}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
              Upload files to preview sizes
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ImageResizerPage
