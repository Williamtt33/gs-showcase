import { useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion } from 'framer-motion'
import { addCustomModel, generateId } from '../store/modelStore'
import { storeSplatFileWithProgress, storeThumbnail } from '../utils/fileStorage'
import { validateModelFile } from '../utils/fileValidation'
import { showToast } from '../components/Toast'
import { addUploadRecord } from '../utils/uploadHistory'
import { createModel, uploadSplatFile, uploadThumbnail, isSupabaseConfigured } from '../lib/api'
import type { ModelMeta } from '../types'
import FileDropZone from '../components/FileDropZone'

export default function UploadModel() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validating, setValidating] = useState(false)
  const [dropZoneKey, setDropZoneKey] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  // ── Model file handling ──
  const handleModelFile = useCallback(async (file: File) => {
    setError('')
    setUploadProgress(0)
    setValidating(true)

    // Auto-fill name from filename
    if (!name) {
      const base = file.name.replace(/\.(ply|sog|splat)$/i, '')
      setName(base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    }

    try {
      // Async header validation
      const result = await validateModelFile(file)

      if (!result.valid) {
        setError(result.error!)
        setModelFile(null)
        return
      }

      setModelFile(file)
      setDropZoneKey(k => k + 1) // reset drop zone — file info now in summary card below

      // Show format info via toast for confirmation
      if (result.format) {
        showToast(`已识别: ${result.format}`, 'info')
      }
    } catch (err: unknown) {
      setError('文件读取失败: ' + (err instanceof Error ? err.message : '未知错误'))
      setModelFile(null)
    } finally {
      setValidating(false)
    }
  }, [name])

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

  const removeCover = () => setCoverPreview(null)

  // ── Save with progress + cancel support ──
  const handleSave = async () => {
    setError('')
    if (!name.trim()) { setError('请输入作品名称'); return }
    if (!modelFile) { setError('请上传模型文件'); return }

    setSaving(true)
    setUploadProgress(0)
    const modelId = generateId()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const useRemote = isSupabaseConfigured()
      let useLocalFallback = false

      if (useRemote) {
        // ── Try Supabase cloud path first ──
        try {
          setUploadProgress(10)
          const fileUrl = await uploadSplatFile(modelId, modelFile)

          setUploadProgress(70)
          let thumbUrl = ''
          if (coverPreview) {
            thumbUrl = await uploadThumbnail(modelId, coverPreview)
          }

          setUploadProgress(90)
          const model: Omit<ModelMeta, 'id'> = {
            name: name.trim(),
            nameEn: name.trim(),
            description: description.trim(),
            descriptionEn: description.trim(),
            file: fileUrl,
            thumbnail: thumbUrl,
            tags: [],
            pointCount: '',
            size: '',
            featured: false,
            hotspots: [],
          }

          await createModel(model, modelId)
          setUploadProgress(100)
        } catch (remoteErr: unknown) {
          // Supabase failed (e.g. RLS, auth) — fall back to local storage
          console.warn('Supabase upload failed, falling back to local storage:', remoteErr)
          useLocalFallback = true
        }
      }

      if (!useRemote || useLocalFallback) {
        // ── Local path: IndexedDB + localStorage ──
        await storeSplatFileWithProgress(
          modelId, modelFile, modelFile.name,
          (pct) => setUploadProgress(pct), controller.signal,
        )

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
      }

      addUploadRecord({ id: modelId, name: name.trim(), filename: modelFile.name, size: modelFile.size })

      showToast(`「${name.trim()}」上传成功`, 'success')
      navigate('/gallery')
    } catch (e: unknown) {
      if (e instanceof Error && (e.name === 'AbortError' || e.message?.includes('cancelled'))) {
        showToast('上传已取消', 'info')
      } else {
        setError('保存失败: ' + (e instanceof Error ? e.message : '未知错误'))
      }
    } finally {
      setSaving(false)
      abortRef.current = null
    }
  }

  const handleCancel = () => {
    abortRef.current?.abort()
  }

  const formatSizeDisplay = (bytes: number) => {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
    return `${bytes} B`
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
          <p className="text-text-3 text-[14px] mb-4 leading-relaxed">
            上传 3D Gaussian Splatting 模型文件，支持 .ply / .sog / .splat 格式
          </p>
          <details className="mb-12 group">
            <summary className="text-[12px] text-text-3/50 hover:text-text-3/80 cursor-pointer transition-colors select-none">
              {t.upload.whatAreFormats}
            </summary>
            <div className="mt-3 ink-card-light rounded-xl px-4 py-3 text-[12px] text-text-3/60 leading-relaxed space-y-2">
              <p>{t.upload.formatDesc1}</p>
              <p>{t.upload.formatDesc2}</p>
            </div>
          </details>
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

            {/* Drop zone with validating overlay */}
            <div className="relative">
              <FileDropZone
                key={dropZoneKey}
                onFile={handleModelFile}
                requireConfirm
                hint="拖拽 .splat 或 .ply 文件到此处"
              />

              {/* Validating overlay — covers drop zone during async check */}
              {validating && (
                <div className="absolute inset-0 rounded-2xl bg-surface-0/80 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[13px] text-text-3/60">正在校验文件...</p>
                  </div>
                </div>
              )}
            </div>

            {/* File info summary after confirmation */}
            {modelFile && !validating && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 ink-card-light rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-2/10 border border-accent-2/15 flex items-center justify-center text-xs font-mono text-accent-2/70 shrink-0">
                  {modelFile.name.split('.').pop()?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-text-1 truncate">{modelFile.name}</p>
                  <p className="text-[11px] text-text-3/50">{formatSizeDisplay(modelFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setModelFile(null); setUploadProgress(0) }}
                  className="text-[11px] text-text-3/40 hover:text-accent-3/60 transition-colors cursor-pointer shrink-0"
                  style={{ cursor: 'pointer' }}
                >
                  移除
                </button>
              </motion.div>
            )}
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

          {/* ── Upload progress (visible during save) ── */}
          {saving && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border-1 bg-surface-2/40 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-text-2">
                  {uploadProgress < 100 ? '正在上传...' : '处理中...'}
                </span>
                <span className="text-[11px] font-mono text-text-3/60">{uploadProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-1 via-accent-1/80 to-accent-2"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                />
              </div>

              {/* Size indicator */}
              {modelFile && (
                <p className="text-[11px] text-text-3/40 text-center">
                  {formatSizeDisplay(modelFile.size * uploadProgress / 100)} / {formatSizeDisplay(modelFile.size)}
                </p>
              )}

              {/* Cancel button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-[12px] text-text-3/50 hover:text-accent-3 hover:bg-accent-3/[0.06] transition-all cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  取消上传
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Error ── */}
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-accent-3 text-[13px] bg-accent-3/[0.06] border border-accent-3/15 rounded-xl px-4 py-3">
              {error}
            </motion.p>
          )}

          {/* ── Actions ── */}
          {!saving && (
            <div className="flex items-center gap-3 pt-8 pb-4">
              <button
                onClick={handleSave}
                disabled={!modelFile || validating}
                className="flex-1 py-3.5 px-6 rounded-xl btn-primary text-[15px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed"
                style={{ cursor: !modelFile || validating ? 'not-allowed' : 'pointer' }}
              >
                上传场景
              </button>
              <Link
                to="/gallery"
                className="px-6 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-2 text-[15px] font-medium hover:bg-white/[0.06] hover:text-text-1 transition-all cursor-pointer"
                style={{ cursor: 'pointer' }}
              >取消</Link>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
