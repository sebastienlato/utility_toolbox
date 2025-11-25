export type ToolStatus = 'stable' | 'beta'

export type ToolMeta = {
  id: string
  name: string
  description: string
  path: string
  category: string
  status: ToolStatus
}

export const tools: ToolMeta[] = [
  {
    id: 'background-removal',
    name: 'Background Removal',
    description: 'Upload images and preview clean cutouts with transparent backgrounds.',
    path: '/background-removal',
    category: 'Images',
    status: 'beta',
  },
  {
    id: 'image-renamer',
    name: 'Image Renamer',
    description: 'Batch rename photos with custom patterns, delimiters, and counters.',
    path: '/image-renamer',
    category: 'Productivity',
    status: 'stable',
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize and optimize images client-side while preserving aspect ratios.',
    path: '/image-resizer',
    category: 'Images',
    status: 'stable',
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Convert any text or URL into downloadable QR codes instantly.',
    path: '/qr-code-generator',
    category: 'Text',
    status: 'stable',
  },
]
