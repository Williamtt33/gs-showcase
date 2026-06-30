import { useState, useCallback, createContext, useContext, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import Gallery from './components/Gallery'
import About from './components/About'
import Admin from './components/Admin'
import Upload from './components/Upload'
import ViewerPage from './components/ViewerPage'
import LocalViewerPage from './components/LocalViewerPage'
import ToastProvider from './components/Toast'

// ── Page State Machine ──
// Replaces React Router. 6 pages, no URL routing complexity.

export type Page =
  | { route: 'home' }
  | { route: 'gallery' }
  | { route: 'about' }
  | { route: 'viewer'; modelId: string; edit?: boolean }
  | { route: 'localViewer' }
  | { route: 'upload' }
  | { route: 'admin' }

// Module-level storage for local file data (can't put File/ArrayBuffer in React state easily)
let localFileBuffer: ArrayBuffer | null = null
let localFileName = ''

export function setLocalFile(buffer: ArrayBuffer, name: string) {
  localFileBuffer = buffer
  localFileName = name
}

export function getLocalFile(): { buffer: ArrayBuffer; name: string } | null {
  if (!localFileBuffer) return null
  return { buffer: localFileBuffer!, name: localFileName }
}

interface PageCtxValue {
  page: Page
  go: (p: Page) => void
  back: () => void
}

const PageCtx = createContext<PageCtxValue>(null!)

export function usePage() {
  return useContext(PageCtx)
}

// Restore page from hash (e.g. #/viewer/shamian)
function pageFromHash(): Page {
  const hash = window.location.hash.replace('#', '')
  if (hash === '/local-viewer') return { route: 'localViewer' }
  if (hash.startsWith('/viewer/')) {
    const parts = hash.split('/')
    return { route: 'viewer', modelId: parts[2], edit: parts[3] === 'edit' }
  }
  if (hash === '/gallery') return { route: 'gallery' }
  if (hash === '/about') return { route: 'about' }
  if (hash === '/upload') return { route: 'upload' }
  if (hash === '/admin') return { route: 'admin' }
  return { route: 'home' }
}

function pageToHash(p: Page): string {
  switch (p.route) {
    case 'viewer': return `/viewer/${p.modelId}${p.edit ? '/edit' : ''}`
    case 'gallery': return '/gallery'
    case 'about': return '/about'
    case 'localViewer': return '/local-viewer'
    case 'upload': return '/upload'
    case 'admin': return '/admin'
    default: return ''
  }
}

export default function App() {
  const [history, setHistory] = useState<Page[]>(() => [pageFromHash()])

  const page = history[history.length - 1]

  const go = useCallback((p: Page) => {
    setHistory(prev => [...prev, p])
    window.location.hash = pageToHash(p)
  }, [])

  const back = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev
      const next = prev.slice(0, -1)
      window.location.hash = pageToHash(next[next.length - 1])
      return next
    })
  }, [])

  // Listen for browser back/forward (hashchange)
  useEffect(() => {
    const onHashChange = () => {
      const p = pageFromHash()
      setHistory(prev => {
        // If already at this page, don't push duplicate
        const last = prev[prev.length - 1]
        if (last.route === p.route && (last.route !== 'viewer' || (last as any).modelId === (p as any).modelId)) return prev
        return [...prev, p]
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page.route, (page as any).modelId])

  const isViewer = page.route === 'viewer'

  return (
    <PageCtx.Provider value={{ page, go, back }}>
      <ToastProvider>
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          {!isViewer && <Navbar />}
          <div style={{ flex: 1, paddingTop: isViewer ? 0 : 90 }}>
            <PageRenderer page={page} />
          </div>
          {!isViewer && <Footer />}
        </div>
      </ToastProvider>
    </PageCtx.Provider>
  )
}

function PageRenderer({ page }: { page: Page }) {
  switch (page.route) {
    case 'home': return <Home />
    case 'gallery': return <Gallery />
    case 'about': return <About />
    case 'viewer': return <ViewerPage modelId={page.modelId} edit={page.edit} />
    case 'localViewer': return <LocalViewerPage />
    case 'upload': return <Upload />
    case 'admin': return <Admin />
  }
}
