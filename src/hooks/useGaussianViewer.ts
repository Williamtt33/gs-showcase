import { useRef, useCallback, useState } from 'react'

export interface ViewerState {
  isLoading: boolean
  progress: number
  isLoaded: boolean
  error: string | null
  splatCount: number
  fps: number
}

export function useGaussianViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const animFrameRef = useRef<number>(0)
  const fpsFrames = useRef<number[]>([])

  const [state, setState] = useState<ViewerState>({
    isLoading: false,
    progress: 0,
    isLoaded: false,
    error: null,
    splatCount: 0,
    fps: 0,
  })

  const splatModuleRef = useRef<any>(null)

  const initViewer = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const SPLAT = await import('gsplat')
      splatModuleRef.current = SPLAT

      const scene = new SPLAT.Scene()
      const camera = new SPLAT.Camera()
      const renderer = new SPLAT.WebGLRenderer(canvas)
      const controls = new SPLAT.OrbitControls(camera, canvas)

      sceneRef.current = scene
      cameraRef.current = camera
      rendererRef.current = renderer
      controlsRef.current = controls

      // Handle resize
      const resize = () => {
        if (!containerRef.current) return
        const { width, height } = containerRef.current.getBoundingClientRect()
        const dpr = Math.min(window.devicePixelRatio, 2)
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        renderer.setSize(width * dpr, height * dpr)
      }
      resize()
      window.addEventListener('resize', resize)

      // Render loop
      const animate = () => {
        controls.update()
        renderer.render(scene, camera)

        // FPS tracking
        const now = performance.now()
        fpsFrames.current.push(now)
        while (fpsFrames.current.length > 0 && fpsFrames.current[0] < now - 1000) {
          fpsFrames.current.shift()
        }
        if (fpsFrames.current.length > 0) {
          setState(prev => ({ ...prev, fps: fpsFrames.current.length }))
        }

        animFrameRef.current = requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)

      return () => {
        window.removeEventListener('resize', resize)
        cancelAnimationFrame(animFrameRef.current)
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message || 'Failed to initialize viewer' }))
    }
  }, [])

  const loadModel = useCallback(async (url: string) => {
    const scene = sceneRef.current
    if (!scene) return

    const SPLAT = await import('gsplat')
    setState(prev => ({ ...prev, isLoading: true, progress: 0, error: null }))

    try {
      // Clear previous scene
      scene.reset()

      const splat = await SPLAT.Loader.LoadAsync(url, scene, (progress: number) => {
        setState(prev => ({ ...prev, progress: Math.round(progress * 100) }))
      })

      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        progress: 100,
        splatCount: splat?.data?.vertexCount ?? 0,
      }))
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to load model',
      }))
    }
  }, [])

  const resetCamera = useCallback(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    const SPLAT = splatModuleRef.current
    if (!camera || !controls || !SPLAT) return

    camera.position = new SPLAT.Vector3(0, 0, 5)
    controls.setCameraTarget(new SPLAT.Vector3(0, 0, 0))
    controls.update()
  }, [])

  const resize = useCallback(() => {
    const renderer = rendererRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!renderer || !canvas || !container) return

    const { width, height } = container.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    renderer.setSize(width * dpr, height * dpr)
  }, [])

  return {
    canvasRef,
    containerRef,
    state,
    initViewer,
    loadModel,
    resetCamera,
    resize,
  }
}
