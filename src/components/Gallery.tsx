import { useEffect, useState } from 'react'
import { getAllModels } from '../store'
import type { ModelMeta } from '../types'
import ModelCard from './ModelCard'
import PointCloudBackground from './PointCloudBackground'

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
  const [models, setModels] = useState<ModelMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = () => {
    setLoadError(null)
    setLoading(true)
    getAllModels()
      .then(setModels)
      .catch(err => setLoadError(err.message || '加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <main className="min-h-screen bg-surface-0 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-ink-wash opacity-40" />
        <PointCloudBackground className="opacity-40" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(232,224,213,0.1) 6px, rgba(232,224,213,0.1) 7px)' }} />
      </div>

      <div className="relative z-10" style={{ paddingTop: '90px' }}>
        <section className="pt-20 sm:pt-28 pb-16 sm:pb-20">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="mb-10 animate-fade-up">
              <ScrollRoller />
            </div>
            <div className="text-center animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[11px] font-medium tracking-[0.05em]"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(141,163,145,0.12)', color: '#8DA391' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-2/60" />
                场景画廊
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight mb-6 leading-[1.22]">
                <span className="gradient-text">场景画廊</span>
              </h1>
            </div>
          </div>
        </section>

        <section className="pb-24 sm:pb-32">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            {loading ? (
              <div className="flex items-center justify-center py-40">
                <div className="w-8 h-8 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin" />
              </div>
            ) : loadError ? (
              <div className="text-center py-40">
                <div className="text-5xl mb-6 opacity-40">—</div>
                <h2 className="text-lg font-semibold text-text-2 mb-2">加载失败</h2>
                <p className="text-text-3/50 text-sm max-w-md mx-auto mb-5">{loadError}</p>
                <button onClick={load} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-2 text-sm hover:bg-white/[0.08] cursor-pointer" style={{ cursor: 'pointer' }}>
                  重试
                </button>
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-40">
                <div className="inline-block px-6 py-4 rounded-2xl text-center"
                  style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(51,46,42,0.08)' }}>
                  <p className="text-text-3/50 text-[14px]">回廊尚空，尚无场景入驻</p>
                  <p className="text-text-3/30 text-[12px] mt-1">前往管理页面上传首个场景</p>
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
