import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getModelById, resolveModelUrl } from '../utils/models'
import { updateCustomModel } from '../store/modelStore'
import { storeThumbnail } from '../utils/fileStorage'
import Viewer3D from '../components/Viewer3D'
import type { ModelMeta } from '../types'

export default function EditModel() {
  const { modelId } = useParams<{ modelId: string }>()

  const [model, setModel] = useState<ModelMeta | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!modelId) return
    setLoading(true)
    setDownloading(false)
    getModelById(modelId).then(async (m) => {
      if (!m) { setNotFound(true); setLoading(false); return }
      setModel(m)
      setName(m.name)
      setDescription(m.description)
      setLoading(false)
      setDownloading(true)
      try {
        const url = await resolveModelUrl(m, setDownloadProgress)
        setModelUrl(url)
      } catch {}
      setDownloading(false)
    })
  }, [modelId])

  // Load existing thumbnail if any
  useEffect(() => {
    if (!model) return
    if (model.thumbnail === '[local]') {
      import('../utils/fileStorage').then(({ getThumbnail }) => {
        getThumbnail(model.id).then(data => { if (data) setCoverPreview(data) })
      })
    } else if (model.thumbnail && model.thumbnail.startsWith('/')) {
      setCoverPreview(model.thumbnail)
    }
  }, [model])

  const handleCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!model || !name.trim()) return
    setSaving(true)
    try {
      if (coverPreview && coverPreview.startsWith('data:')) {
        await storeThumbnail(model.id, coverPreview)
      }
      updateCustomModel(model.id, {
        name: name.trim(),
        nameEn: name.trim(),
        description: description.trim(),
        descriptionEn: description.trim(),
        thumbnail: coverPreview?.startsWith('data:') ? '[local]' : model.thumbnail,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      console.error('Save failed:', e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-0">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-3/60 text-sm">加载场景信息...</p>
        </div>
      </div>
    )
  }

  if (notFound || !model) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-2 mb-2">场景未找到</h1>
          <Link to="/admin" className="text-text-3/60 hover:text-text-2 transition-colors text-sm">← 返回管理</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* 3D Viewer in edit mode */}
      {modelUrl && (
        <Viewer3D
          modelUrl={modelUrl}
          modelName={model.name}
          modelId={model.id}
          readOnly={false}
          downloadProgress={downloadProgress}
        />
      )}

      {/* Download progress overlay */}
      {downloading && !modelUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-30">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/60 text-sm mb-3">正在下载模型...</p>
            <div className="w-64 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-1 to-accent-2 rounded-full"
                animate={{ width: `${downloadProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-white/25 text-xs mt-2 font-mono">{downloadProgress}%</p>
          </div>
        </div>
      )}

      {/* Back link */}
      <Link
        to="/admin"
        className="absolute top-4 left-4 glass rounded-xl px-4 py-2.5 text-sm text-white/50 hover:text-white/80 transition-colors z-10"
      >← 返回管理</Link>

      {/* Edit panel — right side */}
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        className="absolute top-4 right-4 glass rounded-2xl p-5 z-10 w-[300px] max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl"
      >
        <h3 className="font-semibold text-text-1 text-[15px] mb-4">编辑场景</h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="edit-name" className="text-[11px] font-medium text-text-3/60 block mb-1.5">场景名称</label>
            <input
              id="edit-name" name="edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface-2/80 border border-border-1 rounded-lg px-3 py-2.5 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-desc" className="text-[11px] font-medium text-text-3/60 block mb-1.5">场景描述</label>
            <textarea
              id="edit-desc" name="edit-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-surface-2/80 border border-border-1 rounded-lg px-3 py-2.5 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors resize-none"
            />
          </div>

          {/* Cover */}
          <div>
            <label className="text-[11px] font-medium text-text-3/60 block mb-1.5">封面图片</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => document.getElementById('edit-cover')?.click()}
                className="w-16 h-10 rounded-lg border border-border-1 bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-border-2 transition-colors"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm opacity-20">🖼</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('edit-cover')?.click()}
                className="text-[11px] text-text-3/60 hover:text-text-2 transition-colors cursor-pointer"
                style={{ cursor: 'pointer' }}
              >更换封面</button>
              <input id="edit-cover" name="edit-cover" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverFile(f) }} className="hidden" />
            </div>
          </div>

          {/* Hotspot list summary */}
          {model.hotspots && model.hotspots.length > 0 && (
            <div className="text-[11px] text-text-3/50">
              已标注 {model.hotspots.length} 个热点 · 按 E 进入编辑模式后在模型上点击放置
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[13px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-35"
            style={{ cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? '保存中...' : saved ? '✓ 已保存' : '保存信息'}
          </button>

          {/* Quick hint */}
          <div className="text-[10px] text-text-3/40 leading-relaxed border-t border-border-1 pt-3">
            <p>💡 移动视角到目标位置后，点击工具栏 <span className="text-white/60">📌 添加标注</span> 按钮</p>
            <p className="mt-1">点击标注圆圈可飞回对应视角，左/右方向键浏览</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
