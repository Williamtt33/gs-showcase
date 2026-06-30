/**
 * Decode .sog (SuperSplat Gaussian) files to PLY in the browser.
 */
import { readFile, writePly, MemoryReadFileSystem, MemoryFileSystem } from '@playcanvas/splat-transform'

async function decodeSogBuffer(arrayBuffer: ArrayBuffer, filename: string): Promise<ArrayBuffer> {
  const readFs = new MemoryReadFileSystem()
  readFs.set(filename, new Uint8Array(arrayBuffer))

  const [dataTable] = await readFile({
    filename,
    inputFormat: 'sog',
    fileSystem: readFs as any,
    options: {},
    params: {},
  } as any)

  const writeFs = new MemoryFileSystem()
  await writePly({
    filename: 'scene.ply',
    plyData: { elements: [{ name: 'vertex', dataTable }] },
  } as any, writeFs)

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

/** Decode a .sog URL (fetch → decode) to PLY ArrayBuffer */
export async function sogUrlToPly(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`下载 SoG 失败: HTTP ${res.status}`)
  const filename = url.split('/').pop() ?? 'scene.sog'
  return decodeSogBuffer(await res.arrayBuffer(), filename)
}
