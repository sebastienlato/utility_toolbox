# Useful Tools — Architecture

This document defines the structure, conventions, and patterns used across the **Useful Tools** project.

It covers:

- Project folder conventions
- Tool architecture
- Shared components
- Services and utilities
- How to add new tools

---

# 1. Tech Stack

- **React** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **React Router**
- **HTML Canvas APIs** (image processing)
- Optional libraries:
  - `qrcode.react`
  - Compression utilities
  - Color extraction utilities

---

# 2. Project Structure

Target structure:

```
src/
  main.tsx
  App.tsx
  index.css

  components/
    PageHeader.tsx
    PrimaryButton.tsx
    ToolCard.tsx
    InputField.tsx
    SelectField.tsx
    DropZone.tsx

  layout/
    AppLayout.tsx
    Header.tsx
    Footer.tsx

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
        imageResizeService.ts

      QrCodeGenerator/
        QrCodeGeneratorPage.tsx

      FileCompressor/
        FileCompressorPage.tsx
        fileCompressorService.ts

      ColorPaletteExtractor/
        ColorPaletteExtractorPage.tsx
        colorPaletteService.ts

      ImageWatermarker/
        ImageWatermarkerPage.tsx
        watermarkService.ts

      TextCaseConverter/
        TextCaseConverterPage.tsx

      UUIDGenerator/
        UUIDGeneratorPage.tsx

      PasswordGenerator/
        PasswordGeneratorPage.tsx

      JsonFormatter/
        JsonFormatterPage.tsx

      SvgOptimizer/
        SvgOptimizerPage.tsx
        svgOptimizerService.ts
```

---

# 3. Tool Registry

All tools must be declared in:

`src/features/tools/toolRegistry.ts`

Each entry:

```ts
{
  id: "image-resizer",
  name: "Image Resizer",
  slug: "/image-resizer",
  shortDescription: "Resize images on the client.",
  category: "Images",
  status: "stable"
}
```

This registry fuels:

- Home page card list
- Future sidebar navigation (if added)
- CLI-based automation

---

# 4. Tool Page Conventions

Every tool follows:

```
ToolName/
  ToolNamePage.tsx
  optionalHook.ts
  optionalService.ts
```

Each Page must include:

- `<PageHeader />`
- A main panel using the **glass-card** style
- Inputs on the left (mobile: top)
- Preview / output on the right (mobile: bottom)
- Clear empty / error states
- Copy / download / export buttons

---

# 5. Shared UI Components

### `PageHeader`

- Tool title & description banner

### `PrimaryButton`

- Standard CTA button (blue/emerald by theme)

### `ToolCard`

- Display tool metadata on the Home page

### `DropZone`

- Drag & drop + click-to-upload panel
- Used across:
  - Background removal
  - Resizer
  - Renamer
  - Watermarker
  - Palette extractor

---

# 6. Services

Services are always:

- Framework-free (no React inside)
- Pure async logic
- Reusable across tools if needed

Examples:

- `backgroundRemovalService.ts`
- `imageResizeService.ts`
- `fileCompressorService.ts`
- `watermarkService.ts`
- `colorPaletteService.ts`

Each service should:

- Accept input(s)
- Return a structured result object
- Handle errors gracefully
- Export clear & typed functions

---

# 7. Adding a New Tool (Step-by-Step)

### 1. Make a new folder

```
src/features/tools/MyNewTool/
  MyNewToolPage.tsx
```

### 2. Add a route entry in App.tsx

```
<Route path="/my-new-tool" element={<MyNewToolPage />} />
```

### 3. Add a registry entry

In `toolRegistry.ts`:

```ts
tools.push({
  id: "my-new-tool",
  name: "My New Tool",
  slug: "/my-new-tool",
  shortDescription: "Describe what it does.",
  category: "Utilities",
  status: "beta",
});
```

### 4. (Optional) Add a service file

If tool requires computation:

```
src/features/tools/MyNewTool/myNewToolService.ts
```

### 5. (Optional) Add hook

If tool requires complex state:

```
useMyNewTool.ts
```

---

# 8. Design System Guidelines

### Theme

- Monochrome dark (shadcn-like)
- subtle gradients
- glass panels (backdrop-blur + border-white/10)

### Responsive Behavior

- 1 column on mobile
- 2–3 columns on desktop
- Flexible card grids

### Interaction Rules

- Hover lift on cards
- Clear focus rings
- Smooth transitions
- Disabled state visuals

---

# 9. TODO: Future Tools

- Image Compressor (advanced)
- Video Tools
- Markdown Tools
- AI-powered Text Tools

---

# End of Architecture
