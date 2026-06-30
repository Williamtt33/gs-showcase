import { useEffect, useState } from 'react'
import { usePage } from '../App'
import { getAllModels } from '../store'
import ModelCard from './ModelCard'
import PointCloudBackground from './PointCloudBackground'
import type { ModelMeta } from '../types'

const FOG_SEEDS = [
  { x: '15%', y: '25%', s: 180, dx: 30, dy: -20, d: 28 },
  { x: '72%', y: '35%', s: 220, dx: -25, dy: 15, d: 32 },
  { x: '40%', y: '60%', s: 160, dx: 20, dy: -10, d: 35 },
  { x: '85%', y: '18%', s: 140, dx: -15, dy: 25, d: 30 },
  { x: '55%', y: '75%', s: 200, dx: 35, dy: -15, d: 26 },
]

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

export default function Home() {
  const { go } = usePage()
  const [models, setModels] = useState<ModelMeta[]>([])
  const [loading, setLoading] = useState(true)

  const loadModels = () => {
    setLoading(true)
    getAllModels()
      .then(setModels)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadModels() }, [])

  return (
    <div className="relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-manuscript-grid opacity-20" />
        <PointCloudBackground className="opacity-60" />
        {/* Fog atmosphere */}
        <div className="absolute inset-0 overflow-hidden">
          {FOG_SEEDS.map((s, i) => (
            <div
              key={i}
              className="fog-particle"
              style={{
                left: s.x, top: s.y,
                width: s.s, height: s.s,
                '--drift-x': `${s.dx}px`,
                '--drift-y': `${s.dy}px`,
                '--drift-duration': `${s.d}s`,
                '--drift-delay': `${i * 3.5}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
        {/* Light halos */}
        <div className="absolute rounded-full blur-[120px] animate-fade-in"
          style={{ width: 'min(700px, 55vw)', height: 'min(700px, 55vw)', top: '-15%', left: '25%',
            background: 'radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%)', opacity: 0.15 }} />
        <div className="absolute rounded-full blur-[100px]"
          style={{ width: 'min(500px, 38vw)', height: 'min(500px, 38vw)', top: '45%', right: '12%',
            background: 'radial-gradient(circle, rgba(201,79,42,0.04) 0%, transparent 70%)', opacity: 0.1 }} />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
          <div className="absolute top-16 sm:top-20 w-full max-w-4xl animate-fade-up">
            <ScrollRoller />
          </div>

          <div className="text-center max-w-4xl mx-auto animate-fade-up">
            {/* Pill badge */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] font-medium tracking-[0.04em] sm:tracking-[0.06em] mb-10 sm:mb-12 max-w-[92vw]"
              style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(200,169,110,0.15)', color: '#4A4744' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-2/60 animate-pulse shrink-0" />
              <span>历史文化街区</span>
              <span className="opacity-20">·</span>
              <span>数字化保护</span>
              <span className="opacity-20">·</span>
              <span>三维重建</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[88px] font-display leading-[1.25] sm:leading-[1.18] mb-8 sm:mb-10 tracking-tight">
              <span className="gradient-text">让街区在数字中重生</span>
            </h1>
            <p className="text-sm sm:text-lg text-text-2 max-w-xl mx-auto mb-10 sm:mb-14 leading-[1.8] font-light">
              高精度三维扫描与实时渲染，为历史建筑建立永恒的数字档案
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-12">
              <button
                onClick={() => go({ route: 'gallery' })}
                className="btn-primary text-[15px] px-8 py-4 rounded-xl font-semibold tracking-[0.04em]"
                style={{ cursor: 'pointer' }}
              >
                <span className="mr-2">◇</span>
                探索场景
              </button>
              <div className="flex items-center gap-6 sm:gap-8">
                <button onClick={() => go({ route: 'gallery' })} className="text-[13px] text-text-3/50 hover:text-text-1 transition-colors duration-300 bg-transparent border-none cursor-pointer">
                  场景画廊
                </button>
                <button onClick={() => go({ route: 'upload' })} className="text-[13px] text-text-3/50 hover:text-text-1 transition-colors duration-300 bg-transparent border-none cursor-pointer">
                  上传场景
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery preview */}
        <section className="relative pb-20 sm:pb-28">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-14 sm:mb-18 animate-fade-up">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight mb-5 leading-[1.25]">
                <span className="gradient-text">场景画廊</span>
              </h2>
              <p className="text-text-3 text-base max-w-lg mx-auto font-light leading-[1.8]">
                点击场景，步入三维重建的历史街区
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-3/50 text-sm">暂无场景</p>
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

        {/* Bottom seal */}
        <div className="pb-16 animate-fade-in">
          <div className="max-w-4xl mx-auto px-6 mb-5">
            <ScrollRoller />
          </div>
          <div className="flex justify-center gap-4">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-accent-3/40 text-accent-3/50 text-[8px] font-bold rotate-6 select-none"
              style={{ fontFamily: "'Noto Serif SC', serif" }}>鉴</div>
            <span className="text-[10px] text-text-3/25 tracking-[0.2em] font-medium self-end"
              style={{ fontFamily: "'Noto Serif SC', serif" }}>
              历史街区数字化保护 · 乙巳年
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
