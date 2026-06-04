import { Routes, Route, useLocation } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Gallery from './pages/GalleryPage'
import Viewer from './pages/Viewer'
import Admin from './pages/Admin'
import UploadModel from './pages/UploadModel'
import EditModel from './pages/EditModel'
import NotFound from './pages/NotFound'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/viewer/:modelId" element={<Viewer />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/upload" element={<UploadModel />} />
      <Route path="/edit/:modelId" element={<EditModel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  const location = useLocation()
  const isViewer = location.pathname.startsWith('/viewer/') || location.pathname.startsWith('/edit/')

  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col">
        {!isViewer && <Navbar />}
        <div className="flex-1">
          <AnimatedRoutes />
        </div>
        {!isViewer && <Footer />}
      </div>
    </I18nProvider>
  )
}
