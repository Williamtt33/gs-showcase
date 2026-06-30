export default function Footer() {
  return (
    <footer className="border-t border-border-1 bg-surface-0">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center text-[9px] font-bold text-black">
              3D
            </div>
            <span className="text-[12px] text-text-3">© 2026 墨韵三维 · 历史街区数字化保护</span>
          </div>
          <span className="text-[11px] text-text-3/50 font-mono">3DGS · WebGL</span>
        </div>
      </div>
    </footer>
  )
}
