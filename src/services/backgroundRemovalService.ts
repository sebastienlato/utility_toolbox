export type BackgroundRemovalResult = {
  originalUrl: string
  processedUrl: string
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const backgroundRemovalService = {
  async process(file: File): Promise<BackgroundRemovalResult> {
    const originalUrl = URL.createObjectURL(file)

    // TODO: Replace with real API call; this mock just echoes the original image
    await delay(1500)

    return {
      originalUrl,
      processedUrl: originalUrl,
    }
  },
}
