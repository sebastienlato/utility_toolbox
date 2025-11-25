import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal'

/**
 * Note: the first call may take longer while the ONNX/WASM models download and cache in the browser.
 */
export type BackgroundRemovalResult = {
  originalUrl: string
  processedUrl: string
}

export const backgroundRemovalService = {
  async process(file: File): Promise<BackgroundRemovalResult> {
    const originalUrl = URL.createObjectURL(file)

    try {
      const blob = await imglyRemoveBackground(file)
      const processedUrl = URL.createObjectURL(blob)

      return {
        originalUrl,
        processedUrl,
      }
    } catch (error) {
      console.warn('Background removal failed', error)
      throw new Error('Unable to remove the background right now. Please try again.')
    }
  },
}
