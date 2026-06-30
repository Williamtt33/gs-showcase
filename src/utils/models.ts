import { getCustomModels } from '../store/modelStore'
import { getSplatFileBuffer, cacheModelFile, getCachedModelBuffer } from './fileStorage'
import { fetchCustomModels, isSupabaseConfigured } from '../lib/api'
import type { ModelMeta } from '../types'

export type { ModelMeta as ModelInfo }

/** Result of resolving a model to its loadable source. */
export type ResolvedModel =
  | { source: 'url'; url: string }
  | { source: 'buffer'; buffer: ArrayBuffer }

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

  // Fetch shared models from Supabase (if configured)
  let remote: ModelMeta[] = []
  if (isSupabaseConfigured()) {
    try {
      remote = await fetchCustomModels()
    } catch (e) {
      console.warn('Failed to fetch remote models:', e)
    }
  }

  // Deduplicate: Supabase models take priority over local models with same ID
  const remoteIds = new Set(remote.map(m => m.id))
  const filteredCustom = custom.filter(m => !remoteIds.has(m.id))

  return [...builtin, ...remote, ...filteredCustom]
}

/** Resolve a model to its loadable source.
 *  For relative-path and [local] models: returns `{ source: 'buffer', buffer }`.
 *  For http/https URLs: returns `{ source: 'url', url }` (passthrough).
 *  onProgress reports 0–100 during download for relative-path cache misses. */
export async function resolveModelUrl(
  model: ModelMeta,
  onProgress?: (p: number) => void,
): Promise<ResolvedModel> {
  // Locally uploaded file → load raw ArrayBuffer from IndexedDB
  if (model.file.startsWith('[local]')) {
    const buffer = await getSplatFileBuffer(model.id)
    if (!buffer) throw new Error(`Local file for "${model.name}" not found. Please re-upload.`)
    onProgress?.(100)
    return { source: 'buffer', buffer }
  }
  // Full URL — pass through, gsplat handles fetch + progress internally
  if (model.file.startsWith('http://') || model.file.startsWith('https://')) {
    return { source: 'url', url: model.file }
  }
  // Relative path — check IndexedDB cache first
  const path = `${import.meta.env.BASE_URL}models/${model.file}`
  const cached = await getCachedModelBuffer(path)
  if (cached) {
    onProgress?.(100)
    return { source: 'buffer', buffer: cached }
  }
  // Cache miss — download with progress, cache in background, return buffer
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
  cacheModelFile(path, buffer).catch((e: unknown) => { console.warn('Failed to cache model file:', e) })
  onProgress?.(100)
  return { source: 'buffer', buffer }
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
