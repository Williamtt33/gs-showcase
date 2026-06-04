import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Hero() {
  const { t } = useI18n()
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-0">
      {/* Animated background */}
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-grid-subtle" style={{ transform: `translate(${(mousePos.x - 0.5) * 6}px, ${(mousePos.y - 0.5) * 6}px)` }} />

      {/* Floating orbs — warm ink-wash tones, slow and meditative */}
      <motion.div className="absolute w-[700px] h-[700px] rounded-full blur-[150px] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(212,165,116,0.3) 0%, transparent 70%)',
          left: `${30 + mousePos.x * 15}%`, top: `${10 + mousePos.y * 15}%`,
        }}
        animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute w-[550px] h-[550px] rounded-full blur-[120px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(163,181,166,0.25) 0%, transparent 70%)',
          left: `${40 - mousePos.x * 15}%`, top: `${50 - mousePos.y * 15}%`,
        }}
        animate={{ scale: [1.08, 0.92, 1.08] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-light text-[12px] font-medium text-text-2 tracking-[0.04em] mb-12">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-2 shadow-[0_0_8px_rgba(163,181,166,0.5)] animate-pulse" />
            实时渲染 · 照片级真实感 · WebGL
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-display leading-[1.08] mb-10 tracking-tight"
        >
          <span className="gradient-text">{t.hero.title}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }}
          className="text-base sm:text-lg text-text-2 max-w-xl mx-auto mb-14 leading-relaxed font-light"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/gallery"
              className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[15px] font-semibold cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300"
              style={{ cursor: 'pointer' }}
            >
              {t.hero.ctaView}
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-2 text-[15px] font-medium cursor-pointer hover:bg-white/[0.08] hover:text-text-1 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              style={{ cursor: 'pointer' }}
            >
              上传场景
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-[11px] text-text-3/40 uppercase tracking-[0.25em] font-medium">{t.hero.scrollHint}</span>
          <motion.div
            animate={{ y: [0, 6, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/[0.06] flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-text-3/40" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
