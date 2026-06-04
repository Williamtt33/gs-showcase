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
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight mb-4">
              <span className="gradient-text">{t.gallery.title}</span>
            </h1>
            <p className="text-text-3 text-base font-light max-w-lg mx-auto">{t.gallery.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin" />
                <p className="text-[13px] text-text-3 font-mono">{t.gallery.loading}</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="text-center py-32">
              <div className="text-5xl mb-6 opacity-60">⚠️</div>
              <h2 className="text-xl font-semibold text-text-2 mb-2">加载失败</h2>
              <p className="text-text-3 text-sm max-w-md mx-auto leading-relaxed mb-4">{loadError}</p>
              <button onClick={() => { setLoadError(null); setLoading(true); getModels().then(m => setModels(m)).catch(err => setLoadError(err.message)).finally(() => setLoading(false)) }}
                className="px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-text-2 text-sm hover:bg-white/[0.1] transition-all">
                重试
              </button>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-32">
              <div className="text-5xl mb-6 opacity-60">📭</div>
              <h2 className="text-xl font-semibold text-text-2 mb-2">暂无场景</h2>
              <p className="text-text-3 text-sm max-w-md mx-auto leading-relaxed">
                将 .splat 文件放入 public/models/ 目录，并在管理页面添加场景。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
