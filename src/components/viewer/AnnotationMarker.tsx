interface Props {
  hotspotId: string
  screenX: number
  screenY: number
  number: number
  title: string
  note: string
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  scale: number
}

export default function AnnotationMarker({ hotspotId, screenX, screenY, number, title, note, isSelected, onSelect, onEdit, scale }: Props) {
  const label = title || `标注点 ${number}`

  return (
    <div
      data-hotspot={hotspotId}
      className="absolute pointer-events-auto"
      style={{
        left: screenX,
        top: screenY,
        transform: `translate(0, -50%) scale(${scale})`,
        zIndex: isSelected ? 40 : 30,
      }}
    >
      <div className="flex items-center gap-2">
        {/* Numbered circle */}
        <button
          onClick={onSelect}
          className="shrink-0 flex items-center justify-center rounded-full select-none cursor-pointer"
          style={{
            width: isSelected ? 34 : 26, height: isSelected ? 34 : 26,
            background: isSelected ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.6)',
            border: isSelected ? '2.5px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.45)',
            boxShadow: isSelected ? '0 0 20px rgba(255,255,255,0.3)' : '0 2px 6px rgba(0,0,0,0.6)',
            color: '#fff', fontSize: isSelected ? 14 : 12, fontWeight: 700,
            fontFamily: 'Inter, Noto Sans SC, sans-serif',
            transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          {number}
        </button>

        {/* Unselected: just label */}
        {!isSelected && (
          <span onClick={onSelect} className="text-xs font-medium text-white/70 truncate max-w-[120px] cursor-pointer"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {label}
          </span>
        )}

        {/* Selected: expanded bubble */}
        {isSelected && (
          <div className="flex items-start gap-1">
            <div onClick={onSelect} className="rounded-xl px-3 py-2 max-w-[220px] cursor-pointer"
              style={{
                background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              }}>
              <p className="text-xs font-semibold text-white/90 leading-snug">{label}</p>
              {note ? (
                <p className="text-[11px] text-white/55 leading-snug mt-1">{note}</p>
              ) : (
                <p className="text-[11px] text-white/25 italic mt-0.5">点击编辑添加注释</p>
              )}
            </div>
            <button onClick={e => { e.stopPropagation(); onEdit() }}
              className="shrink-0 w-5 h-5 rounded flex items-center justify-center bg-white/10 text-white/40 hover:text-white/80 hover:bg-white/20 transition-all mt-0.5 cursor-pointer"
              title="编辑" style={{ cursor: 'pointer' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
