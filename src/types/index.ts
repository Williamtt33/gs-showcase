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
  icon: string // emoji
  color: string // hex
  /** Camera viewpoint saved when hotspot was placed — for fly-to animation */
  cameraPosition?: Vector3Like
  cameraTarget?: Vector3Like
}

export interface CameraWaypoint {
  id: string
  position: Vector3Like
  target: Vector3Like
  duration: number // seconds to reach this waypoint from previous
}

export interface CameraPath {
  id: string
  name: string
  nameEn: string
  waypoints: CameraWaypoint[]
  loop: boolean
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
  cameraPaths: CameraPath[]
}

// localStorage keys
export const STORAGE_KEY_HOTSPOTS = 'gs_hotspots_'
export const STORAGE_KEY_CAMERA_PATHS = 'gs_camera_paths_'
export const STORAGE_KEY_CUSTOM_MODELS = 'gs_custom_models'
