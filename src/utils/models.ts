import { getCustomModels } from '../store/modelStore'
import { getSplatFileUrl, cacheModelFile, getCachedModelFile } from './fileStorage'
import type { ModelMeta } from '../types'

export type { ModelMeta as ModelInfo }

let cachedManifest: ModelMeta[] | null = null

export async function getBuiltinModels(): Promise<ModelMeta[]> {
  if (cachedManifest) return cachedManifest
  const base = import.meta.env.BASE_URL
  const res = await fetch(`${base}models/manifest.json?t=${Date.now()}`)
  if (!res.ok) throw new Error(`Failed to fetch manifest (${res.status})`)
  const models: ModelMeta[] = await res.json()
  if (!Array.isArray(models)) throw new Error('Invalid manifest format')
  models.forEach(m => {
    if (!m.hotspots) m.hotspots = []
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
 *  For relative-path builtin models: check IndexedDB cache first,
 *  otherwise download, cache, and return a blob URL.
 *  onProgress reports 0–100 during download. */
export async function resolveModelUrl(
  model: ModelMeta,
  onProgress?: (p: number) => void,
): Promise<string> {
  // Locally uploaded file → load from IndexedDB
  if (model.file.startsWith('[local]')) {
    const url = await getSplatFileUrl(model.id)
    if (!url) throw new Error(`Local file for "${model.name}" not found. Please re-upload.`)
    return url
  }
  // Full URL — pass through, let gsplat handle download
  if (model.file.startsWith('http://') || model.file.startsWith('https://')) {
    return model.file
  }
  // Relative path — check IndexedDB cache first
  const path = `${import.meta.env.BASE_URL}models/${model.file}`
  const cached = await getCachedModelFile(path)
  if (cached) {
    onProgress?.(100)
    return cached
  }
  // Download with progress, cache, return blob URL
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Failed to load model: ${response.status}`)
  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0
  const reader = response.body!.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    if (total > 0) onProgress?.(Math.round((loaded / total) * 100))
  }

  const buffer = await new Blob(chunks as BlobPart[]).arrayBuffer()
  // Cache in background — don't block loading
  cacheModelFile(path, buffer).catch(() => {})
  return URL.createObjectURL(new Blob([buffer]))
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
