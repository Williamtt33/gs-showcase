import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  isVisible: boolean
  onClose: () => void
}

export default function ControlsHelp({ isVisible, onClose }: Props) {
  const { t } = useI18n()

  const sections = [
    {
      title: '🖱️ 鼠标操作',
      items: [
        { key: '左键拖拽', action: t.controls.rotate },
        { key: '右键拖拽', action: t.controls.pan },
        { key: '滚轮', action: t.controls.zoom },
      ],
    },
    {
      title: '⌨️ 快捷键',
      items: [
        { key: 'H', action: '切换帮助面板' },
        { key: 'R', action: t.controls.reset },
      ],
    },
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-4 left-4 glass rounded-xl p-5 text-sm z-20 max-w-[280px]"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white/80 text-xs uppercase tracking-wider">
              {t.controls.title}
            </h3>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            {sections.map((section, si) => (
              <div key={si}>
                <h4 className="text-xs text-white/30 mb-1.5 font-medium">{section.title}</h4>
                <div className="space-y-1">
                  {section.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      <kbd className="min-w-[24px] h-5 flex items-center justify-center rounded bg-white/10 text-white/60 text-[10px] font-mono px-1.5">
                        {item.key}
                      </kbd>
                      <span className="text-white/40 text-xs">{item.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
