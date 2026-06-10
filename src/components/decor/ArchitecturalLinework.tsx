import { motion } from 'framer-motion'

/**
 * ArchitecturalLinework — Song Dynasty 界画 style architectural line drawing.
 * Fine gold/ink strokes outlining traditional Chinese timber-frame structure:
 * roof ridges, dougong brackets, columns, and tile patterns.
 *
 * Rendered as a subtle, slow-drifting background layer — like blueprints
 * floating behind the content.
 */

const INK = 'rgba(212,165,116,0.06)'
const INK_ACCENT = 'rgba(212,165,116,0.09)'
const INK_DIM = 'rgba(212,165,116,0.035)'

interface Props {
  className?: string
}

export default function ArchitecturalLinework({ className = '' }: Props) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ═══════════════════════════════════════════
            ROOF — 屋顶飞檐
            ═══════════════════════════════════════════ */}

        {/* Main ridge */}
        <path
          d="M80,200 L680,160 L1360,200"
          fill="none" stroke={INK_ACCENT} strokeWidth="1.2"
        />
        {/* Ridge ornament — chiwen (鸱吻) */}
        <path d="M80,200 Q75,185 82,175 Q90,170 85,185" fill="none" stroke={INK_ACCENT} strokeWidth="1" />
        <path d="M1360,200 Q1365,185 1358,175 Q1350,170 1355,185" fill="none" stroke={INK_ACCENT} strokeWidth="1" />

        {/* Eaves — sweeping curves (飞檐) */}
        <path
          d="M40,260 Q200,180 400,195 Q680,170 1040,195 Q1240,180 1400,260"
          fill="none" stroke={INK} strokeWidth="0.8"
        />
        {/* Eave shadow line */}
        <path
          d="M50,268 Q200,190 400,203 Q680,178 1040,203 Q1240,190 1390,268"
          fill="none" stroke={INK_DIM} strokeWidth="0.6"
        />

        {/* Tile rows — horizontal curves suggesting 瓦垄 */}
        {[230, 245, 260, 275, 290, 305].map((y, i) => (
          <path
            key={`tile-${i}`}
            d={`M100,${y} Q400,${y - 8 - i * 2} 720,${y - 4} Q1040,${y - 8 - i * 2} 1340,${y}`}
            fill="none" stroke={INK_DIM} strokeWidth={i % 2 === 0 ? '0.5' : '0.3'}
          />
        ))}

        {/* Vertical tile seams */}
        {[200, 320, 440, 560, 680, 800, 920, 1040, 1160, 1280].map((x, i) => (
          <line
            key={`tile-seam-${i}`}
            x1={x} y1={200} x2={x + (i % 2 === 0 ? 10 : -10)} y2={305}
            stroke={INK_DIM} strokeWidth="0.3"
          />
        ))}

        {/* ═══════════════════════════════════════════
            DOUGONG — 斗拱层
            ═══════════════════════════════════════════ */}

        {/* Horizontal beams (额枋) */}
        <line x1="60" y1="325" x2="1380" y2="325" stroke={INK} strokeWidth="0.8" />
        <line x1="80" y1="340" x2="1360" y2="340" stroke={INK_DIM} strokeWidth="0.6" />

        {/* Dougong sets — positioned at column tops */}
        {[120, 280, 440, 600, 760, 920, 1080, 1240, 1380].map((cx, i) => (
          <DougongBracket key={`dougong-${i}`} cx={cx} cy={325} scale={0.7 + (i % 3) * 0.15} />
        ))}

        {/* ═══════════════════════════════════════════
            COLUMNS — 柱网
            ═══════════════════════════════════════════ */}

        {/* Columns — vertical lines with slight entasis (卷杀) */}
        {[120, 280, 440, 600, 760, 920, 1080, 1240, 1380].map((cx, i) => (
          <g key={`column-${i}`}>
            {/* Column shaft */}
            <line
              x1={cx} y1={340} x2={cx} y2={800}
              stroke={i % 3 === 0 ? INK_ACCENT : INK} strokeWidth={i % 3 === 0 ? '1' : '0.7'}
            />
            {/* Column base (柱础) */}
            <line x1={cx - 12} y1={800} x2={cx + 12} y2={800} stroke={INK} strokeWidth="0.8" />
            <line x1={cx - 8} y1={805} x2={cx + 8} y2={805} stroke={INK_DIM} strokeWidth="0.5" />
            <line x1={cx - 14} y1={795} x2={cx + 14} y2={795} stroke={INK_DIM} strokeWidth="0.4" />
            {/* Capital (柱头) */}
            <line x1={cx - 10} y1={340} x2={cx + 10} y2={340} stroke={INK} strokeWidth="0.7" />
          </g>
        ))}

        {/* ═══════════════════════════════════════════
            BRACKET TIE-BEAMS — 穿插枋
            ═══════════════════════════════════════════ */}

        {/* Horizontal tie beams between columns */}
        {[380, 540, 700, 860, 1060].map((y, i) => (
          <line
            key={`tie-${i}`}
            x1="120" y1={y} x2="1380" y2={y}
            stroke={INK_DIM} strokeWidth="0.4" strokeDasharray="8 4"
          />
        ))}

        {/* ═══════════════════════════════════════════
            PLATFORM — 台基
            ═══════════════════════════════════════════ */}

        {/* Platform steps */}
        <line x1="40" y1="810" x2="1400" y2="810" stroke={INK} strokeWidth="0.9" />
        <line x1="60" y1="820" x2="1380" y2="820" stroke={INK_DIM} strokeWidth="0.6" />
        <line x1="80" y1="830" x2="1360" y2="830" stroke={INK_DIM} strokeWidth="0.5" />
        <line x1="100" y1="838" x2="1340" y2="838" stroke={INK_DIM} strokeWidth="0.4" />

        {/* Balustrade posts (望柱) — small vertical ticks */}
        {[140, 260, 380, 500, 620, 740, 860, 980, 1100, 1220, 1340].map((x, i) => (
          <line key={`baluster-${i}`} x1={x} y1="800" x2={x} y2="810" stroke={INK_DIM} strokeWidth="0.5" />
        ))}

        {/* ═══════════════════════════════════════════
            FLOATING MOTIFS — 散落纹样
            ═══════════════════════════════════════════ */}

        {/* Small bracket detail — isolated, like a floating study sketch */}
        <g transform="translate(1100, 460) scale(0.5)" opacity="0.5">
          <DougongBracket cx={0} cy={0} scale={1} />
        </g>

        {/* Roof tile arc — floating */}
        <path
          d="M160,550 Q180,530 200,550"
          fill="none" stroke={INK_DIM} strokeWidth="0.5"
        />
        <path
          d="M165,548 Q180,532 195,548"
          fill="none" stroke={INK_DIM} strokeWidth="0.4"
        />

        {/* Single column capital detail — right margin */}
        <g transform="translate(1280, 520) scale(0.4)" opacity="0.35">
          <DougongBracket cx={0} cy={0} scale={0.8} />
        </g>

        {/* ═══════════════════════════════════════════
            CORNER PAVILION — 角亭轮廓 (upper left)
            ═══════════════════════════════════════════ */}
        <g transform="translate(60, 380) scale(0.35)" opacity="0.4">
          {/* Roof */}
          <path d="M0,0 L60,-50 L120,0" fill="none" stroke={INK} strokeWidth="1.5" />
          <path d="M10,0 L60,-45 L110,0" fill="none" stroke={INK_DIM} strokeWidth="0.8" />
          {/* Pillars */}
          <line x1="20" y1="0" x2="20" y2="60" stroke={INK} strokeWidth="1.2" />
          <line x1="100" y1="0" x2="100" y2="60" stroke={INK} strokeWidth="1.2" />
          {/* Base */}
          <line x1="10" y1="60" x2="110" y2="60" stroke={INK} strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}

/** A single dougong bracket set — 斗拱单元 */
function DougongBracket({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  const s = 20 * scale
  const h = 8 * scale
  return (
    <g transform={`translate(${cx}, ${cy})`} fill="none" stroke={INK} strokeWidth="0.6">
      {/* Ludou (栌斗) — base block */}
      <rect x={-s * 0.55} y={h * 1.5} width={s * 1.1} height={h} rx={1} />
      {/* First tier arms */}
      <rect x={-s} y={h * 2.5} width={s * 2} height={h * 0.6} rx={0.5} />
      {/* Second tier */}
      <rect x={-s * 0.8} y={h * 3} width={s * 1.6} height={h * 0.55} rx={0.5} />
      {/* Third tier */}
      <rect x={-s * 0.55} y={h * 3.5} width={s * 1.1} height={h * 0.5} rx={0.5} />
      {/* Ang (昂) — downward-pointing cantilever */}
      <line x1={0} y1={0} x2={0} y2={h * 4} strokeWidth="0.5" />
      {/* Small blocks between tiers */}
      <rect x={-s * 0.2} y={h * 2.5} width={s * 0.4} height={h * 0.5} rx={0.5} strokeWidth="0.4" />
      <rect x={-s * 0.15} y={h * 3} width={s * 0.3} height={h * 0.5} rx={0.5} strokeWidth="0.4" />
    </g>
  )
}

/** Animated wrapper — gentle drift over time */
export function DriftingLinework({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -12, 0],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        y: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
        opacity: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <ArchitecturalLinework />
    </motion.div>
  )
}
