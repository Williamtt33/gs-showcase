import { motion } from 'framer-motion'

interface Props {
  progress: number // 0–100
  isDownloading?: boolean
}

export default function ShamianLoadingScreen({ progress, isDownloading }: Props) {
  const clampedProgress = Math.round(Math.min(100, Math.max(0, progress)))

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden select-none flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #f5f5f3 0%, #e8e6e0 100%)',
      }}
    >
      {/* ── Main container with breathing animation ── */}
      <motion.div
        className="flex flex-col items-center relative"
        animate={{ scale: [1, 1.02, 1], opacity: [1, 0.85, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* ═══ Building silhouette with progress fill ═══ */}
        <div className="relative w-[120px] h-[160px] mb-[60px]">
          {/* Progress fill — rises from bottom */}
          <div
            className="absolute bottom-0 left-0 w-full transition-all duration-300"
            style={{
              height: `${clampedProgress}%`,
              background: '#d8d5cd',
              borderRadius: '60px 60px 0 0',
              zIndex: 0,
            }}
          />

          {/* SVG linework — always on top */}
          <svg
            className="absolute inset-0 w-full h-full z-10"
            viewBox="0 0 120 160"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              fill: 'none',
              stroke: '#1a1a1a',
              strokeWidth: 2,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            {/* Roof */}
            <path d="M20 80 L60 20 L100 80" />
            {/* Walls */}
            <path d="M20 80 L20 150 L100 150 L100 80" />
            {/* Arched doorway */}
            <path d="M40 150 L40 120 Q60 90 80 120 L80 150" />
            {/* Upper window */}
            <path d="M50 90 L50 110 L70 110 L70 90" />
          </svg>
        </div>

        {/* ═══ Title & subtitle ═══ */}
        <h1
          className="text-[24px] font-medium mb-[8px]"
          style={{ letterSpacing: '6px', color: '#1a1a1a' }}
        >
          沙面岛
        </h1>
        <p
          className="text-[12px] font-light uppercase mb-0"
          style={{ letterSpacing: '4px', color: '#666' }}
        >
          Shamian · Historic District
        </p>

        {/* ═══ Progress bar — ultra thin line ═══ */}
        <div className="relative mt-[40px]" style={{ width: 200 }}>
          <div
            className="h-[2px] rounded-[4px] overflow-hidden"
            style={{ background: '#d1ccc4' }}
          >
            <div
              className="h-full rounded-[4px] transition-all duration-300"
              style={{
                width: `${clampedProgress}%`,
                background: '#1a1a1a',
              }}
            />
          </div>
          {/* Percentage number */}
          <span
            className="absolute text-[14px] font-light"
            style={{
              right: -40,
              top: -6,
              color: '#333',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {clampedProgress}%
          </span>
        </div>

        {/* ═══ Status text ═══ */}
        <motion.p
          key={isDownloading ? 'downloading' : 'processing'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] mt-4 font-light"
          style={{ color: '#999', letterSpacing: '2px' }}
        >
          {isDownloading ? '正在获取数据...' : '正在加载场景...'}
        </motion.p>
      </motion.div>
    </div>
  )
}
