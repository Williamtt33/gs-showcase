import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { getModels } from '../utils/models'
import type { ModelMeta } from '../types'
import ModelCard from '../components/ModelCard'
import { motion } from 'framer-motion'

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

export default function Gallery() {
  const { t } = useI18n()
  const [models, setModels] = useState<ModelMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    getModels()
      .then(m => { setModels(m) })
      .catch(err => { console.error('Failed to load models:', err); setLoadError(err.message || 'Failed to load') })
      .finally(() => { setLoading(false) })
  }, [])

  return (
    <main className="min-h-screen bg-surface-0 relative">
      {/* ── Wall-like ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-ink-wash opacity-40" />
        {/* Subtle garden wall texture */}
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
            {/* Top scroll roller */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.9 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10"
            >
              <ScrollRoller />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              {/* Pill badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[11px] font-medium tracking-[0.05em]"
                style={{
                  background: 'rgba(24,23,20,0.6)',
                  border: '1px solid rgba(163,181,166,0.08)',
                  color: '#a3b5a6',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-2/60 shadow-[0_0_6px_rgba(163,181,166,0.3)]" />
                场景画廊
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight mb-6 leading-[1.22]">
                <span className="gradient-text">{t.gallery.title}</span>
              </h1>
              <p className="text-text-3/70 text-base sm:text-lg font-light max-w-lg mx-auto leading-[1.8]">
                透过花窗，窥见历史街区的三维映像
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Grid — scenes framed in lattice windows along the corridor ── */}
        <section className="pb-24 sm:pb-32">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            {loading ? (
              <div className="flex items-center justify-center py-40">
                <div className="flex flex-col items-center gap-5">
                  <div className="w-8 h-8 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin" />
                  <p className="text-[13px] text-text-3/40">{t.gallery.loading}</p>
                </div>
              </div>
            ) : loadError ? (
              <div className="text-center py-40">
                <div className="text-5xl mb-6 opacity-40">—</div>
                <h2 className="text-lg font-semibold text-text-2 mb-2">加载失败</h2>
                <p className="text-text-3/50 text-sm max-w-md mx-auto leading-relaxed mb-5">{loadError}</p>
                <button
                  onClick={() => { setLoadError(null); setLoading(true); getModels().then(m => setModels(m)).catch(err => setLoadError(err.message)).finally(() => setLoading(false)) }}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-2 text-sm hover:bg-white/[0.08] transition-all cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  重试
                </button>
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-40">
                <div
                  className="inline-block px-6 py-4 rounded-2xl text-center"
                  style={{
                    background: 'rgba(24,23,20,0.5)',
                    border: '1px dashed rgba(232,224,213,0.06)',
                  }}
                >
                  <p className="text-text-3/50 text-[14px] leading-relaxed">
                    回廊尚空，尚无场景入驻
                  </p>
                  <p className="text-text-3/30 text-[12px] mt-1">
                    前往管理页面上传首个场景，为这面墙添上第一扇花窗
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {models.map((model, i) => (
                  <ModelCard key={model.id} model={model} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
