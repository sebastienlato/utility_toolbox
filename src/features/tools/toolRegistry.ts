export type ToolStatus = "stable" | "beta" | "experimental";

export type ToolMeta = {
  id: string;
  name: string;
  shortDescription: string;
  slug: string;
  category: string;
  status: ToolStatus;
};

export const tools: ToolMeta[] = [
  {
    id: "background-removal",
    name: "Background Removal",
    shortDescription:
      "Upload images and preview clean cutouts with transparent backgrounds.",
    slug: "/background-removal",
    category: "Images",
    status: "beta",
  },
  {
    id: "image-renamer",
    name: "Image Renamer",
    shortDescription:
      "Batch rename photos with custom patterns, delimiters, and counters.",
    slug: "/image-renamer",
    category: "Productivity",
    status: "stable",
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    shortDescription:
      "Resize and optimize images client-side while preserving aspect ratios.",
    slug: "/image-resizer",
    category: "Images",
    status: "stable",
  },
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    shortDescription:
      "Convert any text or URL into downloadable QR codes instantly.",
    slug: "/qr-code-generator",
    category: "Text",
    status: "stable",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    shortDescription: "Compress images to smaller file sizes.",
    slug: "/image-compressor",
    category: "Images",
    status: "experimental",
  },
  {
    id: "image-format-converter",
    name: "Image Format Converter",
    shortDescription: "Convert images between PNG, JPEG, and WEBP.",
    slug: "/image-format-converter",
    category: "Images",
    status: "experimental",
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    shortDescription: "Merge PDFs client-side and export a combined file.",
    slug: "/pdf-tools",
    category: "Documents",
    status: "experimental",
  },
  {
    id: "text-case-converter",
    name: "Text Case Converter",
    shortDescription: "Quickly convert text between cases and formats.",
    slug: "/text-case-converter",
    category: "Text",
    status: "experimental",
  },
  {
    id: "color-palette-extractor",
    name: "Color Palette Extractor",
    shortDescription:
      "Extract dominant colors from any image and copy their codes.",
    slug: "/color-palette-extractor",
    category: "Images",
    status: "experimental",
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    shortDescription: "Generate favicon-ready icons in multiple sizes.",
    slug: "/favicon-generator",
    category: "Images",
    status: "experimental",
  },
  {
    id: "image-filters",
    name: "Image Filters",
    shortDescription:
      "Apply visual filters like blur, contrast, and grayscale.",
    slug: "/image-filters",
    category: "Images",
    status: "experimental",
  },
];
