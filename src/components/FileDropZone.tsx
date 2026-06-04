import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onFile: (file: File) => void
  accept?: string
  hint?: string
  className?: string
}

export default function FileDropZone({ onFile, accept = '.splat', hint, className = '' }: Props) {
  const [dragover, setDragover] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    setFileName(file.name)
    const mb = file.size / (1024 * 1024)
    setFileSize(mb >= 1 ? `${mb.toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`)
    onFile(file)
  }, [onFile])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragover(true)
  }, [])

  const onDragLeave = useCallback(() => setDragover(false), [])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className={className}>
      <motion.div
        animate={dragover ? { scale: 1.02, borderColor: 'rgba(167,139,250,0.5)' } : { scale: 1, borderColor: 'rgba(255,255,255,0.08)' }}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragover
            ? 'border-accent-1/40 bg-accent-1/[0.06]'
            : fileName
              ? 'border-accent-2/30 bg-accent-2/[0.03]'
              : 'border-border-1 hover:border-border-2 bg-surface-2/30 hover:bg-surface-2/50'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        {fileName ? (
          <div className="space-y-1">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-[13px] font-medium text-text-1">{fileName}</p>
            <p className="text-[11px] text-text-3/60">{fileSize}</p>
            <p className="text-[10px] text-text-3/40 mt-2">点击或拖拽以替换文件</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl mb-2 opacity-50">{dragover ? '📂' : '📁'}</div>
            <p className="text-[13px] font-medium text-text-2">
              {dragover ? '松开以上传' : hint || '拖拽 .splat 文件到此处'}
            </p>
            <p className="text-[11px] text-text-3/40">或点击选择文件</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          className="hidden"
        />
      </motion.div>
    </div>
  )
}
