# Useful Tools

Useful Tools is a Vite + React + Tailwind SPA that bundles four production-ready utilities:

- **Background Removal** — drag & drop images, preview the original and processed output (mocked service today, API-ready).
- **Image Renamer** — batch rename files with patterns, folder uploads, and optional PNG/JPEG conversion.
- **Image Resizer** — resize one or many images client-side with canvas, dimension controls, and download links.
- **QR Code Generator** — type URLs or text, tweak size/error correction, preview, and download/copy the QR.

## Getting Started

```bash
# install dependencies
npm install

# run the Vite dev server
npm run dev

# type-check + build production assets
npm run build
```

Tailwind is auto-imported via `src/index.css`, and the dev server is available at `http://localhost:5173`.

## Tools at a Glance

- **Home Hub (`/`)** – lists all tools using the shared registry so new additions appear automatically.
- **Background Removal (`/background-removal`)** – upload + preview UI with loading/error states and download button; swap in a real API later.
- **Image Renamer (`/image-renamer`)** – drop files or folders, tweak base name/index/delimiter/output format, preview original → new names, download individually or all.
- **Image Resizer (`/image-resizer`)** – queue images, set width/height, preserve aspect ratio, pick PNG/JPEG, and download resized results with size summaries.
- **QR Code Generator (`/qr-code-generator`)** – text/URL input, size + error correction controls, live QR preview, download PNG, copy input.

Each tool lives under `src/features/tools/*`, and shared UI (buttons, cards, headers) sits in `src/components/`.
