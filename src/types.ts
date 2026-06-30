export interface Vector3Like {
  x: number
  y: number
  z: number
}

export interface Hotspot {
  id: string
  position: Vector3Like
  title: string
  description: string
  note: string
  order: number
  cameraPosition: Vector3Like
  cameraTarget: Vector3Like
}

export interface ModelMeta {
  id: string
  name: string
  description: string
  file: string
  thumbnail: string
  tags: string[]
  pointCount: string
  size: string
  featured: boolean
  hotspots: Hotspot[]
  initialCameraPosition?: Vector3Like
  initialCameraTarget?: Vector3Like
}

export interface Keyframe {
  id: string
  position: Vector3Like
  target: Vector3Like
}

export interface CameraPath {
  id: string
  name: string
  keyframes: Keyframe[]
}

export const STORAGE_KEY_HOTSPOTS = 'gs_hotspots_'
export const STORAGE_KEY_CAMERA_PATHS = 'gs_camera_paths_'
export const STORAGE_KEY_CUSTOM_MODELS = 'gs_custom_models'
export const STORAGE_KEY_INITIAL_CAMERA = 'gs_initial_camera_'
