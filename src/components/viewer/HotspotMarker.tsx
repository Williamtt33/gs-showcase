import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  screenX: number
  screenY: number
  number: number
  title: string
  description: string
  isSelected: boolean
  onFly: () => void
  onEdit: () => void
  scale: number
}

export default function HotspotMarker({ screenX, screenY, number, title, description, isSelected, onFly, onEdit, scale }: Props) {
  const [hovered, setHovered] = useState(false)
  const active = hovered || isSelected
  const hasText = !!(title || description)

  return (
    <motion.div
      data-hotspot
      className="absolute pointer-events-auto z-30"
      style={{
        left: screenX,
        top: screenY,
        transform: `translate(0, -50%) scale(${scale})`,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2">
        {/* Numbered circle — click to fly */}
        <button
          onClick={onFly}
          className="relative flex items-center justify-center rounded-full select-none shrink-0 cursor-pointer"
          style={{
            width: active ? '36px' : '28px',
            height: active ? '36px' : '28px',
            background: active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.55)',
            border: active ? '2.5px solid rgba(255,255,255,0.85)' : '2px solid rgba(255,255,255,0.5)',
            boxShadow: active
              ? '0 0 20px rgba(255,255,255,0.25), 0 0 4px rgba(255,255,255,0.4)'
              : '0 2px 8px rgba(0,0,0,0.5), 0 0 2px rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: active ? '15px' : '12px',
            fontWeight: 700,
            fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
            transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          {number}
          {/* Pulse ring */}
          {active && (
            <motion.div
              className="absolute rounded-full"
              style={{ border: '1.5px solid rgba(255,255,255,0.3)', inset: '-6px' }}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}
        </button>

        {/* Text bubble — always visible when text exists */}
        {(active || hasText) && (
          <motion.div
            initial={active ? { opacity: 0, x: -4 } : false}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-1.5"
          >
            <div
              className="rounded-xl px-3 py-2 max-w-[220px] cursor-pointer"
              style={{
                background: 'rgba(0,0,0,0.7)',
                border: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}
              onClick={onFly}
            >
              {title && (
                <p className="text-xs font-semibold text-white/90 leading-snug line-clamp-2">
                  {title}
                </p>
              )}
              {description && (
                <p className="text-[11px] text-white/50 leading-snug mt-0.5 line-clamp-2">
                  {description}
                </p>
              )}
              {!title && !description && (
                <p className="text-[11px] text-white/30 italic">无标注</p>
              )}
            </div>
            {/* Edit button */}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              style={{
                opacity: active ? 1 : 0,
                cursor: 'pointer',
                marginTop: '2px',
              }}
              title="编辑标注"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
