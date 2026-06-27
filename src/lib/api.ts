/**
 * Supabase API layer — replaces localStorage (modelStore) + IndexedDB (fileStorage)
 *
 * Works against Supabase DB + Storage. Falls back gracefully when not configured.
 */

import { supabase } from './supabase'
import type { ModelMeta, Hotspot, CameraPath, Keyframe } from '../types'

// ── Type helpers for raw DB rows ──

interface DbModelRow {
  id: string; name: string; name_en: string; description: string
  description_en: string; file: string; thumbnail: string
  tags: string[]; point_count: string; size: string; featured: boolean
  created_at: string; updated_at: string
}

interface DbHotspotRow {
  id: string; model_id: string
  position_x: number; position_y: number; position_z: number
  title: string; title_en: string; description: string; description_en: string
  note: string; sort_order: number
  camera_pos_x: number; camera_pos_y: number; camera_pos_z: number
  camera_tgt_x: number; camera_tgt_y: number; camera_tgt_z: number
  created_at: string
}

interface DbPathRow { id: string; model_id: string; name: string; name_en: string; created_at: string }

interface DbKfRow { id: string; path_id: string; sort_order: number; pos_x: number; pos_y: number; pos_z: number; tgt_x: number; tgt_y: number; tgt_z: number }

// ── Data converters ──

function dbToModel(db: DbModelRow): ModelMeta {
  return {
    id: db.id, name: db.name, nameEn: db.name_en,
    description: db.description, descriptionEn: db.description_en,
    file: db.file, thumbnail: db.thumbnail,
    tags: db.tags ?? [], pointCount: db.point_count ?? '', size: db.size ?? '',
    featured: db.featured ?? false, hotspots: [],
  }
}

function modelToInsert(m: Omit<ModelMeta, 'id'>, id: string) {
  return {
    id, name: m.name, name_en: m.nameEn,
    description: m.description, description_en: m.descriptionEn,
    file: m.file, thumbnail: m.thumbnail,
    tags: m.tags ?? [], point_count: m.pointCount, size: m.size, featured: m.featured,
  }
}

function dbToHotspot(db: DbHotspotRow): Hotspot {
  return {
    id: db.id,
    position: { x: db.position_x, y: db.position_y, z: db.position_z },
    title: db.title, titleEn: db.title_en,
    description: db.description, descriptionEn: db.description_en,
    note: db.note, order: db.sort_order,
    cameraPosition: { x: db.camera_pos_x, y: db.camera_pos_y, z: db.camera_pos_z },
    cameraTarget: { x: db.camera_tgt_x, y: db.camera_tgt_y, z: db.camera_tgt_z },
  }
}

function hotspotToInsert(hs: Hotspot, modelId: string) {
  return {
    id: hs.id, model_id: modelId,
    position_x: hs.position.x, position_y: hs.position.y, position_z: hs.position.z,
    title: hs.title, title_en: hs.titleEn,
    description: hs.description, description_en: hs.descriptionEn,
    note: hs.note, sort_order: hs.order,
    camera_pos_x: hs.cameraPosition.x, camera_pos_y: hs.cameraPosition.y, camera_pos_z: hs.cameraPosition.z,
    camera_tgt_x: hs.cameraTarget.x, camera_tgt_y: hs.cameraTarget.y, camera_tgt_z: hs.cameraTarget.z,
  }
}

// ── Models ──

export async function fetchCustomModels(): Promise<ModelMeta[]> {
  const { data, error } = await supabase.from('models').select('*').order('created_at', { ascending: false })
  if (error) { console.error('Failed to fetch custom models:', error); return [] }
  return ((data ?? []) as DbModelRow[]).map(dbToModel)
}

export async function createModel(model: Omit<ModelMeta, 'id'>, modelId: string): Promise<void> {
  const { error } = await supabase.from('models').insert(modelToInsert(model, modelId))
  if (error) throw new Error(`创建模型失败: ${error.message}`)
}

export async function updateModel(id: string, updates: Partial<ModelMeta>): Promise<void> {
  const db: Record<string, unknown> = {}
  if (updates.name !== undefined) { db.name = updates.name; db.name_en = updates.nameEn ?? updates.name }
  if (updates.description !== undefined) { db.description = updates.description; db.description_en = updates.descriptionEn ?? updates.description }
  if (updates.thumbnail !== undefined) db.thumbnail = updates.thumbnail
  if (Object.keys(db).length === 0) return
  const { error } = await supabase.from('models').update(db).eq('id', id)
  if (error) throw new Error(`更新模型失败: ${error.message}`)
}

export async function deleteModel(id: string): Promise<void> {
  await deleteModelFiles(id)
  const { error } = await supabase.from('models').delete().eq('id', id)
  if (error) throw new Error(`删除模型失败: ${error.message}`)
}

// ── File Storage ──

export async function uploadSplatFile(modelId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'splat'
  const path = `${modelId}/scene.${ext}`
  const { error } = await supabase.storage.from('splat-files').upload(path, file, { cacheControl: '31536000', upsert: true })
  if (error) throw new Error(`文件上传失败: ${error.message}`)
  const { data: urlData } = supabase.storage.from('splat-files').getPublicUrl(path)
  return urlData.publicUrl
}

export async function uploadThumbnail(modelId: string, dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const path = `${modelId}/thumb.${blob.type === 'image/png' ? 'png' : 'jpg'}`
  const { error } = await supabase.storage.from('thumbnails').upload(path, blob, { cacheControl: '31536000', upsert: true, contentType: blob.type })
  if (error) throw new Error(`封面上传失败: ${error.message}`)
  const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(path)
  return urlData.publicUrl
}

async function deleteModelFiles(modelId: string): Promise<void> {
  for (const bucket of ['splat-files', 'thumbnails']) {
    const { data: files } = await supabase.storage.from(bucket).list(modelId)
    if (files?.length) {
      await supabase.storage.from(bucket).remove(files.map(f => `${modelId}/${f.name}`))
    }
  }
}

// ── Hotspots ──

export async function fetchHotspots(modelId: string): Promise<Hotspot[]> {
  const { data, error } = await supabase.from('hotspots').select('*').eq('model_id', modelId).order('sort_order', { ascending: true })
  if (error) { console.error('Failed to fetch hotspots:', error); return [] }
  return ((data ?? []) as DbHotspotRow[]).map(dbToHotspot)
}

export async function saveHotspots(modelId: string, hotspots: Hotspot[]): Promise<void> {
  await supabase.from('hotspots').delete().eq('model_id', modelId)
  if (hotspots.length === 0) return
  const { error } = await supabase.from('hotspots').insert(hotspots.map(hs => hotspotToInsert(hs, modelId)))
  if (error) throw new Error(`保存标注失败: ${error.message}`)
}

// ── Camera Paths ──

export async function fetchCameraPaths(modelId: string): Promise<CameraPath[]> {
  const { data: paths, error } = await supabase.from('camera_paths').select('*').eq('model_id', modelId).order('created_at', { ascending: true })
  if (error || !paths?.length) return []

  const pathIds = (paths as DbPathRow[]).map(p => p.id)
  const { data: kfs } = await supabase.from('keyframes').select('*').in('path_id', pathIds).order('sort_order', { ascending: true })

  const kfMap = new Map<string, DbKfRow[]>()
  for (const kf of (kfs ?? []) as DbKfRow[]) {
    const arr = kfMap.get(kf.path_id) ?? []
    arr.push(kf); kfMap.set(kf.path_id, arr)
  }

  return (paths as DbPathRow[]).map(p => ({
    id: p.id, name: p.name, nameEn: p.name_en,
    keyframes: (kfMap.get(p.id) ?? []).map((kf): Keyframe => ({
      id: kf.id, position: { x: kf.pos_x, y: kf.pos_y, z: kf.pos_z }, target: { x: kf.tgt_x, y: kf.tgt_y, z: kf.tgt_z },
    })),
  }))
}

export async function saveCameraPaths(modelId: string, paths: CameraPath[]): Promise<void> {
  await supabase.from('camera_paths').delete().eq('model_id', modelId)
  for (const path of paths) {
    await supabase.from('camera_paths').insert({ id: path.id, model_id: modelId, name: path.name, name_en: path.nameEn })
    if (path.keyframes.length > 0) {
      await supabase.from('keyframes').insert(path.keyframes.map((kf, i) => ({
        id: kf.id, path_id: path.id, sort_order: i,
        pos_x: kf.position.x, pos_y: kf.position.y, pos_z: kf.position.z,
        tgt_x: kf.target.x, tgt_y: kf.target.y, tgt_z: kf.target.z,
      })))
    }
  }
}

// ── Connection check ──

let _configured: boolean | null = null
export function isSupabaseConfigured(): boolean {
  if (_configured !== null) return _configured
  const url = import.meta.env.VITE_SUPABASE_URL as string
  _configured = !!url && !url.includes('your-project')
  return _configured
}
