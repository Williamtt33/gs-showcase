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
}

interface PlaybackInternal {
  segmentIndex: number
  segmentT: number
  lastTime: number
}

function getControlPoints(keyframes: Keyframe[], i: number): {
  p0: Vector3Like; p1: Vector3Like; p2: Vector3Like; p3: Vector3Like
  p0t: Vector3Like; p1t: Vector3Like; p2t: Vector3Like; p3t: Vector3Like
} {
  const n = keyframes.length
  const p0 = i > 0 ? keyframes[i - 1].position : keyframes[0].position
  const p1 = keyframes[i].position
  const p2 = i < n - 1 ? keyframes[i + 1].position : keyframes[n - 1].position
  const p3 = i < n - 2 ? keyframes[i + 2].position : (i < n - 1 ? keyframes[n - 1].position : keyframes[n - 1].position)

  const p0t = i > 0 ? keyframes[i - 1].target : keyframes[0].target
  const p1t = keyframes[i].target
  const p2t = i < n - 1 ? keyframes[i + 1].target : keyframes[n - 1].target
  const p3t = i < n - 2 ? keyframes[i + 2].target : (i < n - 1 ? keyframes[n - 1].target : keyframes[n - 1].target)

  return { p0, p1, p2, p3, p0t, p1t, p2t, p3t }
}

/**
 * Camera path playback engine. The `isPathPlayingRef` and `pathUpdateRef` are
 * OWNED by the caller (Viewer3D) so the render loop can read them directly
 * without going through any wrapper object.
 */
export function useCameraPathPlayer(
  activePath: CameraPath | null,
  cameraRef: React.RefObject<Camera | null>,
  controlsRef: React.RefObject<OrbitControls | null>,
  splatModuleRef: React.RefObject<typeof import('gsplat') | null>,
  isPathPlayingRef: React.MutableRefObject<boolean>,
  pathUpdateRef: React.MutableRefObject<(() => void) | null>,
): PlaybackEngine {
  const [state, setState] = useState<PlaybackState>('idle')
  const [overallProgress, setOverallProgress] = useState(0)
  const [speed, setSpeedState] = useState(1)

  const stateRef = useRef<PlaybackState>('idle')
  const speedRef = useRef(1)
  const internalRef = useRef<PlaybackInternal>({ segmentIndex: 0, segmentT: 0, lastTime: 0 })
  const activePathRef = useRef<CameraPath | null>(null)

  // Keep refs in sync
  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { activePathRef.current = activePath }, [activePath])

  // Sync isPathPlayingRef with state
  useEffect(() => {
    isPathPlayingRef.current = state === 'playing' || state === 'paused'
  }, [state, isPathPlayingRef])

  // Stop when activePath changes
  const stopInternal = useCallback(() => {
    setState('idle')
    setOverallProgress(0)
    isPathPlayingRef.current = false
    internalRef.current = { segmentIndex: 0, segmentT: 0, lastTime: 0 }

    // Sync orbit controls target to current camera position so the camera
    // doesn't jump back to pre-playback position when controls.update() resumes.
    const ctrl = controlsRef.current
    const cam = cameraRef.current
    const SPLAT = splatModuleRef.current
    if (ctrl && cam && SPLAT) {
      const fwd = cam.forward
      ctrl.setCameraTarget(new SPLAT.Vector3(
        cam.position.x + fwd.x * 3,
        cam.position.y + fwd.y * 3,
        cam.position.z + fwd.z * 3,
      ))
      ctrl.dampening = 0
      ctrl.update()
      ctrl.dampening = 0.2
    } else if (ctrl) {
      ctrl.dampening = 0
      ctrl.update()
      ctrl.dampening = 0.2
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (stateRef.current !== 'idle') stopInternal()
  }, [activePath?.id, stopInternal])

  useEffect(() => {
    return () => { stopInternal() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── The per-frame update function, called from Viewer3D render loop ──
  const frameCounterRef = useRef(0)

  const updatePath = useCallback(() => {
    const path = activePathRef.current
    const cam = cameraRef.current
    const SPLAT = splatModuleRef.current
    if (!path || !cam || !SPLAT) return
    const kfs = path.keyframes
    if (kfs.length === 0) return

    // Log first few frames for debugging
    if (frameCounterRef.current < 5) {
      console.log('[CameraPath] frame', frameCounterRef.current,
        'state:', stateRef.current,
        'segIdx:', internalRef.current.segmentIndex,
        'segT:', internalRef.current.segmentT.toFixed(4),
        'camPos(before):', cam.position.x.toFixed(3), cam.position.y.toFixed(3), cam.position.z.toFixed(3))
    }

    if (kfs.length === 1) {
      const p = kfs[0].position
      const t = kfs[0].target
      const dx = t.x - p.x; const dy = t.y - p.y; const dz = t.z - p.z
      const dirLen = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dirLen < 0.0001) return
      const dir = new SPLAT.Vector3(dx, dy, dz)
      const rot = SPLAT.Quaternion.LookRotation(dir)
      cam.position = new SPLAT.Vector3(p.x, p.y, p.z)
      cam.rotation = rot
      setOverallProgress(1)
      return
    }

    const intern = internalRef.current
    const spd = speedRef.current
    const now = performance.now()

    if (stateRef.current === 'paused') {
      intern.lastTime = now
      return
    }

    if (intern.lastTime === 0) {
      intern.lastTime = now
    }

    const dt = (now - intern.lastTime) / 1000
    intern.lastTime = now

    const totalSegments = kfs.length - 1
    const baseSegmentDuration = 2.0
    const segmentDuration = baseSegmentDuration / spd

    intern.segmentT += dt / segmentDuration

    while (intern.segmentT >= 1 && intern.segmentIndex < totalSegments - 1) {
      intern.segmentT -= 1
      intern.segmentIndex++
    }

    if (intern.segmentIndex >= totalSegments - 1 && intern.segmentT >= 1) {
      const last = kfs[kfs.length - 1]
      const dir = new SPLAT.Vector3(
        last.target.x - last.position.x,
        last.target.y - last.position.y,
        last.target.z - last.position.z,
      )
      const rot = SPLAT.Quaternion.LookRotation(dir)
      cam.position = new SPLAT.Vector3(last.position.x, last.position.y, last.position.z)
      cam.rotation = rot
      setOverallProgress(1)
      stopInternal()
      return
    }

    const i = Math.min(intern.segmentIndex, totalSegments - 1)
    const t = Math.max(0, Math.min(1, intern.segmentT))
    const easedT = easeInOutCubic(t)

    const { p0, p1, p2, p3, p0t, p1t, p2t, p3t } = getControlPoints(kfs, i)

    const pos = catmullRomPoint(p0, p1, p2, p3, easedT)
    const tgt = catmullRomPoint(p0t, p1t, p2t, p3t, easedT)

    const dirX = tgt.x - pos.x
    const dirY = tgt.y - pos.y
    const dirZ = tgt.z - pos.z
    const dirLen = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ)
    if (dirLen < 0.0001) return
    const rot = SPLAT.Quaternion.LookRotation(new SPLAT.Vector3(dirX, dirY, dirZ))

    cam.position = new SPLAT.Vector3(pos.x, pos.y, pos.z)
    cam.rotation = rot

    // Post-update debug: did cam.position change after setter?
    if (frameCounterRef.current < 5) {
      console.log('[CameraPath] frame', frameCounterRef.current,
        'computed:', pos.x.toFixed(3), pos.y.toFixed(3), pos.z.toFixed(3),
        '| camPos(after):', cam.position.x.toFixed(3), cam.position.y.toFixed(3), cam.position.z.toFixed(3),
        '| segT:', intern.segmentT.toFixed(4))
      frameCounterRef.current++
    }

    const overall = (i + t) / totalSegments
    setOverallProgress(overall)
  }, [cameraRef, splatModuleRef, stopInternal])

  // Keep pathUpdateRef.current pointing to latest updatePath.
  // Done in render so it's always current when the rAF loop reads it.
  // eslint-disable-next-line react-hooks/refs
  pathUpdateRef.current = updatePath

  const play = useCallback(() => {
    const path = activePathRef.current
    if (!path) {
      console.warn('[CameraPath] play() aborted: no active path selected')
      return
    }
    if (path.keyframes.length === 0) {
      console.warn('[CameraPath] play() aborted: active path has no keyframes (path:', path.name, ')')
      return
    }
    if (!splatModuleRef.current) {
      console.warn('[CameraPath] play() aborted: splat module not loaded yet')
      return
    }

    const ctrl = controlsRef.current
    if (ctrl) ctrl.dampening = 0

    if (stateRef.current === 'idle') {
      internalRef.current = { segmentIndex: 0, segmentT: 0, lastTime: 0 }
      setOverallProgress(0)
    }

    internalRef.current.lastTime = 0
    frameCounterRef.current = 0
    setState('playing')
    isPathPlayingRef.current = true
    console.log('[CameraPath] play() started — keyframes:', path.keyframes.length, 'speed:', speedRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }
}
