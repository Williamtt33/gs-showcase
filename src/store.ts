import { supabase, isSupabaseConfigured } from './supabase'
import type { ModelMeta, Hotspot, CameraPath, Vector3Like } from './types'
import { STORAGE_KEY_HOTSPOTS, STORAGE_KEY_CAMERA_PATHS, STORAGE_KEY_CUSTOM_MODELS, STORAGE_KEY_INITIAL_CAMERA } from './types'

// ── Helpers ──

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function warn(msg: string, err?: unknown) {
  console.warn(`[store] ${msg}`, err ?? '')
}

// ── Built-in models (static manifest) ──

let builtinCache: ModelMeta[] | null = null

export async function getBuiltinModels(): Promise<ModelMeta[]> {
  if (builtinCache) return builtinCache
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}models/manifest.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    builtinCache = await res.json()
    return builtinCache ?? []
  } catch (e) {
    warn('内置模型加载失败', e)
    return []
  }
}

// ── Remote models (Supabase) ──

async function fetchRemoteModels(): Promise<ModelMeta[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const { data, error } = await supabase.from('models').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return ((data ?? []) as any[]).map((db: any) => ({
      id: db.id,
      name: db.name,
      description: db.description,
      file: db.file,
      thumbnail: db.thumbnail,
      tags: db.tags ?? [],
      pointCount: db.point_count ?? '',
      size: db.size ?? '',
      featured: db.featured ?? false,
      hotspots: [],
    }))
  } catch (e) {
    warn('远程模型加载失败', e)
    return []
  }
}

// ── Custom models (localStorage fallback) ──

function getLocalModels(): ModelMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_MODELS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocalModels(models: ModelMeta[]) {
  localStorage.setItem(STORAGE_KEY_CUSTOM_MODELS, JSON.stringify(models))
}

// ── Public API: Models ──

export async function getAllModels(): Promise<ModelMeta[]> {
  const [builtin, remote] = await Promise.all([getBuiltinModels(), fetchRemoteModels()])
  // Merge with localStorage custom models if Supabase unavailable
  const local = isSupabaseConfigured() ? [] : getLocalModels()
  // Deduplicate by id
  const seen = new Set<string>()
  const all: ModelMeta[] = []
  for (const m of [...remote, ...local, ...builtin]) {
    if (!seen.has(m.id)) { seen.add(m.id); all.push(m) }
  }
  return all
}

export async function getModelById(id: string): Promise<ModelMeta | null> {
  const all = await getAllModels()
  return all.find(m => m.id === id) ?? null
}

export async function saveModel(model: Omit<ModelMeta, 'id'> & { id?: string }): Promise<string> {
  const id = model.id || uid()
  const m = { ...model, id, hotspots: (model as any).hotspots ?? [] }

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('models').upsert({
      id, name: m.name, description: m.description,
      file: m.file, thumbnail: m.thumbnail,
      tags: m.tags, point_count: m.pointCount, size: m.size, featured: m.featured,
    })
    if (error) throw new Error(`保存模型失败: ${error.message}`)
  } else {
    const models = getLocalModels().filter(x => x.id !== id)
    models.unshift(m)
    saveLocalModels(models)
  }
  return id
}

export async function deleteModel(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    // Delete files from storage
    for (const bucket of ['splat-files', 'thumbnails']) {
      try {
        const { data: files } = await supabase.storage.from(bucket).list(id)
        if (files?.length) {
          await supabase.storage.from(bucket).remove(files.map(f => `${id}/${f.name}`))
        }
      } catch { /* files might not exist */ }
    }
    const { error } = await supabase.from('models').delete().eq('id', id)
    if (error) throw new Error(`删除模型失败: ${error.message}`)
  } else {
    const models = getLocalModels().filter(x => x.id !== id)
    saveLocalModels(models)
  }
}

// ── Public API: Hotspots ──

export async function getHotspots(modelId: string): Promise<Hotspot[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('hotspots').select('*').eq('model_id', modelId).order('sort_order', { ascending: true })
      if (error) throw error
      return ((data ?? []) as any[]).map((db: any) => ({
        id: db.id,
        position: { x: db.position_x, y: db.position_y, z: db.position_z },
        title: db.title, description: db.description, note: db.note ?? '',
        order: db.sort_order,
        cameraPosition: { x: db.camera_pos_x, y: db.camera_pos_y, z: db.camera_pos_z },
        cameraTarget: { x: db.camera_tgt_x, y: db.camera_tgt_y, z: db.camera_tgt_z },
      }))
    } catch (e) {
      warn('云端标注加载失败，使用本地缓存', e)
    }
  }
  // localStorage fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOTSPOTS + modelId)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveHotspots(modelId: string, hotspots: Hotspot[]): Promise<void> {
  // Always save to localStorage as backup
  localStorage.setItem(STORAGE_KEY_HOTSPOTS + modelId, JSON.stringify(hotspots))

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('hotspots').delete().eq('model_id', modelId)
      if (hotspots.length > 0) {
        const rows = hotspots.map(hs => ({
          id: hs.id, model_id: modelId,
          position_x: hs.position.x, position_y: hs.position.y, position_z: hs.position.z,
          title: hs.title, description: hs.description, note: hs.note, sort_order: hs.order,
          camera_pos_x: hs.cameraPosition.x, camera_pos_y: hs.cameraPosition.y, camera_pos_z: hs.cameraPosition.z,
          camera_tgt_x: hs.cameraTarget.x, camera_tgt_y: hs.cameraTarget.y, camera_tgt_z: hs.cameraTarget.z,
        }))
        const { error } = await supabase.from('hotspots').insert(rows)
        if (error) throw error
      }
    } catch (e) {
      warn('云端标注保存失败', e)
    }
  }
}

// ── Public API: Camera Paths ──

export async function getCameraPaths(modelId: string): Promise<CameraPath[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data: paths, error } = await supabase.from('camera_paths').select('*').eq('model_id', modelId).order('created_at', { ascending: true })
      if (!error && paths?.length) {
        const pathIds = (paths as any[]).map((p: any) => p.id)
        const { data: kfs } = await supabase.from('keyframes').select('*').in('path_id', pathIds).order('sort_order', { ascending: true })
        const kfMap = new Map<string, any[]>()
        for (const kf of (kfs ?? []) as any[]) {
          const arr = kfMap.get(kf.path_id) ?? []; arr.push(kf); kfMap.set(kf.path_id, arr)
        }
        return (paths as any[]).map((p: any) => ({
          id: p.id, name: p.name,
          keyframes: (kfMap.get(p.id) ?? []).map((kf: any) => ({
            id: kf.id,
            position: { x: kf.pos_x, y: kf.pos_y, z: kf.pos_z },
            target: { x: kf.tgt_x, y: kf.tgt_y, z: kf.tgt_z },
          })),
        }))
      }
    } catch (e) { warn('云端相机路径加载失败', e) }
  }
  // localStorage fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAMERA_PATHS + modelId)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveCameraPaths(modelId: string, paths: CameraPath[]): Promise<void> {
  localStorage.setItem(STORAGE_KEY_CAMERA_PATHS + modelId, JSON.stringify(paths))

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('camera_paths').delete().eq('model_id', modelId)
      for (const path of paths) {
        await supabase.from('camera_paths').insert({ id: path.id, model_id: modelId, name: path.name })
        if (path.keyframes.length > 0) {
          await supabase.from('keyframes').insert(path.keyframes.map((kf, i) => ({
            id: kf.id, path_id: path.id, sort_order: i,
            pos_x: kf.position.x, pos_y: kf.position.y, pos_z: kf.position.z,
            tgt_x: kf.target.x, tgt_y: kf.target.y, tgt_z: kf.target.z,
          })))
        }
      }
    } catch (e) { warn('云端相机路径保存失败', e) }
  }
}

// ── Initial Camera (localStorage only) ──

export function getInitialCamera(modelId: string): { position: Vector3Like; target: Vector3Like } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INITIAL_CAMERA + modelId)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveInitialCamera(modelId: string, position: Vector3Like, target: Vector3Like): void {
  localStorage.setItem(STORAGE_KEY_INITIAL_CAMERA + modelId, JSON.stringify({ position, target }))
}

// ── File Storage ──

export async function uploadSplatFile(modelId: string, file: File): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error('Supabase 未配置，无法上传文件')
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'splat'
  const path = `${modelId}/scene.${ext}`
  const { error } = await supabase.storage.from('splat-files').upload(path, file, { cacheControl: '31536000', upsert: true })
  if (error) throw new Error(`文件上传失败: ${error.message}`)
  const { data } = supabase.storage.from('splat-files').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadThumbnail(modelId: string, dataUrl: string): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error('Supabase 未配置，无法上传封面')
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const path = `${modelId}/thumb.${blob.type === 'image/png' ? 'png' : 'jpg'}`
  const { error } = await supabase.storage.from('thumbnails').upload(path, blob, { cacheControl: '31536000', upsert: true, contentType: blob.type })
  if (error) throw new Error(`封面上传失败: ${error.message}`)
  const { data } = supabase.storage.from('thumbnails').getPublicUrl(path)
  return data.publicUrl
}

// ── Model URL Resolution ──

export type ModelSource =
  | { type: 'url'; url: string }
  | { type: 'buffer'; buffer: ArrayBuffer }

export async function resolveModelSource(model: ModelMeta): Promise<ModelSource> {
  const file = model.file
  // HTTP(S) URL → handle .sog decoding, otherwise use as-is
  if (file.startsWith('http://') || file.startsWith('https://')) {
    if (file.toLowerCase().endsWith('.sog')) {
      // Remote .sog → download + decode to PLY client-side
      const { sogUrlToPly } = await import('./utils/sogDecoder')
      const plyBuffer = await sogUrlToPly(file)
      return { type: 'buffer', buffer: plyBuffer }
    }
    return { type: 'url', url: file }
  }
  // Relative path → serve from /models/
  const base = import.meta.env.BASE_URL || '/'
  const url = `${base}models/${file}`
  // SoG files: download + decode to PLY
  if (file.toLowerCase().endsWith('.sog')) {
    const { sogUrlToPly } = await import('./utils/sogDecoder')
    const plyBuffer = await sogUrlToPly(url)
    return { type: 'buffer', buffer: plyBuffer }
  }
  // PLY files: stream directly via gsplat LoadAsync
  if (file.toLowerCase().endsWith('.ply')) {
    return { type: 'url', url }
  }
  // SPLAT files: pre-fetch as ArrayBuffer
  const res = await fetch(url)
  if (!res.ok) throw new Error(`加载模型失败: HTTP ${res.status}`)
  const buffer = await res.arrayBuffer()
  return { type: 'buffer', buffer }
}
