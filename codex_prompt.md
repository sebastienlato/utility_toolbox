# Codex Prompt — Utility Toolbox

You are Codex working inside an existing **React + Vite + Tailwind + TypeScript** project named **Utility Toolbox**.

The user controls the repo, Git history, and `plan.md`.  
Your job is to implement features **phase-by-phase**, in small, reviewable chunks.

---

## 1. Context & Hard Constraints

- The project has **already** been created by the user.
- Do **NOT**:
  - Recreate or reinitialize the project.
  - Run scaffolding commands (`npm create vite@latest`, `pnpm create`, etc.).
  - Initialize Tailwind or replace Vite/Tailwind configs.
  - Overwrite global configs unless the user explicitly asks.
- You _may_:
  - Add lightweight dependencies required for features in `plan.md`.
  - Add minimal config needed for those dependencies.

**Language:**  
Use **TypeScript** unless the repo clearly uses `.jsx`/`.js`.

---

## 2. Sources of Truth

Codex must strictly follow:

- `plan.md` → **Phase-by-phase roadmap**
- `architecture.md` → **Folder structure + naming conventions**
- `toolRegistry.ts` → **List of tools, routes, metadata**

Do **NOT** modify `plan.md` or `codex_prompt.md` unless explicitly told.

When `plan.md` is ambiguous:

- Make a reasonable assumption.
- State it clearly.

---

## 3. Workflow Rules (Super Important)

### For _every_ phase:

#### 1. Restate phase scope

At the top of the response:

> “Phase X — Doing Y (according to plan.md)”

#### 2. Implement ONLY that phase

No sneak-ahead.  
No extra refactors.  
No future features.

#### 3. After implementation, ALWAYS provide:

### **A. File-by-file summary**

Example:

```txt
- src/features/tools/ImageRenamer/ImageRenamerPage.tsx:1-210 – added full UI (upload, form, preview, downloads)
- src/features/tools/ImageRenamer/useImageRenamer.ts:1-140 – added core rename logic, cleanup, and helpers
```

### **B. Meaningful diff snippets**

Only relevant snippets, never whole files.

### **C. A ready Git block**

Always in this format:

```bash
git add .
git commit -m "feat: phase X — short summary"   -m "  - bullet 1"   -m "  - bullet 2"   -m "  - bullet 3"
git push
```

### **D. Stop and wait**

End every phase with:

> “Phase X is complete.  
> When you’re ready, I can continue with Phase Y — [name].”

Never proceed without user confirmation.

---

## 4. Architecture Rules

Follow `architecture.md` exactly.

### The structure:

```txt
src/
  main.tsx
  App.tsx

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

      ImageCompressor/
        ImageCompressorPage.tsx

      ImageFormatConverter/
        ImageFormatConverterPage.tsx

      PdfTools/
        PdfToolsPage.tsx

      TextCaseConverter/
        TextCaseConverterPage.tsx
        textCaseUtils.ts

      ColorPaletteExtractor/
        ColorPaletteExtractorPage.tsx

      FaviconGenerator/
        FaviconGeneratorPage.tsx

      ImageFilters/
        ImageFiltersPage.tsx

  services/
    backgroundRemovalService.ts
    imageResizeService.ts
    imageCompressorService.ts
    imageFormatService.ts
    pdfToolsService.ts
    colorPaletteService.ts
    imageFiltersService.ts

  styles/
    index.css
```

### Routing rules:

All routes must exist in `<App />` using:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/background-removal" element={<BackgroundRemovalPage />} />
  <Route path="/image-renamer" element={<ImageRenamerPage />} />
  <Route path="/image-resizer" element={<ImageResizerPage />} />
  <Route path="/qr-code-generator" element={<QrCodeGeneratorPage />} />

  <Route path="/image-compressor" element={<ImageCompressorPage />} />
  <Route
    path="/image-format-converter"
    element={<ImageFormatConverterPage />}
  />
  <Route path="/pdf-tools" element={<PdfToolsPage />} />
  <Route path="/text-case-converter" element={<TextCaseConverterPage />} />
  <Route
    path="/color-palette-extractor"
    element={<ColorPaletteExtractorPage />}
  />
  <Route path="/favicon-generator" element={<FaviconGeneratorPage />} />
  <Route path="/image-filters" element={<ImageFiltersPage />} />
</Routes>
```

---

## 5. UI & Theme Rules

- Use Tailwind exclusively.
- The global theme is **dark monochrome / shadcn-inspired**.
- Reuse:
  - glass-card surfaces
  - soft borders
  - subtle shadows
  - radial gradients
  - smooth transitions
- Inputs must have:
  - `focus-visible:ring`
  - rounded-md or rounded-lg
  - good contrast

Tool pages must all follow the same pattern:

- PageHeader at the top
- glass-card panel for the main tool UI
- responsive layout
- consistent spacing

---

## 6. Tool Behavior (High-level)

### Background Removal

- Use the existing color-key method unless user chooses ML mode (future).
- Must show:
  - drag/drop uploader
  - original preview
  - processed preview
  - download button

### Image Renamer

- Multi-file upload
- Pattern form (base name, index, delimiter)
- Preview table (original → new)
- Download all
- Remove/cancel items

### Image Resizer

- Canvas resize
- Width/height
- Preserve aspect ratio
- Output format select
- Before/after info

### QR Code Generator

- Text input + options
- Size + error correction
- Download PNG + SVG
- Logo overlay support

### Image Compressor

- Quality slider (0–100)
- Show before/after size
- Download result

### Image Format Converter

- Convert between JPG/PNG/WebP/SVG (when valid)
- Batch support

### PDF Tools

- Merge PDFs
- Extract pages
- Compress (basic)
- Preview thumbnails

### Text Case Converter

- Uppercase, lowercase, title case, sentence case
- Clear and copy buttons

### Color Palette Extractor

- Upload image
- Extract dominant colors
- Show HEX/RGB
- Copy buttons

### Favicon Generator

- Upload image/logo
- Generate different sizes
- Export zip

### Image Filters

- Apply: grayscale, sepia, blur, brightness, contrast
- Compare before/after

---

## 7. If You Get Stuck

If anything does not match plan.md or conflicts with existing code:

- Stop immediately.
- Explain the issue clearly.
- Offer 1–2 possible solutions.
- Wait for user confirmation.

---

You must follow all rules above for every phase.
