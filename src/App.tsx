import { Link, NavLink, Route, Routes } from 'react-router-dom'
import HomePage from './features/home/HomePage'
import BackgroundRemovalPage from './features/tools/BackgroundRemoval/BackgroundRemovalPage'
import ImageRenamerPage from './features/tools/ImageRenamer/ImageRenamerPage'
import ImageResizerPage from './features/tools/ImageResizer/ImageResizerPage'
import QrCodeGeneratorPage from './features/tools/QrCodeGenerator/QrCodeGeneratorPage'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/background-removal', label: 'Background Removal' },
  { to: '/image-renamer', label: 'Image Renamer' },
  { to: '/image-resizer', label: 'Image Resizer' },
  { to: '/qr-code-generator', label: 'QR Code Generator' },
]

const App = () => {
  return (
    <div className="app-shell flex min-h-screen flex-col text-slate-100">
      <header className="border-b border-white/10 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="text-2xl font-semibold tracking-tight text-white focus-ring">
            Useful Tools
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'focus-ring rounded-full border px-4 py-1 text-sm transition-all duration-200',
                    isActive
                      ? 'border-emerald-400/60 bg-emerald-400/15 text-white shadow-lg shadow-emerald-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:text-white',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/background-removal" element={<BackgroundRemovalPage />} />
          <Route path="/image-renamer" element={<ImageRenamerPage />} />
          <Route path="/image-resizer" element={<ImageResizerPage />} />
          <Route path="/qr-code-generator" element={<QrCodeGeneratorPage />} />
        </Routes>
      </main>

      <footer className="border-t border-white/10 px-6 py-4 text-center text-sm text-slate-400 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl">
          Built with React, Vite, and Tailwind — © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}

export default App
