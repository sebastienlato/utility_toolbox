import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import PageHeader from '../../../components/PageHeader'
import PrimaryButton from '../../../components/PrimaryButton'

const errorLevels = [
  { label: 'Low (L)', value: 'L' },
  { label: 'Medium (M)', value: 'M' },
  { label: 'Quality (Q)', value: 'Q' },
  { label: 'High (H)', value: 'H' },
] as const

const sizePresets = [128, 256, 512, 768, 1024]
const previewSize = 320

type ContentType = 'url' | 'email' | 'text'
type ErrorLevel = (typeof errorLevels)[number]['value']

const contentTypes: Array<{ label: string; value: ContentType }> = [
  { label: 'URL', value: 'url' },
  { label: 'Email', value: 'email' },
  { label: 'Text', value: 'text' },
]

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = (event) => reject(event)
    image.src = src
  })

const toDataUrl = async (src: string): Promise<string> => {
  const response = await fetch(src)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const QrCodeGeneratorPage = () => {
  const [contentType, setContentType] = useState<ContentType>('url')
  const [urlValue, setUrlValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [textValue, setTextValue] = useState('')

  const [size, setSize] = useState(320)
  const [quietZone, setQuietZone] = useState(24)
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M')

  const [fgColor, setFgColor] = useState('#0f172a')
  const [bgColor, setBgColor] = useState('#f8fafc')
  const [transparentBg, setTransparentBg] = useState(false)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [logoUrl])

  const { qrValue, validationMessage } = useMemo(() => {
    if (contentType === 'url') {
      const trimmed = urlValue.trim()
      if (!trimmed) {
        return { qrValue: '', validationMessage: 'URL cannot be empty.' }
      }
      const hasProtocol = /^[a-zA-Z]+:\/\//.test(trimmed)
      const domainPattern = /^[\w.-]+\.[a-z]{2,}/i
      if (!hasProtocol && !domainPattern.test(trimmed)) {
        return { qrValue: '', validationMessage: 'Please enter a valid URL.' }
      }
      const value = hasProtocol ? trimmed : `https://${trimmed}`
      return { qrValue: value, validationMessage: '' }
    }
    if (contentType === 'email') {
      const trimmed = emailValue.trim()
      if (!trimmed) {
        return { qrValue: '', validationMessage: 'Email cannot be empty.' }
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
        return { qrValue: '', validationMessage: 'Please enter a valid email.' }
      }
      return { qrValue: `mailto:${trimmed}`, validationMessage: '' }
    }

    const trimmed = textValue.trim()
    if (!trimmed) {
      return { qrValue: '', validationMessage: 'Text cannot be empty.' }
    }
    return { qrValue: trimmed, validationMessage: '' }
  }, [contentType, urlValue, emailValue, textValue])

  const isValid = Boolean(qrValue) && !validationMessage

  const placeholder = useMemo(() => {
    if (contentType === 'url') return 'e.g. your-domain.com/product'
    if (contentType === 'email') return 'team@usefultools.dev'
    return 'Enter any text content you want to encode...'
  }, [contentType])

  const currentInputValue =
    contentType === 'url' ? urlValue : contentType === 'email' ? emailValue : textValue

  const handleInputChange = (value: string) => {
    if (contentType === 'url') setUrlValue(value)
    else if (contentType === 'email') setEmailValue(value)
    else setTextValue(value)
  }

  const handleLogoUpload = (file: File | null) => {
    if (!file) return
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl)
    }
    const nextUrl = URL.createObjectURL(file)
    setLogoFile(file)
    setLogoUrl(nextUrl)
  }

  const clearLogo = () => {
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl)
    }
    setLogoFile(null)
    setLogoUrl(null)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const handleCopy = async () => {
    if (!isValid) return
    await navigator.clipboard.writeText(qrValue)
  }

  const exportSize = size
  const innerExportSize = Math.max(size - quietZone * 2, 1)

  const downloadPng = async () => {
    if (!canvasRef.current || !isValid) return

    const baseCanvas = canvasRef.current
    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = exportSize
    outputCanvas.height = exportSize
    const ctx = outputCanvas.getContext('2d')
    if (!ctx) return

    if (!transparentBg) {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, exportSize, exportSize)
    } else {
      ctx.clearRect(0, 0, exportSize, exportSize)
    }

    ctx.drawImage(baseCanvas, quietZone, quietZone, innerExportSize, innerExportSize)

    if (logoUrl) {
      try {
        const logoImage = await loadImage(logoUrl)
        const logoSize = innerExportSize * 0.22
        const offset = (exportSize - logoSize) / 2
        ctx.drawImage(logoImage, offset, offset, logoSize, logoSize)
      } catch (error) {
        console.warn('Unable to draw logo on QR export', error)
      }
    }

    const link = document.createElement('a')
    link.href = outputCanvas.toDataURL('image/png')
    link.download = 'qr-code.png'
    link.click()
  }

  const downloadSvg = async () => {
    if (!svgRef.current || !isValid) return
    const svgNode = svgRef.current.cloneNode(true) as SVGSVGElement

    svgNode.removeAttribute('style')
    const viewBoxAttr = svgNode.getAttribute('viewBox') ?? `0 0 ${innerExportSize} ${innerExportSize}`
    const [baseMinX = 0, baseMinY = 0, baseWidth = innerExportSize, baseHeight = innerExportSize] = viewBoxAttr
      .split(' ')
      .map((num) => parseFloat(num))

    const unitsPerPxX = baseWidth / innerExportSize
    const unitsPerPxY = baseHeight / innerExportSize
    const quietUnitsX = quietZone * unitsPerPxX
    const quietUnitsY = quietZone * unitsPerPxY
    const newMinX = baseMinX - quietUnitsX
    const newMinY = baseMinY - quietUnitsY
    const newWidth = baseWidth + quietUnitsX * 2
    const newHeight = baseHeight + quietUnitsY * 2

    svgNode.setAttribute('width', `${exportSize}`)
    svgNode.setAttribute('height', `${exportSize}`)
    svgNode.setAttribute('viewBox', `${newMinX} ${newMinY} ${newWidth} ${newHeight}`)
    svgNode.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    if (!transparentBg) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', `${newMinX}`)
      rect.setAttribute('y', `${newMinY}`)
      rect.setAttribute('width', `${newWidth}`)
      rect.setAttribute('height', `${newHeight}`)
      rect.setAttribute('fill', bgColor)
      svgNode.insertBefore(rect, svgNode.firstChild)
    }

    if (logoUrl) {
      try {
        const embeddedLogo = await toDataUrl(logoUrl)
        const logoSizePx = innerExportSize * 0.22
        const logoSizeUnits = logoSizePx * unitsPerPxX
        const logoX = newMinX + (newWidth - logoSizeUnits) / 2
        const logoY = newMinY + (newHeight - logoSizeUnits) / 2

        const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
        imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', embeddedLogo)
        imageElement.setAttribute('x', `${logoX}`)
        imageElement.setAttribute('y', `${logoY}`)
        imageElement.setAttribute('width', `${logoSizeUnits}`)
        imageElement.setAttribute('height', `${logoSizeUnits}`)
        imageElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svgNode.appendChild(imageElement)
      } catch (error) {
        console.warn('Unable to embed logo into SVG', error)
      }
    }

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgNode)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'qr-code.svg'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1500)
  }

  const previewBackground = transparentBg ? 'transparent' : bgColor

  return (
    <section className="space-y-10">
      <div className="glass-card p-10">
        <PageHeader
          eyebrow="QR code"
          title="Generate scannable codes instantly"
          description="Choose a content type, adjust styling, and export QR codes with optional logo overlays."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card space-y-6 p-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Content type</p>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setContentType(value)}
                  className={[
                    'rounded-full border px-4 py-1 text-sm transition',
                    contentType === value
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              {contentType === 'text' ? 'Text content' : contentType === 'email' ? 'Email address' : 'URL'}
              {contentType === 'text' ? (
                <textarea
                  value={currentInputValue}
                  onChange={(event) => handleInputChange(event.target.value)}
                  placeholder={placeholder}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                />
              ) : (
                <input
                  value={currentInputValue}
                  onChange={(event) => handleInputChange(event.target.value)}
                  placeholder={placeholder}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                />
              )}
            </label>
            {validationMessage ? (
              <p className="text-xs text-amber-300">{validationMessage}</p>
            ) : (
              <p className="text-xs text-slate-400">
                {contentType === 'url'
                  ? 'Tip: protocols like https:// are added if missing.'
                  : contentType === 'email'
                    ? 'Encodes as mailto: so scanners can email you instantly.'
                    : 'Plain text is great for short messages, IDs, or promo codes.'}
              </p>
            )}
          </div>

          <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Export width: {exportSize}px</span>
              <span className="text-xs text-slate-400">QR modules: {innerExportSize}px</span>
              <div className="flex flex-wrap gap-2">
                {sizePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSize(preset)}
                    className={[
                      'rounded-full border px-2 py-0.5 text-xs',
                      size === preset
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-white'
                        : 'border-white/10 text-slate-300 hover:border-white/30 hover:text-white',
                    ].join(' ')}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min={128}
              max={1024}
              step={16}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="w-full accent-emerald-400"
            />
            <div className="mt-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center justify-between">
                <span>Quiet zone: {quietZone}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={64}
                step={2}
                value={quietZone}
                onChange={(event) => setQuietZone(Number(event.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-white">Error correction</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {errorLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setErrorLevel(level.value)}
                    className={[
                      'rounded-full border px-4 py-1 text-sm transition',
                      errorLevel === level.value
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white',
                    ].join(' ')}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  Foreground color
                  <div className="mt-1 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(event) => setFgColor(event.target.value)}
                      className="h-8 w-8 cursor-pointer rounded-full border border-white/10 bg-transparent"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(event) => setFgColor(event.target.value)}
                      className="flex-1 bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  Background color
                  <div className="mt-1 flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        disabled={transparentBg}
                        onChange={(event) => setBgColor(event.target.value)}
                        className="h-8 w-8 cursor-pointer rounded-full border border-white/10 bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        disabled={transparentBg}
                        onChange={(event) => setBgColor(event.target.value)}
                        className="flex-1 bg-transparent text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setTransparentBg((previous) => !previous)}
                      className={[
                        'rounded-full border px-3 py-1 text-xs transition',
                        transparentBg
                          ? 'border-emerald-400/60 bg-emerald-400/10 text-white'
                          : 'border-white/15 text-slate-300 hover:border-white/30 hover:text-white',
                      ].join(' ')}
                    >
                      {transparentBg ? 'Transparent background enabled' : 'Enable transparent background'}
                    </button>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Logo overlay</p>
              <button
                type="button"
                onClick={clearLogo}
                disabled={!logoUrl}
                className="text-xs text-slate-400 underline-offset-2 hover:text-white hover:underline disabled:text-slate-600 disabled:no-underline"
              >
                Clear logo
              </button>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-4 text-center">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)}
              />
              <p className="text-sm text-slate-300">Drop a logo or pick a PNG, JPG, or SVG file.</p>
              <div className="flex flex-col items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo preview" className="h-16 w-16 rounded-xl border border-white/10 object-contain" />
                ) : (
                  <div className="h-16 w-16 rounded-xl border border-dashed border-white/15 text-xs text-slate-500">
                    <div className="flex h-full items-center justify-center">No logo</div>
                  </div>
                )}
                {logoFile ? (
                  <p className="text-xs text-slate-400">{logoFile.name}</p>
                ) : (
                  <p className="text-xs text-slate-500">Recommended: square logo</p>
                )}
              </div>
              <PrimaryButton onClick={() => logoInputRef.current?.click()}>
                {logoUrl ? 'Replace logo' : 'Upload logo'}
              </PrimaryButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={downloadPng} disabled={!isValid}>
              Download PNG
            </PrimaryButton>
            <button
              type="button"
              onClick={downloadSvg}
              disabled={!isValid}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm text-slate-300 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
            >
              Download SVG
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!isValid}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm text-slate-300 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
            >
              Copy content
            </button>
          </div>
        </div>

        <div className="glass-card flex h-full flex-col gap-6 p-8">
          {isValid ? (
            <>
              <div
                className="flex rounded-2xl border border-white/10 p-6"
                style={{ background: previewBackground }}
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    background: previewBackground,
                    padding: `${quietZone}px`,
                  }}
                >
                  <QRCodeCanvas
                    value={qrValue}
                    size={previewSize}
                    level={errorLevel}
                    includeMargin={false}
                    bgColor={transparentBg ? '#00000000' : bgColor}
                    fgColor={fgColor}
                  />
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="QR logo overlay"
                      className="pointer-events-none absolute left-1/2 top-1/2 h-1/4 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-transparent object-contain shadow-lg shadow-black/50"
                    />
                  ) : null}
                </div>
              </div>
              <p className="text-center text-sm text-slate-400">
                {exportSize}px export · Error level {errorLevel} · Quiet zone {quietZone}px
              </p>
            </>
          ) : (
            <div className="grid h-64 w-full place-items-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
              Enter content to preview a QR code
            </div>
          )}
          <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
            <QRCodeSVG
              ref={svgRef}
              value={qrValue || ' '}
              size={innerExportSize}
              level={errorLevel}
              includeMargin={false}
              bgColor={transparentBg ? '#00000000' : bgColor}
              fgColor={fgColor}
            />
          </div>
          <QRCodeCanvas
            ref={(node) => {
              canvasRef.current = node
            }}
            value={qrValue || ' '}
            size={innerExportSize}
            level={errorLevel}
            includeMargin={false}
            bgColor={transparentBg ? '#00000000' : bgColor}
            fgColor={fgColor}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          />
        </div>
      </div>
    </section>
  )
}

export default QrCodeGeneratorPage
