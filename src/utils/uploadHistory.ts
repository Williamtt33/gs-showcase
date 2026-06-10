/**
 * Upload history — localStorage-backed list of recently uploaded models.
 * Used to show users what they've uploaded recently.
 */

const STORAGE_KEY = 'gs_upload_history'

export interface UploadRecord {
  id: string
  name: string
  filename: string
  size: number
  uploadedAt: string // ISO timestamp
}

/** Get all upload records, newest first */
export function getUploadHistory(): UploadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Add a new upload record */
export function addUploadRecord(record: Omit<UploadRecord, 'uploadedAt'>): void {
  const history = getUploadHistory()
  // Remove duplicate by id (if re-uploading same model)
  const filtered = history.filter(r => r.id !== record.id)
  filtered.unshift({ ...record, uploadedAt: new Date().toISOString() })
  // Keep last 20 entries
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)))
}

/** Clear all history */
export function clearUploadHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
