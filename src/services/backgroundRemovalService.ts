/**
 * Simple color-key background removal:
 * - Samples the corners of the image to estimate a dominant background color.
 * - Any pixel within the threshold distance is made transparent.
 * Works best on solid or near-uniform backgrounds and avoids heavy ML dependencies.
 */

export type BackgroundRemovalResult = {
  originalUrl: string
  processedUrl: string
}

type RGB = { r: number; g: number; b: number }

const CORNER_SAMPLE_SIZE = 4
const COLOR_DISTANCE_THRESHOLD = 45
const COLOR_DISTANCE_THRESHOLD_SQ = COLOR_DISTANCE_THRESHOLD * COLOR_DISTANCE_THRESHOLD

const hasCreateImageBitmap = typeof createImageBitmap === 'function'

const loadImageFromFile = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  if (hasCreateImageBitmap) {
    return createImageBitmap(file)
  }

  const objectUrl = URL.createObjectURL(file)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = (event) => {
      URL.revokeObjectURL(objectUrl)
      reject(event)
    }
    img.src = objectUrl
  })
}

const getDimensions = (image: ImageBitmap | HTMLImageElement) => ({
  width: 'width' in image ? image.width : (image as HTMLImageElement).naturalWidth,
  height: 'height' in image ? image.height : (image as HTMLImageElement).naturalHeight,
})

const sampleCorner = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
): RGB => {
  const width = Math.min(CORNER_SAMPLE_SIZE, maxWidth)
  const height = Math.min(CORNER_SAMPLE_SIZE, maxHeight)
  const imageData = ctx.getImageData(x, y, width, height)
  const { data } = imageData
  let r = 0
  let g = 0
  let b = 0
  let count = 0

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 200) continue
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    count += 1
  }

  if (count === 0) {
    return { r: data[0] ?? 255, g: data[1] ?? 255, b: data[2] ?? 255 }
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  }
}

const estimateBackgroundColor = (ctx: CanvasRenderingContext2D, width: number, height: number): RGB => {
  const corners = [
    sampleCorner(ctx, 0, 0, width, height),
    sampleCorner(ctx, Math.max(width - CORNER_SAMPLE_SIZE, 0), 0, width, height),
    sampleCorner(ctx, 0, Math.max(height - CORNER_SAMPLE_SIZE, 0), width, height),
    sampleCorner(ctx, Math.max(width - CORNER_SAMPLE_SIZE, 0), Math.max(height - CORNER_SAMPLE_SIZE, 0), width, height),
  ]

  const total = corners.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b,
    }),
    { r: 0, g: 0, b: 0 },
  )

  return {
    r: Math.round(total.r / corners.length),
    g: Math.round(total.g / corners.length),
    b: Math.round(total.b / corners.length),
  }
}

const colorDistanceSq = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return dr * dr + dg * dg + db * db
}

const applyColorKey = (ctx: CanvasRenderingContext2D, bgColor: RGB, width: number, height: number) => {
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha === 0) continue
    const distance = colorDistanceSq(data[i], data[i + 1], data[i + 2], bgColor.r, bgColor.g, bgColor.b)
    if (distance < COLOR_DISTANCE_THRESHOLD_SQ) {
      data[i + 3] = 0
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export const backgroundRemovalService = {
  async process(file: File): Promise<BackgroundRemovalResult> {
    const originalUrl = URL.createObjectURL(file)

    try {
      const image = await loadImageFromFile(file)
      const { width, height } = getDimensions(image)

      if (!width || !height) {
        throw new Error('Image has invalid dimensions.')
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        throw new Error('Canvas not supported in this browser.')
      }

      ctx.drawImage(image as CanvasImageSource, 0, 0, width, height)
      if ('close' in image && typeof (image as ImageBitmap).close === 'function') {
        ;(image as ImageBitmap).close()
      }

      const bgColor = estimateBackgroundColor(ctx, width, height)
      applyColorKey(ctx, bgColor, width, height)

      const processedUrl = canvas.toDataURL('image/png')

      return {
        originalUrl,
        processedUrl,
      }
    } catch (error) {
      console.warn('Background removal failed', error)
      throw new Error('Background removal failed. Please try a different image or simpler background.')
    }
  },
}
