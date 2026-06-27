import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  isVisible: boolean
  onClose: () => void
  showPerf?: boolean
  onTogglePerf?: () => void
  forceVisible?: boolean
}

export default function ControlsHelp({ isVisible, onClose, showPerf, onTogglePerf, forceVisible }: Props) {
  const { t } = useI18n()
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)

  const rows = [
    { key: t.controls.leftDrag, action: t.controls.rotate },
    { key: t.controls.rightDrag, action: t.controls.pan },
    { key: t.controls.scrollWheel, action: t.controls.zoom },
  ]
  const flightRows = [
    { key: 'W A S D', action: t.controls.flightWASD },
    { key: 'Q / E', action: t.controls.flightQE },
  ]
  const shortcutRows = [
    { key: 'H', action: t.controls.shortcutHelp },
    { key: 'R', action: t.controls.reset },
  ]

  const showFull = forceVisible || hovered || pinned

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: showFull ? 1 : 0.1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="absolute bottom-4 left-4 z-20 max-w-[260px]
            rounded-xl px-4 py-3.5 text-sm
            bg-[#1a1815]/[0.88] backdrop-blur-xl
            border border-[rgba(200,169,110,0.10)]
            shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(200,169,110,0.04)_inset]
            pointer-events-auto"
        >
          {/* Title row + pin */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#C8A96E] text-[11px] font-medium uppercase tracking-[0.12em] select-none">
              {t.controls.title}
            </h3>
            <div className="flex items-center gap-1">
              {/* Pin toggle */}
              <button
                onClick={() => setPinned(!pinned)}
                title={pinned ? t.controls.unpinPanel : t.controls.pinPanel}
                className={`text-sm leading-none transition-all cursor-pointer border-none bg-none ${
                  pinned
                    ? 'text-[#C8A96E]/70'
                    : 'text-[#8B8782]/15 hover:text-[#8B8782]/40'
                }`}
                style={{ cursor: 'pointer' }}
              >📌</button>
              {/* Close */}
              <button
                onClick={() => { onClose(); setPinned(false) }}
                className="text-[#8B8782]/20 hover:text-[#8B8782]/60 transition-colors text-base leading-none cursor-pointer border-none bg-none ml-0.5"
                style={{ cursor: 'pointer' }}
              >×</button>
            </div>
          </div>

          {/* Mouse section */}
          <div className="mb-2.5">
            <h4 className="text-[#8B8782]/25 text-[9px] font-medium uppercase tracking-[0.15em] mb-2 select-none">{t.controls.mouseSection}</h4>
            <div className="space-y-1">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-[#C8A96E]/55 text-[11px] w-[72px] shrink-0 select-none">{r.key}</span>
                  <span className="text-[#C8A96E]/30 mx-2 select-none">·</span>
                  <span className="text-[#C8A96E]/40 text-[11px] select-none">{r.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flight section */}
          <div className="mb-2.5">
            <h4 className="text-[#8B8782]/25 text-[9px] font-medium uppercase tracking-[0.15em] mb-2 select-none">{t.controls.flightSection}</h4>
            <div className="space-y-1">
              {flightRows.map((r, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-[#C8A96E]/55 text-[11px] w-[72px] shrink-0 font-mono select-none">{r.key}</span>
                  <span className="text-[#C8A96E]/30 mx-2 select-none">·</span>
                  <span className="text-[#C8A96E]/40 text-[11px] select-none">{r.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shortcuts section */}
          <div>
            <h4 className="text-[#8B8782]/25 text-[9px] font-medium uppercase tracking-[0.15em] mb-2 select-none">{t.controls.shortcutsSection}</h4>
            <div className="space-y-1">
              {shortcutRows.map((r, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-[#C8A96E]/55 text-[11px] w-[72px] shrink-0 font-mono select-none">{r.key}</span>
                  <span className="text-[#C8A96E]/30 mx-2 select-none">·</span>
                  <span className="text-[#C8A96E]/40 text-[11px] select-none">{r.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance toggle */}
          {onTogglePerf && (
            <div className="mt-3 pt-3 border-t border-[rgba(200,169,110,0.06)]">
              <button
                onClick={onTogglePerf}
                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] transition-all cursor-pointer border-none outline-none ${
                  showPerf
                    ? 'bg-[rgba(200,169,110,0.06)] text-[#C8A96E]/50'
                    : 'text-[#8B8782]/20 hover:text-[#8B8782]/40 hover:bg-[rgba(200,169,110,0.02)]'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <span className="font-mono uppercase tracking-wider">{t.controls.perfPanel}</span>
                <span className="font-mono">{showPerf ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
