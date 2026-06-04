import type { ModelMeta, Hotspot, CameraPath, CameraWaypoint } from '../types'
import { STORAGE_KEY_HOTSPOTS, STORAGE_KEY_CAMERA_PATHS, STORAGE_KEY_CUSTOM_MODELS } from '../types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// --- Hotspots ---

export function getHotspots(modelId: string): Hotspot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOTSPOTS + modelId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHotspots(modelId: string, hotspots: Hotspot[]): void {
  localStorage.setItem(STORAGE_KEY_HOTSPOTS + modelId, JSON.stringify(hotspots))
}

export function addHotspot(modelId: string, hotspot: Omit<Hotspot, 'id'>): Hotspot {
  const hotspots = getHotspots(modelId)
  const newHotspot: Hotspot = { ...hotspot, id: generateId() }
  hotspots.push(newHotspot)
  saveHotspots(modelId, hotspots)
  return newHotspot
}

export function updateHotspot(modelId: string, id: string, updates: Partial<Hotspot>): void {
  const hotspots = getHotspots(modelId)
  const idx = hotspots.findIndex(h => h.id === id)
  if (idx >= 0) {
    hotspots[idx] = { ...hotspots[idx], ...updates }
    saveHotspots(modelId, hotspots)
  }
}

export function deleteHotspot(modelId: string, id: string): void {
  const hotspots = getHotspots(modelId).filter(h => h.id !== id)
  saveHotspots(modelId, hotspots)
}

// --- Camera Paths ---

export function getCameraPaths(modelId: string): CameraPath[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAMERA_PATHS + modelId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCameraPaths(modelId: string, paths: CameraPath[]): void {
  localStorage.setItem(STORAGE_KEY_CAMERA_PATHS + modelId, JSON.stringify(paths))
}

export function addCameraPath(modelId: string, path: Omit<CameraPath, 'id'>): CameraPath {
  const paths = getCameraPaths(modelId)
  const newPath: CameraPath = { ...path, id: generateId() }
  paths.push(newPath)
  saveCameraPaths(modelId, paths)
  return newPath
}

export function updateCameraPath(modelId: string, id: string, updates: Partial<CameraPath>): void {
  const paths = getCameraPaths(modelId)
  const idx = paths.findIndex(p => p.id === id)
  if (idx >= 0) {
    paths[idx] = { ...paths[idx], ...updates }
    saveCameraPaths(modelId, paths)
  }
}

export function deleteCameraPath(modelId: string, id: string): void {
  const paths = getCameraPaths(modelId).filter(p => p.id !== id)
  saveCameraPaths(modelId, paths)
}

export function addWaypoint(modelId: string, pathId: string, waypoint: Omit<CameraWaypoint, 'id'>): void {
  const paths = getCameraPaths(modelId)
  const path = paths.find(p => p.id === pathId)
  if (path) {
    path.waypoints.push({ ...waypoint, id: generateId() })
    saveCameraPaths(modelId, paths)
  }
}

export function updateWaypoint(modelId: string, pathId: string, wpId: string, updates: Partial<CameraWaypoint>): void {
  const paths = getCameraPaths(modelId)
  const path = paths.find(p => p.id === pathId)
  if (path) {
    const idx = path.waypoints.findIndex(w => w.id === wpId)
    if (idx >= 0) {
      path.waypoints[idx] = { ...path.waypoints[idx], ...updates }
      saveCameraPaths(modelId, paths)
    }
  }
}

export function deleteWaypoint(modelId: string, pathId: string, wpId: string): void {
  const paths = getCameraPaths(modelId)
  const path = paths.find(p => p.id === pathId)
  if (path) {
    path.waypoints = path.waypoints.filter(w => w.id !== wpId)
    saveCameraPaths(modelId, paths)
  }
}

// --- Custom Models ---

export function getCustomModels(): ModelMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_MODELS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomModels(models: ModelMeta[]): void {
  localStorage.setItem(STORAGE_KEY_CUSTOM_MODELS, JSON.stringify(models))
}

export function addCustomModel(model: Omit<ModelMeta, 'id'>, preGeneratedId?: string): ModelMeta {
  const models = getCustomModels()
  const newModel: ModelMeta = { ...model, id: preGeneratedId || generateId(), hotspots: model.hotspots || [], cameraPaths: model.cameraPaths || [] }
  models.push(newModel)
  saveCustomModels(models)
  return newModel
}

export function updateCustomModel(id: string, updates: Partial<ModelMeta>): void {
  const models = getCustomModels()
  const idx = models.findIndex(m => m.id === id)
  if (idx >= 0) {
    models[idx] = { ...models[idx], ...updates }
    saveCustomModels(models)
  }
}

export function deleteCustomModel(id: string): void {
  const models = getCustomModels().filter(m => m.id !== id)
  saveCustomModels(models)
  // Also clean up associated data
  localStorage.removeItem(STORAGE_KEY_HOTSPOTS + id)
  localStorage.removeItem(STORAGE_KEY_CAMERA_PATHS + id)
}

// --- Export/Import ---

export function exportModelData(modelId: string): string {
  return JSON.stringify({
    hotspots: getHotspots(modelId),
    cameraPaths: getCameraPaths(modelId),
  }, null, 2)
}

export function importModelData(modelId: string, json: string): void {
  try {
    const data = JSON.parse(json)
    if (data.hotspots) saveHotspots(modelId, data.hotspots)
    if (data.cameraPaths) saveCameraPaths(modelId, data.cameraPaths)
  } catch {
    throw new Error('Invalid JSON data')
  }
}
