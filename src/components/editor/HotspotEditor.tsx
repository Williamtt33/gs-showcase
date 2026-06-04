import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Hotspot, Vector3Like } from '../../types'

interface Props {
  isOpen: boolean
  mode: 'add' | 'edit'
  position?: Vector3Like | null
  editingHotspot?: Hotspot | null
  onSave: (data: { title: string; titleEn: string; description: string; descriptionEn: string }) => void
  onDelete?: () => void
  onClose: () => void
}

export default function HotspotEditor({ isOpen, mode, position, editingHotspot, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(editingHotspot?.title || '')
  const [titleEn, setTitleEn] = useState(editingHotspot?.titleEn || '')
  const [desc, setDesc] = useState(editingHotspot?.description || '')
  const [descEn, setDescEn] = useState(editingHotspot?.descriptionEn || '')

  useEffect(() => {
    if (!isOpen) return
    if (editingHotspot) {
      setTitle(editingHotspot.title || '')
      setTitleEn(editingHotspot.titleEn || '')
      setDesc(editingHotspot.description || '')
      setDescEn(editingHotspot.descriptionEn || '')
    } else {
      setTitle(''); setTitleEn(''); setDesc(''); setDescEn('')
    }
  }, [isOpen, editingHotspot])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const pos = editingHotspot?.position || position
  const order = editingHotspot?.order

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`absolute top-20 left-4 glass rounded-2xl p-5 z-20 w-[340px] max-w-[calc(100vw-2rem)] shadow-2xl shadow-black/30 ${isOpen ? '' : 'hidden'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {order && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold">
              {order}
            </span>
          )}
          <h3 className="font-semibold text-text-1 text-[14px]">
            {mode === 'add' ? '添加热点' : '编辑热点'}
          </h3>
        </div>
        <button onClick={onClose} className="text-text-3/50 hover:text-text-1 text-lg leading-none transition-colors">×</button>
      </div>

      {pos && (
        <div className="text-[10px] text-text-3/50 font-mono mb-4 bg-surface-2/50 rounded-lg px-3 py-2 border border-border-1">
          位置: ({pos.x.toFixed(2)}, {pos.y.toFixed(2)}, {pos.z.toFixed(2)})
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="hs-title" className="text-[11px] font-medium text-text-3/60 block mb-1">标题</label>
          <input id="hs-title" name="hs-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="这个视角下你观察到了什么？" autoFocus
            className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-3.5 py-2.5 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors" />
        </div>
        <div>
          <label htmlFor="hs-desc" className="text-[11px] font-medium text-text-3/60 block mb-1">描述（可选）</label>
          <textarea id="hs-desc" name="hs-desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="补充说明..." rows={2}
            className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-3.5 py-2.5 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors resize-none" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <button onClick={() => onSave({ title, titleEn, description: desc, descriptionEn: descEn })}
          disabled={!title.trim()}
          className="flex-1 py-2.5 px-6 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ cursor: !title.trim() ? 'not-allowed' : 'pointer' }}>
          保存
        </button>
        {mode === 'edit' && onDelete && (
          <button onClick={onDelete} className="px-4 py-2.5 rounded-xl bg-accent-3/[0.06] border border-accent-3/15 text-accent-3 text-[13px] font-medium cursor-pointer hover:bg-accent-3/[0.12] transition-all" style={{ cursor: 'pointer' }}>
            删除
          </button>
        )}
      </div>
    </motion.div>
  )
}
