import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  screenX: number
  screenY: number
  icon: string
  color: string
  title: string
  isSelected: boolean
  onClick: () => void
  scale: number
}

export default function HotspotMarker({ screenX, screenY, icon, color, title, isSelected, onClick, scale }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
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
      {/* Ring animation */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `${color}20`,
          border: `2px solid ${color}60`,
        }}
        animate={{
          scale: hovered || isSelected ? 1.3 : 1,
          opacity: hovered || isSelected ? 1 : 0.7,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Pulse ring */}
      {(hovered || isSelected) && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${color}40` }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Icon */}
      <div
        className="relative w-8 h-8 rounded-full flex items-center justify-center text-sm backdrop-blur-sm"
        style={{
          background: `${color}30`,
          border: `2px solid ${color}80`,
          boxShadow: isSelected ? `0 0 16px ${color}60` : `0 0 8px ${color}20`,
        }}
      >
        {icon}
      </div>

      {/* Label */}
      {(hovered || isSelected) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="glass rounded-lg px-2 py-1 text-xs text-white/80">
            {title}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
