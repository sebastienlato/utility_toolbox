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
];
