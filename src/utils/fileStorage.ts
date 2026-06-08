const DB_NAME = 'gs-showcase-files'
const DB_VERSION = 1
const STORE_SPLAT = 'splat-files'
const STORE_THUMBS = 'thumbnails'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_SPLAT)) {
        db.createObjectStore(STORE_SPLAT)
      }
      if (!db.objectStoreNames.contains(STORE_THUMBS)) {
        db.createObjectStore(STORE_THUMBS)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Store a splat file (ArrayBuffer) keyed by modelId */
export async function storeSplatFile(modelId: string, buffer: ArrayBuffer, filename: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SPLAT, 'readwrite')
    const store = tx.objectStore(STORE_SPLAT)
    store.put({ buffer, filename, storedAt: Date.now() }, modelId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Get a splat file URL (blob URL) for a model */
export async function getSplatFileUrl(modelId: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SPLAT, 'readonly')
    const store = tx.objectStore(STORE_SPLAT)
    const req = store.get(modelId)
    req.onsuccess = () => {
      const data = req.result
      if (!data || !data.buffer) { resolve(null); return }
      const blob = new Blob([data.buffer], { type: 'application/octet-stream' })
      resolve(URL.createObjectURL(blob))
    }
    req.onerror = () => reject(req.error)
  })
}

/** Check if splat file is stored locally */
export async function hasSplatFile(modelId: string): Promise<boolean> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SPLAT, 'readonly')
    const req = tx.objectStore(STORE_SPLAT).get(modelId)
    req.onsuccess = () => resolve(!!req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Delete stored splat file */
export async function deleteSplatFile(modelId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SPLAT, 'readwrite')
    tx.objectStore(STORE_SPLAT).delete(modelId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Store a thumbnail image (base64 data URL or blob) */
export async function storeThumbnail(modelId: string, dataUrl: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_THUMBS, 'readwrite')
    tx.objectStore(STORE_THUMBS).put({ dataUrl, storedAt: Date.now() }, modelId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Get thumbnail data URL for a model */
export async function getThumbnail(modelId: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_THUMBS, 'readonly')
    const req = tx.objectStore(STORE_THUMBS).get(modelId)
    req.onsuccess = () => resolve(req.result?.dataUrl || null)
    req.onerror = () => reject(req.error)
  })
}

/** Cache a downloaded builtin model file by its URL path */
export async function cacheModelFile(url: string, buffer: ArrayBuffer): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    // Use a separate store for downloaded cache
    if (!db.objectStoreNames.contains('model-cache')) {
      db.close()
      // Need to upgrade — reopen with higher version
      const req2 = indexedDB.open(DB_NAME, DB_VERSION + 1)
      req2.onupgradeneeded = () => {
        if (!req2.result.objectStoreNames.contains('model-cache')) {
          req2.result.createObjectStore('model-cache')
        }
      }
      req2.onsuccess = () => {
        const db2 = req2.result
        const tx = db2.transaction('model-cache', 'readwrite')
        tx.objectStore('model-cache').put({ buffer, cachedAt: Date.now() }, url)
        tx.oncomplete = () => { db2.close(); resolve() }
        tx.onerror = () => reject(tx.error)
      }
      req2.onerror = () => reject(req2.error)
      return
    }
    const tx = db.transaction('model-cache', 'readwrite')
    tx.objectStore('model-cache').put({ buffer, cachedAt: Date.now() }, url)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Get a cached model file blob URL by its URL path */
export async function getCachedModelFile(url: string): Promise<string | null> {
  const db = await openDB()
  if (!db.objectStoreNames.contains('model-cache')) return null
  return new Promise((resolve, reject) => {
    const tx = db.transaction('model-cache', 'readonly')
    const req = tx.objectStore('model-cache').get(url)
    req.onsuccess = () => {
      const data = req.result
      if (!data?.buffer) { resolve(null); return }
      resolve(URL.createObjectURL(new Blob([data.buffer])))
    }
    req.onerror = () => reject(req.error)
  })
}

/** Delete thumbnail */
export async function deleteThumbnail(modelId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_THUMBS, 'readwrite')
    tx.objectStore(STORE_THUMBS).delete(modelId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
