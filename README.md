<p align="center">
  <img src="public/logo.png" alt="Useful Tools logo" width="120" />
</p>

<h1 align="center">Useful Tools</h1>

<p align="center">
  A Vite + React + TypeScript toolkit that bundles production-ready utilities for creatives and marketing teams.
</p>

## Overview

Useful Tools centralizes multiple image-focused workflows in a single responsive SPA. Each tool lives in its own feature module while sharing consistent UI primitives, routing, and service helpers. Ship background removal previews, batch renaming, client-side resizing, and QR code generation without hopping between apps.

## Feature Highlights

- **Home Hub (`/`)** – auto-discovers tools from the registry and surfaces descriptions, icons, and CTA links.
- **Background Removal (`/background-removal`)** – drag-and-drop uploads, show original vs. processed previews, progress states, and mocked API hooks.
- **Image Renamer (`/image-renamer`)** – batch rename files or folders with base name/index/delimiter controls plus optional format conversion.
- **Image Resizer (`/image-resizer`)** – resize queues of images on the client with canvas, aspect-ratio locking, and per-file download links.
- **QR Code Generator (`/qr-code-generator`)** – accepts URL/text input, tunes size/error correction, and offers PNG download or value copy.

## Screenshots

<div align="center">
  <img src="public/screenshots/screenshot1.png" alt="Useful Tools home" width="260" />
  <img src="public/screenshots/screenshot2.png" alt="Background removal" width="260" />
  <img src="public/screenshots/screenshot3.png" alt="Image renamer" width="260" />
</div>
<div align="center">
  <img src="public/screenshots/screenshot4.png" alt="Image resizer" width="260" />
  <img src="public/screenshots/screenshot5.png" alt="QR code generator" width="260" />
</div>

## Tech Stack

- Vite + React + TypeScript SPA bootstrapped through `src/main.tsx` and `src/App.tsx`.
- Tailwind CSS utilities loaded via `src/index.css` for rapid layout work.
- Module-scoped features inside `src/features/tools/*` with shared UI under `src/components/`.
- ESLint (flat config) keeps TS/JSX quality consistent.

## Project Structure

```text
src/
  components/        # shared buttons, layout blocks, and page sections
  features/tools/    # feature folders (background removal, renamer, resizer, QR)
  services/          # API helpers, registries, and cross-cutting logic
  main.tsx           # app bootstrap + router
  App.tsx            # layout and route definitions
public/
  logo.png
  screenshots/
```

## Getting Started

```bash
# install dependencies
npm install

# start the Vite dev server
npm run dev

# run type-check + optimized build
npm run build
```

Visit the dev server at `http://localhost:5173` and keep Tailwind classes scoped via `src/index.css`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Launch the Vite dev server with hot module replacement. |
| `npm run build` | Run TypeScript project references then emit the production bundle to `dist/`. |
| `npm run preview` | Serve the production build locally for sanity checks. |
| `npm run lint` | Run the flat ESLint config across all `ts/tsx` entries. |

## Development Notes

- Keep `architecture.md` synchronized when introducing new features or registry entries so the module boundaries stay clear.
- Co-locate future tests next to the code they cover using Vitest + React Testing Library (`ComponentName.test.tsx`).
- Tailwind utility combos that repeat should be promoted into `src/components/` or helper class strings for consistency.
