import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './lib/auth'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <ScrollToTop />
          <App />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
