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
}

// localStorage keys
export const STORAGE_KEY_HOTSPOTS = 'gs_hotspots_'
export const STORAGE_KEY_CUSTOM_MODELS = 'gs_custom_models'
