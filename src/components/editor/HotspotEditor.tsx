import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import type { Hotspot, Vector3Like } from '../../types'

const EMOJI = ['📍', '🏷️', '💡', '🔍', '⭐', '🎯', '📌', '🔬', '🌿', '🏛️', '🪟', '🚪']
const COLORS = ['#d4a574', '#a3b5a6', '#c84b31', '#6b8e7b', '#fbbf24', '#f472b6', '#fb923c', '#f87171', '#ffffff']

interface Props {
  isOpen: boolean; mode: 'add' | 'edit'; position?: Vector3Like | null
  editingHotspot?: Hotspot | null
  onSave: (data: { title: string; titleEn: string; description: string; descriptionEn: string; icon: string; color: string }) => void
  onDelete?: () => void; onClose: () => void
}

export default function HotspotEditor({ isOpen, mode, position, editingHotspot, onSave, onDelete, onClose }: Props) {
  const { t } = useI18n()
  const [title, setTitle] = useState(editingHotspot?.title || '')
  const [titleEn, setTitleEn] = useState(editingHotspot?.titleEn || '')
  const [desc, setDesc] = useState(editingHotspot?.description || '')
  const [descEn, setDescEn] = useState(editingHotspot?.descriptionEn || '')
  const [icon, setIcon] = useState(editingHotspot?.icon || '📍')
  const [color, setColor] = useState(editingHotspot?.color || '#d4a574')

  // Sync form fields when editor opens (component stays mounted, uses CSS hidden)
  useEffect(() => {
    if (!isOpen) return
    if (editingHotspot) {
      setTitle(editingHotspot.title || '')
      setTitleEn(editingHotspot.titleEn || '')
      setDesc(editingHotspot.description || '')
      setDescEn(editingHotspot.descriptionEn || '')
      setIcon(editingHotspot.icon || '📍')
      setColor(editingHotspot.color || '#d4a574')
    } else {
      setTitle(''); setTitleEn(''); setDesc(''); setDescEn('')
      setIcon('📍'); setColor('#d4a574')
    }
  }, [isOpen, editingHotspot])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const pos = editingHotspot?.position || position

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`absolute top-20 left-4 glass rounded-2xl p-5 z-20 w-[340px] max-w-[calc(100vw-2rem)] shadow-2xl shadow-black/30 ${isOpen ? '' : 'hidden'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-1 text-[14px]">{mode === 'add' ? t.editor.addHotspot : t.editor.editHotspot}</h3>
        <button onClick={onClose} className="text-text-3/50 hover:text-text-1 text-lg leading-none transition-colors">×</button>
      </div>

      {pos && (
        <div className="text-[10px] text-text-3/50 font-mono mb-4 bg-surface-2/50 rounded-lg px-3 py-2 border border-border-1">
          位置: ({pos.x.toFixed(2)}, {pos.y.toFixed(2)}, {pos.z.toFixed(2)})
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="hs-title" className="text-[10px] text-text-3/60 block">标题 (中文)</label>
        <input id="hs-title" name="hs-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="标题 (中文)" autoFocus
          className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-3.5 py-2.5 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors" />
        <label htmlFor="hs-title-en" className="text-[10px] text-text-3/60 block">Title (English)</label>
        <input id="hs-title-en" name="hs-title-en" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Title (English)"
          className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-3.5 py-2.5 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors" />
        <label htmlFor="hs-desc" className="text-[10px] text-text-3/60 block">描述 (中文)</label>
        <textarea id="hs-desc" name="hs-desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述 (中文)" rows={2}
          className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-3.5 py-2.5 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors resize-none" />
        <label htmlFor="hs-desc-en" className="text-[10px] text-text-3/60 block">Description (English)</label>
        <textarea id="hs-desc-en" name="hs-desc-en" value={descEn} onChange={e => setDescEn(e.target.value)} placeholder="Description (English)" rows={2}
          className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-3.5 py-2.5 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors resize-none" />

        {/* Icon + Color row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="text-[10px] text-text-3/60 mb-1.5 block">图标</span>
            <div className="flex flex-wrap gap-1">
              {EMOJI.map(e => (
                <button key={e} onClick={() => setIcon(e)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${icon === e ? 'bg-white/15 ring-1 ring-white/20' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}
                >{e}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-text-3/60 mb-1.5 block">颜色</span>
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full transition-all ${color === c ? 'ring-2 ring-white/40 scale-115' : 'ring-1 ring-white/[0.06] hover:scale-110'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <button onClick={() => onSave({ title, titleEn, description: desc, descriptionEn: descEn, icon, color })}
          disabled={!title.trim()}
          className="flex-1 py-2.5 px-6 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ cursor: !title.trim() ? 'not-allowed' : 'pointer' }}>
          {t.editor.save}
        </button>
        {mode === 'edit' && onDelete && (
          <button onClick={onDelete} className="px-4 py-2.5 rounded-xl bg-accent-3/[0.06] border border-accent-3/15 text-accent-3 text-[13px] font-medium cursor-pointer hover:bg-accent-3/[0.12] transition-all" style={{ cursor: 'pointer' }}>
            {t.editor.delete}
          </button>
        )}
      </div>
    </motion.div>
  )
}
