import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastCtx {
  toast: (message: string, type?: ToastItem['type']) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let _nextId = 0
let _globalToast: ToastCtx['toast'] = () => {}

/** Imperative API — call from anywhere (outside React tree) */
export function showToast(message: string, type: ToastItem['type'] = 'info') {
  _globalToast(message, type)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = ++_nextId
    setToasts(prev => [...prev.slice(-4), { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  useEffect(() => {
    _globalToast = addToast
    return () => { _globalToast = () => {} }
  }, [addToast])

  const icons: Record<ToastItem['type'], string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  const colors: Record<ToastItem['type'], string> = {
    success: 'border-accent-2/30 bg-accent-2/[0.06]',
    error: 'border-accent-3/30 bg-accent-3/[0.06]',
    info: 'border-accent-1/30 bg-accent-1/[0.06]',
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container — fixed bottom-center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${colors[t.type]} glass text-[13px] text-text-2 shadow-lg`}
            >
              <span className={`text-[11px] font-bold ${
                t.type === 'success' ? 'text-accent-2/70' :
                t.type === 'error' ? 'text-accent-3/70' :
                'text-accent-1/70'
              }`}>
                {icons[t.type]}
              </span>
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
