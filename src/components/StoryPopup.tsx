import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { StreetStory } from '../data/heritage'

interface Props {
  story: StreetStory | null
  onClose: () => void
}

export default function StoryPopup({ story, onClose }: Props) {
  const isOpen = story !== null

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Popup */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {story && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="ink-card rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-text-3/40 hover:text-text-1 hover:bg-white/[0.04] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Story image (if present) */}
            {story.image && (
              <div className="aspect-[16/9] rounded-xl bg-surface-3 border border-border-1 overflow-hidden mb-5">
                <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Decorative seal for stories without images */}
            {!story.image && (
              <div className="flex justify-center mb-5">
                <div
                  className="w-14 h-14 rounded-sm border-2 border-accent-3/30 flex items-center justify-center text-accent-3/35 text-[12px] font-bold rotate-6"
                  style={{ fontFamily: "'Noto Serif SC', 'STSong', serif" }}
                >
                  记
                </div>
              </div>
            )}

            <h3 className="text-[18px] font-semibold text-text-1 mb-4 leading-snug">
              {story.title}
            </h3>

            <p className="text-[14px] text-text-2/80 leading-[1.85] whitespace-pre-line">
              {story.text}
            </p>
          </motion.div>
        )}
      </div>
    </>
  )
}

/* ── Story marker dot for the illustration background ── */

interface MarkerProps {
  story: StreetStory
  isActive: boolean
  onClick: () => void
}

export function StoryMarker({ story, isActive, onClick }: MarkerProps) {
  return (
    <button
      onClick={onClick}
      className="absolute group cursor-pointer border-none outline-none bg-transparent p-0"
      style={{
        left: `${story.position.x}%`,
        top: `${story.position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      title={story.title}
    >
      {/* Outer ring */}
      <span
        className={`block w-7 h-7 rounded-full border-2 transition-all duration-300 ${
          isActive
            ? 'border-accent-1/60 bg-accent-1/10 shadow-[0_0_16px_rgba(212,165,116,0.3)]'
            : 'border-accent-1/25 bg-transparent group-hover:border-accent-1/40 group-hover:bg-accent-1/[0.04]'
        }`}
      />
      {/* Inner dot */}
      <span
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
          isActive
            ? 'bg-accent-1/70 scale-125'
            : 'bg-accent-1/40 group-hover:bg-accent-1/60 group-hover:scale-110'
        }`}
      />
      {/* Label */}
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-[9px] sm:text-[10px] text-text-3/35 whitespace-nowrap opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {story.title}
      </span>
    </button>
  )
}
