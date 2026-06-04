import { getCustomModels } from '../store/modelStore'
import { getSplatFileUrl } from './fileStorage'
import type { ModelMeta } from '../types'

export type { ModelMeta as ModelInfo }

let cachedManifest: ModelMeta[] | null = null

export async function getBuiltinModels(): Promise<ModelMeta[]> {
  if (cachedManifest) return cachedManifest
  const res = await fetch(`/models/manifest.json?t=${Date.now()}`)
  if (!res.ok) throw new Error(`Failed to fetch manifest (${res.status})`)
  const models: ModelMeta[] = await res.json()
  if (!Array.isArray(models)) throw new Error('Invalid manifest format')
  models.forEach(m => {
    if (!m.hotspots) m.hotspots = []
    if (!m.cameraPaths) m.cameraPaths = []
  })
  cachedManifest = models
  return cachedManifest!
}

export async function getModels(): Promise<ModelMeta[]> {
  const builtin = await getBuiltinModels()
  const custom = getCustomModels()
  return [...builtin, ...custom]
}

/** Resolve the actual loadable URL for a model.
 *  Handles local IndexedDB files (starts with [local]),
 *  remote URLs (starts with http), and relative paths. */
export async function resolveModelUrl(model: ModelMeta): Promise<string> {
  // Locally uploaded file → load from IndexedDB
  if (model.file.startsWith('[local]')) {
    const url = await getSplatFileUrl(model.id)
    if (!url) throw new Error(`Local file for "${model.name}" not found. Please re-upload.`)
    return url
  }
  // Full URL
  if (model.file.startsWith('http://') || model.file.startsWith('https://')) {
    return model.file
  }
  // Path relative to /models/
  return `/models/${model.file}`
}

/** Get the display URL for showing in UI (not the real loadable URL) */
export function getModelDisplayPath(model: ModelMeta): string {
  if (model.file.startsWith('[local]')) {
    return model.file.replace('[local]', '')
  }
  return model.file
}

export async function getModelById(id: string): Promise<ModelMeta | undefined> {
  const models = await getModels()
  return models.find(m => m.id === id)
}
