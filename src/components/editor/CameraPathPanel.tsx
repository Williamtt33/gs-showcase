import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import type { CameraPath } from '../../types'
import type { Camera, OrbitControls } from 'gsplat'
import type { PlaybackEngine } from '../../hooks/useCameraPathPlayer'
import {
  getCameraPaths,
  addCameraPath,
  updateCameraPath,
  deleteCameraPath,
  generateId,
} from '../../store/modelStore'

interface Props {
  modelId: string
  cameraRef: React.RefObject<Camera | null>
  controlsRef: React.RefObject<OrbitControls | null>
  splatModuleRef: React.RefObject<typeof import('gsplat') | null>
  playback: PlaybackEngine | null
  /** Currently selected path ID (managed by Viewer3D) */
  activePathId: string | null
  onSelectPath: (path: CameraPath | null) => void
  visible: boolean
  onClose: () => void
}

export default function CameraPathPanel({
  modelId,
  cameraRef,
  splatModuleRef,
  playback,
  activePathId,
  onSelectPath,
  visible,
  onClose,
}: Props) {
  const { t, lang } = useI18n()
  const cp = t.cameraPath
  const [paths, setPaths] = useState<CameraPath[]>(() => getCameraPaths(modelId))
  const [editingMode, setEditingMode] = useState<'none' | 'new' | 'rename'>('none')
  const [editValue, setEditValue] = useState('')

  // Reload paths when panel opens or model changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (visible) setPaths(getCameraPaths(modelId))
  }, [visible, modelId])

  const activePath = paths.find(p => p.id === activePathId) || null

  // ── Path CRUD ──
  const handleNew = useCallback(() => {
    if (!editValue.trim()) return
    const path = addCameraPath(modelId, {
      name: editValue.trim(),
      nameEn: editValue.trim(),
      keyframes: [],
    })
    setPaths(getCameraPaths(modelId))
    onSelectPath(path)
    setEditingMode('none')
    setEditValue('')
  }, [modelId, editValue, onSelectPath])

  const handleRename = useCallback(() => {
    if (!activePathId || !editValue.trim()) return
    updateCameraPath(modelId, activePathId, {
      name: editValue.trim(),
      nameEn: editValue.trim(),
    })
    setPaths(getCameraPaths(modelId))
    setEditingMode('none')
    setEditValue('')
  }, [modelId, activePathId, editValue])

  const handleDelete = useCallback(() => {
    if (!activePathId) return
    deleteCameraPath(modelId, activePathId)
    onSelectPath(null)
    setPaths(getCameraPaths(modelId))
  }, [modelId, activePathId, onSelectPath])

  // ── Keyframe CRUD ──
  const handleCaptureKeyframe = useCallback(() => {
    if (!activePathId) return
    const cam = cameraRef.current
    const SPLAT = splatModuleRef.current
    if (!cam || !SPLAT) return

    const pos = { x: cam.position.x, y: cam.position.y, z: cam.position.z }
    const fwd = cam.forward
    const target = {
      x: pos.x + fwd.x * 3,
      y: pos.y + fwd.y * 3,
      z: pos.z + fwd.z * 3,
    }

    const newKf = {
      id: generateId(),
      position: pos,
      target,
    }

    const updatedKfs = [...(activePath?.keyframes || []), newKf]
    updateCameraPath(modelId, activePathId, { keyframes: updatedKfs })
    setPaths(getCameraPaths(modelId))
  }, [modelId, activePathId, activePath, cameraRef, splatModuleRef])

  const handleDeleteKeyframe = useCallback((kfId: string) => {
    if (!activePathId || !activePath) return
    const updatedKfs = activePath.keyframes.filter(k => k.id !== kfId)
    updateCameraPath(modelId, activePathId, { keyframes: updatedKfs })
    setPaths(getCameraPaths(modelId))
  }, [modelId, activePathId, activePath])

  const handleMoveKeyframe = useCallback((kfId: string, direction: -1 | 1) => {
    if (!activePathId || !activePath) return
    const kfs = [...activePath.keyframes]
    const idx = kfs.findIndex(k => k.id === kfId)
    if (idx < 0) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= kfs.length) return
    // Swap
    ;[kfs[idx], kfs[newIdx]] = [kfs[newIdx], kfs[idx]]
    updateCameraPath(modelId, activePathId, { keyframes: kfs })
    setPaths(getCameraPaths(modelId))
  }, [modelId, activePathId, activePath])

  // ── Escape key ──
  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, onClose])

  const isPlaying = playback?.state === 'playing'
  const isPaused = playback?.state === 'paused'
  const kfs = activePath?.keyframes || []

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute top-20 right-4 glass rounded-2xl p-5 z-20 w-[340px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto shadow-2xl shadow-black/30 ${visible ? '' : 'hidden'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-1 text-[14px]">{cp.title}</h3>
        <button onClick={onClose} className="text-text-3/50 hover:text-text-1 text-lg leading-none transition-colors">×</button>
      </div>

      {/* ═══ Section 1: Path Management ═══ */}
      <div className="space-y-2 mb-4">
        {/* Path selector */}
        {paths.length > 0 ? (
          <select
            value={activePathId || ''}
            onChange={e => {
              const p = paths.find(pp => pp.id === e.target.value)
              onSelectPath(p || null)
            }}
            className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-3 py-2.5 text-[13px] text-text-1 focus:outline-none focus:border-accent-1/40 transition-colors"
          >
            <option value="" disabled>{cp.selectPath}</option>
            {paths.map(p => (
              <option key={p.id} value={p.id}>
                {lang === 'zh' ? p.name : p.nameEn || p.name}
                {p.keyframes.length > 0 ? ` (${p.keyframes.length} kf)` : ''}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-[12px] text-text-3/50 py-2">{cp.noPaths}</p>
        )}

        {/* Path action buttons */}
        <div className="flex items-center gap-2">
          {editingMode === 'none' ? (
            <>
              <button
                onClick={() => { setEditingMode('new'); setEditValue('') }}
                className="flex-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-3 hover:text-text-2 text-[12px] font-medium transition-all cursor-pointer"
                style={{ cursor: 'pointer' }}
              >+ {cp.newPath}</button>
              {activePath && (
                <>
                  <button
                    onClick={() => { setEditingMode('rename'); setEditValue(lang === 'zh' ? activePath.name : activePath.nameEn || activePath.name) }}
                    className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-3/60 hover:text-text-3 text-[12px] transition-all cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >{cp.renamePath}</button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 rounded-lg bg-accent-3/[0.06] border border-accent-3/15 text-accent-3/70 hover:text-accent-3 text-[12px] transition-all cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >{cp.deletePath}</button>
                </>
              )}
            </>
          ) : (
            /* Inline name input */
            <div className="flex items-center gap-2 w-full">
              <input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { if (editingMode === 'new') handleNew(); else handleRename() }
                  if (e.key === 'Escape') setEditingMode('none')
                }}
                placeholder={cp.pathName}
                className="flex-1 bg-surface-2/80 border border-border-1 rounded-lg px-3 py-2 text-[13px] text-text-1 placeholder:text-text-3/30 focus:outline-none focus:border-accent-1/40 transition-colors"
                autoFocus
              />
              <button
                onClick={editingMode === 'new' ? handleNew : handleRename}
                disabled={!editValue.trim()}
                className="px-3 py-2 rounded-lg bg-accent-2/10 border border-accent-2/20 text-accent-2/80 text-[12px] font-medium disabled:opacity-30 cursor-pointer transition-all"
                style={{ cursor: editValue.trim() ? 'pointer' : 'not-allowed' }}
              >✓</button>
              <button
                onClick={() => setEditingMode('none')}
                className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-3/60 text-[12px] cursor-pointer transition-all"
                style={{ cursor: 'pointer' }}
              >×</button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Section 2: Keyframe List ═══ */}
      {activePath && (
        <div className="border-t border-border-1 pt-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-text-3/60">{cp.keyframes}</span>
            <span className="text-[10px] text-text-3/40 font-mono">{kfs.length}</span>
          </div>

          {kfs.length === 0 ? (
            <p className="text-[11px] text-text-3/40 py-3 text-center">{cp.noKeyframes}</p>
          ) : (
            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
              {kfs.map((kf, idx) => (
                <div
                  key={kf.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2/40 border border-border-1 group hover:bg-surface-2/60 transition-colors"
                >
                  {/* Index badge */}
                  <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-text-3/70 shrink-0">
                    {idx + 1}
                  </span>

                  {/* Coords */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-text-3/50 block truncate">
                      {kf.position.x.toFixed(1)}, {kf.position.y.toFixed(1)}, {kf.position.z.toFixed(1)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleMoveKeyframe(kf.id, -1)}
                      disabled={idx === 0}
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-text-3/40 hover:text-text-2 disabled:opacity-20 transition-colors cursor-pointer"
                      style={{ cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                      title={cp.moveUp}
                    >▲</button>
                    <button
                      onClick={() => handleMoveKeyframe(kf.id, 1)}
                      disabled={idx === kfs.length - 1}
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-text-3/40 hover:text-text-2 disabled:opacity-20 transition-colors cursor-pointer"
                      style={{ cursor: idx === kfs.length - 1 ? 'not-allowed' : 'pointer' }}
                      title={cp.moveDown}
                    >▼</button>
                    <button
                      onClick={() => handleDeleteKeyframe(kf.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-accent-3/40 hover:text-accent-3 transition-colors cursor-pointer ml-0.5"
                      style={{ cursor: 'pointer' }}
                      title={cp.deleteKeyframe}
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Capture button */}
          <button
            onClick={handleCaptureKeyframe}
            className="w-full mt-2 py-2 rounded-lg bg-white/[0.04] border border-dashed border-white/[0.08] text-text-3/60 hover:text-text-2 hover:border-white/[0.12] text-[12px] font-medium transition-all cursor-pointer"
            style={{ cursor: 'pointer' }}
          >+ {cp.addKeyframe}</button>
        </div>
      )}

      {/* ═══ Section 3: Playback Controls ═══ */}
      {activePath && playback && (
        <div className="border-t border-border-1 pt-4">
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-1 to-accent-2 rounded-full"
              style={{ width: `${Math.round(playback.overallProgress * 100)}%` }}
            />
          </div>

          {/* Play/Pause/Stop */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                if (isPlaying) playback.pause()
                else playback.play()
              }}
              disabled={!activePath || kfs.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[13px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ cursor: (!activePath || kfs.length === 0) ? 'not-allowed' : 'pointer' }}
            >
              {isPlaying ? '⏸' : '▶'} {isPlaying ? cp.pause : isPaused ? cp.play : cp.play}
            </button>
            <button
              onClick={playback.stop}
              disabled={playback.state === 'idle'}
              className="px-4 py-2.5 rounded-xl bg-accent-3/[0.06] border border-accent-3/15 text-accent-3/70 text-[13px] font-medium cursor-pointer hover:bg-accent-3/[0.12] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ cursor: playback.state === 'idle' ? 'not-allowed' : 'pointer' }}
            >■ {cp.stop}</button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-3/50 font-medium">{cp.speed}</span>
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                onClick={() => playback.setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                  playback.speed === s
                    ? 'bg-accent-1/15 border border-accent-1/30 text-accent-1/80'
                    : 'bg-white/[0.03] border border-white/[0.06] text-text-3/50 hover:text-text-3'
                }`}
                style={{ cursor: 'pointer' }}
              >{s}x</button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
