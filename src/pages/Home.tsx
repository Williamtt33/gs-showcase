import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { getModels } from '../utils/models'
import ModelCard from '../components/ModelCard'
import type { ModelMeta } from '../types'

const features = [
  { icon: '✨', title: '沉浸式体验', desc: '自由旋转缩放，从任意角度探索三维场景的每一处细节' },
  { icon: '🎨', title: '照片级画质', desc: '高精度三维重建，保留真实场景的光影与色彩' },
  { icon: '🖱️', title: '直观交互', desc: '点击场景中的标记点，发现隐藏在场景里的故事' },
  { icon: '📱', title: '随时随地', desc: '浏览器即开即用，无需安装任何软件或插件' },
]

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

function SealStamp({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-sm border border-accent-3/40 text-accent-3/50 text-[10px] font-bold rotate-6 select-none ${className}`}
      style={{ fontFamily: "'Noto Serif SC', 'STSong', serif" }}>
      印
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
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -80])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.94])

  // Features reveal
  const featuresOpacity = useTransform(scrollYProgress, [0.18, 0.3], [0, 1])
  const featuresY = useTransform(scrollYProgress, [0.18, 0.35], [60, 0])

  // Scroll progress indicator
  const progressHeight = useTransform(scrollYProgress, [0, 1], [0, 100])

  // Gallery data
  const [models, setModels] = useState<ModelMeta[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)

  useEffect(() => {
    getModels()
      .then(setModels)
      .catch(() => {})
      .finally(() => setModelsLoading(false))
  }, [])

  return (
    <div ref={containerRef} className="relative">

      {/* ── Fixed decorations ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Ambient ink wash */}
        <div className="absolute inset-0 bg-ink-wash opacity-60" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-manuscript-grid opacity-40" />

        {/* Floating ink orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%)',
            top: useTransform(scrollYProgress, [0, 1], ['10%', '40%']),
            left: '20%',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(163,181,166,0.06) 0%, transparent 70%)',
            top: useTransform(scrollYProgress, [0, 1], ['40%', '65%']),
            right: '10%',
          }}
        />

        {/* Scroll progress track — right side */}
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
            HERO — 卷首
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
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-light text-[13px] font-medium text-text-2 tracking-[0.06em] mb-12">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-2 shadow-[0_0_8px_rgba(163,181,166,0.5)] animate-pulse" />
                实时渲染 &nbsp;·&nbsp; 照片级真实感 &nbsp;·&nbsp; WebGL
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-display leading-[1.18] mb-10 tracking-tight"
            >
              <span className="gradient-text">3D Gaussian Splatting</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35 }}
              className="text-base sm:text-lg text-text-2 max-w-2xl mx-auto mb-14 leading-[1.8] font-light"
            >
              新一代三维重建技术 · 实时渲染 · 照片级真实感
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })}
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
              <span className="text-[11px] text-text-3/40 uppercase tracking-[0.25em] font-medium">向下滚动展开画卷</span>
              <svg className="w-4 h-5 text-text-3/30" viewBox="0 0 16 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="1" width="14" height="18" rx="7" />
                <motion.circle
                  cx="8" cy="7" r="2"
                  animate={{ cy: [7, 11, 7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
            TRANSITION — 卷轴转场
            ═══════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: featuresOpacity }}
          className="relative py-8"
        >
          <div className="max-w-4xl mx-auto px-6">
            <ScrollRoller />
          </div>
          {/* Seal stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mt-6"
          >
            <SealStamp />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            FEATURES — 卷中
            ═══════════════════════════════════════════ */}
        <motion.section
          style={{ opacity: featuresOpacity, y: featuresY }}
          className="relative py-16 sm:py-20"
        >
          <div className="max-w-6xl mx-auto px-6">
            {/* Section heading */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight mb-6 leading-[1.25]">
                以前所未有的方式<span className="gradient-text">探索三维世界</span>
              </h2>
              <p className="text-text-3 text-base max-w-lg mx-auto font-light leading-[1.8]">
                在浏览器中实时漫游高精度三维场景
              </p>
            </motion.div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group p-6 sm:p-8 rounded-2xl border border-border-1 hover:border-border-2 bg-surface-2/40 hover:bg-surface-2/80 transition-all duration-500"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-text-1 text-[15px] mb-3">{f.title}</h3>
                  <p className="text-[13px] text-text-3 leading-[1.75]">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════
            TRANSITION — 卷轴再展
            ═══════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0.4, 0.5], [0, 1]) }}
          className="relative py-8"
        >
          <div className="max-w-4xl mx-auto px-6">
            <ScrollRoller />
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            GALLERY — 场景画廊
            ═══════════════════════════════════════════ */}
        <section id="gallery-section" className="relative pb-20 sm:pb-28">
          <div className="max-w-6xl mx-auto px-6">
            {/* Gallery heading */}
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
                点击任意场景进入沉浸式 3D 体验
              </p>
            </motion.div>

            {/* Gallery grid */}
            {modelsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-3/50 text-sm">暂无场景，前往<Link to="/upload" className="text-accent-1/70 hover:text-accent-1 transition-colors">上传</Link></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
            <SealStamp className="w-8 h-8 text-[8px]" />
            <span className="text-[10px] text-text-3/25 tracking-[0.2em] font-medium self-end"
              style={{ fontFamily: "'Noto Serif SC', 'STSong', serif" }}>
              墨韵三维 · 乙巳年
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
