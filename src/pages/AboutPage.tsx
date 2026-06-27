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

export default function AboutPage() {
  const { t } = useI18n()

  const exploreItems = [
    { icon: '🖱️', title: t.about.explore.mouse.title, desc: t.about.explore.mouse.desc },
    { icon: '🎮', title: t.about.explore.wasd.title, desc: t.about.explore.wasd.desc },
    { icon: '🧭', title: t.about.explore.arrows.title, desc: t.about.explore.arrows.desc },
    { icon: '❓', title: t.about.explore.help.title, desc: t.about.explore.help.desc },
  ]

  const advantageItems = [
    { icon: '🌐', title: t.about.advantages.browser.title, desc: t.about.advantages.browser.desc },
    { icon: '📸', title: t.about.advantages.quality.title, desc: t.about.advantages.quality.desc },
    { icon: '⚡', title: t.about.advantages.realtime.title, desc: t.about.advantages.realtime.desc },
    { icon: '📱', title: t.about.advantages.lightweight.title, desc: t.about.advantages.lightweight.desc },
    { icon: '🔓', title: t.about.advantages.open.title, desc: t.about.advantages.open.desc },
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
        <section className="pt-20 sm:pt-28 pb-12 sm:pb-16">
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

        {/* ── Content ── */}
        <section className="pb-24 sm:pb-32">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 space-y-12 sm:space-y-16">
            {/* What Is This Website */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: CUBIC }}
              className="ink-card rounded-2xl p-6 sm:p-8 space-y-4 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-display text-text-1">
                {t.about.whatIs.title}
              </h2>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.whatIs.p1}
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.whatIs.p2}
              </p>
            </motion.div>

            {/* What Is Gaussian Splatting */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.1, ease: CUBIC }}
              className="ink-card rounded-2xl p-6 sm:p-8 space-y-4 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-display text-text-1">
                {t.about.gaussians.title}
              </h2>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.gaussians.p1}
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.gaussians.p2}
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.gaussians.p3}
              </p>
            </motion.div>

            {/* How to Explore */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: CUBIC }}
            >
              <h2 className="text-xl sm:text-2xl font-display text-text-1 mb-6 text-center">
                {t.about.explore.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exploreItems.map((item, i) => (
                  <div key={i} className="ink-card-light rounded-xl p-5 flex gap-4 items-start">
                    <span className="text-2xl shrink-0 select-none">{item.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-1 mb-1">{item.title}</h3>
                      <p className="text-xs text-text-3/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upload Your Own */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.2, ease: CUBIC }}
              className="ink-card rounded-2xl p-6 sm:p-8 space-y-4 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-display text-text-1">
                {t.about.uploadAbout.title}
              </h2>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.uploadAbout.p1}
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.uploadAbout.p2}
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.uploadAbout.p3}
              </p>
            </motion.div>

            {/* Key Advantages */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.25, ease: CUBIC }}
            >
              <h2 className="text-xl sm:text-2xl font-display text-text-1 mb-6 text-center">
                {t.about.advantages.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {advantageItems.map((item, i) => (
                  <div key={i} className="ink-card-light rounded-xl p-5 flex flex-col items-center text-center gap-3">
                    <span className="text-2xl select-none">{item.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-1 mb-1">{item.title}</h3>
                      <p className="text-xs text-text-3/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* About Shamian */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.3, ease: CUBIC }}
              className="ink-card rounded-2xl p-6 sm:p-8 space-y-4 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-display text-text-1">
                {t.about.heritage.title}
              </h2>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.heritage.p1}
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.85]">
                {t.about.heritage.p2}
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}
