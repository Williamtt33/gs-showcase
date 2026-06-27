import { useRef, useEffect, useCallback } from 'react'

/**
 * PointCloudBackground — 3D 点云微动效背景
 *
 * Renders a subtle, slowly rotating field of 3D particles
 * with faint connecting lines, evoking Gaussian Splatting
 * point clouds. Pure Canvas 2D projection — no WebGL.
 *
 * Designed to sit behind hero content as an atmospheric layer.
 */

interface Point3D {
  x: number; y: number; z: number
  /** Base radius on screen */
  r: number
  /** Opacity multiplier */
  a: number
  /** Orbit speed multiplier */
  speed: number
  /** Vertical drift phase offset */
  driftPhase: number
}

const POINT_COUNT = 280
const SPHERE_RADIUS = 600
const ROTATE_SPEED = 0.0003 // radians per ms — very slow
const LINE_DIST = 180 // max distance for connecting lines
const DOT_COLOR = '200, 169, 110' // accent-1 gold in rgb
const LINE_ALPHA = 0.03
const DOT_ALPHA_BASE = 0.12

interface Props {
  className?: string
}

export default function PointCloudBackground({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point3D[]>([])
  const animRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const visibleRef = useRef(true)

  // Generate stable pseudo-random points (seeded so they don't shift on re-render)
  const initPoints = useCallback((count: number, radius: number) => {
    const points: Point3D[] = []
    // Simple multiplicative PRNG — stable across renders
    let seed = 42
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let i = 0; i < count; i++) {
      // Uniform distribution on a sphere (not inside — Fibonacci sphere)
      const phi = Math.acos(1 - 2 * (i + 0.5) / count)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i // golden angle
      const r = radius * (0.6 + rand() * 0.4) // slight radius variation
      points.push({
        x: Math.cos(theta) * Math.sin(phi) * r,
        y: Math.sin(theta) * Math.sin(phi) * r * 0.7, // flatten Y for horizontal feel
        z: Math.cos(phi) * r,
        r: 0.8 + rand() * 2.2,
        a: DOT_ALPHA_BASE * (0.5 + rand() * 0.5),
        speed: 0.7 + rand() * 0.6,
        driftPhase: rand() * Math.PI * 2,
      })
    }
    // Add some scattered background points (not on sphere surface)
    for (let i = 0; i < 60; i++) {
      const theta2 = rand() * Math.PI * 2
      const phi2 = rand() * Math.PI
      const r2 = radius * (0.3 + rand() * 0.9)
      points.push({
        x: Math.cos(theta2) * Math.sin(phi2) * r2,
        y: Math.sin(theta2) * Math.sin(phi2) * r2 * 0.5,
        z: Math.cos(phi2) * r2,
        r: 0.5 + rand() * 1.2,
        a: DOT_ALPHA_BASE * (0.3 + rand() * 0.3),
        speed: 0.9 + rand() * 0.4,
        driftPhase: rand() * Math.PI * 2,
      })
    }
    return points
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize points once
    if (pointsRef.current.length === 0) {
      pointsRef.current = initPoints(POINT_COUNT, SPHERE_RADIUS)
    }
    const points = pointsRef.current

    // Resize handler
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // Visibility observer — pause when off-screen
    const io = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting },
      { threshold: 0 }
    )
    io.observe(canvas)

    // Check reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = mq.matches
    const onMotionChange = (e: MediaQueryListEvent) => { reducedMotion = e.matches }
    mq.addEventListener('change', onMotionChange)

    // Animation loop
    const w = () => canvas.parentElement?.getBoundingClientRect().width ?? 0
    const h = () => canvas.parentElement?.getBoundingClientRect().height ?? 0

    const animate = (timestamp: number) => {
      if (!visibleRef.current) {
        animRef.current = requestAnimationFrame(animate)
        return
      }

      const cw = w()
      const ch = h()
      if (cw === 0 || ch === 0) {
        animRef.current = requestAnimationFrame(animate)
        return
      }

      const dt = timeRef.current ? timestamp - timeRef.current : 16
      timeRef.current = timestamp

      const angle = reducedMotion ? 0 : ROTATE_SPEED * dt
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      // Rotate all points around Y axis
      for (const p of points) {
        const nx = p.x * cos - p.z * sin
        const nz = p.x * sin + p.z * cos
        p.x = nx
        p.z = nz
      }

      // Clear
      ctx.clearRect(0, 0, cw, ch)

      // Project points to 2D
      const cx = cw / 2
      const cy = ch / 2
      const scale = Math.min(cw, ch) / 1200
      const projected: { sx: number; sy: number; z: number; r: number; a: number }[] = []

      for (const p of points) {
        // Perspective projection
        const fov = 800
        const sz = fov / (fov + p.z)
        const sx = cx + p.x * sz * scale
        const sy = cy + p.y * sz * scale
        // Depth-based size
        const sr = p.r * sz * scale * 1.5
        projected.push({ sx, sy, z: p.z, r: sr, a: p.a * sz })
      }

      // Sort by depth (far first — painter's algorithm for subtle depth)
      projected.sort((a, b) => a.z - b.z)

      // Draw connecting lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].sx - projected[j].sx
          const dy = projected[i].sy - projected[j].sy
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = LINE_DIST * scale
          if (dist < maxDist) {
            const alpha = LINE_ALPHA * (1 - dist / maxDist) * projected[i].a
            ctx.beginPath()
            ctx.moveTo(projected[i].sx, projected[i].sy)
            ctx.lineTo(projected[j].sx, projected[j].sy)
            ctx.strokeStyle = `rgba(${DOT_COLOR}, ${alpha})`
            ctx.lineWidth = 0.3
            ctx.stroke()
          }
        }
      }

      // Draw dots
      for (const p of projected) {
        if (p.r < 0.2) continue // skip tiny dots
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, Math.max(0.3, p.r), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${DOT_COLOR}, ${p.a})`
        // Soft glow on larger dots
        if (p.r > 2) {
          ctx.shadowColor = `rgba(${DOT_COLOR}, ${p.a * 0.5})`
          ctx.shadowBlur = p.r * 2
        }
        ctx.fill()
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      io.disconnect()
      mq.removeEventListener('change', onMotionChange)
    }
  }, [initPoints])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
