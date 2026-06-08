import { motion } from 'framer-motion'
import type { PreservationBuilding } from '../data/heritage'

interface Props {
  building: PreservationBuilding
  index: number
}

export default function BeforeAfterCard({ building, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="ink-card rounded-2xl p-5 sm:p-6"
    >
      {/* Building name as header */}
      <h3 className="text-[16px] font-semibold text-text-1 mb-2">{building.name}</h3>
      <p className="text-[13px] text-text-3/60 leading-[1.7] mb-5">{building.desc}</p>

      {/* Before / After comparison */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Before */}
        <div className="space-y-2">
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-3/10 border border-accent-3/20 text-accent-3/70 tracking-[0.06em]">
            修缮前
          </span>
          <div className="aspect-[4/3] rounded-xl bg-surface-3/60 border border-border-1 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              {/* Decorative "before" visual — damaged texture hints */}
              <div className="relative w-full h-full bg-surface-2">
                <div className="absolute inset-0 bg-manuscript-grid opacity-50" />
                {/* Crack / damage lines */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 150" preserveAspectRatio="none">
                  <line x1="20" y1="10" x2="80" y2="90" stroke="#c84b31" strokeWidth="0.5" />
                  <line x1="120" y1="20" x2="60" y2="140" stroke="#c84b31" strokeWidth="0.3" />
                  <line x1="40" y1="120" x2="180" y2="50" stroke="#6b6358" strokeWidth="0.4" />
                  <line x1="160" y1="80" x2="190" y2="130" stroke="#c84b31" strokeWidth="0.3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-text-3/25 font-mono tracking-[0.1em]">历史照片缺失</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-text-3/45 leading-relaxed">{building.beforeDesc}</p>
        </div>

        {/* After */}
        <div className="space-y-2">
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-2/10 border border-accent-2/20 text-accent-2/70 tracking-[0.06em]">
            修缮后
          </span>
          <div className="aspect-[4/3] rounded-xl bg-surface-3/60 border border-accent-2/15 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-surface-2 relative">
              <div className="absolute inset-0 bg-ink-wash opacity-80" />
              {/* Restored structure hints — clean, geometric */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-16 h-12 border border-accent-2/20 rounded-lg bg-accent-2/[0.03]" />
                <div className="w-20 h-1 rounded-full bg-accent-2/15" />
                <div className="w-12 h-1 rounded-full bg-accent-2/10" />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-text-3/45 leading-relaxed">{building.afterDesc}</p>
        </div>
      </div>
    </motion.div>
  )
}
