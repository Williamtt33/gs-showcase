import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { getModelById, resolveModelUrl, type ModelInfo } from '../utils/models'
import Viewer3D from '../components/Viewer3D'
import { motion } from 'framer-motion'

export default function Viewer() {
  const { modelId } = useParams<{ modelId: string }>()
  const { t, lang } = useI18n()
  const [model, setModel] = useState<ModelInfo | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const genRef = useRef(0)

  useEffect(() => {
    if (!modelId) return
    genRef.current++
    const currentGen = genRef.current
    setModelUrl(null); setLoadError(null); setNotFound(false)
    getModelById(modelId).then(async (m) => {
      if (currentGen !== genRef.current) return // Stale request
      if (!m) { setNotFound(true); return }
      setModel(m)
      try {
        const url = await resolveModelUrl(m, (p) => {
          if (currentGen === genRef.current) setDownloadProgress(p)
        })
        if (currentGen !== genRef.current) return // Stale request
        setModelUrl(url)
      } catch (e: any) {
        if (currentGen !== genRef.current) return // Stale request
        setLoadError(e.message)
      }
    })
  }, [modelId])

  if (notFound || loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">{notFound ? '🔍' : '⚠️'}</div>
          <h1 className="text-2xl font-bold text-text-1 mb-2">{notFound ? '场景未找到' : '加载失败'}</h1>
          <p className="text-text-3/60 mb-6 max-w-sm mx-auto">{notFound ? `未找到 ID 为 "${modelId}" 的场景` : loadError}</p>
          <Link to="/gallery" className="inline-flex px-6 py-3 rounded-xl border border-white/[0.08] text-text-2 hover:text-text-1 hover:bg-white/[0.04] transition-all">
            ← {t.viewer.back}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dyn w-full bg-black relative overflow-hidden">
      {model && modelUrl && (
        <Viewer3D
          modelUrl={modelUrl}
          modelName={lang === 'zh' ? model.name : model.nameEn}
          modelId={model.id}
          readOnly
          downloadProgress={downloadProgress}
        />
      )}

      {/* Back button */}
      {model && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <Link to="/gallery" className="glass rounded-xl px-5 py-2.5 text-sm text-white/60 hover:text-white/90 transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            {t.viewer.back}
          </Link>
        </motion.div>
      )}

      {/* Loading state — shows progress bar during download */}
      {(!model || !modelUrl) && !notFound && !loadError && (
        <div className="h-full flex items-center justify-center bg-surface-0">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/60 text-sm mb-3">
              {model && !modelUrl ? '正在下载模型...' : t.gallery.loading}
            </p>
            {model && !modelUrl && (
              <>
                <div className="w-64 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent-1 to-accent-2 rounded-full"
                    animate={{ width: `${downloadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-white/25 text-xs mt-2 font-mono">{downloadProgress}%</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
