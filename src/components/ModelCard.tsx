import { useMemo } from 'react'
import type { ModelMeta } from '../types'
import { usePage } from '../App'

// Generate a consistent pastel gradient from a string (model id)
function gradientFromId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff
  const hue1 = (hash % 60) + 25    // warm range 25–85
  const hue2 = (hash % 40) + 180   // cool range 180–220
  return `linear-gradient(135deg, hsl(${hue1}, 45%, 88%) 0%, hsl(${hue2}, 30%, 82%) 100%)`
}

export default function ModelCard({ model, index }: { model: ModelMeta; index: number }) {
  const { go } = usePage()
  const placeholderGradient = useMemo(() => gradientFromId(model.id), [model.id])

  return (
    <button
      onClick={() => go({ route: 'viewer', modelId: model.id })}
      className="group ink-card rounded-2xl overflow-hidden text-left w-full border-none cursor-pointer"
      style={{
        animation: `fade-up 0.55s ease-out ${index * 0.08}s both`,
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-surface-2 overflow-hidden">
        {model.thumbnail ? (
          <img
            src={model.thumbnail}
            alt={model.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center relative"
            style={{ background: placeholderGradient }}
          >
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
              }}
            />
            <svg className="w-14 h-14 text-text-3/12 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M9 22V12h6v10" />
              <path d="M9 8h6" />
            </svg>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors duration-500 flex items-center justify-center">
          <span className="text-[11px] font-medium tracking-[0.06em] text-text-1/0 group-hover:text-text-1/50 transition-all duration-500 bg-white/0 group-hover:bg-white/80 px-4 py-1.5 rounded-full">
            探索场景 →
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <h3 className="text-[15px] font-semibold text-text-1 mb-1.5 group-hover:text-accent-1/80 transition-colors">
          {model.name}
        </h3>
        {model.description && (
          <p className="text-[12px] text-text-3/60 leading-relaxed line-clamp-2 mb-3">
            {model.description}
          </p>
        )}
        <div className="flex items-center gap-4">
          {model.pointCount && (
            <span className="text-[10px] text-text-3/40 font-mono">{model.pointCount} 点</span>
          )}
          {model.size && (
            <span className="text-[10px] text-text-3/40 font-mono">{model.size}</span>
          )}
        </div>
        {/* Tags */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {model.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 rounded-md text-[9px] font-medium tracking-[0.03em]"
                style={{ background: 'rgba(141,163,145,0.08)', color: '#6B8B6E' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
