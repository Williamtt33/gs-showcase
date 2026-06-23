import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, AnimatePresence } from 'framer-motion'

const CUBIC = [0.22, 1, 0.36, 1] as const

export default function Navbar() {
  const { t, lang, toggleLang } = useI18n()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const contentLinks = [
    { to: '/', label: t.nav.home },
    { to: '/gallery', label: t.nav.gallery },
  ]

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: CUBIC }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center"
    >
      <div className="w-full flex justify-center px-3 sm:px-6 mt-3 sm:mt-4">
        <div
          className="navbar-glass rounded-2xl transition-all duration-700 ease-out relative"
          style={{
            width: scrolled ? '100%' : 'auto',
            maxWidth: scrolled ? 'min(1280px, 100%)' : 'min(720px, 100%)',
          }}
        >
          <div
            className={`relative flex items-center justify-between transition-all duration-500 ease-out ${
              scrolled ? 'h-11 sm:h-12 px-3 sm:px-5' : 'h-14 sm:h-16 px-4 sm:px-6'
            }`}
          >
            {/* ═══ Left: Brand — fixed width zone ═══ */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
              {/* Minimalist architectural silhouette icon */}
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'rgba(212,165,116,0.7)' }}
              >
                {/* Arch + pillar silhouette */}
                <path d="M4 20 L4 10 Q8 4 12 10 L12 20" />
                <path d="M20 20 L20 10 Q16 4 12 10" />
                <path d="M7 20 L7 12 Q9 8 12 12 L12 20" />
                <path d="M17 20 L17 12 Q15 8 12 12" />
              </svg>
              <span
                className={`font-medium tracking-[0.05em] transition-all duration-500 leading-none ${
                  scrolled ? 'text-[12px]' : 'text-[14px]'
                }`}
                style={{ color: 'rgba(232,224,213,0.8)' }}
              >
                墨韵
              </span>
            </Link>

            {/* ═══ Center: Content nav — absolutely centered ═══ */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {contentLinks.map((link) => {
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 sm:px-5 py-2 text-[13px] font-medium tracking-[0.04em] transition-all duration-400 ${
                      isActive
                        ? 'text-text-1'
                        : 'text-text-3/40 hover:text-text-3/70'
                    }`}
                  >
                    {/* Active indicator: glowing dot above */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-dot"
                        className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{
                          background: '#d4a574',
                          boxShadow: '0 0 6px rgba(212,165,116,0.5), 0 0 12px rgba(212,165,116,0.2)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* ═══ Right: System functions — flush right ═══ */}
            <div className="hidden md:flex items-center gap-4 sm:gap-5">
              <Link
                to="/admin"
                className={`text-[11px] font-medium tracking-[0.04em] transition-all duration-300 ${
                  location.pathname === '/admin'
                    ? 'text-text-2'
                    : 'text-text-3/30 hover:text-text-3/55'
                }`}
              >
                {t.nav.admin}
              </Link>
              <button
                onClick={toggleLang}
                className="text-[10px] font-medium tracking-[0.08em] uppercase transition-all duration-300 text-text-3/30 hover:text-text-3/55 font-mono"
              >
                {lang === 'zh' ? 'EN' : '中'}
              </button>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 -mr-2 text-text-3/40 hover:text-text-1 transition-colors ml-auto"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {mobileOpen
                  ? <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>
                  : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>
                }
              </svg>
            </button>
          </div>

          {/* Bottom glow separator line */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px rounded-full opacity-30"
            style={{
              width: '75%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(212,165,116,0.3) 20%, rgba(212,165,116,0.5) 50%, rgba(212,165,116,0.3) 80%, transparent 100%)',
            }}
          />
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: CUBIC }}
            className="md:hidden fixed top-[72px] left-3 right-3 max-w-lg mx-auto glass rounded-2xl overflow-hidden"
          >
            <nav className="px-1.5 py-2 space-y-0.5">
              {/* Content links */}
              {contentLinks.map(link => {
                const isActive = location.pathname === link.to
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-white/[0.06] text-text-1' : 'text-text-3/70 hover:text-text-2 hover:bg-white/[0.02]'
                    }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-1/60 shadow-[0_0_6px_rgba(212,165,116,0.4)]" />
                    )}
                    <span>{link.label}</span>
                  </Link>
                )
              })}
              <div className="h-px bg-border-1 mx-4 my-2" />
              {/* Admin link */}
              <Link to="/admin" onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/admin' ? 'bg-white/[0.06] text-text-2' : 'text-text-3/50 hover:text-text-2 hover:bg-white/[0.02]'
                }`}
              >
                <span>{t.nav.admin}</span>
              </Link>
              <button
                onClick={() => { toggleLang(); setMobileOpen(false) }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-text-3/50 hover:text-text-2 hover:bg-white/[0.02] transition-all font-mono tracking-wider"
              >
                {t.lang.switchTo}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
