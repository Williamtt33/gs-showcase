import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nContext'
import type { CameraPath } from '../../types'

interface Props {
  isOpen: boolean
  paths: CameraPath[]
  activePathId: string | null
  onSelectPath: (pathId: string) => void
  onAddPath: (name: string, nameEn: string) => void
  onDeletePath: (pathId: string) => void
  onRecordWaypoint: (pathId: string) => void
  onDeleteWaypoint: (pathId: string, wpId: string) => void
  onClearWaypoints: (pathId: string) => void
  onClose: () => void
}

export default function CameraPathEditor({
  isOpen,
  paths,
  activePathId,
  onSelectPath,
  onAddPath,
  onDeletePath,
  onRecordWaypoint,
  onDeleteWaypoint,
  onClearWaypoints,
  onClose,
}: Props) {
  const { t } = useI18n()
  const [newName, setNewName] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const activePath = paths.find(p => p.id === activePathId)

  const handleAddPath = () => {
    if (!newName.trim()) return
    onAddPath(newName.trim(), newName.trim())
    setNewName('')
    setShowNewForm(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute top-20 right-4 glass rounded-2xl p-5 z-20 max-w-sm w-full shadow-xl shadow-black/20 ${isOpen ? '' : 'hidden'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white/80 text-sm">{t.editor.cameraPath}</h3>
        <button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg leading-none">×</button>
      </div>

      {/* Path list */}
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {paths.map(path => (
          <div
            key={path.id}
            className={`rounded-xl p-3 cursor-pointer transition-all ${
              activePathId === path.id
                ? 'bg-accent-1/10 border border-accent-1/25'
                : 'bg-white/5 border border-white/5 hover:bg-white/10'
            }`}
            onClick={() => onSelectPath(path.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-white/70">{path.name}</span>
                <span className="text-xs text-white/30 ml-2">
                  {path.waypoints.length} {t.editor.waypointCount}
                </span>
                {path.loop && <span className="text-xs text-accent-2 ml-1">↻</span>}
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDeletePath(path.id) }}
                className="text-white/20 hover:text-red-400 text-sm transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {paths.length === 0 && (
          <p className="text-xs text-white/30 text-center py-4">{t.editor.noPaths}</p>
        )}
      </div>

      {/* New path form */}
      {showNewForm ? (
        <div className="flex gap-2 mb-3">
          <label htmlFor="path-name" className="sr-only">{t.editor.pathName}</label>
          <input
            id="path-name" name="path-name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddPath()}
            placeholder={t.editor.pathName}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-accent-1/40"
            autoFocus
          />
          <button onClick={handleAddPath} className="px-3 py-2 rounded-lg bg-accent-1/15 text-accent-1 text-xs">
            {t.editor.save}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewForm(true)}
          className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:text-white/80 hover:bg-white/10 transition-colors mb-3"
        >
          + {t.editor.newPath}
        </button>
      )}

      {/* Waypoint controls for active path */}
      {activePath && (
        <div className="border-t border-white/5 pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRecordWaypoint(activePath.id)}
              className="flex-1 py-2 rounded-lg bg-accent-2/15 border border-accent-2/25 text-accent-2 text-xs hover:bg-accent-2/20 transition-colors font-medium"
            >
              📷 {t.editor.recordCurrent}
            </button>
          </div>

          {/* Waypoints list */}
          {activePath.waypoints.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {activePath.waypoints.map((wp, i) => (
                <div key={wp.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/[0.02]">
                  <span className="text-xs text-white/20 font-mono w-5">#{i + 1}</span>
                  <span className="text-xs text-white/40 font-mono flex-1 truncate">
                    pos({wp.position.x.toFixed(1)}, {wp.position.y.toFixed(1)}, {wp.position.z.toFixed(1)})
                  </span>
                  <span className="text-xs text-white/20">{wp.duration}s</span>
                  <button
                    onClick={() => onDeleteWaypoint(activePath.id, wp.id)}
                    className="text-white/20 hover:text-red-400 text-xs transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => onClearWaypoints(activePath.id)}
                className="w-full text-xs text-white/20 hover:text-red-400 transition-colors py-1"
              >
                清除所有路径点
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
