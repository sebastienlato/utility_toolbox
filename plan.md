# Useful Tools — Delivery Plan

A React + Vite + Tailwind **tool hub** called **“Useful Tools”**.

- You (Codex) are working **inside an already-created Vite + Tailwind project**.
- **Do not** create or re-create the project, Vite config, Tailwind config, or package.json from scratch.
- Detect whether the project uses **TypeScript or JavaScript** from existing files and remain consistent.
- Follow phases in order, and stop after each phase once the ‘Stop after’ conditions are met.

The app should:

- Show a **homepage** that lists tools as polished cards:
  - Background removal
  - Image renamer
  - Image resizer
  - QR code generator
- Provide a **dedicated page for each tool** with professional, modern UI.
- Make it **easy to add new tools** later (single source of truth for tool metadata).
- Use **React Router** for navigation.

Use **Tailwind CSS** for all styling.

---

## Phase 0 — Lightweight Setup & Dependencies

**Goal:** Check the existing project structure and add only what’s needed.

**Tasks:**

- Inspect the current `src/` structure and confirm:
  - Entry files (`main.(tsx|jsx)`, `App.(tsx|jsx)`).
  - Tailwind is wired (e.g., `index.css` imports Tailwind layers).
- Ensure we have these dependencies (if not, add them):
  - `react-router-dom`
  - `qrcode.react` (or equivalent QR lib)
- Do **not** change the project’s tooling (no new Vite/Tailwind setup).

**Stop after:**

- Dependencies added (if needed).
- A short note summarizing what you changed.
- A suggested multi-line commit message.

---

## Phase 1 — App Shell & Routing

**Goal:** Create a clean layout and page routing.

**Tasks:**

- Add a simple **layout shell**:
  - Top navigation bar with logo/title **Useful Tools**.
  - Space for page content.
  - Optional subtle footer.
- Integrate **React Router** with routes like:
  - `/` → Home (tool hub)
  - `/background-removal`
  - `/image-renamer`
  - `/image-resizer`
  - `/qr-code-generator`
- Put route components under a clear structure (see `architecture.md`), e.g.:
  - `src/features/tools/BackgroundRemoval/BackgroundRemovalPage.(tsx|jsx)`
  - etc.

**Design notes:**

- Use a **dark, modern, slightly glassy** look with Tailwind (no inline styles).
- Make the layout responsive and centered, with max-width for content.

**Stop after:**

- Layout shell + navigation.
- Routing wired with placeholder pages that just render the tool name.
- Suggested commit message.

---

## Phase 2 — Home Tool Hub Page

**Goal:** Build a Home page that showcases all tools.

### Tasks

- Build a Home page that:

  - Imports the tool registry.
  - Renders cards for each tool with:
    - Title
    - Short description
    - Badge
    - Status pill
  - Includes an **“Open tool”** button linking to each tool’s route.
  - Looks polished and responsive:
    - 2–3 column grid on desktop
    - 1 column on mobile

- Create reusable UI components (in `src/components`), for example:
  - `ToolCard`
  - `PrimaryButton`
  - `PageHeader`

### Stop after

- Home page shows all four tools as attractive cards.
- Tool registry is used as the single source of truth.
- A **suggested commit message** is provided.

---

## Phase 3 — Background Removal Tool (UI-first)

**Goal:** Build a professional, API-ready background removal page.

### Tasks

- Implement `BackgroundRemovalPage` with:

  - Drag & drop + click-to-upload area for image.
  - Preview of the original image.
  - Placeholder/preview for the “removed background” result.
  - Clear loading / empty / error states.

- Create a `backgroundRemovalService` in `src/services/backgroundRemovalService.(ts|js)`:

  - For now, **stub** the implementation:
    - Accept a `File` or `Blob`.
    - Return a mocked “processed” image (e.g., echo the original image).
    - Expose a clear function that could later call a real API using an env var (document this with comments).

- Make the UI feel real:
  - Show progress indicators or skeletons during “processing”.
  - Provide a **Download** button for the “result” (even if stubbed).

### Notes

- Focus on clean architecture:
  - The UI calls the service.
  - The service handles async logic.
- Prepare clear `TODO` comments where a real API would plug in.

### Stop after

- Fully functional UI (even if logic is stubbed).
- Service abstraction added.
- A **suggested commit message** is provided.

---

## Phase 4 — Image Renamer Tool

**Goal:** Upload images, configure naming, and download with new names.

### Tasks

- Implement `ImageRenamerPage` with:

  - Multi-file upload of images.
  - A form to configure naming pattern:
    - Base name (e.g., `holiday-photo`).
    - Starting index (e.g., `1`).
    - Optional delimiter (e.g., `-` → `holiday-photo-01.jpg`).

- Show a list / table of uploaded images:

  - Original name.
  - Preview thumbnail.
  - New name based on pattern.

- Provide the ability to:

  - Download individual images with the new filename.
  - (Optional) **“Download all”**:
    - Simple loop of download links, or
    - Zip stub if practical.

- Encapsulate logic in a small helper or hook, e.g. `useImageRenamer`.

### UX

- Clear instructions and validation.
- Disabled actions when no files are selected.
- Empty and error states.

### Stop after

- Image renaming flow is usable and intuitive.
- A **suggested commit message** is provided.

---

## Phase 5 — Image Resizer Tool

**Goal:** Resize images client-side and download the resized output.

### Tasks

- Implement `ImageResizerPage` with:

  - Image upload (single or multiple).
  - Controls for:
    - Target width and/or height.
    - Option to **Preserve aspect ratio**.
    - Output format selection (e.g., `PNG`, `JPEG`).

- Canvas-based client-side resize:

  - Use an HTML `<canvas>` to resize.
  - Export the resized image as a `Blob` / Data URL and attach to a download link.

- Preview:

  - Show before/after size information:
    - Original vs resized dimensions.
    - File size if easy.

- Encapsulate resizing logic in a reusable helper (e.g. `imageResizeService`).

### Stop after

- Basic resize flow works for at least a single image.
- UI is responsive and polished.
- A **suggested commit message** is provided.

---

## Phase 6 — QR Code Generator Tool

**Goal:** Generate and download QR codes.

### Tasks

- Implement `QrCodeGeneratorPage` with:

  - Text/URL input field.
  - Options for:
    - Size.
    - Error correction level (basic).

- Generate QR code using `qrcode.react` (or similar).

- Provide the ability to:

  - Download QR code as PNG.
  - Copy the content to clipboard.

- Include validation:
  - Warn on empty input.
  - Optional helper message for URLs (e.g. ensure `https://` prefix).

### Stop after

- QR code generation and download are working.
- A **suggested commit message** is provided.

---

## Phase 7 — Visual Polish & Accessibility

**Goal:** Make everything feel cohesive, accessible, and ready to show.

### Tasks

- Centralize core Tailwind styles / design tokens:

  - Background, foreground, accent colors.
  - Typography scale.
  - Card shadows and radii.

- Ensure the layout looks good on:

  - Mobile.
  - Tablet.
  - Desktop.

- Accessibility:

  - Sensible headings (`h1` for page title, etc.).
  - Clear focus states for interactive elements.
  - Sufficient color contrast.

- Add small hover states and micro-interactions:
  - Card hover lift.
  - Button hover/active/focus states.

### Stop after

- UI feels cohesive and polished.
- A **suggested commit message** is provided.

---

## Phase 8 — Documentation & “Add New Tool” Guide

**Goal:** Document how to work with and extend the app.

### Tasks

- Update `README.md` with:

  - Project description.
  - How to run dev/build.
  - Short description of each tool.

- In `architecture.md`:

  - Confirm folder structure.
  - Document how to add a new tool:
    - Add a new feature folder.
    - Add a new route.
    - Add an entry to the tool registry for Home page.

- Leave `TODO` markers for potential future tools (e.g., “Image compressor”, “Text tools”).

### Stop after

- Docs are updated and consistent with the implementation.
- A final **suggested commit message** is provided.

---

## Phase 9 — Image Compressor Tool

**Goal:** Compress images client-side to reduce file size while preserving acceptable quality.

### Tasks

- Add a new route and page:

  - Route: `/image-compressor`.
  - Page component: `ImageCompressorPage` under `src/features/tools/ImageCompressor/ImageCompressorPage.(tsx|jsx)`.

- Implement `ImageCompressorPage` with:

  - Multi-file upload of images.
  - Controls for:
    - Target quality (`0.1–1.0` range for JPEG/WebP).
    - Optional maximum width/height (reusing logic from the resizer if helpful).
    - Output format (at least `JPEG` and `WEBP`, fallback to original if unsupported).
  - A queue/list view showing:
    - Original file name and size.
    - Estimated or actual compressed size (after processing).
  - Per-item actions:
    - “Compress” or “Compress all”.
    - “Download” compressed image.
    - “Remove” from queue.
  - Global actions:
    - “Clear all”.
    - (Optional) “Download all compressed” (simple loop over links).

- Create a compression helper/service, e.g.:

  - `src/services/imageCompressorService.(ts|js)` or
  - A local helper in `ImageCompressor` feature.

  The service should:

  - Use `<canvas>` to re-encode images in a lossy format (JPEG/WEBP) using `toDataURL` or `toBlob` with a quality parameter.
  - Return compressed `Blob`s plus metadata (size, mime type).

- UX:

  - Show progress/loading states while compressing.
  - Disable compression actions when no files are selected.
  - Handle errors gracefully (e.g. unsupported formats).

### Stop after

- Users can load several images, tweak compression settings, and download noticeably smaller files.
- A **suggested commit message** is provided.

---

## Phase 10 — Image Format Converter Tool

**Goal:** Convert images between common formats (PNG, JPEG, WEBP) client-side.

### Tasks

- Add a new route and page:

  - Route: `/image-format-converter`.
  - Page: `ImageFormatConverterPage` in `src/features/tools/ImageFormatConverter/ImageFormatConverterPage.(tsx|jsx)`.

- Implement `ImageFormatConverterPage` with:

  - Multi-file upload of images.
  - A simple control to choose **output format**:
    - `PNG`, `JPEG`, `WEBP` (as supported by the browser).
  - Optional quality slider when converting to JPEG/WEBP.
  - A results list showing:
    - Original file name, type, size.
    - New type and size (after conversion).
  - Actions:
    - Convert individual item.
    - Convert all.
    - Download individual converted files.
    - (Optional) “Download all converted”.

- Implement a small conversion helper/service, e.g.:

  - `src/services/imageFormatService.(ts|js)`.

  The service should:

  - Take an input file, desired target format, and optional quality.
  - Use `<canvas>` to render and export to the requested format.
  - Return a `Blob` + object URL.

### Stop after

- Format conversion works reliably for at least PNG/JPEG/WEBP.
- UI is consistent with other tools.
- A **suggested commit message** is provided.

---

## Phase 11 — PDF Tools (Merge & Basic Compress)

**Goal:** Provide a simple PDF utilities page, starting with **PDF merge** and optional basic compression.

### Tasks

- Add a new route and page:

  - Route: `/pdf-tools`.
  - Page: `PdfToolsPage` under `src/features/tools/PdfTools/PdfToolsPage.(tsx|jsx)`.

- Use a lightweight client-side library such as `pdf-lib` (or similar) if available:

  - If adding a dependency, document it in `README.md`.
  - Keep the implementation minimal and focused on merge.

- Implement `PdfToolsPage` with:

  - Upload area for multiple PDFs (and optionally images to convert to a PDF).
  - A list of files with:
    - File name.
    - Size.
    - Drag-and-drop reordering to control merge order (if reasonable).
  - Controls:
    - “Merge PDFs” (creates a single merged PDF).
    - (Optional) “Basic compress” toggle if the library supports it or by downscaling embedded images.

- Output:

  - Provide a download for the merged PDF.
  - Show resulting size.

### Stop after

- Multiple PDFs can be merged into a single downloadable file.
- Any compression logic is clearly documented or marked as TODO.
- A **suggested commit message** is provided.

---

## Phase 12 — Text Case Converter Tool

**Goal:** Provide a simple but powerful text-case transformer for common developer/writer needs.

### Tasks

- Add a new route and page:

  - Route: `/text-case-converter`.
  - Page: `TextCaseConverterPage` in `src/features/tools/TextCaseConverter/TextCaseConverterPage.(tsx|jsx)`.

- Implement `TextCaseConverterPage` with:

  - A large textarea for input text.
  - A set of buttons or a select for transformations:
    - `lowercase`
    - `UPPERCASE`
    - `Title Case`
    - `Sentence case`
    - `snake_case`
    - `kebab-case`
    - `camelCase`
    - `PascalCase`
  - Read-only output display with:
    - “Copy result” button.
    - Optional “Swap input with output” button.

- Implement transformation logic in a small pure helper, e.g.:

  - `src/features/tools/TextCaseConverter/textCaseUtils.(ts|js)`.

### Stop after

- All listed text-case conversions behave correctly on typical strings.
- The tool feels instant and responsive.
- A **suggested commit message** is provided.

---

## Phase 13 — Color Palette Extractor Tool

**Goal:** Extract a color palette from an uploaded image and present usable hex values.

### Tasks

- Add a new route and page:

  - Route: `/color-palette-extractor`.
  - Page: `ColorPaletteExtractorPage` in `src/features/tools/ColorPaletteExtractor/ColorPaletteExtractorPage.(tsx|jsx)`.

- Implementation:

  - Allow single-image upload.
  - Use either:
    - A small color extraction library (e.g. `color-thief`-style), or
    - Custom canvas-based sampling (downscale image, cluster colors with a simple algorithm).

- UI:

  - Show the original image preview.
  - Display a grid of extracted colors (e.g. top 5–10).
  - For each color:
    - Show a color swatch.
    - Display hex and RGB values.
    - Provide a “Copy hex” button.

- Options:

  - Let users choose how many colors to extract (e.g. 5, 8, 10).

### Stop after

- Given an input image, the tool shows a reasonable palette with copyable values.
- A **suggested commit message** is provided.

---

## Phase 14 — Favicon / ICO Generator Tool

**Goal:** Generate favicon-ready assets from an uploaded square image.

### Tasks

- Add a new route and page:

  - Route: `/favicon-generator`.
  - Page: `FaviconGeneratorPage` in `src/features/tools/FaviconGenerator/FaviconGeneratorPage.(tsx|jsx)`.

- Implement `FaviconGeneratorPage` with:

  - Single-image upload (recommend square PNG/JPEG/SVG for best results).
  - A set of target sizes (checkboxes or fixed list):
    - 16×16
    - 32×32
    - 48×48
    - 64×64
    - 128×128
    - 180×180
    - 256×256
    - 512×512
  - Use `<canvas>` to resize the image to each selected size.

- Output options:

  - Download individual PNGs per size.
  - (Optional) Bundle all PNGs into a `.zip` using a lightweight zip library.
  - (Optional) Provide a basic `.ico` file if feasible, or leave as a TODO with notes.

### Stop after

- Users can upload an image and download at least multiple favicon PNG sizes.
- A **suggested commit message** is provided.

---

## Phase 15 — Image Filters & Blur Tool

**Goal:** Apply simple effects (blur and other filters) to images client-side and export the result.

### Tasks

- Add a new route and page:

  - Route: `/image-filters`.
  - Page: `ImageFiltersPage` in `src/features/tools/ImageFilters/ImageFiltersPage.(tsx|jsx)`.

- Implement `ImageFiltersPage` with:

  - Single or multi-image upload.
  - Controls for filters (using either CSS filters on `<canvas>` drawing or manual pixel manipulation):
    - Blur
    - Brightness
    - Contrast
    - Saturation
    - Grayscale
  - Live preview:
    - Show original vs filtered image side by side, or with a toggle.

- Processing:

  - Use `<canvas>` to apply filters and export filtered images as PNG/JPEG.
  - Allow per-image “Apply & Download” button.

### Stop after

- Users can tweak filter sliders, see the changes, and download the filtered image.
- A **suggested commit message** is provided.
