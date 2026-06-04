import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  screenX: number
  screenY: number
  number: number
  title: string
  isSelected: boolean
  onClick: () => void
  scale: number
}

export default function HotspotMarker({ screenX, screenY, number, title, isSelected, onClick, scale }: Props) {
  const [hovered, setHovered] = useState(false)
  const active = hovered || isSelected

  return (
    <motion.div
      data-hotspot
      className="absolute pointer-events-auto cursor-pointer z-30"
      style={{
        left: screenX,
        top: screenY,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer pulse ring on hover/select */}
      {active && (
        <motion.div
          className="absolute rounded-full -inset-2"
          style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}

      {/* Main circle: white border + number */}
      <div
        className="relative flex items-center justify-center rounded-full select-none"
        style={{
          width: active ? '36px' : '30px',
          height: active ? '36px' : '30px',
          background: active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.55)',
          border: active ? '2.5px solid rgba(255,255,255,0.85)' : '2px solid rgba(255,255,255,0.55)',
          boxShadow: active
            ? '0 0 20px rgba(255,255,255,0.25), 0 0 4px rgba(255,255,255,0.4)'
            : '0 2px 8px rgba(0,0,0,0.5), 0 0 2px rgba(255,255,255,0.15)',
          color: '#fff',
          fontSize: active ? '15px' : '13px',
          fontWeight: 700,
          fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        {number}
      </div>

      {/* Label tooltip on hover/select */}
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
        >
          <span
            className="inline-block rounded-lg px-3 py-1.5 text-xs font-medium text-white/90"
            style={{
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {title || `热点 ${number}`}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
