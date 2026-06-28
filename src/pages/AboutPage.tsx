import { useRef, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { motion } from 'framer-motion'
import PointCloudBackground from '../components/decor/PointCloudBackground'

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

const CUBIC = [0.22, 1, 0.36, 1] as const

/* ── 墨线图标 — 代替 emoji ── */

function InkIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${className}`}
      style={{
        border: '1px solid rgba(51,46,42,0.12)',
        color: '#4A4744',
      }}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </div>
  )
}

const mouseIcon   = <><rect x="5" y="2" width="14" height="20" rx="7" /><line x1="12" y1="6" x2="12" y2="10" /></>
const wasdIcon    = <><rect x="7" y="3" width="4" height="6" rx="1" /><rect x="13" y="3" width="4" height="6" rx="1" /><rect x="7" y="11" width="4" height="6" rx="1" /><rect x="13" y="11" width="4" height="6" rx="1" /><rect x="7" y="19" width="4" height="3" rx="1" /></>
const arrowsIcon  = <><circle cx="12" cy="12" r="10" /><path d="M12 6v12M12 6l-4 4M12 6l4 4" /></>
const helpIcon    = <><circle cx="12" cy="12" r="10" /><path d="M9.5 9a3.5 3.5 0 015.5 2.5c0 2-3.5 3-3.5 3" /><circle cx="12" cy="18" r="0.5" fill="currentColor" /></>

const browserIcon  = <><rect x="3" y="4" width="18" height="14" rx="2" /><line x1="3" y1="8" x2="21" y2="8" /></>
const qualityIcon  = <><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="9" /></>
const realtimeIcon = <><circle cx="17" cy="12" r="3" fill="currentColor" opacity="0.3" /><polyline points="2,12 5,12 8,7 11,17 14,10 16,11 19,9" /></>
const mobileIcon   = <><rect x="5" y="2" width="14" height="20" rx="3" /><line x1="9" y1="19" x2="15" y2="19" /></>
const openIcon     = <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.15" /></>

/* ── 右侧水墨点云占位动效 ── */

function InkPointCloudPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; a: number; phase: number }> = []
    const count = 80
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: 0.4 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.03,
        vy: (Math.random() - 0.5) * 0.03,
        a: 0.04 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
      })
    }

    let animId: number
    const render = () => {
      const w = canvas.width = canvas.clientWidth * devicePixelRatio
      const h = canvas.height = canvas.clientHeight * devicePixelRatio
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < -5) p.x = 105; if (p.x > 105) p.x = -5
        if (p.y < -5) p.y = 105; if (p.y > 105) p.y = -5

        const cx = p.x / 100 * w
        const cy = p.y / 100 * h
        const radius = p.r * devicePixelRatio

        // 极淡墨点 — 模拟水墨点云
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(51,46,42,${p.a})`
        ctx.fill()

        // 微弱连线 — 邻近粒子之间
        for (const q of particles) {
          const dx = (p.x - q.x) / 100 * w
          const dy = (p.y - q.y) / 100 * h
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 40 * devicePixelRatio && dist > 0) {
            ctx.beginPath()
            ctx.moveTo(cx, cy)
            ctx.lineTo(q.x / 100 * w, q.y / 100 * h)
            ctx.strokeStyle = `rgba(51,46,42,${0.02 * (1 - dist / (40 * devicePixelRatio))})`
            ctx.lineWidth = 0.3
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  )
}

/* ── Main Page ── */

export default function AboutPage() {
  const { t } = useI18n()

  const exploreItems = [
    { icon: mouseIcon,   title: t.about.explore.mouse.title,   desc: t.about.explore.mouse.desc },
    { icon: wasdIcon,    title: t.about.explore.wasd.title,    desc: t.about.explore.wasd.desc },
    { icon: arrowsIcon,  title: t.about.explore.arrows.title,  desc: t.about.explore.arrows.desc },
    { icon: helpIcon,    title: t.about.explore.help.title,     desc: t.about.explore.help.desc },
  ]

  const advantageItems = [
    { icon: browserIcon,  title: t.about.advantages.browser.title,     desc: t.about.advantages.browser.desc },
    { icon: qualityIcon,  title: t.about.advantages.quality.title,     desc: t.about.advantages.quality.desc },
    { icon: realtimeIcon, title: t.about.advantages.realtime.title,    desc: t.about.advantages.realtime.desc },
    { icon: mobileIcon,   title: t.about.advantages.lightweight.title, desc: t.about.advantages.lightweight.desc },
    { icon: openIcon,     title: t.about.advantages.open.title,        desc: t.about.advantages.open.desc },
  ]

  return (
    <main className="min-h-screen bg-surface-0 relative">
      {/* ── Ink-wash ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-ink-wash opacity-40" />
        <PointCloudBackground className="opacity-40" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(232,224,213,0.1) 6px, rgba(232,224,213,0.1) 7px)
            `,
          }}
        />
      </div>

      <div className="relative z-10" style={{ paddingTop: '90px' }}>
        {/* ── Header ── */}
        <section className="pt-20 sm:pt-28 pb-16 sm:pb-20">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, scaleX: 0.9 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: CUBIC }}
              className="mb-10"
            >
              <ScrollRoller />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: CUBIC }}
              className="text-center"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[11px] font-medium tracking-[0.05em]"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(141,163,145,0.12)',
                  color: '#8DA391',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-2/60 shadow-[0_0_6px_rgba(163,181,166,0.3)]" />
                {t.about.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight mb-6 leading-[1.22]">
                <span className="gradient-text">{t.about.title}</span>
              </h1>
              <p className="text-text-3/70 text-base sm:text-lg font-light max-w-lg mx-auto leading-[1.8]">
                {t.about.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            WHAT IS — 双栏：左文右画
            ═══════════════════════════════════════════ */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
              {/* ── 左栏：文字 60% ── */}
              <div className="flex-1 lg:w-[60%] space-y-14 sm:space-y-18">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, ease: CUBIC }}
                >
                  <h2
                    className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]"
                    style={{ fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif", color: '#332E2A' }}
                  >
                    {t.about.whatIs.title}
                  </h2>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                    {t.about.whatIs.p1}
                  </p>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                    {t.about.whatIs.p2}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: 0.1, ease: CUBIC }}
                >
                  <h2
                    className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]"
                    style={{ fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif", color: '#332E2A' }}
                  >
                    {t.about.gaussians.title}
                  </h2>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                    {t.about.gaussians.p1}
                  </p>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                    {t.about.gaussians.p2}
                  </p>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                    {t.about.gaussians.p3}
                  </p>
                </motion.div>
              </div>

              {/* ── 右栏：水墨点云占位 40% ── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: 0.15, ease: CUBIC }}
                className="lg:w-[40%] hidden lg:block"
              >
                <div
                  className="relative w-full sticky top-24"
                  style={{
                    height: 'min(520px, calc(100vh - 140px))',
                    background: '#F2EFE9',
                    border: '1px solid rgba(200,169,110,0.12)',
                  }}
                >
                  {/* 线稿 overlay */}
                  <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#332E2A" strokeWidth="0.8">
                    {/* 建筑轮廓线 */}
                    <rect x="80" y="60" width="100" height="160" rx="2" />
                    <rect x="90" y="70" width="30" height="20" rx="1" />
                    <rect x="130" y="70" width="30" height="20" rx="1" />
                    <line x1="130" y1="60" x2="130" y2="20" />
                    <line x1="220" y1="80" x2="280" y2="80" />
                    <line x1="250" y1="80" x2="250" y2="40" />
                    <path d="M90,220 L200,160 L310,220" opacity="0.5" />
                    {/* 树 */}
                    <circle cx="60" cy="180" r="20" opacity="0.4" />
                    <line x1="60" y1="200" x2="60" y2="260" />
                    <circle cx="330" cy="200" r="25" opacity="0.3" />
                    <line x1="330" y1="225" x2="330" y2="270" />
                    {/* 远山 */}
                    <path d="M0,300 Q60,250 120,290 Q180,240 240,280 Q300,230 400,290" strokeWidth="1.2" opacity="0.5" />
                    <path d="M0,340 Q80,290 160,330 Q240,280 400,330" opacity="0.3" />
                    {/* 飞鸟 */}
                    <path d="M150,120 Q155,115 160,120 Q165,115 170,120" opacity="0.6" />
                    <path d="M200,100 Q203,97 206,100 Q209,97 212,100" opacity="0.4" />
                  </svg>
                  {/* 点云动效 */}
                  <InkPointCloudPlaceholder />
                  {/* 题字 */}
                  <div
                    className="absolute left-4 bottom-4 text-[10px] select-none"
                    style={{ fontFamily: "'Noto Serif SC', serif", color: 'rgba(51,46,42,0.18)', writingMode: 'vertical-rl' as any }}
                  >
                    三维点云示意
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW TO EXPLORE
            ═══════════════════════════════════════════ */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: CUBIC }}
            >
              <h2
                className="text-lg sm:text-xl font-semibold mb-8 tracking-[0.06em] text-center"
                style={{ fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif", color: '#332E2A' }}
              >
                {t.about.explore.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {exploreItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <InkIcon>{item.icon}</InkIcon>
                    <div>
                      <h3
                        className="text-sm font-semibold mb-1.5 tracking-[0.04em]"
                        style={{ color: '#332E2A' }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-3/70 leading-[1.8]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            UPLOAD YOUR OWN
            ═══════════════════════════════════════════ */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: CUBIC }}
            >
              <h2
                className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]"
                style={{ fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif", color: '#332E2A' }}
              >
                {t.about.uploadAbout.title}
              </h2>
              <div className="space-y-4">
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  {t.about.uploadAbout.p1}
                </p>
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  {t.about.uploadAbout.p2}
                </p>
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  {t.about.uploadAbout.p3}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            ADVANTAGES
            ═══════════════════════════════════════════ */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: CUBIC }}
            >
              <h2
                className="text-lg sm:text-xl font-semibold mb-8 tracking-[0.06em] text-center"
                style={{ fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif", color: '#332E2A' }}
              >
                {t.about.advantages.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {advantageItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <InkIcon>{item.icon}</InkIcon>
                    <div>
                      <h3
                        className="text-sm font-semibold mb-1.5 tracking-[0.04em]"
                        style={{ color: '#332E2A' }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-3/70 leading-[1.8]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HERITAGE
            ═══════════════════════════════════════════ */}
        <section className="pb-24 sm:pb-32">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: CUBIC }}
            >
              <h2
                className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]"
                style={{ fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif", color: '#332E2A' }}
              >
                {t.about.heritage.title}
              </h2>
              <div className="space-y-4">
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  {t.about.heritage.p1}
                </p>
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  {t.about.heritage.p2}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}
