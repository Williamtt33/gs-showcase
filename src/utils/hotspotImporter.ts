import type { Hotspot, Vector3Like } from '../types'

/**
 * Supported import formats:
 *
 * 1. Our own format:
 *    [{ id, position: {x,y,z}, title, titleEn, description, descriptionEn, icon, color }]
 *
 * 2. SuperSplat annotation format:
 *    { annotations: [{ position: [x,y,z], title, description }] }
 *
 * 3. Simple format:
 *    [{ position: {x,y,z}, title, description }]
 *    [{ position: [x,y,z], title, desc }]
 *    [{ x, y, z, title, description }]
 *
 * 4. Generic JSON with array of objects that have position data
 */

function isArray(obj: any): obj is any[] {
  return Array.isArray(obj)
}

function extractPosition(item: any): Vector3Like | null {
  // { position: {x,y,z} }
  if (item.position && typeof item.position === 'object' && !Array.isArray(item.position)) {
    const p = item.position
    if (typeof p.x === 'number' && typeof p.y === 'number' && typeof p.z === 'number') {
      return { x: p.x, y: p.y, z: p.z }
    }
  }
  // { position: [x,y,z] }
  if (item.position && Array.isArray(item.position) && item.position.length >= 3) {
    return { x: item.position[0], y: item.position[1], z: item.position[2] }
  }
  // { x, y, z }
  if (typeof item.x === 'number' && typeof item.y === 'number' && typeof item.z === 'number') {
    return { x: item.x, y: item.y, z: item.z }
  }
  // { pos: {x,y,z} } or { pos: [x,y,z] }
  if (item.pos) {
    if (typeof item.pos.x === 'number') return { x: item.pos.x, y: item.pos.y, z: item.pos.z }
    if (Array.isArray(item.pos) && item.pos.length >= 3) return { x: item.pos[0], y: item.pos[1], z: item.pos[2] }
  }
  // { location: ... }
  if (item.location) {
    if (typeof item.location.x === 'number') return { x: item.location.x, y: item.location.y, z: item.location.z }
    if (Array.isArray(item.location) && item.location.length >= 3) return { x: item.location[0], y: item.location[1], z: item.location[2] }
  }
  return null
}

function extractText(item: any): { title: string; titleEn: string; description: string; descriptionEn: string } {
  return {
    title: item.title || item.name || item.label || '',
    titleEn: item.titleEn || item.title_en || item.nameEn || item.title || '',
    description: item.description || item.desc || item.note || item.content || '',
    descriptionEn: item.descriptionEn || item.description_en || item.descEn || item.description || '',
  }
}

export interface ImportResult {
  hotspots: Omit<Hotspot, 'id'>[]
  errors: string[]
  total: number
}

export function parseHotspotJSON(raw: string): ImportResult {
  const result: ImportResult = { hotspots: [], errors: [], total: 0 }

  let data: any
  try {
    data = JSON.parse(raw)
  } catch (e) {
    result.errors.push('Invalid JSON: ' + (e as Error).message)
    return result
  }

  // Extract items from various formats
  let items: any[] = []

  if (isArray(data)) {
    items = data
  } else if (data.annotations && isArray(data.annotations)) {
    // SuperSplat format
    items = data.annotations
  } else if (data.hotspots && isArray(data.hotspots)) {
    items = data.hotspots
  } else if (data.points && isArray(data.points)) {
    items = data.points
  } else if (data.markers && isArray(data.markers)) {
    items = data.markers
  } else if (isArray(data.items)) {
    items = data.items
  } else {
    result.errors.push('Could not find array of items in JSON. Expected top-level array, or object with "annotations" / "hotspots" / "points" / "markers" key.')
    return result
  }

  result.total = items.length

  items.forEach((item, i) => {
    const pos = extractPosition(item)
    if (!pos) {
      result.errors.push(`Item ${i}: could not extract position. Expected {position:{x,y,z}}, {position:[x,y,z]}, or {x,y,z}`)
      return
    }

    const text = extractText(item)
    if (!text.title) {
      result.errors.push(`Item ${i}: no title found`)
      return
    }

    result.hotspots.push({
      position: pos,
      title: text.title,
      titleEn: text.titleEn,
      description: text.description,
      descriptionEn: text.descriptionEn,
      order: item.order || (i + 1),
      cameraPosition: item.cameraPosition || item.camera_position || { x: 0, y: 0, z: 5 },
      cameraTarget: item.cameraTarget || item.camera_target || { x: 0, y: 0, z: 0 },
    })
  })

  return result
}

/** Export hotspots to our format (for backup) */
export function exportHotspotsJSON(hotspots: Hotspot[]): string {
  return JSON.stringify(hotspots.map(h => ({
    id: h.id,
    position: h.position,
    title: h.title,
    titleEn: h.titleEn,
    description: h.description,
    descriptionEn: h.descriptionEn,
    order: h.order,
    cameraPosition: h.cameraPosition,
    cameraTarget: h.cameraTarget,
  })), null, 2)
}
