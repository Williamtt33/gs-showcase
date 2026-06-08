import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { getModels } from '../utils/models'
import ModelCard from '../components/ModelCard'
import HeritageTimeline from '../components/HeritageTimeline'
import BeforeAfterCard from '../components/BeforeAfterCard'
import StoryPopup, { StoryMarker } from '../components/StoryPopup'
import {
  TIMELINE_EVENTS,
  PRESERVATION_BUILDINGS,
  STREET_STORIES,
  HERITAGE_TAGS,
} from '../data/heritage'
import type { StreetStory } from '../data/heritage'
import type { ModelMeta } from '../types'

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
  const storiesOpacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1])
  const galleryTransition = useTransform(scrollYProgress, [0.72, 0.8], [0, 1])

  // Scroll progress indicator
  const progressHeight = useTransform(scrollYProgress, [0, 1], [0, 100])

  // Story popup state
  const [activeStory, setActiveStory] = useState<StreetStory | null>(null)

  // Gallery data
  const [models, setModels] = useState<ModelMeta[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)

  useEffect(() => {
    getModels()
      .then((all) => {
        // Filter for heritage-tagged or featured models; fallback to all
        const heritage = all.filter(
          (m) => m.tags?.some((t) => HERITAGE_TAGS.includes(t)) || m.featured
        )
        setModels(heritage.length > 0 ? heritage : all)
      })
      .catch(() => {})
      .finally(() => setModelsLoading(false))
  }, [])

  return (
    <div ref={containerRef} className="relative">

      {/* ── Fixed background decorations ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Ambient ink wash */}
        <div className="absolute inset-0 bg-ink-wash opacity-60" />
        {/* Manuscript grid */}
        <div className="absolute inset-0 bg-manuscript-grid opacity-40" />

        {/* Floating ink orbs — viewport-relative sizing, capped at original px */ }
        <motion.div
          className="absolute rounded-full blur-[140px]"
          style={{
            width: 'min(600px, 45vw)', height: 'min(600px, 45vw)',
            background: 'radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%)',
            top: useTransform(scrollYProgress, [0, 1], ['10%', '50%']),
            left: '20%',
          }}
        />
        <motion.div
          className="absolute rounded-full blur-[120px]"
          style={{
            width: 'min(500px, 38vw)', height: 'min(500px, 38vw)',
            background: 'radial-gradient(circle, rgba(163,181,166,0.06) 0%, transparent 70%)',
            top: useTransform(scrollYProgress, [0, 1], ['35%', '70%']),
            right: '10%',
          }}
        />
        <motion.div
          className="absolute rounded-full blur-[100px]"
          style={{
            width: 'min(400px, 30vw)', height: 'min(400px, 30vw)',
            background: 'radial-gradient(circle, rgba(200,75,49,0.04) 0%, transparent 70%)',
            top: useTransform(scrollYProgress, [0, 1], ['55%', '85%']),
            left: '35%',
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
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
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
            style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full glass-light text-[11px] sm:text-[13px] font-medium text-text-2 tracking-[0.04em] sm:tracking-[0.06em] mb-10 sm:mb-12 max-w-[92vw]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-3/70 shadow-[0_0_8px_rgba(200,75,49,0.4)] animate-pulse shrink-0" />
                <span className="whitespace-nowrap">历史文化街区</span>
                <span className="text-text-3/25 select-none">·</span>
                <span className="whitespace-nowrap">数字化保护</span>
                <span className="text-text-3/25 select-none">·</span>
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
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() =>
                  document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[15px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300"
                style={{ cursor: 'pointer' }}
              >
                探索场景
              </button>
              <Link
                to="/upload"
                className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-2 text-[15px] font-medium cursor-pointer hover:bg-white/[0.08] hover:text-text-1 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                style={{ cursor: 'pointer' }}
              >
                上传场景
              </Link>
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
          <div className="max-w-5xl mx-auto px-6">
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
          <div className="max-w-5xl mx-auto px-6">
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
            TRANSITION
            ═══════════════════════════════════════════ */}
        <motion.div style={{ opacity: storiesOpacity }} className="relative py-8">
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
            <SealStamp char="忆" />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            STORIES — 街巷故事
            ═══════════════════════════════════════════ */}
        <motion.section
          style={{ opacity: storiesOpacity }}
          className="relative py-12 sm:py-16"
        >
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-14 sm:mb-18"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight mb-5 leading-[1.25]">
                <span className="gradient-text">街巷故事</span>
              </h2>
              <p className="text-text-3 text-base max-w-lg mx-auto font-light leading-[1.8]">
                每条街巷都藏着几代人的记忆——点击标记，听听他们的故事
              </p>
            </motion.div>

            {/* Interactive story illustration */}
            <div className="relative ink-card rounded-2xl overflow-hidden">
              {/* Background illustration — ink wash + architectural lines */}
              <div className="aspect-[2/1] sm:aspect-[3/1] relative bg-surface-2 overflow-hidden">
                {/* Ink wash atmospheric layers */}
                <div className="absolute inset-0 bg-ink-wash opacity-70" />
                <div className="absolute inset-0 bg-manuscript-grid opacity-30" />

                {/* Silhouetted architectural elements */}
                <div className="absolute bottom-0 left-0 right-0 h-2/3">
                  {/* Roofline silhouettes */}
                  <svg className="absolute bottom-0 w-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                    <path d="M0,280 L50,280 L65,240 L80,280 L120,280 L135,200 L150,280 L200,280 L220,230 L240,280 L290,280 L305,180 L320,280 L360,280 L380,220 L400,280 L440,280 L455,190 L470,280 L510,280 L530,240 L550,280 L600,280 L620,210 L640,280 L680,280 L695,170 L710,280 L750,280 L770,230 L790,280 L800,280 L800,300 L0,300Z"
                      fill="rgba(24,23,20,0.5)" />
                    <path d="M0,285 L30,285 L42,255 L55,285 L90,285 L105,220 L120,285 L160,285 L178,245 L195,285 L230,285 L248,210 L265,285 L300,285 L315,240 L335,285 L370,285 L385,215 L400,285 L440,285 L455,235 L470,285 L505,285 L520,225 L535,285 L570,285 L585,240 L600,285 L640,285 L655,220 L670,285 L700,285 L715,250 L730,285 L770,285 L790,225 L800,285 L800,300 L0,300Z"
                      fill="rgba(18,17,15,0.35)" />
                  </svg>

                  {/* Bridge arch */}
                  <svg className="absolute bottom-0 left-1/4 w-1/3" viewBox="0 0 200 120" preserveAspectRatio="none">
                    <path d="M10,120 Q100,0 190,120"
                      fill="none" stroke="rgba(232,224,213,0.06)" strokeWidth="3" />
                    <path d="M25,120 Q100,15 175,120"
                      fill="none" stroke="rgba(232,224,213,0.03)" strokeWidth="2" />
                  </svg>

                  {/* Tree silhouettes */}
                  <div className="absolute bottom-0 right-[15%] w-16 h-24 opacity-[0.04] rounded-t-full bg-gradient-to-t from-transparent to-text-1" />
                  <div className="absolute bottom-0 left-[20%] w-12 h-20 opacity-[0.03] rounded-t-full bg-gradient-to-t from-transparent to-text-1" />
                </div>

                {/* Floating particles — fireflies / dust motes */}
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-accent-1/15"
                      style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${10 + Math.random() * 80}%`,
                      }}
                      animate={{
                        opacity: [0.1, 0.4, 0.1],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>

                {/* Story markers */}
                {STREET_STORIES.map((story) => (
                  <StoryMarker
                    key={story.id}
                    story={story}
                    isActive={activeStory?.id === story.id}
                    onClick={() => setActiveStory(story)}
                  />
                ))}
              </div>
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
          <div className="max-w-6xl mx-auto px-6">
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
            ) : models.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-3/50 text-sm">
                  暂无场景，前往
                  <Link to="/upload" className="text-accent-1/70 hover:text-accent-1 transition-colors">上传</Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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

      {/* ── Story popup (rendered at root level) ── */}
      <StoryPopup story={activeStory} onClose={() => setActiveStory(null)} />
    </div>
  )
}
