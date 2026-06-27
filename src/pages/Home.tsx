import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, useScroll, useTransform } from 'framer-motion'
import { getModels } from '../utils/models'
import ModelCard from '../components/ModelCard'
import HeritageTimeline from '../components/HeritageTimeline'
import BeforeAfterCard from '../components/BeforeAfterCard'
import { DriftingLinework } from '../components/decor/ArchitecturalLinework'
import PointCloudBackground from '../components/decor/PointCloudBackground'
import {
  TIMELINE_EVENTS,
  PRESERVATION_BUILDINGS,
  HERITAGE_TAGS,
} from '../data/heritage'
import type { ModelMeta } from '../types'

/* ── Fog particles — ultra-slow drifting atmosphere ── */

const FOG_SEEDS = [
  { x: '15%', y: '25%', s: 180, dx: 30, dy: -20, d: 28 },
  { x: '72%', y: '35%', s: 220, dx: -25, dy: 15, d: 32 },
  { x: '40%', y: '60%', s: 160, dx: 20, dy: -10, d: 35 },
  { x: '85%', y: '18%', s: 140, dx: -15, dy: 25, d: 30 },
  { x: '55%', y: '75%', s: 200, dx: 35, dy: -15, d: 26 },
  { x: '28%', y: '48%', s: 120, dx: -20, dy: 10, d: 33 },
  { x: '65%', y: '80%', s: 170, dx: 25, dy: -25, d: 29 },
  { x: '8%', y: '70%', s: 150, dx: 15, dy: -30, d: 31 },
]

function FogAtmosphere() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FOG_SEEDS.map((s, i) => (
        <div
          key={i}
          className="fog-particle"
          style={{
            left: s.x, top: s.y,
            width: s.s, height: s.s,
            '--drift-x': `${s.dx}px`,
            '--drift-y': `${s.dy}px`,
            animationDuration: `${s.d}s`,
            animationDelay: `${i * 3.5}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

/* ── Scroll painting decorations ── */

function ScrollRoller({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-1/25 to-transparent" />
      <div className="w-8 h-[5px] rounded-full bg-accent-1/30" />
      <div className="w-8 h-[5px] rounded-full bg-accent-1/25" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-accent-1/25 to-transparent" />
    </div>
  )
}

function SealStamp({ char = '印', className = '' }: { char?: string; className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center w-10 h-10 rounded-sm border border-accent-3/40 text-accent-3/50 text-[10px] font-bold rotate-6 select-none ${className}`}
      style={{ fontFamily: "'Noto Serif SC', 'STSong', serif" }}
    >
      {char}
    </div>
  )
}

/* ── Main Page ── */

export default function Home() {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Hero fade & parallax
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  // Section reveals
  const timelineOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1])
  const preservationOpacity = useTransform(scrollYProgress, [0.35, 0.45], [0, 1])
  const galleryTransition = useTransform(scrollYProgress, [0.48, 0.58], [0, 1])

  // Scroll progress indicator
  const progressHeight = useTransform(scrollYProgress, [0, 1], [0, 100])

  // Gallery data
  const [models, setModels] = useState<ModelMeta[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [modelsError, setModelsError] = useState(false)

  const loadModels = () => {
    setModelsError(false)
    setModelsLoading(true)
    getModels()
      .then((all) => {
        // Filter for heritage-tagged or featured models; fallback to all
        const heritage = all.filter(
          (m) => m.tags?.some((t) => HERITAGE_TAGS.includes(t)) || m.featured
        )
        setModels(heritage.length > 0 ? heritage : all)
      })
      .catch(() => {
        setModelsError(true)
      })
      .finally(() => setModelsLoading(false))
  }

  useEffect(() => {
    loadModels()
  }, [])

  return (
    <div ref={containerRef} className="relative">

      {/* ── Fixed background decorations ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Manuscript grid — subtle */}
        <div className="absolute inset-0 bg-manuscript-grid opacity-20" />
        {/* Architectural linework — 界画线描 */}
        <DriftingLinework className="absolute inset-0 opacity-30" />
        {/* 3D Point cloud — 点云微动效 */}
        <PointCloudBackground className="opacity-60" />
        {/* Fog atmosphere */}
        <FogAtmosphere />

        {/* Warm gold light halos — cinematic glow */}
        <motion.div
          className="absolute rounded-full blur-[120px]"
          animate={{ opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 'min(700px, 55vw)', height: 'min(700px, 55vw)',
            background: 'radial-gradient(circle, rgba(200,169,110,0.08) 0%, rgba(141,163,145,0.04) 30%, transparent 70%)',
            top: useTransform(scrollYProgress, [0, 1], ['-15%', '20%']),
            left: '25%',
            willChange: 'transform',
          }}
        />
        <motion.div
          className="absolute rounded-full blur-[100px]"
          animate={{ opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            width: 'min(500px, 38vw)', height: 'min(500px, 38vw)',
            background: 'radial-gradient(circle, rgba(201,79,42,0.04) 0%, rgba(200,169,110,0.03) 40%, transparent 70%)',
            top: useTransform(scrollYProgress, [0, 1], ['45%', '70%']),
            right: '12%',
            willChange: 'transform',
          }}
        />

        {/* Scroll progress track — right edge */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-px h-32 bg-border-1 rounded-full hidden lg:block">
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-6 rounded-full bg-accent-1/50"
            style={{ top: `${progressHeight.get()}%`, transform: `translate(-50%, -50%)` }}
          />
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="relative z-10">

        {/* ═══════════════════════════════════════════
            PROLOGUE — 序幕
            ═══════════════════════════════════════════ */}
        <section
          className="relative min-h-screen flex flex-col items-center justify-center px-6"
          style={{ contain: 'layout style paint' }}
        >
          {/* Top scroll roller */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.9 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-16 sm:top-20 w-full max-w-4xl"
          >
            <ScrollRoller />
          </motion.div>

          {/* Hero content */}
          <motion.div
            style={{ opacity: heroOpacity, y: heroY, scale: heroScale, willChange: 'transform, opacity' }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div
                className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] font-medium tracking-[0.04em] sm:tracking-[0.06em] mb-10 sm:mb-12 max-w-[92vw]"
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(200,169,110,0.15)',
                  color: '#4A4744',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-2/60 shadow-[0_0_6px_rgba(141,163,145,0.3)] animate-pulse shrink-0" />
                <span className="whitespace-nowrap">历史文化街区</span>
                <span className="opacity-20 select-none">·</span>
                <span className="whitespace-nowrap">数字化保护</span>
                <span className="opacity-20 select-none">·</span>
                <span className="whitespace-nowrap">三维重建</span>
              </div>
            </motion.div>

            {/* Main tagline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[88px] font-display leading-[1.25] sm:leading-[1.18] mb-8 sm:mb-10 tracking-tight"
            >
              <span className="gradient-text">让街区在数字中重生</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35 }}
              className="text-sm sm:text-lg text-text-2 max-w-xl mx-auto mb-10 sm:mb-14 leading-[1.8] font-light"
            >
              高精度三维扫描与实时渲染，为历史建筑建立永恒的数字档案
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-12"
            >
              <Link
                to="/viewer/shamian"
                className="btn-primary text-[15px] px-8 py-4 rounded-xl font-semibold tracking-[0.04em]"
                style={{ cursor: 'pointer' }}
              >
                <span className="mr-2">◇</span>
                探索场景
              </Link>
              <div className="flex items-center gap-6 sm:gap-8">
                <Link
                  to="/gallery"
                  className="text-[13px] text-text-3/50 hover:text-text-1 transition-colors duration-300"
                  style={{ cursor: 'pointer' }}
                >
                  {t.nav.gallery}
                </Link>
                <Link
                  to="/upload"
                  className="text-[13px] text-text-3/50 hover:text-text-1 transition-colors duration-300"
                  style={{ cursor: 'pointer' }}
                >
                  上传场景
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-[11px] text-text-3/40 uppercase tracking-[0.25em] font-medium">
                向下滚动展开画卷
              </span>
              <svg className="w-4 h-5 text-text-3/30" viewBox="0 0 16 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="1" width="14" height="18" rx="7" />
                <motion.circle cx="8" cy="7" r="2"
                  animate={{ cy: [7, 11, 7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
            TRANSITION
            ═══════════════════════════════════════════ */}
        <motion.div style={{ opacity: timelineOpacity }} className="relative py-8">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollRoller />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mt-6"
          >
            <SealStamp char="史" />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            HISTORY — 历史溯源
            ═══════════════════════════════════════════ */}
        <motion.section
          style={{ opacity: timelineOpacity }}
          className="relative py-12 sm:py-16"
        >
          <div className="max-w-5xl lg:max-w-6xl mx-auto px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-14 sm:mb-18"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight mb-5 leading-[1.25]">
                <span className="gradient-text">历史溯源</span>
              </h2>
              <p className="text-text-3 text-base max-w-lg mx-auto font-light leading-[1.8]">
                六百年街巷脉络，从明代商埠到数字重生
              </p>
            </motion.div>

            <HeritageTimeline events={TIMELINE_EVENTS} />
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════
            TRANSITION
            ═══════════════════════════════════════════ */}
        <motion.div style={{ opacity: preservationOpacity }} className="relative py-8">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollRoller />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mt-6"
          >
            <SealStamp char="护" />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            PRESERVATION — 保护现状
            ═══════════════════════════════════════════ */}
        <motion.section
          style={{ opacity: preservationOpacity }}
          className="relative py-12 sm:py-16"
        >
          <div className="max-w-5xl lg:max-w-6xl mx-auto px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-14 sm:mb-18"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight mb-5 leading-[1.25]">
                <span className="gradient-text">保护现状</span>
              </h2>
              <p className="text-text-3 text-base max-w-lg mx-auto font-light leading-[1.8]">
                重点历史建筑的保护与修缮——修旧如旧，存真守正
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {PRESERVATION_BUILDINGS.map((b, i) => (
                <BeforeAfterCard key={b.id} building={b} index={i} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════
            TRANSITION — 转入画廊
            ═══════════════════════════════════════════ */}
        <motion.div style={{ opacity: galleryTransition }} className="relative py-8">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollRoller />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mt-6"
          >
            <SealStamp char="观" />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            GALLERY — 场景画廊
            ═══════════════════════════════════════════ */}
        <section id="gallery-section" className="relative pb-20 sm:pb-28">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="text-center mb-14 sm:mb-18"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight mb-5 leading-[1.25]">
                <span className="gradient-text">场景画廊</span>
              </h2>
              <p className="text-text-3 text-base max-w-lg mx-auto font-light leading-[1.8]">
                点击场景，步入三维重建的历史街区
              </p>
            </motion.div>

            {modelsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin" />
              </div>
            ) : modelsError ? (
              <div className="text-center py-20">
                <p className="text-text-3/50 text-sm mb-3">场景加载失败</p>
                <button
                  onClick={loadModels}
                  className="px-5 py-2 rounded-xl border border-white/[0.08] text-text-3/60 hover:text-text-1 hover:bg-white/[0.04] transition-all text-sm cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >重试</button>
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-3/50 text-sm">
                  暂无场景，前往
                  <Link to="/upload" className="text-accent-1/70 hover:text-accent-1 transition-colors">上传</Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {models.map((model, i) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ModelCard model={model} index={i} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            BOTTOM SEAL — 卷尾落款
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pb-16"
        >
          <div className="max-w-4xl mx-auto px-6 mb-5">
            <ScrollRoller />
          </div>
          <div className="flex justify-center gap-4">
            <SealStamp char="鉴" className="w-8 h-8 text-[8px]" />
            <span
              className="text-[10px] text-text-3/25 tracking-[0.2em] font-medium self-end"
              style={{ fontFamily: "'Noto Serif SC', 'STSong', serif" }}
            >
              历史街区数字化保护 · 乙巳年
            </span>
          </div>
        </motion.div>

      </div>

    </div>
  )
}
