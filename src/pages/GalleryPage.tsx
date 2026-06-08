import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { getModels } from '../utils/models'
import type { ModelMeta } from '../types'
import ModelCard from '../components/ModelCard'
import { motion } from 'framer-motion'

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
    <main className="min-h-screen bg-surface-0">
      {/* ── Header ── */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-[11px] font-medium text-text-2 tracking-[0.05em] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-2 shadow-[0_0_6px_rgba(163,181,166,0.4)]" />
              三维场景
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight mb-6 leading-[1.22]">
              <span className="gradient-text">{t.gallery.title}</span>
            </h1>
            <p className="text-text-3/70 text-base sm:text-lg font-light max-w-lg mx-auto leading-[1.8]">
              {t.gallery.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
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
              <p className="text-text-3/40 text-[15px] leading-relaxed">
                暂无场景，请先在管理页面添加
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {models.map((model, i) => (
                <ModelCard key={model.id} model={model} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
