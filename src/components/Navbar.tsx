import { useState, useEffect, useCallback, useRef } from 'react'
import { usePage } from '../App'

const SCROLL_THRESHOLD = 10

export default function Navbar() {
  const { page, go } = usePage()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastScrollRef = useRef(0)

  const handleScroll = useCallback(() => {
    const y = window.scrollY || document.documentElement.scrollTop
    setScrolled(y > 20)
    if (y <= 0) { setHidden(false); lastScrollRef.current = y; return }
    const delta = Math.abs(lastScrollRef.current - y)
    if (delta <= SCROLL_THRESHOLD) return
    setHidden(y > lastScrollRef.current)
    lastScrollRef.current = y
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const currentRoute = page.route

  const navLinks = [
    { route: 'home' as const, label: '首页' },
    { route: 'gallery' as const, label: '场景画廊' },
    { route: 'about' as const, label: '关于' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <nav
        className="navbar-glass flex items-center flex-nowrap w-full"
        style={{
          height: scrolled ? 48 : 64,
          paddingLeft: 'clamp(12px, 3vw, 48px)',
          paddingRight: 'clamp(12px, 3vw, 48px)',
          transition: 'height 0.7s ease-out',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3" style={{ flex: 1, justifyContent: 'flex-start' }}>
          <button
            onClick={() => go({ route: 'home' })}
            className="flex items-center gap-2 sm:gap-2.5 group shrink-0 bg-transparent border-none cursor-pointer"
            style={{ font: 'inherit', color: 'inherit' }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-1/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20 L4 10 Q8 4 12 10 L12 20" />
              <path d="M20 20 L20 10 Q16 4 12 10" />
              <path d="M7 20 L7 12 Q9 8 12 12 L12 20" />
              <path d="M17 20 L17 12 Q15 8 12 12" />
            </svg>
            <span className="font-medium tracking-[0.05em] leading-none hidden sm:inline whitespace-nowrap text-text-1/80"
              style={{ fontSize: scrolled ? 13 : 15 }}>
              晶格视界
            </span>
          </button>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2" style={{ flex: 1, justifyContent: 'center' }}>
          {navLinks.map(link => {
            const isActive = currentRoute === link.route
            return (
              <button
                key={link.route}
                onClick={() => go({ route: link.route })}
                className={`relative px-3 sm:px-5 py-2 text-[13px] sm:text-[14px] font-medium tracking-[0.04em] whitespace-nowrap transition-colors duration-300 bg-transparent border-none cursor-pointer ${isActive ? 'text-text-1' : 'text-text-3/40'}`}
              >
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent-1" />
                )}
                {link.label}
              </button>
            )
          })}
        </div>

        {/* Desktop system links */}
        <div className="hidden md:flex items-center" style={{ flex: 1, justifyContent: 'flex-end', gap: 'clamp(16px, 3vw, 32px)' }}>
          <button
            onClick={() => go({ route: 'upload' })}
            className={`text-[11px] sm:text-[12px] font-medium tracking-[0.04em] whitespace-nowrap bg-transparent border-none cursor-pointer transition-colors duration-300 ${currentRoute === 'upload' ? 'text-text-2' : 'text-text-3/30'}`}
          >
            上传
          </button>
          <button
            onClick={() => go({ route: 'admin' })}
            className={`text-[11px] sm:text-[12px] font-medium tracking-[0.04em] whitespace-nowrap bg-transparent border-none cursor-pointer transition-colors duration-300 ${currentRoute === 'admin' ? 'text-text-2' : 'text-text-3/30'}`}
          >
            管理
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 -mr-2 bg-transparent border-none cursor-pointer text-text-3/40"
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

      {/* Bottom glow */}
      <div className="h-px w-full opacity-25"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.3) 20%, rgba(200,169,110,0.5) 50%, rgba(200,169,110,0.3) 80%, transparent 100%)' }}
      />

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed top-[64px] left-3 right-3 max-w-lg mx-auto glass rounded-2xl overflow-hidden"
          style={{ animation: 'fade-in 0.2s ease-out' }}>
          <nav className="px-1.5 py-2 space-y-0.5">
            {navLinks.map(link => {
              const isActive = currentRoute === link.route
              return (
                <button
                  key={link.route}
                  onClick={() => { go({ route: link.route }); setMobileOpen(false) }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left bg-transparent border-none cursor-pointer transition-all whitespace-nowrap ${isActive ? 'bg-white/[0.06] text-text-1' : 'text-text-3/70'}`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent-1/60" />}
                  <span>{link.label}</span>
                </button>
              )
            })}
            <div className="h-px bg-border-1 mx-4 my-2" />
            <button
              onClick={() => { go({ route: 'upload' }); setMobileOpen(false) }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left bg-transparent border-none cursor-pointer transition-all whitespace-nowrap text-text-3/50"
            >
              <span>上传场景</span>
            </button>
            <button
              onClick={() => { go({ route: 'admin' }); setMobileOpen(false) }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left bg-transparent border-none cursor-pointer transition-all whitespace-nowrap ${currentRoute === 'admin' ? 'bg-white/[0.06] text-text-2' : 'text-text-3/50'}`}
            >
              <span>管理</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
