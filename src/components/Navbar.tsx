import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, AnimatePresence } from 'framer-motion'

const CUBIC = [0.22, 1, 0.36, 1] as const

function LinkSep() {
  return (
    <span className="w-[1px] h-3.5 bg-gradient-to-b from-transparent via-text-3/20 to-transparent shrink-0" />
  )
}

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

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/gallery', label: t.nav.gallery },
    { to: '/admin', label: t.nav.admin },
  ]

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: CUBIC }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center"
    >
      <div className={`
        mx-auto transition-all duration-500 ease-out
        ${scrolled
          ? 'mx-3 sm:mx-6 lg:mx-auto lg:max-w-6xl xl:max-w-7xl mt-3 glass rounded-xl'
          : 'max-w-2xl lg:max-w-3xl mt-4 sm:mt-6 bg-surface-0/60 backdrop-blur-md rounded-xl'
        }
      `}>
        <div className={`
          relative flex items-center justify-between transition-all duration-500 ease-out
          ${scrolled ? 'h-12 sm:h-14 px-3 sm:px-5' : 'h-14 sm:h-16 px-4 sm:px-6'}
        `}>
          {/* Logo + site name */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-accent-1 via-accent-1/70 to-accent-2 flex items-center justify-center text-[10px] sm:text-xs font-bold text-black shadow-md shadow-accent-1/12 group-hover:shadow-accent-1/25 transition-shadow duration-500"
            >
              3D
            </motion.div>
            <span className={`
              font-semibold tracking-[0.03em] transition-all duration-500
              ${scrolled ? 'text-[13px]' : 'text-[15px]'}
              text-text-1/85 group-hover:text-text-1 hidden sm:inline
            `}>
              墨韵三维
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0">
            {links.map((link, idx) => {
              const isActive = location.pathname === link.to
              return (
                <div key={link.to} className="flex items-center">
                  {idx > 0 && <LinkSep />}
                  <Link
                    to={link.to}
                    className={`relative px-3.5 py-2 text-[13px] font-medium tracking-[0.03em] transition-all duration-300 ${
                      isActive
                        ? 'text-accent-1/90'
                        : 'text-text-3/70 hover:text-text-2'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[1.5px] rounded-full bg-accent-1/40"
                        style={{ width: '60%' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                </div>
              )
            })}

            <LinkSep />

            <button
              onClick={toggleLang}
              className="px-3 py-1.5 text-[11px] font-medium text-text-3/50 hover:text-text-2 transition-all duration-200 font-mono tracking-wider uppercase"
            >
              {lang === 'zh' ? 'EN' : '中'}
            </button>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 -mr-2 text-text-3/60 hover:text-text-1 transition-colors"
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
              {links.map(link => {
                const isActive = location.pathname === link.to
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-white/[0.06] text-text-1' : 'text-text-3/70 hover:text-text-2 hover:bg-white/[0.02]'
                    }`}
                  >
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent-1/60 shadow-[0_0_6px_rgba(212,165,116,0.4)]" />}
                    <span>{link.label}</span>
                  </Link>
                )
              })}
              <div className="h-px bg-border-1 mx-4 my-2" />
              <button
                onClick={() => { toggleLang(); setMobileOpen(false) }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-text-3/60 hover:text-text-2 hover:bg-white/[0.02] transition-all font-mono tracking-wider"
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
