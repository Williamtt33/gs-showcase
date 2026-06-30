interface Props {
  progress: number
}

export default function LoadingScreen({ progress }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin mx-auto" />
        <p className="text-white/30 text-sm font-medium">场景加载中...</p>
        <div className="w-48 h-1 rounded-full bg-white/[0.04] overflow-hidden mx-auto">
          <div className="h-full rounded-full bg-accent-1/60 transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
        {progress > 0 && <p className="text-white/20 text-[10px] font-mono">{Math.round(progress)}%</p>}
      </div>
    </div>
  )
}
