import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { t, lang, toggleLang } = useI18n()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/gallery', label: t.nav.gallery },
    { to: '/admin', label: t.nav.admin },
  ]

  return (
    <motion.header
      initial={{ y: -100 }} animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className={`mx-auto transition-all duration-500 ${
        scrolled
          ? 'mx-4 sm:mx-8 lg:mx-auto lg:max-w-6xl mt-4 glass rounded-2xl'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8'
      }`}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-1 via-accent-1/70 to-accent-2 flex items-center justify-center text-xs font-bold text-black shadow-lg shadow-accent-1/15 group-hover:shadow-accent-1/30 transition-shadow duration-500">
              3D
            </div>
            <span className="font-semibold text-text-1/90 group-hover:text-text-1 transition-colors text-[14px] tracking-[0.02em] hidden sm:inline">
              墨韵三维
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'text-text-1'
                    : 'text-text-3 hover:text-text-2'
                }`}
              >
                {location.pathname === link.to && (
                  <motion.div layoutId="nav-active" className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.06]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
            <div className="w-px h-4 bg-border-1 mx-3" />
            <button
              onClick={toggleLang}
              className="px-3 py-2 rounded-xl text-[11px] font-medium text-text-3 hover:text-text-2 hover:bg-white/[0.04] transition-all duration-200 font-mono tracking-wider uppercase"
            >
              {lang === 'zh' ? 'EN' : '中'}
            </button>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-text-3 hover:text-text-1 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden mx-4 mt-2 glass rounded-2xl overflow-hidden"
          >
            <nav className="px-2 py-3 space-y-0.5">
              {links.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.to ? 'bg-white/[0.06] text-text-1' : 'text-text-3 hover:text-text-2'
                  }`}
                >{link.label}</Link>
              ))}
              <button onClick={toggleLang} className="w-full text-left px-4 py-3 rounded-xl text-sm text-text-3 hover:text-text-2 transition-all font-mono">
                {lang === 'zh' ? 'Switch to English' : '切换到中文'}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
