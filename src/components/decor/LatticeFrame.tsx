import { motion } from 'framer-motion'

/**
 * LatticeFrame — traditional Chinese 花窗 decorative frame.
 * Content is viewed through the lattice "window", emphasizing
 * the artistic nature of what's inside.
 *
 * Patterns:
 * - "ice"  = 冰裂纹 (ice-crack) — irregular geometric fractures
 * - "step" = 步步锦 (progressive brocade) — nested stepped squares
 */

interface Props {
  children: React.ReactNode
  pattern?: 'ice' | 'step'
  className?: string
  /** Border frame thickness in px (default 12) */
  borderWidth?: number
}

export default function LatticeFrame({ children, pattern = 'step', className = '', borderWidth = 12 }: Props) {
  return (
    <div className={`relative ${className}`}>
      {/* ── Outer frame — dark ink wood ── */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
        style={{
          border: `${borderWidth}px solid #332E2A`,
          boxShadow: `
            inset 0 0 0 1px rgba(51,46,42,0.06),
            0 2px 12px rgba(0,0,0,0.15),
            0 0 0 1px rgba(51,46,42,0.04)
          `,
        }}
      />

      {/* ── Inner lattice pattern — SVG overlay ── */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none z-[5] overflow-hidden" style={{ margin: borderWidth }}>
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 200">
          {pattern === 'ice' ? <IcePattern /> : <StepPattern />}
        </svg>
      </div>

      {/* ── Subtle inner shadow from frame onto content ── */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-[6]"
        style={{
          margin: borderWidth,
          boxShadow: 'inset 0 0 24px rgba(0,0,0,0.2), inset 0 0 2px rgba(51,46,42,0.04)',
        }}
      />

      {/* ── Content ── */}
      <div className="rounded-2xl overflow-hidden" style={{ padding: borderWidth }}>
        {children}
      </div>
    </div>
  )
}

/* ── 步步锦 pattern — concentric stepped squares (classic 园林 window) ── */

function StepPattern() {
  const strokes = 'rgba(51,46,42,0.06)'
  const accents = 'rgba(51,46,42,0.09)'
  return (
    <g>
      {/* Outer rect */}
      <rect x="10" y="10" width="180" height="180" fill="none" stroke={strokes} strokeWidth="1.5" rx="6" />
      {/* Stepped rects going inward */}
      <rect x="25" y="25" width="150" height="150" fill="none" stroke={strokes} strokeWidth="1" rx="4" />
      {/* Corner stepped brackets */}
      {[[25, 25], [175, 25], [25, 175], [175, 175]].map(([cx, cy], i) => (
        <g key={i} stroke={accents} strokeWidth="1" fill="none">
          <line x1={cx} y1={cy} x2={cx + 30} y2={cy} />
          <line x1={cx} y1={cy} x2={cx} y2={cy + 30} />
          <line x1={cx + 16} y1={cy + 12} x2={cx + 16} y2={cy + 30} opacity="0.6" />
          <line x1={cx + 12} y1={cy + 16} x2={cx + 30} y2={cy + 16} opacity="0.6" />
        </g>
      ))}
      {/* Center lozenge */}
      <rect x="70" y="70" width="60" height="60" fill="none" stroke={accents} strokeWidth="1.2" rx="3"
        transform="rotate(45 100 100)" />
      {/* Small inner circle */}
      <circle cx="100" cy="100" r="18" fill="none" stroke={strokes} strokeWidth="0.8" />
      {/* Cross lines */}
      <line x1="100" y1="60" x2="100" y2="140" stroke={strokes} strokeWidth="0.6" />
      <line x1="60" y1="100" x2="140" y2="100" stroke={strokes} strokeWidth="0.6" />
    </g>
  )
}

/* ── 冰裂纹 pattern — irregular fractured lines (winter window) ── */

function IcePattern() {
  const lines = [
    // Irregular fracture lines across the surface
    [[30, 0], [45, 35], [20, 70], [50, 120], [30, 200]],
    [[0, 40], [50, 55], [80, 30], [150, 45], [200, 60]],
    [[60, 0], [70, 50], [100, 40], [130, 70], [180, 50], [200, 80]],
    [[0, 100], [45, 90], [70, 130], [110, 110], [200, 100]],
    [[10, 160], [55, 150], [90, 180], [140, 160], [200, 170]],
    [[40, 10], [35, 60], [80, 100], [60, 160], [90, 200]],
    [[120, 0], [110, 45], [160, 55], [140, 110], [170, 160], [150, 200]],
    [[170, 20], [160, 70], [120, 90], [180, 130], [200, 150]],
    [[85, 70], [100, 100], [80, 140]],
    [[140, 80], [120, 110], [155, 140]],
  ]

  return (
    <g stroke="rgba(51,46,42,0.05)" strokeWidth="0.7" fill="none">
      {lines.map((pts, i) => (
        <polyline key={i} points={pts.map(([x, y]) => `${x},${y}`).join(' ')} />
      ))}
      {/* Junction dots — where cracks meet */}
      {[[45, 35], [50, 55], [100, 40], [70, 90], [110, 110], [80, 140], [150, 45], [160, 55]].map(([cx, cy], i) => (
        <circle key={`dot-${i}`} cx={cx} cy={cy} r="1.2" fill="rgba(51,46,42,0.07)" stroke="none" />
      ))}
    </g>
  )
}

/* ── Animated variant — lattice bars glow on hover ── */

export function LatticeFrameHover({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative group/lattice ${className}`}
      whileHover="hover"
    >
      <LatticeFrame pattern="step">
        {children}
      </LatticeFrame>

      {/* Hover glow — seal-red accent on frame edge */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-20"
        variants={{
          idle: { opacity: 0, boxShadow: 'inset 0 0 0 1px rgba(201,79,42,0)' },
          hover: { opacity: 1, boxShadow: 'inset 0 0 0 1px rgba(201,79,42,0.08), 0 0 40px -10px rgba(201,79,42,0.06)' },
        }}
        initial="idle"
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  )
}
