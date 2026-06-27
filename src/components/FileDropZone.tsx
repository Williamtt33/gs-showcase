import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { hasValidExtension, formatSize } from '../utils/fileValidation'

interface Props {
  onFile: (file: File) => void
  accept?: string
  hint?: string
  className?: string
  id?: string
  /** If true, show confirm/cancel buttons after drop instead of auto-triggering onFile */
  requireConfirm?: boolean
}

export default function FileDropZone({
  onFile,
  accept = '.ply,.sog,.splat',
  hint,
  className = '',
  id,
  requireConfirm = false,
}: Props) {
  const [dragover, setDragover] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [invalidExt, setInvalidExt] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!hasValidExtension(file.name)) {
      setPendingFile(file)
      setInvalidExt(true)
      return
    }
    setInvalidExt(false)
    if (requireConfirm) {
      setPendingFile(file)
    } else {
      setPendingFile(file)
      onFile(file)
    }
  }, [onFile, requireConfirm])

  const confirmFile = useCallback(() => {
    if (pendingFile) {
      onFile(pendingFile)
      // Don't clear pendingFile — parent may want to show it
    }
  }, [pendingFile, onFile])

  const resetFile = useCallback(() => {
    setPendingFile(null)
    setInvalidExt(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragover(true)
  }, [])

  const onDragLeave = useCallback(() => setDragover(false), [])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }, [handleFile])

  const hasFile = pendingFile !== null

  return (
    <div className={className}>
      <motion.div
        animate={dragover ? { scale: 1.01, borderColor: 'var(--color-accent-1, rgba(200,169,110,0.45))' } : { scale: 1, borderColor: 'rgba(51,46,42,0.08)' }}
        className={`relative rounded-2xl border-2 border-dashed p-5 sm:p-6 text-center cursor-pointer transition-colors duration-300 ${
          dragover
            ? 'border-accent-1/40 bg-accent-1/[0.06]'
            : invalidExt
              ? 'border-accent-3/30 bg-accent-3/[0.03]'
              : hasFile && !invalidExt
                ? 'border-accent-2/30 bg-accent-2/[0.03]'
                : 'border-border-1 hover:border-border-2 bg-surface-2/30 hover:bg-surface-2/50'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => { if (!hasFile) inputRef.current?.click() }}
      >
        {hasFile ? (
          <div className="space-y-3">
            {/* Invalid extension warning */}
            {invalidExt ? (
              <>
                <div className="text-3xl mb-1">⚠️</div>
                <p className="text-[13px] font-medium text-accent-3/80">
                  不支持的文件格式
                </p>
                <p className="text-[12px] text-text-3/50 font-mono break-all">
                  {pendingFile.name}
                </p>
                <p className="text-[11px] text-text-3/40">
                  仅支持 .ply · .sog · .splat 格式
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); resetFile() }}
                  className="inline-flex px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-2 text-[12px] font-medium hover:bg-white/[0.08] transition-all cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  选择其他文件
                </button>
              </>
            ) : (
              <>
                {/* File icon */}
                <div className="text-3xl mb-1">
                  {dragover ? '📂' : '✅'}
                </div>

                {/* File info card */}
                <div className="ink-card-light rounded-xl px-4 py-3 text-left max-w-xs mx-auto space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-text-1 truncate" title={pendingFile.name}>
                      {pendingFile.name}
                    </p>
                    <span className="text-[10px] font-mono text-text-3/50 shrink-0">
                      {pendingFile.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-text-3/50">
                    <span>{formatSize(pendingFile.size)}</span>
                    <span className="w-px h-2.5 bg-border-1" />
                    <span>
                      {pendingFile.name.toLowerCase().endsWith('.ply') ? '点云' : '高斯泼溅'}
                    </span>
                  </div>
                </div>

                {/* Confirm / Cancel (only in requireConfirm mode) */}
                {requireConfirm && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); confirmFile() }}
                      className="px-4 py-2 rounded-lg bg-accent-1/15 border border-accent-1/25 text-accent-1/80 text-[12px] font-medium hover:bg-accent-1/20 transition-all cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      确认使用
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); resetFile() }}
                      className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-text-3/60 text-[12px] hover:text-text-2 hover:bg-white/[0.06] transition-all cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      移除
                    </button>
                  </div>
                )}

                {!requireConfirm && (
                  <p className="text-[10px] text-text-3/40">
                    点击或拖拽以替换文件
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <div className="text-4xl mb-1 opacity-50">
              {dragover ? '📂' : '☁️'}
            </div>
            <p className="text-[13px] font-medium text-text-2">
              {dragover ? '松开以上传' : hint || '拖拽 .splat 或 .ply 文件到此处'}
            </p>
            <p className="text-[11px] text-text-3/40">
              或点击选择文件 · 支持 .ply .sog .splat
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          id={id}
          name={id}
          type="file"
          accept={accept}
          onChange={onInputChange}
          className="hidden"
        />
      </motion.div>
    </div>
  )
}
