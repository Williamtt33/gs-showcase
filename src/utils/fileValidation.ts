/**
 * File format validation — magic-byte checks for 3D model files.
 * .splat / .ply / .sog all accepted; extension + header sanity combined.
 */

const ALLOWED_EXTENSIONS = ['.ply', '.sog', '.splat']

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB hard cap

export interface ValidationResult {
  valid: boolean
  error?: string
  /** Detected format label */
  format?: string
  /** Parsed from PLY header (if applicable) */
  vertexCount?: number
}

/** Quick extension check */
export function hasValidExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext))
}

/** Read first N bytes of a file */
async function readHead(file: File, bytes: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file.slice(0, bytes))
  })
}

function bytesToStr(buf: Uint8Array): string {
  return new TextDecoder().decode(buf)
}

/** Check if buffer starts with "ply\n" */
function isPlyHeader(buf: Uint8Array): boolean {
  return bytesToStr(buf.slice(0, 4)) === 'ply\n'
}

/** Check for gzip magic (1f 8b) — .splat files are gzipped */
function isGzip(buf: Uint8Array): boolean {
  return buf[0] === 0x1f && buf[1] === 0x8b
}

/** PLY vertex count from header (if present) */
function parsePlyVertexCount(buf: Uint8Array): number | undefined {
  const head = bytesToStr(buf)
  const match = head.match(/^element vertex (\d+)/m)
  return match ? parseInt(match[1], 10) : undefined
}

/**
 * Validate a model file — extension + header sanity.
 * - .ply files MUST start with "ply\n"
 * - .splat / .sog files are gzipped; we check for gzip magic
 */
export async function validateModelFile(file: File): Promise<ValidationResult> {
  if (!hasValidExtension(file.name)) {
    return {
      valid: false,
      error: `不支持的文件格式 ".${file.name.split('.').pop()}"，仅支持 ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  if (file.size === 0) {
    return { valid: false, error: '文件为空，请选择有效的模型文件' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `文件过大（${formatSize(file.size)}），上限为 ${formatSize(MAX_FILE_SIZE)}` }
  }

  const ext = file.name.toLowerCase().split('.').pop() ?? ''

  try {
    const head = await readHead(file, 512)

    if (ext === 'ply') {
      if (!isPlyHeader(head)) {
        return { valid: false, error: '文件损坏或格式不正确：PLY 文件应以 "ply\\n" 开头' }
      }
      const vc = parsePlyVertexCount(head)
      return { valid: true, format: 'PLY (点云)', vertexCount: vc }
    }

    // .splat / .sog — should be gzip-compressed
    if (!isGzip(head)) {
      return {
        valid: false,
        error: `文件可能已损坏：${ext.toUpperCase()} 文件应为 gzip 压缩格式（缺少 gzip 文件头）`,
      }
    }

    return { valid: true, format: `${ext.toUpperCase()} (高斯泼溅)` }
  } catch {
    // If we can't read the header, allow it — the loader will catch real errors
    return { valid: true, format: ext?.toUpperCase() ?? '未知' }
  }
}

export function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}
