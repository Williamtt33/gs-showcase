import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { ModelMeta } from '../../types'
import { addCustomModel, updateCustomModel, generateId } from '../../store/modelStore'
import { storeSplatFile, deleteSplatFile, storeThumbnail } from '../../utils/fileStorage'
import FileDropZone from '../FileDropZone'

interface Props {
  isOpen: boolean
  editingModel?: ModelMeta | null
  onSaved: () => void
  onClose: () => void
}

export default function ModelForm({ isOpen, editingModel, onSaved, onClose }: Props) {
  const [name, setName] = useState(editingModel?.name || '')
  const [file, setFile] = useState(editingModel?.file || '')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [splatFile, setSplatFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  // Sync form fields when modal opens (component stays mounted, uses CSS hidden)
  useEffect(() => {
    if (!isOpen) return
    if (editingModel) {
      // Edit mode: pre-fill from existing model
      setName(editingModel.name || '')
      setFile(editingModel.file || '')
      setSplatFile(null)
      setCoverPreview(null)
      setError('')
    } else {
      // Add mode: reset to empty
      setName(''); setFile(''); setSplatFile(null); setCoverPreview(null); setError('')
    }
  }, [isOpen, editingModel])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleSplatFile = (f: File) => {
    setSplatFile(f)
    if (!name) {
      const base = f.name.replace(/\.(splat|ply)$/i, '')
      setName(base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    }
    setFile(`[uploaded] ${f.name}`)
    setError('')
  }

  const handleCoverFile = (f: File) => {
    if (!f.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  const handleSave = async () => {
    setError('')
    if (!name.trim()) { setError('请输入场景名称'); return }
    if (!splatFile && !file.trim()) { setError('请上传模型文件或输入文件路径'); return }

    setUploading(true)
    const modelId = editingModel?.id || generateId()

    try {
      if (splatFile) {
        const buffer = await splatFile.arrayBuffer()
        await storeSplatFile(modelId, buffer, splatFile.name)
      }
      if (coverPreview) {
        await storeThumbnail(modelId, coverPreview)
      }

      const base: Omit<ModelMeta, 'id'> = {
        name: name.trim(), nameEn: name.trim(),
        description: '', descriptionEn: '',
        file: splatFile ? `[local]${splatFile.name}` : file.trim(),
        thumbnail: coverPreview ? '[local]' : '',
        tags: [], pointCount: '', size: '',
        featured: false,
        hotspots: editingModel?.hotspots || [],
      }

      if (editingModel) {
        if (!splatFile && editingModel.file !== file.trim()) {
          await deleteSplatFile(editingModel.id)
        }
        updateCustomModel(editingModel.id, base)
      } else {
        addCustomModel(base, modelId)
      }

      onSaved()
      onClose()
    } catch (e: any) {
      setError('保存失败: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="glass rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
          <h3 className="font-semibold text-text-1 text-lg mb-6">
            {editingModel ? '编辑场景' : '添加新场景'}
          </h3>

          <div className="space-y-5">
            <div>
              <label htmlFor="splat-file-upload" className="block text-[12px] font-medium text-text-2 mb-2">模型文件（.splat）</label>
              <FileDropZone id="splat-file-upload" onFile={handleSplatFile} hint="拖拽 .splat 或 .ply 文件到此处" />
            </div>

            <div>
              <label htmlFor="scene-name" className="block text-[12px] font-medium text-text-2 mb-2">场景名称</label>
              <input
                id="scene-name" name="scene-name"
                value={name} onChange={e => { setName(e.target.value); setError('') }}
                placeholder="例如：春日花园、城市街景..."
                className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-4 py-3 text-[14px] text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-accent-1/40 transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="scene-filepath" className="block text-[12px] font-medium text-text-2 mb-2">或输入文件路径</label>
              <input
                id="scene-filepath" name="scene-filepath"
                value={splatFile ? `[上传] ${splatFile.name}` : file}
                onChange={e => { setFile(e.target.value); setError('') }}
                placeholder="/models/your-scene.splat"
                disabled={!!splatFile}
                className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-4 py-3 text-[13px] text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-accent-1/40 transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="cover-input" className="block text-[12px] font-medium text-text-2 mb-2">封面图片（可选）</label>
              <div className="flex items-start gap-4">
                <button type="button"
                  className="w-24 h-16 rounded-xl border border-border-1 bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-border-2 transition-colors"
                  onClick={() => document.getElementById('cover-input')?.click()}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="封面预览" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-lg opacity-30">🖼️</div>
                      <div className="text-[9px] text-text-3/40 mt-0.5">设置封面</div>
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <p className="text-[11px] text-text-3/50 mb-2">上传图片或在查看器中截图自动生成</p>
                  <button type="button"
                    onClick={() => document.getElementById('cover-input')?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-3 hover:text-text-2 text-[11px] transition-all font-medium"
                  >选择图片</button>
                  <input id="cover-input" name="cover" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverFile(f) }} className="hidden" />
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-[12px]">{error}</p>}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSave} disabled={uploading}
              className="flex-1 py-3 px-6 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
            >{uploading ? '保存中...' : editingModel ? '保存修改' : '添加场景'}</button>
            <button onClick={onClose}
              className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-2 text-[14px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-text-1 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              style={{ cursor: 'pointer' }}
            >取消</button>
          </div>
        </motion.div>
      </div>
  )
}
