import { useRef, useState, useCallback, useEffect } from 'react'
import { catmullRomPoint, easeInOutCubic } from '../utils/math3d'
import type { Vector3Like, CameraPath, Keyframe } from '../types'
import type { Camera, OrbitControls } from 'gsplat'

export type PlaybackState = 'idle' | 'playing' | 'paused'

export interface PlaybackEngine {
  state: PlaybackState
  overallProgress: number
  speed: number
  play: () => void
  pause: () => void
  stop: () => void
  setSpeed: (s: number) => void
  /** Read by Viewer3D render loop — skip controls.update() when true */
  isPathPlayingRef: React.MutableRefObject<boolean>
  /** Called each frame by Viewer3D render loop when isPathPlaying is true */
  pathUpdateRef: React.MutableRefObject<(() => void) | null>
}

interface PlaybackInternal {
  segmentIndex: number
  segmentT: number
  lastTime: number
}

/**
 * Build four Catmull-Rom control points for segment i of the keyframe array.
 * Uses boundary extension (duplicate endpoints) for edge segments.
 */
function getControlPoints(keyframes: Keyframe[], i: number): {
  p0: Vector3Like; p1: Vector3Like; p2: Vector3Like; p3: Vector3Like
  p0t: Vector3Like; p1t: Vector3Like; p2t: Vector3Like; p3t: Vector3Like
} {
  const n = keyframes.length
  // Position control points
  const p0 = i > 0 ? keyframes[i - 1].position : keyframes[0].position
  const p1 = keyframes[i].position
  const p2 = i < n - 1 ? keyframes[i + 1].position : keyframes[n - 1].position
  const p3 = i < n - 2 ? keyframes[i + 2].position : (i < n - 1 ? keyframes[n - 1].position : keyframes[n - 1].position)

  // Target control points
  const p0t = i > 0 ? keyframes[i - 1].target : keyframes[0].target
  const p1t = keyframes[i].target
  const p2t = i < n - 1 ? keyframes[i + 1].target : keyframes[n - 1].target
  const p3t = i < n - 2 ? keyframes[i + 2].target : (i < n - 1 ? keyframes[n - 1].target : keyframes[n - 1].target)

  return { p0, p1, p2, p3, p0t, p1t, p2t, p3t }
}

export function useCameraPathPlayer(
  activePath: CameraPath | null,
  cameraRef: React.RefObject<Camera | null>,
  controlsRef: React.RefObject<OrbitControls | null>,
  splatModuleRef: React.RefObject<typeof import('gsplat') | null>,
): PlaybackEngine {
  const [state, setState] = useState<PlaybackState>('idle')
  const [overallProgress, setOverallProgress] = useState(0)
  const [speed, setSpeedState] = useState(1)

  const stateRef = useRef<PlaybackState>('idle')
  const speedRef = useRef(1)
  const internalRef = useRef<PlaybackInternal>({ segmentIndex: 0, segmentT: 0, lastTime: 0 })
  const activePathRef = useRef<CameraPath | null>(null)

  const isPathPlayingRef = useRef(false)
  const pathUpdateFnRef = useRef<(() => void) | null>(null)

  // Keep refs in sync
  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { activePathRef.current = activePath }, [activePath])

  // Sync isPathPlayingRef with state
  useEffect(() => {
    isPathPlayingRef.current = state === 'playing' || state === 'paused'
  }, [state])

  // ── Core functions (defined before effects that use them) ──

  const stopInternal = useCallback(() => {
    setState('idle')
    setOverallProgress(0)
    isPathPlayingRef.current = false
    internalRef.current = { segmentIndex: 0, segmentT: 0, lastTime: 0 }
    // Restore orbit controls
    if (controlsRef.current) controlsRef.current.dampening = 0.2
    // eslint-disable-next-line react-hooks/exhaustive-deps -- controlsRef is a stable ref
  }, [])

  // ── The per-frame update function, called from Viewer3D render loop ──
  const updatePath = useCallback(() => {
    const path = activePathRef.current
    const cam = cameraRef.current
    const SPLAT = splatModuleRef.current
    if (!path || !cam || !SPLAT) return

    const kfs = path.keyframes
    if (kfs.length === 0) return
    if (kfs.length === 1) {
      // Single keyframe — just hold position
      const p = kfs[0].position
      const t = kfs[0].target
      const dir = new SPLAT.Vector3(t.x - p.x, t.y - p.y, t.z - p.z)
      const rot = SPLAT.Quaternion.LookRotation(dir)
      cam.data.update(new SPLAT.Vector3(p.x, p.y, p.z), rot)
      setOverallProgress(1)
      return
    }

    const intern = internalRef.current
    const spd = speedRef.current
    const now = performance.now()

    if (stateRef.current === 'paused') {
      // Don't advance time
      intern.lastTime = now
      return
    }

    if (intern.lastTime === 0) {
      intern.lastTime = now
    }

    const dt = (now - intern.lastTime) / 1000
    intern.lastTime = now

    // Total number of segments
    const totalSegments = kfs.length - 1
    // Duration per segment at speed 1x (seconds)
    const baseSegmentDuration = 2.0
    const segmentDuration = baseSegmentDuration / spd

    // Advance time
    intern.segmentT += dt / segmentDuration

    // Handle segment completion (including skip ahead if speed is very high)
    while (intern.segmentT >= 1 && intern.segmentIndex < totalSegments - 1) {
      intern.segmentT -= 1
      intern.segmentIndex++
    }

    // Check if path is complete
    if (intern.segmentIndex >= totalSegments - 1 && intern.segmentT >= 1) {
      // Clamp to final keyframe
      const last = kfs[kfs.length - 1]
      const dir = new SPLAT.Vector3(
        last.target.x - last.position.x,
        last.target.y - last.position.y,
        last.target.z - last.position.z,
      )
      const rot = SPLAT.Quaternion.LookRotation(dir)
      cam.data.update(
        new SPLAT.Vector3(last.position.x, last.position.y, last.position.z),
        rot,
      )
      setOverallProgress(1)
      stopInternal()
      return
    }

    const i = Math.min(intern.segmentIndex, totalSegments - 1)
    const t = Math.max(0, Math.min(1, intern.segmentT))
    const easedT = easeInOutCubic(t)

    // Build control points for this segment
    const { p0, p1, p2, p3, p0t, p1t, p2t, p3t } = getControlPoints(kfs, i)

    // Interpolate position & target
    const pos = catmullRomPoint(p0, p1, p2, p3, easedT)
    const tgt = catmullRomPoint(p0t, p1t, p2t, p3t, easedT)

    // Compute rotation from direction
    const dirX = tgt.x - pos.x
    const dirY = tgt.y - pos.y
    const dirZ = tgt.z - pos.z
    const rot = SPLAT.Quaternion.LookRotation(new SPLAT.Vector3(dirX, dirY, dirZ))

    // Apply camera transform
    cam.data.update(
      new SPLAT.Vector3(pos.x, pos.y, pos.z),
      rot,
    )

    // Report overall progress
    const overall = (i + t) / totalSegments
    setOverallProgress(overall)
  }, [cameraRef, splatModuleRef, stopInternal])

  // Keep pathUpdateFnRef current (must be in effect, not render)
  useEffect(() => {
    pathUpdateFnRef.current = updatePath
  }, [updatePath])

  // Stop when activePath changes
  useEffect(() => {
    if (stateRef.current !== 'idle') {
      stopInternal()
    }
  }, [activePath?.id, stopInternal])

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopInternal() }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount/unmount
  }, [])

  const play = useCallback(() => {
    const path = activePathRef.current
    if (!path || path.keyframes.length === 0) return
    if (!splatModuleRef.current) return

    // Kill orbit damping for smooth takeover
    const ctrl = controlsRef.current
    if (ctrl) {
      ctrl.dampening = 0
    }

    // Reset timing if starting from idle
    if (stateRef.current === 'idle') {
      internalRef.current = { segmentIndex: 0, segmentT: 0, lastTime: 0 }
      setOverallProgress(0)
    }

    // If paused, just resume — timing continues from where we left off
    internalRef.current.lastTime = 0 // will be set on first updatePath call
    setState('playing')
    isPathPlayingRef.current = true
  }, [splatModuleRef, controlsRef])

  const pause = useCallback(() => {
    if (stateRef.current !== 'playing') return
    setState('paused')
  }, [])

  const stop = useCallback(() => {
    stopInternal()
  }, [stopInternal])

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s)
  }, [])

  return {
    state,
    overallProgress,
    speed,
    play,
    pause,
    stop,
    setSpeed,
    isPathPlayingRef,
    pathUpdateRef: pathUpdateFnRef,
  }
}
