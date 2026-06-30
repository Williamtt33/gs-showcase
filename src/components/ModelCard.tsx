import type { ModelMeta } from '../types'
import { usePage } from '../App'

export default function ModelCard({ model, index }: { model: ModelMeta; index: number }) {
  const { go } = usePage()

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
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-text-3/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <path d="M4 20 L4 10 Q8 4 12 10 L12 20" />
              <path d="M20 20 L20 10 Q16 4 12 10" />
              <path d="M7 20 L7 12 Q9 8 12 12 L12 20" />
              <path d="M17 20 L17 12 Q15 8 12 12" />
            </svg>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-500" />
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <h3 className="text-[15px] font-semibold text-text-1 mb-1.5 group-hover:text-accent-1/80 transition-colors">
          {model.name}
        </h3>
        {model.description && (
          <p className="text-[12px] text-text-3/60 leading-relaxed line-clamp-2">
            {model.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3">
          {model.pointCount && (
            <span className="text-[10px] text-text-3/40 font-mono">{model.pointCount} 点</span>
          )}
          {model.size && (
            <span className="text-[10px] text-text-3/40 font-mono">{model.size}</span>
          )}
        </div>
      </div>
    </button>
  )
}
