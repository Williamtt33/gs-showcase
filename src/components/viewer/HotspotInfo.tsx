import { motion, AnimatePresence } from 'framer-motion'
import type { Hotspot } from '../../types'

interface Props {
  hotspot: Hotspot | null
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  isEditing?: boolean
  lang: string
}

export default function HotspotInfo({ hotspot, onClose, onEdit, onDelete, isEditing, lang }: Props) {
  return (
    <AnimatePresence>
      {hotspot && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-20 right-4 glass rounded-2xl p-5 z-20 max-w-xs w-full shadow-xl shadow-black/20"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Numbered circle */}
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border-2 border-white/30 text-white text-base font-bold shrink-0"
                style={{ fontFamily: "'Inter', 'Noto Sans SC', sans-serif" }}
              >
                {hotspot.order || '?'}
              </span>
              <div>
                <h3 className="font-semibold text-white/90 text-sm">
                  {lang === 'zh' ? hotspot.title : hotspot.titleEn || hotspot.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none"
            >×</button>
          </div>

          <p className="text-sm text-white/50 leading-relaxed mb-4">
            {lang === 'zh' ? hotspot.description : hotspot.descriptionEn || hotspot.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
            <span>pos: ({hotspot.position.x.toFixed(2)}, {hotspot.position.y.toFixed(2)}, {hotspot.position.z.toFixed(2)})</span>
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-3">
              {onEdit && (
                <button onClick={onEdit}
                  className="flex-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-2 text-xs hover:bg-white/[0.08] transition-colors cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >编辑标注</button>
              )}
              {onDelete && (
                <button onClick={onDelete}
                  className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >删除</button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
