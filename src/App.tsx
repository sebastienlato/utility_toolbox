import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./features/home/HomePage";
import BackgroundRemovalPage from "./features/tools/BackgroundRemoval/BackgroundRemovalPage";
import ImageRenamerPage from "./features/tools/ImageRenamer/ImageRenamerPage";
import ImageResizerPage from "./features/tools/ImageResizer/ImageResizerPage";
import QrCodeGeneratorPage from "./features/tools/QrCodeGenerator/QrCodeGeneratorPage";

const App = () => {
  return (
    <div className="app-shell flex min-h-screen flex-col text-slate-100">
      <header className="border-b border-white/10 px-6 py-4 backdrop-blur">
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 ml-10 focus-ring"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15 text-xs font-semibold text-emerald-300 transition group-hover:border-emerald-400/70 group-hover:text-white">
              UT
            </div>
            <span className="sr-only">Go to Useful Tools home</span>
          </Link>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 text-3xl font-bold tracking-wide text-white transition hover:text-emerald-300 focus-ring"
          >
            Useful Tools
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
        </Routes>
      </main>

      <footer className="border-t border-white/10 px-6 py-4 text-center text-sm text-slate-400 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl">
          Built with React, Vite, and Tailwind — LatoDev ©{" "}
          {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default App;
