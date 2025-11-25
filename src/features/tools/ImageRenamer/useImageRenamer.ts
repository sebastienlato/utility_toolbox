import { useCallback, useEffect, useMemo, useState } from 'react'

type PatternState = {
  baseName: string
  startIndex: number
  delimiter: string
}

type InternalFile = {
  id: string
  file: File
  originalName: string
  previewUrl: string
}

export type RenamedFile = InternalFile & {
  newName: string
}

const defaultPattern: PatternState = {
  baseName: 'asset',
  startIndex: 1,
  delimiter: '-',
}

const sanitizeBaseName = (value: string) => value.trim().replace(/\s+/g, '-')

const getExtension = (name: string) => {
  const match = name.match(/(\.[a-zA-Z0-9]+)$/)
  return match ? match[1] : ''
}

const useImageRenamer = () => {
  const [pattern, setPattern] = useState<PatternState>(defaultPattern)
  const [files, setFiles] = useState<InternalFile[]>([])

  const addFiles = useCallback((list: FileList | File[]) => {
    if (!list) return
    const accepted = Array.from(list).filter((file) => file.type.startsWith('image/'))
    if (!accepted.length) return

    setFiles((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${file.name}-${Date.now()}`,
        file,
        originalName: file.name,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }, [])

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      return []
    })
  }, [])

  const renamedFiles = useMemo<RenamedFile[]>(() => {
    const base = sanitizeBaseName(pattern.baseName) || 'asset'
    const delimiter = pattern.delimiter ?? ''
    return files.map((entry, index) => {
      const numericIndex = pattern.startIndex + index
      const paddedIndex = numericIndex.toString().padStart(2, '0')
      const ext = getExtension(entry.originalName)
      const newName = `${base}${delimiter ? delimiter : ''}${paddedIndex}${ext}`

      return {
        ...entry,
        newName,
      }
    })
  }, [files, pattern.baseName, pattern.delimiter, pattern.startIndex])

  const updatePattern = useCallback((key: keyof PatternState, value: string | number) => {
    setPattern((prev) => ({
      ...prev,
      [key]: key === 'startIndex' ? Math.max(0, Number(value) || 0) : String(value),
    }))
  }, [])

  const downloadFile = useCallback((entry: RenamedFile) => {
    const link = document.createElement('a')
    link.href = entry.previewUrl
    link.download = entry.newName
    link.click()
  }, [])

  const downloadAll = useCallback(() => {
    renamedFiles.forEach((entry) => {
      downloadFile(entry)
    })
  }, [renamedFiles, downloadFile])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const entry = prev.find((item) => item.id === id)
      if (entry) {
        URL.revokeObjectURL(entry.previewUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  useEffect(
    () => () => {
      files.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    },
    [files],
  )

  return {
    pattern,
    renamedFiles,
    addFiles,
    updatePattern,
    downloadFile,
    downloadAll,
    clearFiles,
    removeFile,
  }
}

export default useImageRenamer
