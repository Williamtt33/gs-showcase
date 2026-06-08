import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { addCustomModel, generateId } from '../store/modelStore'
import { storeSplatFile, storeThumbnail } from '../utils/fileStorage'
import type { ModelMeta } from '../types'

const ALLOWED_EXTENSIONS = ['.ply', '.sog', '.splat']

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

function checkExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext))
}

export default function UploadModel() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // ── Model file handling ──
  const handleModelFile = (file: File) => {
    if (!checkExtension(file.name)) {
      setError(`不支持的文件格式: ${file.name}。仅支持 ${ALLOWED_EXTENSIONS.join(', ')}`)
      return
    }
    setModelFile(file)
    setError('')
    // Auto-fill name from filename
    if (!name) {
      const base = file.name.replace(/\.(ply|sog|splat)$/i, '')
      setName(base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleModelFile(file)
  }

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleModelFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  // ── Cover image handling ──
  const handleCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择 JPG 或 PNG 格式的图片')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleCoverFile(file)
    e.target.value = ''
  }

  const removeCover = () => { setCoverPreview(null) }

  // ── Save ──
  const handleSave = async () => {
    setError('')
    if (!name.trim()) { setError('请输入作品名称'); return }
    if (!modelFile) { setError('请上传模型文件'); return }

    setSaving(true)
    const modelId = generateId()

    try {
      const buffer = await modelFile.arrayBuffer()
      await storeSplatFile(modelId, buffer, modelFile.name)

      if (coverPreview) {
        await storeThumbnail(modelId, coverPreview)
      }

      const model: Omit<ModelMeta, 'id'> = {
        name: name.trim(),
        nameEn: name.trim(),
        description: description.trim(),
        descriptionEn: description.trim(),
        file: `[local]${modelFile.name}`,
        thumbnail: coverPreview ? '[local]' : '',
        tags: [],
        pointCount: '',
        size: '',
        featured: false,
        hotspots: [],
      }

      addCustomModel(model, modelId)
      navigate('/gallery')
    } catch (e: any) {
      setError('保存失败: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface-0">
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link to="/gallery" className="text-[13px] text-text-3/60 hover:text-text-2 transition-colors mb-6 inline-block">
            ← 返回画廊
          </Link>
          <h1 className="text-3xl font-display tracking-tight mb-2">
            <span className="gradient-text">上传新场景</span>
          </h1>
          <p className="text-text-3 text-[14px] mb-12 leading-relaxed">
            上传 3D Gaussian Splatting 模型文件，支持 .ply / .sog / .splat 格式
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-8"
        >
          {/* ── Model file upload ── */}
          <section>
            <label className="block text-[14px] font-semibold text-text-1 mb-3">
              模型文件 <span className="text-accent-3">*</span>
            </label>
            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-accent-1/50 bg-accent-1/[0.06] scale-[1.01]'
                  : modelFile
                    ? 'border-accent-2/40 bg-accent-2/[0.04]'
                    : 'border-border-1 hover:border-border-2 bg-surface-2/30 hover:bg-surface-2/50'
              }`}
            >
              {modelFile ? (
                <div className="space-y-2">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-[14px] font-medium text-text-1">{modelFile.name}</p>
                  <p className="text-[12px] text-text-3/60">{formatSize(modelFile.size)}</p>
                  <p className="text-[11px] text-text-3/40 mt-2">点击或拖拽以替换文件</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-4xl mb-2 opacity-50">{dragOver ? '📂' : '☁️'}</div>
                  <p className="text-[14px] font-medium text-text-2">
                    {dragOver ? '松开以上传' : '拖拽文件到此处，或点击选择'}
                  </p>
                  <p className="text-[12px] text-text-3/40">支持 .ply · .sog · .splat</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".ply,.sog,.splat"
                onChange={onFileSelect}
                className="hidden"
              />
            </div>
          </section>

          {/* ── Scene name ── */}
          <section>
            <label htmlFor="upload-name" className="block text-[14px] font-semibold text-text-1 mb-3">
              作品名称 <span className="text-accent-3">*</span>
            </label>
            <input
              id="upload-name" name="upload-name"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="输入场景名称..."
              className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-4 py-3.5 text-[14px] text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-accent-1/40 transition-colors"
            />
          </section>

          {/* ── Cover image ── */}
          <section>
            <label className="block text-[14px] font-semibold text-text-1 mb-3">封面图片</label>
            <div className="flex items-start gap-5">
              {/* Preview area */}
              <div
                onClick={() => document.getElementById('upload-cover')?.click()}
                className="w-32 h-20 rounded-xl border border-border-1 bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-border-2 transition-colors"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="封面预览" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-xl opacity-25">🖼️</div>
                    <div className="text-[10px] text-text-3/40 mt-0.5">点击上传</div>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[12px] text-text-3/60">支持 JPG / PNG 格式</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('upload-cover')?.click()}
                    className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-2 text-[12px] font-medium hover:bg-white/[0.08] transition-all cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >选择图片</button>
                  {coverPreview && (
                    <button
                      type="button"
                      onClick={removeCover}
                      className="px-4 py-2 rounded-lg text-text-3/60 text-[12px] hover:text-accent-3 transition-all cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >移除</button>
                  )}
                </div>
              </div>
              <input id="upload-cover" name="upload-cover" type="file" accept="image/jpeg,image/png" onChange={onCoverSelect} className="hidden" />
            </div>
          </section>

          {/* ── Description ── */}
          <section>
            <label htmlFor="upload-desc" className="block text-[14px] font-semibold text-text-1 mb-3">作品描述</label>
            <textarea
              id="upload-desc" name="upload-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="添加详细的场景描述..."
              rows={4}
              className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-4 py-3.5 text-[14px] text-text-1 placeholder:text-text-3/40 focus:outline-none focus:border-accent-1/40 transition-colors resize-none"
            />
          </section>

          {/* ── Error ── */}
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-accent-3 text-[13px] bg-accent-3/[0.06] border border-accent-3/15 rounded-xl px-4 py-3">
              {error}
            </motion.p>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[15px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? '上传中...' : '上传场景'}
            </button>
            <Link
              to="/gallery"
              className="px-6 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-2 text-[15px] font-medium hover:bg-white/[0.06] hover:text-text-1 transition-all cursor-pointer"
              style={{ cursor: 'pointer' }}
            >取消</Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
