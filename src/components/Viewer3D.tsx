import { useEffect, useRef, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion } from 'framer-motion'
import PerformancePanel from './PerformancePanel'
import ControlsHelp from './ControlsHelp'
import AnnotationMarker from './viewer/AnnotationMarker'
import HotspotEditor from './editor/HotspotEditor'
import CameraPathPanel from './editor/CameraPathPanel'
import SplatLoadingScreen from './viewer/SplatLoadingScreen'
import ShamianLoadingScreen from './viewer/ShamianLoadingScreen'
import { worldToScreen, easeInOutCubic } from '../utils/math3d'
import { syncOrbitControls } from '../utils/orbitSync'
import {
  getHotspots, addHotspot, updateHotspot, deleteHotspot,
} from '../store/modelStore'
import type { Hotspot, CameraPath } from '../types'
import type { Scene, Camera, WebGLRenderer, OrbitControls, IntersectionTester } from 'gsplat'
import { useCameraPathPlayer } from '../hooks/useCameraPathPlayer'

interface Props {
  modelUrl: string
  modelName: string
  modelId: string
  readOnly?: boolean
  /** External download progress (0–100) when model is pre-fetched */
  downloadProgress?: number
}

export default function Viewer3D({ modelUrl, modelName, modelId, readOnly, downloadProgress }: Props) {
  const { lang } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  // GSplat refs
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const cameraRef = useRef<Camera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const splatModuleRef = useRef<typeof import('gsplat') | null>(null)
  const intersectionTesterRef = useRef<IntersectionTester | null>(null)

  // WASD flight control refs
  const keysRef = useRef<Set<string>>(new Set())
  const lastTimeRef = useRef<number>(0)
  const flightSpeedRef = useRef(25) // base speed units/sec

  // View state
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [splatCount, setSplatCount] = useState(0)
  const [fps, setFps] = useState(0)
  const fpsFrames = useRef<number[]>([])

  // UI state
  const [showControls, setShowControls] = useState(true)
  const [showHotspotEditor, setShowHotspotEditor] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null)

  // Camera path state — refs owned by Viewer3D so render loop reads them directly
  const [activePathId, setActivePathId] = useState<string | null>(null)
  const [activePath, setActivePath] = useState<CameraPath | null>(null)
  const [showCameraPathPanel, setShowCameraPathPanel] = useState(false)
  const isPathPlayingRef = useRef(false)
  const pathUpdateRef = useRef<(() => void) | null>(null)
  const playback = useCameraPathPlayer(activePath, cameraRef, controlsRef, splatModuleRef, isPathPlayingRef, pathUpdateRef)
  const handleSelectPath = useCallback((path: CameraPath | null) => {
    setActivePathId(path?.id ?? null)
    setActivePath(path)
  }, [])

  // Data state
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const hotspotsRef = useRef<Hotspot[]>([])
  const isLoadingRef = useRef(true)
  const selectedHotspotRef = useRef<Hotspot | null>(null)
  const [showPerf, setShowPerf] = useState(false)

  // Fly-to animation refs
  const flyAnimIdRef = useRef<number>(0)
  const isFlyingRef = useRef(false)

  const flyToHotspot = useCallback((hs: Hotspot) => {
    const cam = cameraRef.current; const ctrl = controlsRef.current
    const SPLAT = splatModuleRef.current
    if (!cam || !ctrl || !SPLAT) { setSelectedHotspot(hs); return }

    setSelectedHotspot(hs)

    // Cancel any in-progress fly animation
    if (flyAnimIdRef.current) cancelAnimationFrame(flyAnimIdRef.current)

    // Current camera state as start
    const startPos = { x: cam.position.x, y: cam.position.y, z: cam.position.z }

    // Target: fly close to the annotation point, looking at it
    const endLookAt = { x: hs.position.x, y: hs.position.y, z: hs.position.z }
    // Approach direction from annotation point toward current camera
    const dx = startPos.x - hs.position.x
    const dy = startPos.y - hs.position.y
    const dz = startPos.z - hs.position.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const closeDist = 1.5 // units from the point
    const endPos = dist > 0.01
      ? {
          x: hs.position.x + (dx / dist) * closeDist,
          y: hs.position.y + (dy / dist) * closeDist,
          z: hs.position.z + (dz / dist) * closeDist,
        }
      : {
          x: hs.position.x + 2,
          y: hs.position.y + 1,
          z: hs.position.z + 1.5,
        }

    const startTime = performance.now()
    const duration = 0.5 // seconds — quick snap to the point
    isFlyingRef.current = true
    ctrl.dampening = 0 // Kill orbit damping during animation

    const tick = () => {
      const elapsed = (performance.now() - startTime) / 1000
      const t = Math.min(elapsed / duration, 1)
      const ease = easeInOutCubic(t)

      const px = startPos.x + (endPos.x - startPos.x) * ease
      const py = startPos.y + (endPos.y - startPos.y) * ease
      const pz = startPos.z + (endPos.z - startPos.z) * ease
      // Keep camera facing the annotation point throughout — no lookAt interpolation
      const dirVec = new SPLAT.Vector3(endLookAt.x - px, endLookAt.y - py, endLookAt.z - pz)
      const rot = SPLAT.Quaternion.LookRotation(dirVec)
      const pos = new SPLAT.Vector3(px, py, pz)
      cam.position = pos
      cam.rotation = rot

      if (t < 1) {
        flyAnimIdRef.current = requestAnimationFrame(tick)
      } else {
        // Animation complete — sync OrbitControls and resume
        isFlyingRef.current = false
        syncOrbitControls(ctrl, SPLAT,
          endLookAt.x, endLookAt.y, endLookAt.z)
      }
    }
    flyAnimIdRef.current = requestAnimationFrame(tick)
  }, [])

  // Hotspot screen positions — stored in ref to avoid React re-render per frame.
  // Updated directly in the render loop via DOM manipulation for 60fps smoothness.
  const hotspotScreensRef = useRef<Map<string, { x: number; y: number; visible: boolean; scale: number }>>(new Map())
  const overlayRef = useRef<HTMLDivElement>(null)

  // Load hotspots from store when switching models
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data on model change
    setHotspots(getHotspots(modelId))
    setSelectedHotspot(null)
    setEditingHotspot(null)
    setShowHotspotEditor(false)
  }, [modelId])

  // Keep refs in sync with state for render loop / event handler closure
  useEffect(() => { hotspotsRef.current = hotspots }, [hotspots])
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])
  useEffect(() => { selectedHotspotRef.current = selectedHotspot }, [selectedHotspot])

  // --- Init & Load ---
  const initAndLoad = useCallback(async () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    try {
      const SPLAT = await import('gsplat')
      splatModuleRef.current = SPLAT

      const scene = new SPLAT.Scene()
      const camera = new SPLAT.Camera()
      const renderer = new SPLAT.WebGLRenderer(canvas)
      const controls = new SPLAT.OrbitControls(camera, canvas, undefined, undefined, undefined, false)

      sceneRef.current = scene
      cameraRef.current = camera
      rendererRef.current = renderer
      controlsRef.current = controls

      const resize = () => {
        const { width, height } = container.getBoundingClientRect()
        const dpr = Math.min(window.devicePixelRatio, 2)
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        renderer.setSize(width * dpr, height * dpr)
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(container)

      // Render loop
      const animate = () => {
        const now = performance.now()

        // Skip controls.update() during fly animation or path playback
        if (isFlyingRef.current) {
          // Camera driven by flyToHotspot rAF loop — just render
        } else if (isPathPlayingRef.current) {
          // Camera driven by path playback engine — update then render
          pathUpdateRef.current?.()
        } else {
          // ── WASD direct camera flight ──
          const keys = keysRef.current
          const hasFlightKeys = keys.size > 0
          if (hasFlightKeys) {
            const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1)
            if (lastTimeRef.current > 0 && dt > 0) {
              const cp = camera.position
              const fwd = camera.forward
              // Right vector = cross(forward, worldUp)
              const rx = 1 * fwd.z - 0 * fwd.y  // worldUp=(0,1,0)
              const ry = 0 * fwd.x - 0 * fwd.z
              const rz = 0 * fwd.y - 1 * fwd.x
              const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz)
              const rightX = rLen > 0.0001 ? rx / rLen : 1
              const rightY = rLen > 0.0001 ? ry / rLen : 0
              const rightZ = rLen > 0.0001 ? rz / rLen : 0

              const speed = flightSpeedRef.current * dt

              let moveX = 0, moveY = 0, moveZ = 0
              if (keys.has('KeyW')) { moveX += fwd.x * speed; moveY += fwd.y * speed; moveZ += fwd.z * speed }
              if (keys.has('KeyS')) { moveX -= fwd.x * speed; moveY -= fwd.y * speed; moveZ -= fwd.z * speed }
              if (keys.has('KeyA')) { moveX -= rightX * speed; moveY -= rightY * speed; moveZ -= rightZ * speed }
              if (keys.has('KeyD')) { moveX += rightX * speed; moveY += rightY * speed; moveZ += rightZ * speed }
              if (keys.has('KeyQ')) { moveY -= speed }
              if (keys.has('KeyE')) { moveY += speed }

              if (moveX !== 0 || moveY !== 0 || moveZ !== 0) {
                const SPLAT = splatModuleRef.current
                if (SPLAT) {
                  // Compute new camera position and look-at target
                  const newX = cp.x + moveX
                  const newY = cp.y + moveY
                  const newZ = cp.z + moveZ
                  const lookDist = 3
                  const newTx = newX + fwd.x * lookDist
                  const newTy = newY + fwd.y * lookDist
                  const newTz = newZ + fwd.z * lookDist

                  // Let controls.update() handle rotation (prevents ghosting),
                  // then override position with our direct computation
                  controls.setCameraTarget(
                    new SPLAT.Vector3(newTx, newTy, newTz))
                  const savedDamp = controls.dampening
                  controls.dampening = 0
                  controls.update()
                  controls.dampening = savedDamp
                  camera.position = new SPLAT.Vector3(newX, newY, newZ)
                }
              }
            }
          }
          lastTimeRef.current = now

          // Normal orbit controls (no WASD active)
          if (!hasFlightKeys) {
            controls.update()
          }
        }

        renderer.render(scene, camera)

        fpsFrames.current.push(now)
        while (fpsFrames.current.length > 0 && fpsFrames.current[0] < now - 1000) fpsFrames.current.shift()
        setFps(fpsFrames.current.length)

        // Update hotspot positions using gsplat's actual view-projection matrix
        const currentHotspots = hotspotsRef.current
        if (currentHotspots.length > 0) {
          const newScreens = new Map<string, { x: number; y: number; visible: boolean; scale: number }>()
          const camPos = camera.position
          const vp = camera.data?.viewProj
          const vpBuffer: number[] | undefined = vp?.buffer
          const rect = container.getBoundingClientRect()
          const sw = rect.width; const sh = rect.height
          for (const hs of currentHotspots) {
            if (!vpBuffer) {
              // Fallback to simple projection
              const fwd = camera.forward
              const cd = camera.data
              const fov = cd ? 2 * Math.atan(cd.height / (2 * cd.fy)) * (180 / Math.PI) : 50
              const screen = worldToScreen(hs.position, camPos, fwd, fov, sw, sh)
              if (screen) {
                const dist = Math.sqrt((hs.position.x - camPos.x) ** 2 + (hs.position.y - camPos.y) ** 2 + (hs.position.z - camPos.z) ** 2)
                newScreens.set(hs.id, { x: screen.x, y: screen.y, visible: screen.visible, scale: Math.max(0.4, Math.min(1.5, 5 / dist)) })
              }
              continue
            }
            // Transform world point by view-projection matrix
            const wx = hs.position.x, wy = hs.position.y, wz = hs.position.z
            const cx = vpBuffer[0] * wx + vpBuffer[4] * wy + vpBuffer[8]  * wz + vpBuffer[12]
            const cy = vpBuffer[1] * wx + vpBuffer[5] * wy + vpBuffer[9]  * wz + vpBuffer[13]
            const cz = vpBuffer[2] * wx + vpBuffer[6] * wy + vpBuffer[10] * wz + vpBuffer[14]
            const cw = vpBuffer[3] * wx + vpBuffer[7] * wy + vpBuffer[11] * wz + vpBuffer[15]
            if (cw <= 0.0001) continue // Behind or at camera
            // Perspective divide + NDC to screen
            const ndcX = cx / cw
            const ndcY = cy / cw
            const screenX = (ndcX * 0.5 + 0.5) * sw
            const screenY = (-ndcY * 0.5 + 0.5) * sh // Flip Y: NDC up -> screen down
            const visible = ndcX >= -1.2 && ndcX <= 1.2 && ndcY >= -1.2 && ndcY <= 1.2 && cz > 0
            const dist = Math.sqrt((wx - camPos.x) ** 2 + (wy - camPos.y) ** 2 + (wz - camPos.z) ** 2)
            newScreens.set(hs.id, { x: screenX, y: screenY, visible, scale: Math.max(0.4, Math.min(1.5, 5 / dist)) })
          }
          // Store in ref and update DOM directly — bypass React for 60fps smoothness
          hotspotScreensRef.current = newScreens
          const overlay = overlayRef.current
          if (overlay) {
            overlay.querySelectorAll<HTMLElement>('[data-hotspot]').forEach(el => {
              const id = el.dataset.hotspot
              if (!id) return
              const screen = newScreens.get(id)
              if (screen?.visible) {
                el.style.display = ''
                el.style.transform = `translate(0, -50%) scale(${screen.scale})`
                el.style.left = `${screen.x}px`
                el.style.top = `${screen.y}px`
              } else {
                el.style.display = 'none'
              }
            })
          }
        }

        animRef.current = requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)

      // Load model
      setIsLoading(true); setProgress(0)
      const splat = await SPLAT.Loader.LoadAsync(modelUrl, scene, (p: number) => setProgress(Math.round(p * 100)))
      setSplatCount(splat?.data?.vertexCount ?? 0)

      // Initialize intersection tester for click-to-place
      try {
        intersectionTesterRef.current = new SPLAT.IntersectionTester(renderer.renderProgram, 5, 1)
      } catch { /* Intersection tester not critical */ }

      setIsLoading(false)

      const onKeyDown = (e: KeyboardEvent) => {
        // Track WASD/QE flight keys (always track, to avoid stuck keys)
        if (['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'].includes(e.code)) {
          keysRef.current.add(e.code)
        }
        // Don't handle keys if user is typing in an input
        if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
        if (e.key === 'r' || e.key === 'R') {
          const cam = cameraRef.current; const ctrl = controlsRef.current
          if (cam && ctrl) {
            cam.position = new SPLAT.Vector3(0, 0, 5)
            ctrl.setCameraTarget(new SPLAT.Vector3(0, 0, 0))
            ctrl.update()
          }
        }
        if (e.key === 'h' || e.key === 'H') setShowControls(prev => !prev)
        // Arrow key hotspot navigation (guided tour)
        const currentHotspots = hotspotsRef.current
        if (!isLoadingRef.current && currentHotspots.length > 0) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            const sel = selectedHotspotRef.current
            const idx = sel ? currentHotspots.findIndex(h => h.id === sel.id) : -1
            const prev = idx > 0 ? currentHotspots[idx - 1] : currentHotspots[currentHotspots.length - 1]
            flyToHotspot(prev)
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            const sel = selectedHotspotRef.current
            const idx = sel ? currentHotspots.findIndex(h => h.id === sel.id) : -1
            const next = idx < currentHotspots.length - 1 ? currentHotspots[idx + 1] : currentHotspots[0]
            flyToHotspot(next)
          }
        }
      }
      const onKeyUp = (e: KeyboardEvent) => {
        keysRef.current.delete(e.code)
      }
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)

      return () => {
        cancelAnimationFrame(animRef.current)
        ro.disconnect()
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
        renderer.dispose()
      }
    } catch (err: unknown) {
      console.error('Viewer error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load model')
      setIsLoading(false)
      return () => { cancelAnimationFrame(animRef.current); rendererRef.current?.dispose() }
    }
  }, [modelUrl, flyToHotspot])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- init external WebGL system
    const cleanup = initAndLoad()
    return () => { cleanup.then((fn) => { if (typeof fn === 'function') fn() }) }
  }, [initAndLoad])


  // --- Hotspot handlers ---
  const handleSaveHotspot = useCallback((data: { title: string; titleEn: string; description: string; descriptionEn: string }) => {
    if (!data.title.trim()) return
    if (editingHotspot?.id) {
      updateHotspot(modelId, editingHotspot.id, { ...data, note: data.description || data.descriptionEn })
    } else if (editingHotspot?.position) {
      const hsData = {
        title: data.title, titleEn: data.titleEn,
        description: data.description, descriptionEn: data.descriptionEn,
        note: data.description || data.descriptionEn,
        position: editingHotspot.position,
        order: editingHotspot.order || hotspots.length + 1,
        cameraPosition: editingHotspot.cameraPosition || { x: 0, y: 0, z: 5 },
        cameraTarget: editingHotspot.cameraTarget || { x: 0, y: 0, z: 0 },
      }
      addHotspot(modelId, hsData)
    }
    setHotspots(getHotspots(modelId))
    setShowHotspotEditor(false); setEditingHotspot(null)
  }, [modelId, editingHotspot, hotspots.length])

  const handleDeleteHotspot = useCallback((id: string) => {
    deleteHotspot(modelId, id)
    setHotspots(getHotspots(modelId))
    setSelectedHotspot(null); setEditingHotspot(null); setShowHotspotEditor(false)
  }, [modelId])

  // --- Annotation overlay — markers positioned by React, screen positions
  //     updated directly in DOM via rAF loop for 60fps smoothness ---
  const hotspotElements = hotspots.map((hs, idx) => (
    <AnnotationMarker
      key={hs.id}
      hotspotId={hs.id}
      screenX={0} screenY={0}
      number={hs.order || idx + 1}
      title={lang === 'zh' ? hs.title : hs.titleEn || hs.title}
      note={hs.note || hs.description || (lang === 'zh' ? hs.description : hs.descriptionEn) || ''}
      isSelected={selectedHotspot?.id === hs.id}
      scale={1}
      onSelect={() => { flyToHotspot(hs) }}
      onEdit={() => { setEditingHotspot(hs); setShowHotspotEditor(true) }}
    />
  ))

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden"
      onClick={(e) => {
        // Deselect hotspot when clicking empty canvas space
        if ((e.target as HTMLElement).tagName === 'CANVAS') {
          setSelectedHotspot(null)
        }
      }}
    >
      <canvas ref={canvasRef} className="gsplat-canvas absolute inset-0" tabIndex={-1} />

      <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
        {hotspotElements}
      </div>

      {/* Loading — model-specific loading screens */}
      {isLoading && (
        modelId === 'shamian' || modelName.includes('沙面') ? (
          <ShamianLoadingScreen
            progress={downloadProgress !== undefined ? Math.max(progress, downloadProgress) : progress}
            isDownloading={downloadProgress !== undefined && downloadProgress < 100}
          />
        ) : (
          <SplatLoadingScreen
            progress={downloadProgress !== undefined ? Math.max(progress, downloadProgress) : progress}
            isDownloading={downloadProgress !== undefined && downloadProgress < 100}
          />
        )
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center p-8"><div className="text-red-400 text-4xl mb-4">⚠</div><p className="text-red-300 mb-2 font-semibold">加载失败</p><p className="text-white/40 text-sm max-w-md">{error}</p></div>
        </div>
      )}

      {/* Top toolbar */}
      {!isLoading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 left-4 flex items-center gap-2 z-10 flex-wrap">
          {/* Back to gallery */}
          <Link to="/gallery" className="glass rounded-xl px-3 py-2.5 text-sm text-white/50 hover:text-white/80 transition-colors">←</Link>

          {/* Model name */}
          <div className="glass rounded-xl px-4 py-2.5 text-sm font-medium text-white/80">{modelName}</div>

          {/* Screenshot button */}
          <button
            onClick={() => {
              const canvas = canvasRef.current
              if (!canvas) return
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
              import('../utils/fileStorage').then(({ storeThumbnail }) => {
                storeThumbnail(modelId, dataUrl).then(() => {
                  const el = document.createElement('div')
                  el.className = 'fixed top-4 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2 text-xs text-accent-2 z-[100] animate-fade-in'
                  el.textContent = '✅ 封面已保存'
                  document.body.appendChild(el)
                  setTimeout(() => el.remove(), 2000)
                })
              })
            }}
            className="glass rounded-xl px-3 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            title="截取当前画面作为封面"
          >📷</button>

          {/* Annotation tools — only in edit pages */}
          {!readOnly && (
            <>
              <div className="w-px h-6 bg-white/10" />
              {/* Add annotation button */}
              <button
                onClick={() => {
                  const canvas = canvasRef.current; const cam = cameraRef.current
                  if (!canvas || !cam) return
                  const rect = canvas.getBoundingClientRect()
                  const x = rect.width / 2; const y = rect.height / 2
                  const tester = intersectionTesterRef.current
                  let pos = { x: cam.position.x + cam.forward.x * 3, y: cam.position.y + cam.forward.y * 3, z: cam.position.z + cam.forward.z * 3 }
                  if (tester?.testPoint(x, y)) {
                    const rayDir = cam.screenPointToRay(x, y)
                    const cp = cam.position; const vp = cam.data.viewProj.buffer
                    const { width: w, height: h } = cam.data
                    for (let d = 0.5; d <= 80; d += 0.5) {
                      const wx = cp.x + rayDir.x * d; const wy = cp.y + rayDir.y * d; const wz = cp.z + rayDir.z * d
                      const cw = vp[3] * wx + vp[7] * wy + vp[11] * wz + vp[15]
                      if (cw <= 0.001) continue
                      const sx = ((vp[0] * wx + vp[4] * wy + vp[8] * wz + vp[12]) / cw * 0.5 + 0.5) * w
                      const sy = ((-(vp[1] * wx + vp[5] * wy + vp[9] * wz + vp[13]) / cw) * 0.5 + 0.5) * h
                      if (Math.abs(sx - x) < 3 && Math.abs(sy - y) < 3) { pos = { x: wx, y: wy, z: wz }; break }
                    }
                  }
                  // Compute look-at target from camera forward (ctrl.target is private in gsplat)
                  const camTgt = {
                    x: cam.position.x + cam.forward.x * 3,
                    y: cam.position.y + cam.forward.y * 3,
                    z: cam.position.z + cam.forward.z * 3,
                  }
                  const nextOrder = hotspots.length + 1
                  setEditingHotspot({ id: '', position: pos, title: '', titleEn: '', description: '', descriptionEn: '', note: '', order: nextOrder, cameraPosition: { x: cam.position.x, y: cam.position.y, z: cam.position.z }, cameraTarget: camTgt })
                  setShowHotspotEditor(true)
                }}
                className="rounded-xl px-3 py-2.5 text-xs font-medium glass text-white/70 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                style={{ cursor: 'pointer' }}
              >📌 添加标注</button>

              <div className="w-px h-6 bg-white/10" />
              {/* Camera path button */}
              <button
                onClick={() => setShowCameraPathPanel(prev => !prev)}
                className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                  showCameraPathPanel
                    ? 'bg-accent-1/20 text-accent-1 border border-accent-1/30'
                    : 'glass text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`}
                style={{ cursor: 'pointer' }}
              >🎥 {lang === 'zh' ? '相机路径' : 'Cam Path'}</button>
            </>
          )}
        </motion.div>
      )}

      <PerformancePanel fps={fps} splatCount={splatCount} isVisible={showPerf && !isLoading && !error} />

      {/* Perf toggle — tiny and unobtrusive */}
      {!isLoading && !error && (
        <button
          onClick={() => setShowPerf(!showPerf)}
          className={`absolute glass rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-text-3/50 hover:text-text-3/80 transition-colors z-10 ${showPerf ? 'bottom-4 right-4' : 'top-4 right-4'}`}
          title="Toggle performance overlay"
        >
          {showPerf ? `${fps} fps` : '···'}
        </button>
      )}


      {/* Hotspot editor — only in edit pages */}
      {!readOnly && (
        <HotspotEditor
          isOpen={showHotspotEditor}
          mode={editingHotspot?.id ? 'edit' : 'add'}
          editingHotspot={editingHotspot}
          onSave={handleSaveHotspot}
          onDelete={editingHotspot?.id ? () => handleDeleteHotspot(editingHotspot!.id) : undefined}
          onClose={() => { setShowHotspotEditor(false); setEditingHotspot(null) }}
        />
      )}

      {/* Camera path panel — only in edit pages */}
      {!readOnly && (
        <CameraPathPanel
          modelId={modelId}
          cameraRef={cameraRef}
          controlsRef={controlsRef}
          splatModuleRef={splatModuleRef}
          playback={playback}
          activePathId={activePathId}
          onSelectPath={handleSelectPath}
          visible={showCameraPathPanel}
          onClose={() => setShowCameraPathPanel(false)}
        />
      )}

      <ControlsHelp isVisible={showControls && !isLoading && !error} onClose={() => setShowControls(false)} />

      {!isLoading && !error && !showControls && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setShowControls(true)}
          className="absolute bottom-4 left-4 glass rounded-lg px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors z-10"
        >
          H: 操作帮助
        </motion.button>
      )}
    </div>
  )
}
