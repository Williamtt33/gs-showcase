import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, AnimatePresence } from 'framer-motion'

const CUBIC = [0.22, 1, 0.36, 1] as const
const SCROLL_THRESHOLD = 10 // px — prevent flicker from tiny scroll deltas

export default function Navbar() {
  const { t, lang, toggleLang } = useI18n()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const lastScrollRef = useRef(0)

  const handleScroll = useCallback(() => {
    const y = window.scrollY || document.documentElement.scrollTop

    // Scrolled state for compact height
    setScrolled(y > 20)

    // At very top — always reveal
    if (y <= 0) {
      setHidden(false)
      lastScrollRef.current = y
      return
    }

    // Ignore tiny scroll changes (touchpad inertia etc.)
    const delta = Math.abs(lastScrollRef.current - y)
    if (delta <= SCROLL_THRESHOLD) return

    // Direction-aware hide/reveal
    if (y > lastScrollRef.current) {
      setHidden(true)   // scrolling down → hide
    } else {
      setHidden(false)  // scrolling up → show
    }

    lastScrollRef.current = y
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
      animate={{
        y: hidden ? '-100%' : 0,
        opacity: 1,
      }}
      transition={{
        y: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.7, ease: CUBIC },
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Single-row nav: flex-nowrap prevents vertical stacking */}
      <nav
        className="navbar-glass flex items-center flex-nowrap w-full transition-all duration-700 ease-out"
        style={{
          height: scrolled ? 48 : 64,
          paddingLeft: 'clamp(12px, 3vw, 48px)',
          paddingRight: 'clamp(12px, 3vw, 48px)',
        }}
      >
        {/* ═══ Zone 1: Brand — left-aligned, flex:1 ═══ */}
        <div className="flex items-center gap-2 sm:gap-3"
          style={{ flex: 1, justifyContent: 'flex-start' }}>
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'rgba(212,165,116,0.7)' }}
            >
              <path d="M4 20 L4 10 Q8 4 12 10 L12 20" />
              <path d="M20 20 L20 10 Q16 4 12 10" />
              <path d="M7 20 L7 12 Q9 8 12 12 L12 20" />
              <path d="M17 20 L17 12 Q15 8 12 12" />
            </svg>
            <span
              className="font-medium tracking-[0.05em] leading-none hidden sm:inline whitespace-nowrap"
              style={{
                fontSize: scrolled ? 13 : 15,
                color: 'rgba(232,224,213,0.8)',
              }}
            >
              墨韵
            </span>
          </Link>
        </div>

        {/* ═══ Zone 2: Content nav — centered, flex:1 ═══ */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2"
          style={{ flex: 1, justifyContent: 'center' }}>
          {contentLinks.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-3 sm:px-5 py-2 text-[13px] sm:text-[14px] font-medium tracking-[0.04em] whitespace-nowrap transition-all duration-300"
                style={{
                  color: isActive
                    ? 'rgb(232,224,213)'
                    : 'rgba(232,224,213,0.4)',
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{
                      background: '#d4a574',
                      boxShadow: '0 0 6px rgba(212,165,116,0.5), 0 0 12px rgba(212,165,116,0.2)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* ═══ Zone 3: System functions — right-aligned, flex:1 ═══ */}
        <div className="hidden md:flex items-center"
          style={{ flex: 1, justifyContent: 'flex-end', gap: 'clamp(16px, 3vw, 32px)' }}>
          <Link
            to="/admin"
            className="text-[11px] sm:text-[12px] font-medium tracking-[0.04em] whitespace-nowrap transition-all duration-300"
            style={{
              color: location.pathname === '/admin'
                ? 'rgba(232,224,213,0.6)'
                : 'rgba(232,224,213,0.3)',
            }}
          >
            {t.nav.admin}
          </Link>
          <button
            onClick={toggleLang}
            className="text-[10px] sm:text-[11px] font-medium tracking-[0.08em] uppercase whitespace-nowrap transition-all duration-300 font-mono"
            style={{ color: 'rgba(232,224,213,0.3)' }}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>

        {/* Mobile toggle — only visible below md */}
        <button
          className="md:hidden p-2 -mr-2 text-text-3/40 hover:text-text-1 transition-colors"
          style={{ flex: '0 0 auto' }}
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
      </nav>

      {/* Bottom glow separator */}
      <div
        className="h-px w-full opacity-25"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,165,116,0.3) 20%, rgba(212,165,116,0.5) 50%, rgba(212,165,116,0.3) 80%, transparent 100%)',
        }}
      />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: CUBIC }}
            className="md:hidden fixed top-[64px] left-3 right-3 max-w-lg mx-auto glass rounded-2xl overflow-hidden"
          >
            <nav className="px-1.5 py-2 space-y-0.5">
              {contentLinks.map(link => {
                const isActive = location.pathname === link.to
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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
              <Link to="/admin" onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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
