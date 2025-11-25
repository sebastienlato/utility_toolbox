export type ResizeOptions = {
  width: number | null
  height: number | null
  preserveAspectRatio: boolean
  format: 'image/png' | 'image/jpeg'
}

export type ResizeResult = {
  blob: Blob
  url: string
  width: number
  height: number
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = (err) => reject(err)
    image.src = URL.createObjectURL(file)
  })

export const imageResizeService = {
  async resize(file: File, options: ResizeOptions): Promise<ResizeResult> {
    const image = await loadImage(file)

    const originalWidth = image.width
    const originalHeight = image.height

    let targetWidth = options.width ?? originalWidth
    let targetHeight = options.height ?? originalHeight

    if (options.preserveAspectRatio) {
      const aspectRatio = originalWidth / originalHeight
      if (options.width && !options.height) {
        targetHeight = Math.round(targetWidth / aspectRatio)
      } else if (!options.width && options.height) {
        targetWidth = Math.round(targetHeight * aspectRatio)
      } else if (options.width && options.height) {
        if (targetWidth / targetHeight > aspectRatio) {
          targetWidth = Math.round(targetHeight * aspectRatio)
        } else {
          targetHeight = Math.round(targetWidth / aspectRatio)
        }
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas not supported')
    }
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight)

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error('Failed to create image blob'))
            return
          }
          resolve(result)
        },
        options.format,
        options.format === 'image/jpeg' ? 0.9 : undefined,
      )
    })

    const url = URL.createObjectURL(blob)

    return {
      blob,
      url,
      width: targetWidth,
      height: targetHeight,
    }
  },
}
