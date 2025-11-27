import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./features/home/HomePage";
import BackgroundRemovalPage from "./features/tools/BackgroundRemoval/BackgroundRemovalPage";
import ColorPaletteExtractorPage from "./features/tools/ColorPaletteExtractor/ColorPaletteExtractorPage";
import ImageCompressorPage from "./features/tools/ImageCompressor/ImageCompressorPage";
import ImageFormatConverterPage from "./features/tools/ImageFormatConverter/ImageFormatConverterPage";
import ImageRenamerPage from "./features/tools/ImageRenamer/ImageRenamerPage";
import ImageResizerPage from "./features/tools/ImageResizer/ImageResizerPage";
import FaviconGeneratorPage from "./features/tools/FaviconGenerator/FaviconGeneratorPage";
import ImageFiltersPage from "./features/tools/ImageFilters/ImageFiltersPage";
import PdfToolsPage from "./features/tools/PdfTools/PdfToolsPage";
import QrCodeGeneratorPage from "./features/tools/QrCodeGenerator/QrCodeGeneratorPage";
import TextCaseConverterPage from "./features/tools/TextCaseConverter/TextCaseConverterPage";

const App = () => {
  return (
    <div className="app-shell flex min-h-screen flex-col text-zinc-100">
      <header className="border-b border-neutral-900/70 bg-black/80 px-6 py-4 backdrop-blur-sm">
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between">
          <Link
            to="/"
            className="group ml-10 flex items-center gap-2 focus-ring"
          >
            <span className="sr-only">Go to Utility Toolbox home</span>
          </Link>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 text-5xl font-bold tracking-wide text-neutral-200 transition hover:text-white focus-ring"
          >
            Utility Toolbox
          </Link>

          <div className="w-8" aria-hidden />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/background-removal"
            element={<BackgroundRemovalPage />}
          />
          <Route path="/image-renamer" element={<ImageRenamerPage />} />
          <Route path="/image-resizer" element={<ImageResizerPage />} />
          <Route path="/qr-code-generator" element={<QrCodeGeneratorPage />} />
          <Route path="/image-compressor" element={<ImageCompressorPage />} />
          <Route
            path="/image-format-converter"
            element={<ImageFormatConverterPage />}
          />
          <Route path="/pdf-tools" element={<PdfToolsPage />} />
          <Route
            path="/text-case-converter"
            element={<TextCaseConverterPage />}
          />
          <Route
            path="/color-palette-extractor"
            element={<ColorPaletteExtractorPage />}
          />
          <Route path="/favicon-generator" element={<FaviconGeneratorPage />} />
          <Route path="/image-filters" element={<ImageFiltersPage />} />
        </Routes>
      </main>

      <footer className="border-t border-neutral-900/70 bg-black/70 px-6 py-4 text-center text-sm text-zinc-500 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-6xl">
          Utility Toolbox — built with React, Vite, and Tailwind by LatoDev ©{" "}
          {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default App;
