import { useEffect, useRef, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, AnimatePresence } from 'framer-motion'
import PerformancePanel from './PerformancePanel'
import ControlsHelp from './ControlsHelp'
import HotspotMarker from './viewer/HotspotMarker'
import HotspotInfo from './viewer/HotspotInfo'
import CameraPathPlayer from './viewer/CameraPathPlayer'
import HotspotEditor from './editor/HotspotEditor'
import CameraPathEditor from './editor/CameraPathEditor'
import { worldToScreen, interpolateWaypoints, lookAtQuaternion } from '../utils/math3d'
import { parseHotspotJSON, exportHotspotsJSON } from '../utils/hotspotImporter'
import {
  getHotspots, addHotspot, updateHotspot, deleteHotspot,
  getCameraPaths, addCameraPath, deleteCameraPath,
  addWaypoint, deleteWaypoint, updateCameraPath,
} from '../store/modelStore'
import type { Hotspot, CameraPath } from '../types'

interface Props {
  modelUrl: string
  modelName: string
  modelId: string
}

export default function Viewer3D({ modelUrl, modelName, modelId }: Props) {
  const { t, lang } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  // GSplat refs
  const rendererRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const splatModuleRef = useRef<any>(null)
  const intersectionTesterRef = useRef<any>(null)

  // View state
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [splatCount, setSplatCount] = useState(0)
  const [fps, setFps] = useState(0)
  const fpsFrames = useRef<number[]>([])

  // UI state
  const [showControls, setShowControls] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showHotspotEditor, setShowHotspotEditor] = useState(false)
  const [showPathEditor, setShowPathEditor] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null)

  // Data state
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [cameraPaths, setCameraPaths] = useState<CameraPath[]>([])
  const [activePathId, setActivePathId] = useState<string | null>(null)

  // Camera path playback
  const [isPlaying, setIsPlaying] = useState(false)
  const isPlayingRef = useRef(false)
  const [playProgress, setPlayProgress] = useState(0)
  const [currentWaypoint, setCurrentWaypoint] = useState(0)
  const [showPerf, setShowPerf] = useState(false)
  const playbackRef = useRef<{
    startTime: number; path: CameraPath; totalDuration: number; waypointDurations: number[]
  } | null>(null)

  // Camera fly-to animation
  const flyAnimRef = useRef<{
    startTime: number; duration: number
    startPos: { x: number; y: number; z: number }
    endPos: { x: number; y: number; z: number }
    startTgt: { x: number; y: number; z: number }
    endTgt: { x: number; y: number; z: number }
  } | null>(null)

  const flyToHotspot = useCallback((hs: Hotspot) => {
    const cam = cameraRef.current; const ctrl = controlsRef.current
    if (!cam || !ctrl) { setSelectedHotspot(hs); return }
    if (!hs.cameraPosition || !hs.cameraTarget) { setSelectedHotspot(hs); return }

    setSelectedHotspot(hs)
    // Stop any playback
    setIsPlaying(false); isPlayingRef.current = false; playbackRef.current = null

    const startPos = { x: cam.position.x, y: cam.position.y, z: cam.position.z }
    let startTgt = { x: 0, y: 0, z: 0 }
    try {
      if ((ctrl as any).target) {
        startTgt = { x: (ctrl as any).target.x, y: (ctrl as any).target.y, z: (ctrl as any).target.z }
      }
    } catch {}

    flyAnimRef.current = {
      startTime: performance.now(),
      duration: 1.2, // seconds
      startPos,
      endPos: hs.cameraPosition,
      startTgt,
      endTgt: hs.cameraTarget,
    }
  }, [])

  const [hotspotScreens, setHotspotScreens] = useState<Map<string, { x: number; y: number; visible: boolean; scale: number }>>(new Map())

  // Load data
  useEffect(() => {
    setHotspots(getHotspots(modelId))
    const paths = getCameraPaths(modelId)
    setCameraPaths(paths)
    if (paths.length > 0 && !activePathId) setActivePathId(paths[0].id)
    setSelectedHotspot(null)
    setEditingHotspot(null)
    setShowHotspotEditor(false)
    setShowPathEditor(false)
    setEditMode(false)
  }, [modelId])

  // Keep refs in sync with state for render loop closure
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  const editModeRef = useRef(editMode)
  editModeRef.current = editMode

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

        // Camera fly-to animation
        if (flyAnimRef.current) {
          const fa = flyAnimRef.current
          const elapsed = (now - fa.startTime) / 1000
          const t = Math.min(elapsed / fa.duration, 1)
          // Ease in-out
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
          const cam = cameraRef.current; const ctrl = controlsRef.current
          if (cam && ctrl) {
            cam.position = new SPLAT.Vector3(
              fa.startPos.x + (fa.endPos.x - fa.startPos.x) * eased,
              fa.startPos.y + (fa.endPos.y - fa.startPos.y) * eased,
              fa.startPos.z + (fa.endPos.z - fa.startPos.z) * eased,
            )
            const tgtX = fa.startTgt.x + (fa.endTgt.x - fa.startTgt.x) * eased
            const tgtY = fa.startTgt.y + (fa.endTgt.y - fa.startTgt.y) * eased
            const tgtZ = fa.startTgt.z + (fa.endTgt.z - fa.startTgt.z) * eased
            ctrl.setCameraTarget(new SPLAT.Vector3(tgtX, tgtY, tgtZ))
          }
          if (t >= 1) flyAnimRef.current = null
        }

        if (isPlayingRef.current && playbackRef.current) {
          const pb = playbackRef.current
          const elapsed = (now - pb.startTime) / 1000
          const total = pb.totalDuration
          const t = pb.path.loop ? (elapsed % total) / total : Math.min(elapsed / total, 1)
          setPlayProgress(t)

          if (pb.path.waypoints.length >= 2) {
            let accumulatedTime = 0
            for (let i = 1; i < pb.path.waypoints.length; i++) {
              const segDur = pb.path.waypoints[i].duration
              if (t * total < accumulatedTime + segDur) {
                const segT = (t * total - accumulatedTime) / segDur
                const segNorm = (i - 1 + segT) / (pb.path.waypoints.length - 1)
                const pos = interpolateWaypoints(pb.path.waypoints.map(w => w.position), segNorm)
                const tgt = interpolateWaypoints(pb.path.waypoints.map(w => w.target), segNorm)
                camera.position = new SPLAT.Vector3(pos.x, pos.y, pos.z)
                const q = lookAtQuaternion(pos, tgt)
                camera.rotation = new (SPLAT as any).Quaternion(q.x, q.y, q.z, q.w)
                setCurrentWaypoint(i - 1)
                break
              }
              accumulatedTime += segDur
            }
          }
          if (!pb.path.loop && elapsed >= total) { setIsPlaying(false); isPlayingRef.current = false; playbackRef.current = null; setPlayProgress(1) }
        } else {
          controls.update()
        }

        renderer.render(scene, camera)

        fpsFrames.current.push(now)
        while (fpsFrames.current.length > 0 && fpsFrames.current[0] < now - 1000) fpsFrames.current.shift()
        setFps(fpsFrames.current.length)

        // Update hotspot positions
        if (hotspots.length > 0) {
          const newScreens = new Map<string, { x: number; y: number; visible: boolean; scale: number }>()
          const camPos = camera.position; const camFwd = camera.forward
          const fov = (camera as any).data?.fovY ?? 50
          const rect = container.getBoundingClientRect()
          for (const hs of hotspots) {
            const screen = worldToScreen(hs.position, camPos, camFwd, fov, rect.width, rect.height)
            if (screen) {
              const dist = Math.sqrt((hs.position.x - camPos.x) ** 2 + (hs.position.y - camPos.y) ** 2 + (hs.position.z - camPos.z) ** 2)
              newScreens.set(hs.id, { x: screen.x, y: screen.y, visible: screen.visible, scale: Math.max(0.4, Math.min(1.5, 5 / dist)) })
            }
          }
          setHotspotScreens(newScreens)
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

      const onKey = (e: KeyboardEvent) => {
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
        if (e.key === 'e' || e.key === 'E') { if (!isLoading) setEditMode(prev => !prev) }
        // Arrow key hotspot navigation (guided tour)
        if (!isLoading && !editMode && hotspots.length > 0) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            const idx = selectedHotspot ? hotspots.findIndex(h => h.id === selectedHotspot.id) : -1
            const prev = idx > 0 ? hotspots[idx - 1] : hotspots[hotspots.length - 1]
            flyToHotspot(prev)
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            const idx = selectedHotspot ? hotspots.findIndex(h => h.id === selectedHotspot.id) : -1
            const next = idx < hotspots.length - 1 ? hotspots[idx + 1] : hotspots[0]
            flyToHotspot(next)
          }
        }
      }
      window.addEventListener('keydown', onKey)

      // Canvas click handler — raycast to place hotspot on model surface
      const onCanvasClick = (e: MouseEvent) => {
        if (!editModeRef.current) return
        const target = e.target as HTMLElement
        if (target.closest('[data-hotspot]') || target.closest('.glass')) return
        placeHotspotAtScreen(e.clientX, e.clientY)
      }
      canvas.addEventListener('click', onCanvasClick)

      // Screen-to-world hotspot placement using IntersectionTester + ray marching
      const placeHotspotAtScreen = (clientX: number, clientY: number) => {
        const cam = cameraRef.current
        const tester = intersectionTesterRef.current
        if (!cam || !canvas) return null
        const rect = canvas.getBoundingClientRect()
        const x = clientX - rect.left
        const y = clientY - rect.top

        // Use IntersectionTester to verify a gaussian is at this screen position
        if (tester) {
          const hit = tester.testPoint(x, y)
          if (!hit) return null // Click didn't hit any gaussian
        }

        // Get ray direction from camera through the pixel
        const rayDir = cam.screenPointToRay(x, y)
        const camPos = cam.position
        const { width, height, viewProj } = cam.data

        // Ray march to find approximate 3D hit position
        // Step along ray, project back to screen, find closest match
        let bestPos = { x: camPos.x + rayDir.x * 3, y: camPos.y + rayDir.y * 3, z: camPos.z + rayDir.z * 3 }
        let bestDist = Infinity

        for (let d = 0.5; d <= 80; d += 0.5) {
          const wx = camPos.x + rayDir.x * d
          const wy = camPos.y + rayDir.y * d
          const wz = camPos.z + rayDir.z * d

          // Transform world point to clip space using view-projection matrix
          const b = viewProj.buffer
          const cx = b[0] * wx + b[4] * wy + b[8] * wz + b[12]
          const cy = b[1] * wx + b[5] * wy + b[9] * wz + b[13]
          const cw = b[3] * wx + b[7] * wy + b[11] * wz + b[15]

          if (cw <= 0.001) continue // Behind camera

          // Perspective divide + NDC to screen
          const sx = ((cx / cw) * 0.5 + 0.5) * width
          const sy = ((-cy / cw) * 0.5 + 0.5) * height

          const dx = sx - x
          const dy = sy - y
          const dist = dx * dx + dy * dy

          if (dist < bestDist) {
            bestDist = dist
            bestPos = { x: wx, y: wy, z: wz }
          }
          if (dist < 4) break // Close enough
        }

        // Capture current camera viewpoint
        const ctrl = controlsRef.current
        let camTgt = { x: 0, y: 0, z: 0 }
        try {
          if (ctrl && (ctrl as any).target) {
            camTgt = { x: (ctrl as any).target.x, y: (ctrl as any).target.y, z: (ctrl as any).target.z }
          }
        } catch {}

        // Open editor at the found position
        const newHs: Hotspot = {
          id: '', position: bestPos,
          title: '', titleEn: '', description: '', descriptionEn: '',
          icon: '📍', color: '#d4a574',
          cameraPosition: { x: camPos.x, y: camPos.y, z: camPos.z },
          cameraTarget: camTgt,
        }
        setEditingHotspot(newHs)
        setShowHotspotEditor(true)
        setSelectedHotspot(null)
        return bestPos
      }

      return () => {
        cancelAnimationFrame(animRef.current)
        ro.disconnect()
        window.removeEventListener('keydown', onKey)
        canvas.removeEventListener('click', onCanvasClick)
        renderer.dispose()
      }
    } catch (err: any) {
      console.error('Viewer error:', err)
      setError(err.message || 'Failed to load model')
      setIsLoading(false)
      return () => { cancelAnimationFrame(animRef.current); rendererRef.current?.dispose() }
    }
  }, [modelUrl])

  useEffect(() => {
    const cleanup = initAndLoad()
    return () => { cleanup.then((fn: any) => fn?.()) }
  }, [initAndLoad])


  // --- Hotspot handlers ---
  const handleSaveHotspot = useCallback((data: { title: string; titleEn: string; description: string; descriptionEn: string; icon: string; color: string }) => {
    if (!data.title.trim()) return
    if (editingHotspot?.id) {
      updateHotspot(modelId, editingHotspot.id, { ...data, position: editingHotspot.position })
    } else if (editingHotspot?.position) {
      addHotspot(modelId, { ...data, position: editingHotspot.position })
    }
    setHotspots(getHotspots(modelId))
    setShowHotspotEditor(false); setEditingHotspot(null)
  }, [modelId, editingHotspot])

  const handleDeleteHotspot = useCallback((id: string) => {
    deleteHotspot(modelId, id)
    setHotspots(getHotspots(modelId))
    setSelectedHotspot(null); setEditingHotspot(null); setShowHotspotEditor(false)
  }, [modelId])

  // --- Import/Export ---
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const result = parseHotspotJSON(text)
        if (result.errors.length > 0) {
          alert('Import warnings:\n' + result.errors.join('\n'))
        }
        if (result.hotspots.length > 0) {
          result.hotspots.forEach(h => addHotspot(modelId, h))
          setHotspots(getHotspots(modelId))
          alert(`Imported ${result.hotspots.length} hotspots!`)
        }
      } catch (e: any) {
        alert('Import failed: ' + e.message)
      }
    }
    input.click()
  }, [modelId])

  const handleExport = useCallback(() => {
    const json = exportHotspotsJSON(hotspots)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${modelId}-hotspots.json`; a.click()
    URL.revokeObjectURL(url)
  }, [hotspots, modelId])

  // --- Camera path handlers ---
  const handleAddPath = useCallback((name: string, nameEn: string) => {
    const path = addCameraPath(modelId, { name, nameEn, waypoints: [], loop: true })
    setCameraPaths(getCameraPaths(modelId)); setActivePathId(path.id)
  }, [modelId])
  const handleDeletePath = useCallback((pathId: string) => {
    deleteCameraPath(modelId, pathId)
    const paths = getCameraPaths(modelId)
    setCameraPaths(paths); setActivePathId(paths.length > 0 ? paths[0].id : null)
    if (activePathId === pathId) setIsPlaying(false)
  }, [modelId, activePathId])
  const handleRecordWaypoint = useCallback((pathId: string) => {
    const camera = cameraRef.current
    if (!camera) return
    const pos = camera.position; const fwd = camera.forward
    addWaypoint(modelId, pathId, { position: { x: pos.x, y: pos.y, z: pos.z }, target: { x: pos.x + fwd.x * 3, y: pos.y + fwd.y * 3, z: pos.z + fwd.z * 3 }, duration: 3 })
    setCameraPaths(getCameraPaths(modelId))
  }, [modelId])
  const handleDeleteWaypoint = useCallback((pathId: string, wpId: string) => { deleteWaypoint(modelId, pathId, wpId); setCameraPaths(getCameraPaths(modelId)) }, [modelId])
  const handleClearWaypoints = useCallback((pathId: string) => { updateCameraPath(modelId, pathId, { waypoints: [] }); setCameraPaths(getCameraPaths(modelId)) }, [modelId])
  const handlePlayPath = useCallback(() => {
    const path = cameraPaths.find(p => p.id === activePathId)
    if (!path || path.waypoints.length < 2) return
    const waypointDurations = path.waypoints.map(w => w.duration)
    playbackRef.current = { startTime: performance.now(), path, totalDuration: waypointDurations.reduce((a, b) => a + b, 0), waypointDurations }
    setIsPlaying(true); setCurrentWaypoint(0)
  }, [cameraPaths, activePathId])
  const handleStopPath = useCallback(() => { setIsPlaying(false); playbackRef.current = null; setPlayProgress(0); setCurrentWaypoint(0) }, [])
  const handleToggleLoop = useCallback((pathId: string) => { const path = cameraPaths.find(p => p.id === pathId); if (path) { updateCameraPath(modelId, pathId, { loop: !path.loop }); setCameraPaths(getCameraPaths(modelId)) } }, [modelId, cameraPaths])

  // --- Hotspot overlay rendering ---
  const hotspotElements = Array.from(hotspotScreens.entries()).map(([id, screen]) => {
    const hs = hotspots.find(h => h.id === id)
    if (!hs || !screen.visible) return null
    return (
      <HotspotMarker
        key={id}
        screenX={screen.x} screenY={screen.y}
        icon={hs.icon} color={hs.color}
        title={lang === 'zh' ? hs.title : hs.titleEn || hs.title}
        isSelected={selectedHotspot?.id === id}
        scale={screen.scale}
        onClick={() => {
          if (editMode) { setEditingHotspot(hs); setShowHotspotEditor(true) }
          else { flyToHotspot(hs) }
        }}
      />
    )
  })

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-black overflow-hidden ${editMode ? 'cursor-crosshair' : ''}`}>
      <canvas ref={canvasRef} className="gsplat-canvas absolute inset-0" tabIndex={-1} />

      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>{hotspotElements}</AnimatePresence>
      </div>

      {/* Loading */}
      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
          <div className="w-16 h-16 border-2 border-white/10 border-t-accent-1 rounded-full animate-spin mb-6" />
          <p className="text-white/60 text-sm mb-3">{t.viewer.loading}</p>
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-accent-1 to-accent-2" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
          <p className="text-white/30 text-xs mt-2">{progress}%</p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
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
                  // Brief visual feedback
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
          >
            📷
          </button>

          {/* Edit mode toggle */}
          <button
            onClick={() => { setEditMode(!editMode); setShowHotspotEditor(false); setShowPathEditor(false); setSelectedHotspot(null) }}
            className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
              editMode ? 'bg-accent-1/15 border border-accent-1/30 text-accent-1' : 'glass text-white/40 hover:text-white/70'
            }`}
          >
            {editMode ? '✎ 编辑中' : '✎ 编辑'}
          </button>

          {/* Edit tools (only in edit mode) */}
          <AnimatePresence>
            {editMode && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2">
                <div className="w-px h-6 bg-white/10" />
                <button
                  onClick={() => {
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const rect = canvas.getBoundingClientRect()
                    const cam = cameraRef.current
                    const tester = intersectionTesterRef.current
                    if (!cam) return
                    const x = rect.width / 2; const y = rect.height / 2
                    // Quick ray march to place hotspot at screen center
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
                    const ctrl = controlsRef.current
                    let camTgt = { x: 0, y: 0, z: 0 }
                    try { if (ctrl && (ctrl as any).target) camTgt = { x: (ctrl as any).target.x, y: (ctrl as any).target.y, z: (ctrl as any).target.z } } catch {}
                    setEditingHotspot({ id: '', position: pos, title: '', titleEn: '', description: '', descriptionEn: '', icon: '📍', color: '#d4a574', cameraPosition: { x: cam.position.x, y: cam.position.y, z: cam.position.z }, cameraTarget: camTgt })
                    setShowHotspotEditor(true); setShowPathEditor(false); setSelectedHotspot(null)
                  }}
                  className="rounded-xl px-3 py-2.5 text-xs font-medium glass text-white/50 hover:text-white/80 transition-colors"
                >
                  📍 添加热点
                </button>
                <button
                  onClick={() => { setShowPathEditor(!showPathEditor); setShowHotspotEditor(false) }}
                  className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${showPathEditor ? 'bg-accent-2/15 border border-accent-2/30 text-accent-2' : 'glass text-white/50 hover:text-white/80'}`}
                >
                  🎬 相机路径
                </button>
                <button onClick={handleImport} className="rounded-xl px-3 py-2.5 text-xs font-medium glass text-white/50 hover:text-white/80 transition-colors">
                  📥 导入JSON
                </button>
                {hotspots.length > 0 && (
                  <button onClick={handleExport} className="rounded-xl px-3 py-2.5 text-xs font-medium glass text-white/50 hover:text-white/80 transition-colors">
                    📤 导出
                  </button>
                )}
                <span className="text-xs text-white/20 ml-1">点击模型放置热点</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Camera path player (always visible when paths exist, not in edit mode) */}
      <AnimatePresence>
        {!editMode && cameraPaths.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <CameraPathPlayer
              paths={cameraPaths} activePathId={activePathId} isPlaying={isPlaying}
              currentWaypoint={currentWaypoint} progress={playProgress}
              onSelectPath={setActivePathId} onPlay={handlePlayPath} onStop={handleStopPath}
              onToggleLoop={handleToggleLoop}
            />
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Hotspot info panel (view mode) */}
      {!editMode && (
        <HotspotInfo hotspot={selectedHotspot} lang={lang} onClose={() => setSelectedHotspot(null)} />
      )}

      {/* Hotspot editor (edit mode) */}
      <HotspotEditor
        isOpen={showHotspotEditor}
        mode={editingHotspot?.id ? 'edit' : 'add'}
        editingHotspot={editingHotspot}
        onSave={handleSaveHotspot}
        onDelete={editingHotspot?.id ? () => handleDeleteHotspot(editingHotspot!.id) : undefined}
        onClose={() => { setShowHotspotEditor(false); setEditingHotspot(null) }}
      />

      {/* Camera path editor */}
      <CameraPathEditor
        isOpen={showPathEditor} paths={cameraPaths} activePathId={activePathId}
        onSelectPath={setActivePathId} onAddPath={handleAddPath} onDeletePath={handleDeletePath}
        onRecordWaypoint={handleRecordWaypoint} onDeleteWaypoint={handleDeleteWaypoint}
        onClearWaypoints={handleClearWaypoints} onClose={() => setShowPathEditor(false)}
      />

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
