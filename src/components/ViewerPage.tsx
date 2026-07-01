import { useState, useEffect } from 'react'
import { resolveModelSource } from '../store'
import { getModelById } from '../store'
import type { ModelMeta } from '../types'
import Viewer3D from './Viewer3D'
import LoadingScreen from './LoadingScreen'

interface Props {
  modelId: string
  edit?: boolean
}

const UNRESOLVED = -1

export default function ViewerPage({ modelId, edit }: Props) {
  const [model, setModel] = useState<ModelMeta | null>(null)
  const [source, setSource] = useState<{ type: 'url'; url: string } | { type: 'buffer'; buffer: ArrayBuffer; format?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resolveProgress, setResolveProgress] = useState(UNRESOLVED) // -1 = finding, 0+ = resolving

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      // Phase 1: Find model
      setResolveProgress(UNRESOLVED)
      setError(null)

      const m = await getModelById(modelId)
      if (cancelled) return
      if (!m) {
        setError('模型未找到')
        return
      }
      setModel(m)

      // Phase 2: Resolve model source
      try {
        const src = await resolveModelSource(m, (pct) => {
          if (!cancelled) setResolveProgress(pct)
        })
        if (!cancelled) {
          setSource(src)
          setResolveProgress(100)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || '加载失败')
      }
    }

    load()
    return () => { cancelled = true }
  }, [modelId])

  // Still resolving — show progress
  if (!error && !source) {
    return (
      <div className="h-screen bg-black">
        <LoadingScreen progress={resolveProgress >= 0 ? Math.max(0, resolveProgress) : 0} />
      </div>
    )
  }

  // Error
  if (error || !model) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-400 text-4xl mb-4">⚠</div>
          <p className="text-red-300 mb-2 font-semibold">加载失败</p>
          <p className="text-white/40 text-sm max-w-md">{error || '模型未找到'}</p>
        </div>
      </div>
    )
  }

  return (
    <Viewer3D
      modelSource={source!}
      modelName={model.name}
      modelId={modelId}
      readOnly={!edit}
      downloadProgress={resolveProgress}
    />
  )
}
