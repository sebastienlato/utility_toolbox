# Useful Tools — Architecture

This document describes the structure of the **Useful Tools** app and how to extend it with new tools.

---

## Tech Stack

- **React** (Vite-based SPA)
- **Tailwind CSS** for styling
- **React Router** for navigation
- Optional:
  - `qrcode.react` for QR code generation
  - Canvas APIs for image resizing

The app is a single-page application: the homepage lists tools, and each tool has its own route/page.

---

## High-level Structure

Current structure:

```txt
src/
  main.tsx
  App.tsx
  index.css             # imports Tailwind + CSS tokens

  components/
    PageHeader.tsx
    PrimaryButton.tsx
    ToolCard.tsx

  features/
    home/
      HomePage.tsx

    tools/
      toolRegistry.ts

      BackgroundRemoval/
        BackgroundRemovalPage.tsx

      ImageRenamer/
        ImageRenamerPage.tsx
        useImageRenamer.ts

      ImageResizer/
        ImageResizerPage.tsx

      QrCodeGenerator/
        QrCodeGeneratorPage.tsx

  services/
    backgroundRemovalService.ts
    imageResizeService.ts
```

Routing is configured in `App.(tsx|jsx)` (or in a dedicated routes file) using `react-router-dom`.

## Tool Registry

The tool registry is a single source of truth for available tools.

Example:

```ts
// src/features/tools/toolRegistry.ts
export type ToolId =
  | "background-removal"
  | "image-renamer"
  | "image-resizer"
  | "qr-code-generator";

export type ToolMeta = {
  id: ToolId;
  name: string;
  slug: string; // route path
  shortDescription: string;
  category: string;
  status?: "stable" | "beta" | "experimental";
};

export const tools: ToolMeta[] = [
  {
    id: "background-removal",
    name: "Background Removal",
    slug: "/background-removal",
    shortDescription:
      "Upload an image and preview a background-removed result.",
    category: "Images",
    status: "beta",
  },
  {
    id: "image-renamer",
    name: "Image Renamer",
    slug: "/image-renamer",
    shortDescription: "Batch rename images with patterns and counters.",
    category: "Images",
    status: "stable",
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    slug: "/image-resizer",
    shortDescription:
      "Resize images client-side and download optimized versions.",
    category: "Images",
    status: "stable",
  },
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    slug: "/qr-code-generator",
    shortDescription: "Generate and download QR codes from any text or URL.",
    category: "Text",
    status: "stable",
  },
];
```

The Home page imports tools and renders them as cards.

## Layout & UI Components

### AppLayout

Wraps the entire app with:

- A header (site title, maybe a subtle tagline)
- A `<main>` region where routed pages render
- A footer with small text / links

### Header

- Displays **Useful Tools** as the brand/logo
- May include a link back to the Home page

### ToolCard

- Reusable card for the Home page
- Props: `name`, `description`, `badge`, `status`, `href`
- Styled with Tailwind for a modern glassy look (backdrop blur, gradients)

## Adding a New Tool

1. **Create a feature folder**

   ```
   src/features/tools/ImageCompressor/
     ImageCompressorPage.tsx
     useImageCompressor.ts (optional)
   ```

2. **Add the route**

   ```tsx
   import ImageCompressorPage from './features/tools/ImageCompressor/ImageCompressorPage'

   <Route path="/image-compressor" element={<ImageCompressorPage />} />
   ```

3. **Extend the registry (`src/features/tools/toolRegistry.ts`)**

   ```ts
   tools.push({
     id: 'image-compressor',
     name: 'Image Compressor',
     description: 'Reduce file sizes while keeping quality high.',
     path: '/image-compressor',
     category: 'Images',
     status: 'experimental',
   })
   ```

   The Home page imports `tools` and will automatically render a card with the metadata.

4. **Wire services if needed**

   - Add to `src/services/` (e.g., `imageCompressorService.ts`) or co-locate hooks in the feature folder.
   - Keep async logic inside services/hooks so pages stay declarative.

## TODOs / Future Tools

- TODO: Image Compressor (optimize size without resizes).
- TODO: Advanced Text utilities (slug generator, case converter).
- TODO: Batch watermarking tool.

Keep dependencies minimal

## Design & Theming

Tailwind is the primary styling tool

Define a consistent theme:

- background / foreground / accents
- card spacing + radii
- typography scale

Extract utility classes for:

- card shells
- primary/secondary buttons
- input fields

Ensures every tool feels consistent and cohesive.
