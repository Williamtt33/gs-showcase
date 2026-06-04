import { motion } from 'framer-motion'
import type { CameraPath } from '../../types'
import { useI18n } from '../../i18n/I18nContext'

interface Props {
  paths: CameraPath[]; activePathId: string | null; isPlaying: boolean
  currentWaypoint: number; progress: number
  onSelectPath: (pid: string) => void; onPlay: () => void; onStop: () => void
  onToggleLoop: (pid: string) => void
}

export default function CameraPathPlayer({ paths, activePathId, isPlaying, currentWaypoint, progress, onSelectPath, onPlay, onStop, onToggleLoop }: Props) {
  const { t } = useI18n()
  const active = paths.find(p => p.id === activePathId)

  return (
    <div className="absolute bottom-4 right-4 glass rounded-2xl p-5 z-10 min-w-[260px]">
      <h4 className="text-[10px] font-semibold text-text-3/60 uppercase tracking-[0.12em] mb-3">{t.editor.cameraPath}</h4>

      {paths.length === 0 ? (
        <p className="text-[11px] text-text-3/40 italic">{t.editor.noPaths}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {paths.map(p => (
              <button key={p.id} onClick={() => onSelectPath(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-300 ${
                  activePathId === p.id ? 'bg-accent-1/15 border border-accent-1/25 text-accent-1' : 'bg-white/[0.03] border border-white/[0.04] text-text-3 hover:text-text-2'
                }`}
              >{p.name}{p.loop && ' ↻'}</button>
            ))}
          </div>

          {active && (
            <div className="space-y-3">
              <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-accent-1 to-accent-2 rounded-full"
                  animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.1 }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-3/60 font-mono">WP {currentWaypoint + 1}/{active.waypoints.length}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onToggleLoop(active.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      active.loop ? 'bg-accent-2/15 border border-accent-2/25 text-accent-2' : 'bg-white/[0.03] border border-white/[0.04] text-text-3/60'
                    }`}>{t.editor.loopPath}</button>
                  {isPlaying ? (
                    <button onClick={onStop} className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-medium hover:bg-red-500/15 transition-all">■ {t.editor.stopPath}</button>
                  ) : (
                    <button onClick={onPlay} disabled={active.waypoints.length < 2}
                      className="px-3 py-1 rounded-lg bg-accent-2/15 border border-accent-2/25 text-accent-2 text-[10px] font-medium hover:bg-accent-2/20 transition-all disabled:opacity-30">▶ {t.editor.playPath}</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
