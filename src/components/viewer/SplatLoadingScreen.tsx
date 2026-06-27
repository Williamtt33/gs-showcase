import { motion } from 'framer-motion'

interface Props {
  progress: number // 0–100
  isDownloading?: boolean
}

/* ── Deterministic particle seeds — Gaussian-splat-like scattered field ── */
const SEEDS = [
  // Central cluster (denser, larger)
  { x: 48, y: 46, r: 6, a: 0.18, d: 1.8 },
  { x: 52, y: 48, r: 7, a: 0.22, d: 1.6 },
  { x: 44, y: 52, r: 5, a: 0.16, d: 2.0 },
  { x: 50, y: 42, r: 8, a: 0.20, d: 1.5 },
  { x: 46, y: 50, r: 6, a: 0.15, d: 2.2 },
  { x: 54, y: 44, r: 5, a: 0.19, d: 1.7 },
  { x: 42, y: 45, r: 7, a: 0.14, d: 1.9 },
  { x: 56, y: 50, r: 4, a: 0.17, d: 2.1 },
  { x: 49, y: 55, r: 5, a: 0.13, d: 2.3 },
  { x: 51, y: 40, r: 6, a: 0.16, d: 2.0 },
  // Near field — medium density
  { x: 35, y: 38, r: 4, a: 0.10, d: 2.8 },
  { x: 62, y: 42, r: 3, a: 0.09, d: 3.0 },
  { x: 30, y: 55, r: 5, a: 0.11, d: 2.5 },
  { x: 68, y: 52, r: 4, a: 0.08, d: 2.7 },
  { x: 40, y: 32, r: 3, a: 0.09, d: 3.2 },
  { x: 60, y: 35, r: 4, a: 0.10, d: 2.6 },
  { x: 55, y: 62, r: 3, a: 0.07, d: 3.1 },
  { x: 32, y: 48, r: 4, a: 0.10, d: 2.9 },
  { x: 65, y: 58, r: 3, a: 0.08, d: 3.3 },
  { x: 38, y: 62, r: 5, a: 0.09, d: 2.4 },
  { x: 58, y: 30, r: 3, a: 0.07, d: 3.5 },
  { x: 45, y: 35, r: 4, a: 0.12, d: 2.6 },
  { x: 53, y: 60, r: 4, a: 0.08, d: 2.8 },
  { x: 28, y: 42, r: 3, a: 0.06, d: 3.4 },
  // Far field — scattered small points
  { x: 18, y: 28, r: 2, a: 0.05, d: 4.0 },
  { x: 78, y: 32, r: 2, a: 0.04, d: 4.2 },
  { x: 15, y: 60, r: 2, a: 0.05, d: 3.8 },
  { x: 82, y: 55, r: 2, a: 0.04, d: 4.1 },
  { x: 22, y: 72, r: 2, a: 0.04, d: 3.9 },
  { x: 75, y: 68, r: 2, a: 0.03, d: 4.3 },
  { x: 12, y: 45, r: 1.5, a: 0.03, d: 4.5 },
  { x: 85, y: 48, r: 1.5, a: 0.03, d: 4.4 },
  { x: 26, y: 20, r: 2, a: 0.04, d: 4.6 },
  { x: 70, y: 22, r: 2, a: 0.04, d: 4.2 },
  { x: 20, y: 78, r: 1.5, a: 0.03, d: 4.7 },
  { x: 80, y: 72, r: 1.5, a: 0.03, d: 4.5 },
  // Extra atmosphere
  { x: 33, y: 25, r: 2, a: 0.05, d: 3.6 },
  { x: 67, y: 28, r: 2, a: 0.04, d: 3.7 },
  { x: 25, y: 65, r: 2, a: 0.04, d: 3.5 },
  { x: 72, y: 64, r: 2, a: 0.03, d: 3.8 },
  { x: 10, y: 35, r: 1.5, a: 0.03, d: 4.8 },
  { x: 88, y: 40, r: 1.5, a: 0.02, d: 5.0 },
  { x: 42, y: 18, r: 2, a: 0.04, d: 4.0 },
  { x: 58, y: 75, r: 2, a: 0.03, d: 4.0 },
  { x: 16, y: 52, r: 1.5, a: 0.03, d: 4.5 },
  { x: 84, y: 60, r: 1.5, a: 0.02, d: 4.6 },
  { x: 36, y: 70, r: 2, a: 0.04, d: 3.5 },
  { x: 64, y: 18, r: 2, a: 0.04, d: 3.8 },
  { x: 7, y: 55, r: 1.5, a: 0.02, d: 5.0 },
  { x: 90, y: 52, r: 1.5, a: 0.02, d: 4.8 },
  { x: 48, y: 72, r: 2, a: 0.03, d: 3.8 },
  { x: 52, y: 22, r: 2, a: 0.05, d: 3.6 },
]

export default function SplatLoadingScreen({ progress, isDownloading }: Props) {
  return (
    <div className="absolute inset-0 bg-[#080706] z-20 overflow-hidden select-none">
      {/* ── Deep ambient gradient ── */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(200,169,110,0.06) 0%, transparent 70%), radial-gradient(ellipse 80% 60% at 50% 55%, rgba(141,163,145,0.04) 0%, transparent 70%)',
        }}
      />

      {/* ── Point cloud particles ── */}
      <div className="absolute inset-0">
        {SEEDS.map((seed, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${seed.x}%`,
              top: `${seed.y}%`,
              width: seed.r,
              height: seed.r,
              background: `radial-gradient(circle, rgba(248,245,240,${seed.a}) 0%, rgba(200,169,110,${seed.a * 0.6}) 40%, transparent 70%)`,
              boxShadow:
                seed.r > 4
                  ? `0 0 ${seed.r * 3}px rgba(200,169,110,${seed.a * 0.7})`
                  : seed.r > 2
                    ? `0 0 ${seed.r * 2}px rgba(200,169,110,${seed.a * 0.5})`
                    : 'none',
            }}
            animate={{
              opacity: [seed.a * 0.3, seed.a, seed.a * 0.3],
              scale: [0.7, 1, 0.7],
            }}
            transition={{
              duration: seed.d,
              repeat: Infinity,
              delay: i * 0.03,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ── Central bloom — the "model forming" focal point ── */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.92, 1, 0.92] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="rounded-full blur-[60px]"
          style={{
            width: 'min(300px, 40vw)',
            height: 'min(300px, 40vw)',
            background: 'radial-gradient(circle, rgba(200,169,110,0.12) 0%, rgba(141,163,145,0.06) 40%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* ── Bottom info panel ── */}
      <div className="absolute bottom-0 left-0 right-0 pb-12 sm:pb-16">
        {/* Progress bar — thin, understated */}
        <div className="max-w-xs mx-auto px-6 mb-4">
          <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgba(200,169,110,0.5), rgba(141,163,145,0.5), rgba(200,169,110,0.3))',
                width: `${progress}%`,
                willChange: 'width',
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          {/* Tick marks */}
          <div className="flex justify-between mt-1.5">
            {[0, 25, 50, 75, 100].map((tick) => (
              <span
                key={tick}
                className={`text-[9px] font-mono transition-colors duration-500 ${
                  progress >= tick ? 'text-white/20' : 'text-white/[0.04]'
                }`}
              >
                {tick}
              </span>
            ))}
          </div>
        </div>

        {/* Status text */}
        <motion.p
          key={isDownloading ? 'downloading' : 'loading'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-[12px] text-white/25 font-light tracking-[0.04em]"
        >
          {isDownloading ? '正在获取模型数据...' : '正在渲染高斯点云...'}
        </motion.p>

        {/* Splat count hint — subtle, fades in after a moment */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 30 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-[10px] text-white/[0.08] mt-1.5 font-mono tracking-[0.06em]"
        >
          3D GAUSSIAN SPLATTING
        </motion.p>
      </div>
    </div>
  )
}
