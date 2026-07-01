/**
 * Decode .sog (SuperSplat Gaussian) files to PLY in the browser.
 */
import { readFile, writePly, MemoryReadFileSystem, MemoryFileSystem } from '@playcanvas/splat-transform'

async function decodeSogBuffer(arrayBuffer: ArrayBuffer, filename: string, onProgress?: (pct: number) => void): Promise<ArrayBuffer> {
  const readFs = new MemoryReadFileSystem()
  readFs.set(filename, new Uint8Array(arrayBuffer))

  onProgress?.(10)

  const [dataTable] = await readFile({
    filename,
    inputFormat: 'sog',
    fileSystem: readFs as any,
    options: {},
    params: {},
  } as any)

  onProgress?.(50)

  const writeFs = new MemoryFileSystem()
  await writePly({
    filename: 'scene.ply',
    plyData: { elements: [{ name: 'vertex', dataTable }] },
  } as any, writeFs)

  onProgress?.(90)

  const result = writeFs.results.get('scene.ply')
  if (!result) throw new Error('SoG 解码失败')
  return (result as Uint8Array).buffer as ArrayBuffer
}

/** Decode a .sog File object to PLY ArrayBuffer */
export async function sogFileToPly(file: File): Promise<{ buffer: ArrayBuffer; name: string }> {
  return {
    buffer: await decodeSogBuffer(await file.arrayBuffer(), file.name),
    name: file.name.replace(/\.sog$/i, ''),
  }
}

/** Decode a .sog URL (fetch → decode) to PLY ArrayBuffer, with progress 0–100 */
export async function sogUrlToPly(url: string, onProgress?: (pct: number) => void): Promise<ArrayBuffer> {
  onProgress?.(0)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`下载 SoG 失败: HTTP ${res.status}`)

  // Track download progress if Content-Length is available
  const contentLength = res.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0
  const reader = res.body?.getReader()
  if (!reader) throw new Error('无法读取响应流')

  const chunks: Uint8Array[] = []
  let received = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (total > 0) onProgress?.(Math.round((received / total) * 70))
  }

  // Merge chunks
  const buffer = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
  }

  const filename = url.split('/').pop() ?? 'scene.sog'
  // Decode: 70% → 100% maps to the decode phase
  return decodeSogBuffer(buffer.buffer as ArrayBuffer, filename, (pct) => {
    onProgress?.(70 + Math.round(pct * 0.3))
  })
}
