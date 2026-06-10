import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, type MotionValue } from 'framer-motion'

/* ── Easing constants ── */
const CUBIC = [0.22, 1, 0.36, 1] as const

/* ── Vertical separator ── */
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
  const [scrollProgress, setScrollProgress] = useState(0)

  // ── Horizontal unroll: mouse X drives how open the scroll is ──
  const headerRef = useRef<HTMLDivElement>(null)
  const mouseIn = useRef(false)
  const rawOpen = useMotionValue(0)
  const smoothOpen = useSpring(rawOpen, { stiffness: 80, damping: 28 })

  // Map open 0→1 to:
  // - scroll content width (via clip-path or max-width)
  // - right axle rotation
  // - content opacity
  const scrollClipPath = useTransform(smoothOpen, [0, 1],
    ['inset(0 75% 0 0 round 4px)', 'inset(0 0% 0 0 round 4px)'])
  const contentOpacity = useTransform(smoothOpen, [0, 0.15, 1], [0.3, 0.6, 1])
  const linkOpacity = useTransform(smoothOpen, [0, 0.3, 1], [0, 0.5, 1])

  const updateOpen = useCallback((clientX: number) => {
    const rect = headerRef.current?.getBoundingClientRect()
    if (!rect) return
    // Map: left edge of header → open=0, right edge of viewport area → open=1
    const relX = clientX - rect.left
    const range = Math.max(rect.width, 400)
    const value = Math.max(0, Math.min(1, relX / range))
    rawOpen.set(value)
  }, [rawOpen])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    updateOpen(e.clientX)
  }, [updateOpen])

  const handleMouseEnter = useCallback(() => {
    mouseIn.current = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseIn.current = false
    rawOpen.set(0)
  }, [rawOpen])

  // Global mouse tracking — allows the scroll to respond even when mouse
  // is slightly above/below the navbar (within a vertical band)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!mouseIn.current) return
      updateOpen(e.clientX)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [updateOpen])

  // ── Scroll tracking ──
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)
    const h = document.documentElement
    const total = h.scrollHeight - h.clientHeight
    setScrollProgress(total > 0 ? Math.round((window.scrollY / total) * 100) : 0)
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
      ref={headerRef}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: CUBIC }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center"
    >
      <div className={`
        mx-auto transition-all duration-500 ease-out
        ${scrolled
          ? 'mx-3 sm:mx-6 lg:mx-auto lg:max-w-6xl xl:max-w-7xl mt-3'
          : 'max-w-2xl lg:max-w-3xl mt-4 sm:mt-6'
        }
      `}>
        {/* ═══════════════════════════════════════
            SCROLL — horizontal unroll
            ═══════════════════════════════════════ */}
        <div className="relative flex items-stretch">
          {/* ── Left axle cap (fixed) ── */}
          <div className="flex items-center">
            <div className="w-[16px] h-[16px] rounded-[3px] border border-accent-1/20 bg-surface-2 shrink-0 relative">
              <div className="absolute inset-[2px] rounded-[1px] bg-[#1a1714]" />
              <div className="absolute inset-[4px] rounded-[1px] bg-accent-1/[0.04]" />
            </div>
          </div>

          {/* ── Scroll body — width controlled by mouse ── */}
          <motion.div
            className="relative flex-1 overflow-hidden"
            style={{ clipPath: scrollClipPath }}
          >
            {/* Scroll surface */}
            <div className={`
              relative transition-all duration-500 ease-out
              ${scrolled ? 'glass rounded-xl' : 'bg-[#151310] rounded-r-xl rounded-l-sm'}
            `}>
              {/* ── Top axle bar ── */}
              <motion.div
                animate={{ height: scrolled ? 0 : 5, opacity: scrolled ? 0 : 1 }}
                className="flex items-center overflow-hidden"
              >
                <div className="flex-1 h-[3px] bg-gradient-to-r from-[#1a1714] to-[#1f1c18] border-b border-border-1" />
              </motion.div>

              {/* ── Manuscript texture ── */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(232,224,213,0.3) 38px, rgba(232,224,213,0.3) 39px),
                    repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(232,224,213,0.15) 5px, rgba(232,224,213,0.15) 6px)
                  `,
                }}
              />

              {/* ── Content ── */}
              <motion.div
                style={{ opacity: contentOpacity }}
                className={`
                  relative flex items-center justify-between transition-all duration-500 ease-out
                  ${scrolled ? 'h-12 sm:h-14 px-3 sm:px-5' : 'h-16 sm:h-[68px] px-4 sm:px-6'}
                `}
              >
                {/* Logo + site name */}
                <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -3 }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-accent-1 via-accent-1/70 to-accent-2 flex items-center justify-center text-[10px] sm:text-xs font-bold text-black shadow-md shadow-accent-1/12 group-hover:shadow-accent-1/25 transition-shadow duration-500"
                  >
                    3D
                  </motion.div>
                  <span className={`
                    font-semibold tracking-[0.03em] transition-all duration-500 font-display
                    ${scrolled ? 'text-[13px]' : 'text-[15px]'}
                    text-text-1/85 group-hover:text-text-1 hidden sm:inline
                  `}>
                    墨韵三维
                  </span>
                </Link>

                {/* Desktop nav — fades in as scroll unrolls */}
                <motion.nav
                  style={{ opacity: linkOpacity }}
                  className="hidden md:flex items-center gap-0"
                >
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
                </motion.nav>

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
              </motion.div>

              {/* ── Bottom axle bar ── */}
              <motion.div
                animate={{ height: scrolled ? 0 : 5, opacity: scrolled ? 0 : 1 }}
                className="flex items-center overflow-hidden"
              >
                <div className="flex-1 h-[3px] bg-gradient-to-r from-[#1a1714] to-[#1f1c18] border-t border-border-1 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-gradient-to-b from-accent-1/15 to-transparent" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ── Right axle cap — rotates as scroll unrolls ── */}
          <RightAxleCap open={smoothOpen} />
        </div>
      </div>

      {/* ── Scroll progress ── */}
      <div
        className={`mx-auto h-[1px] transition-all duration-500 ease-out ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: scrolled ? `${scrollProgress}%` : '0%', transitionProperty: 'width, opacity' }}
      >
        <div className="h-full bg-gradient-to-r from-accent-1/30 via-accent-1/50 to-accent-1/20" />
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: CUBIC }}
            className="md:hidden mx-3 mt-2 w-[calc(100%-1.5rem)] max-w-lg glass rounded-2xl overflow-hidden"
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

/** Right axle cap that reads from a MotionValue */
function RightAxleCap({ open }: { open: MotionValue<number> }) {
  const rotate = useTransform(open, [0, 1], [0, 120])
  const glow = useTransform(open, [0, 1], [0.04, 0.16])
  return (
    <motion.div
      style={{ rotate }}
      className="w-[16px] h-[16px] rounded-[3px] border border-accent-1/20 bg-surface-2 shrink-0 relative"
    >
      <div className="absolute inset-[2px] rounded-[1px] bg-[#1a1714]" />
      <motion.div
        style={{ opacity: glow }}
        className="absolute inset-[4px] rounded-[1px] bg-accent-1"
      />
    </motion.div>
  )
}
