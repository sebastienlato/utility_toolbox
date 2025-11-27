<p align="center">
  <img src="public/logo.png" alt="Utility Toolbox logo" width="120" />
</p>

<h1 align="center">Utility Toolbox</h1>

<p align="center">
  A curated set of browser-based productivity tools for designers, developers, and content creators — all bundled in a single Vite + React SPA.
</p>

---

## Overview

Utility Toolbox brings together a dozen frequently used utilities (image helpers, PDF actions, text transformers, and more) inside a consistent dark UI. Everything runs in the browser, so uploads never leave your machine and results can be previewed instantly.

## Highlights

- **Modular tools:** Each feature is isolated inside its own folder plus entry in the shared registry.
- **Responsive UI:** Tailwind-driven layout with accessible focus states, glass panels, and light motion.
- **Client-side processing:** Image, text, and PDF actions are completed locally via the Canvas API and supporting libraries.
- **Zero backend setup:** Vite handles dev/prod builds, making it easy to deploy the generated static assets.

## Available Tools

| Tool | Category | Status | Description |
| --- | --- | --- | --- |
| Background Removal | Images | `beta` | Upload images and preview transparent cutouts. |
| Image Renamer | Productivity | `stable` | Batch rename photos with counters and custom patterns. |
| Image Resizer | Images | `stable` | Resize and optimize images while preserving aspect ratios. |
| QR Code Generator | Text | `stable` | Turn any URL or text into a downloadable QR code. |
| Image Compressor | Images | `experimental` | Reduce file sizes in-browser before sharing. |
| Image Format Converter | Images | `experimental` | Convert between PNG, JPEG, and WEBP formats. |
| PDF Tools | Documents | `experimental` | Merge PDFs client-side and export a combined file. |
| Text Case Converter | Text | `experimental` | Quickly switch casing (lower, upper, title, slug, etc.). |
| Color Palette Extractor | Images | `experimental` | Extract dominant colors from uploads and copy their codes. |
| Favicon Generator | Images | `experimental` | Create favicon-ready icons in multiple resolutions. |
| Image Filters | Images | `experimental` | Apply effects like blur, contrast, and grayscale. |

Refer to `src/features/tools/toolRegistry.ts` whenever you add or edit a tool so the home page and routes stay in sync.

## Tech Stack

- React 19 + React Router for UI and routing
- TypeScript with strict typing across pages, hooks, and services
- Vite 7 for lightning-fast dev server and optimized builds
- Tailwind CSS for utility-first styling
- Supporting libraries: `lucide-react`, `pdf-lib`, `qrcode.react`, and Canvas APIs

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app boots at `http://localhost:5173` with hot module reloading.

3. **Run quality checks**

   ```bash
   npm run lint
   npm run build
   npm run preview
   ```

   `npm run preview` serves the production build so you can smoke test before deploying.

## Project Structure

```
src/
  main.tsx           # Bootstraps React + Router
  App.tsx            # Shell layout and route definitions
  components/        # Shared UI such as buttons, cards, inputs
  services/          # Framework-free helpers (image + PDF logic)
  features/
    home/            # Landing grid and hero content
    tools/           # Individual tool folders + toolRegistry
public/
  logo.png
  screenshots/
```

Adding a new category or module? Mirror the change in `architecture.md` so the documented boundaries remain accurate.

## Screenshots

<table>
  <tr>
    <td><img src="public/screenshots/screenshot1.png" alt="Home view showcasing the tool grid" width="260" /></td>
    <td><img src="public/screenshots/screenshot2.png" alt="Background removal workflow" width="260" /></td>
    <td><img src="public/screenshots/screenshot3.png" alt="Image renamer configuration" width="260" /></td>
  </tr>
  <tr>
    <td><img src="public/screenshots/screenshot4.png" alt="QR code generator output" width="260" /></td>
    <td><img src="public/screenshots/screenshot5.png" alt="PDF tools interface" width="260" /></td>
    <td><img src="public/screenshots/screenshot6.png" alt="Color palette extractor results" width="260" /></td>
  </tr>
</table>

## Contributing

1. Fork or branch from `main`.
2. Build your tool inside `src/features/tools/YourTool`, adding optional hooks/services as needed.
3. Register the tool in `toolRegistry.ts`, add a `<Route />` entry in `App.tsx`, and update documentation if you introduce a new category.
4. Run `npm run lint`, `npm run build`, and `npm run preview` to ensure everything passes before opening a PR.

Screenshots or GIFs are encouraged for visual changes until automated tests are in place.
