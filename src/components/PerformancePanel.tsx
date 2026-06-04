import { useI18n } from '../i18n/I18nContext'

interface Props { fps: number; splatCount: number; isVisible: boolean }

export default function PerformancePanel({ fps, splatCount, isVisible }: Props) {
  const { t } = useI18n()
  if (!isVisible) return null

  const format = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1_000 ? (n / 1_000).toFixed(0) + 'K' : String(n)
  const fpsColor = fps >= 55 ? 'text-accent-2' : fps >= 30 ? 'text-accent-1' : 'text-accent-3'

  return (
    <div className="absolute top-4 right-4 glass rounded-xl px-4 py-3 text-xs font-mono z-10 min-w-[130px] space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-text-3/70 text-[10px]">{t.viewer.fps}</span>
        <span className={`font-bold text-[11px] ${fpsColor}`}>{fps}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-text-3/70 text-[10px]">{t.viewer.points}</span>
        <span className="text-text-2 text-[11px]">{format(splatCount)}</span>
      </div>
      {/* Mini bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent-1 to-accent-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, fps / 60 * 100)}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
