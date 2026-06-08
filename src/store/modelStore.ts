import type { ModelMeta, Hotspot } from '../types'
import { STORAGE_KEY_HOTSPOTS, STORAGE_KEY_CUSTOM_MODELS } from '../types'

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
  const newModel: ModelMeta = { ...model, id: preGeneratedId || generateId(), hotspots: model.hotspots || [] }
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
}
