import { useState, useCallback, createContext, useContext } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import Gallery from './components/Gallery'
import About from './components/About'
import Admin from './components/Admin'
import Upload from './components/Upload'
import ViewerPage from './components/ViewerPage'
import ToastProvider from './components/Toast'

// ── Page State Machine ──
// Replaces React Router. 6 pages, no URL routing complexity.

export type Page =
  | { route: 'home' }
  | { route: 'gallery' }
  | { route: 'about' }
  | { route: 'viewer'; modelId: string; edit?: boolean }
  | { route: 'upload' }
  | { route: 'admin' }

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
    case 'upload': return <Upload />
    case 'admin': return <Admin />
  }
}
