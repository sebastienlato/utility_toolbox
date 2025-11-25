import { useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode.react'
import PageHeader from '../../../components/PageHeader'
import PrimaryButton from '../../../components/PrimaryButton'

const errorLevels = [
  { label: 'Low (L)', value: 'L' },
  { label: 'Medium (M)', value: 'M' },
  { label: 'Quartile (Q)', value: 'Q' },
  { label: 'High (H)', value: 'H' },
] as const

const sizes = [128, 192, 256, 320]

const QrCodeGeneratorPage = () => {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isValid = text.trim().length > 0
  const showUrlHint = useMemo(() => isValid && !/^https?:\/\//i.test(text.trim()), [isValid, text])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.href = canvasRef.current.toDataURL('image/png')
    link.download = 'qr-code.png'
    link.click()
  }

  const handleCopy = async () => {
    if (!isValid) return
    await navigator.clipboard.writeText(text.trim())
  }

  return (
    <section className="space-y-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/30 p-10 shadow-[0_15px_80px_rgba(2,6,23,0.85)] backdrop-blur">
        <PageHeader
          eyebrow="QR code"
          title="Generate scannable codes instantly"
          description="Type any text or URL, adjust size and error correction, and download a crisp PNG QR code."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Text or URL
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="https://your-domain.com"
                rows={4}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
              />
            </label>
            {!isValid ? (
              <p className="text-xs text-amber-300">Enter some text to generate a QR code.</p>
            ) : showUrlHint ? (
              <p className="text-xs text-slate-400">Tip: add https:// for better scanning on some devices.</p>
            ) : null}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">
                Size
                <select
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                >
                  {sizes.map((option) => (
                    <option key={option} value={option}>
                      {option} px
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label className="text-sm text-slate-300">
                Error correction
                <select
                  value={errorLevel}
                  onChange={(event) => setErrorLevel(event.target.value as typeof errorLevel)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                >
                  {errorLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={handleDownload} disabled={!isValid}>
              Download PNG
            </PrimaryButton>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!isValid}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm text-slate-300 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
            >
              Copy text
            </button>
          </div>
        </div>

        <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8">
          {isValid ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6">
              <QRCode
                value={text.trim()}
                size={size}
                level={errorLevel}
                includeMargin
                bgColor="#020617"
                fgColor="#ffffff"
                renderAs="canvas"
                ref={canvasRef}
              />
              <p className="mt-4 text-center text-sm text-slate-400">
                {size}px · Error level {errorLevel}
              </p>
            </div>
          ) : (
            <div className="grid h-64 w-full place-items-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
              Enter text to preview a QR code
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default QrCodeGeneratorPage
