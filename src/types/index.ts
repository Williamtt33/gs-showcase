export interface Vector3Like {
  x: number
  y: number
  z: number
}

export interface Hotspot {
  id: string
  position: Vector3Like
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  note: string
  /** Sequential order number (1-based) for display */
  order: number
  /** Camera viewpoint saved when annotation was placed */
  cameraPosition: Vector3Like
  cameraTarget: Vector3Like
}

export interface ModelMeta {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  file: string
  thumbnail: string
  tags: string[]
  pointCount: string
  size: string
  featured: boolean
  hotspots: Hotspot[]
  /** Saved initial camera viewpoint for this model */
  initialCameraPosition?: Vector3Like
  initialCameraTarget?: Vector3Like
}

// --- Camera Paths ---

export interface Keyframe {
  id: string
  /** Camera position at this keyframe */
  position: Vector3Like
  /** Look-at target at this keyframe */
  target: Vector3Like
}

export interface CameraPath {
  id: string
  name: string
  nameEn: string
  /** Ordered keyframes (waypoints) */
  keyframes: Keyframe[]
}

// localStorage keys
export const STORAGE_KEY_HOTSPOTS = 'gs_hotspots_'
export const STORAGE_KEY_CAMERA_PATHS = 'gs_camera_paths_'
export const STORAGE_KEY_CUSTOM_MODELS = 'gs_custom_models'
export const STORAGE_KEY_INITIAL_CAMERA = 'gs_initial_camera_'
