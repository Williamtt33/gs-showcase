import { useI18n } from '../i18n/I18nContext'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border-1 bg-surface-0">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center text-[9px] font-bold text-black">
              3D
            </div>
            <span className="text-[12px] text-text-3">{t.footer.copyright}</span>
          </div>
          <span className="text-[11px] text-text-3/50 font-mono">{t.footer.tech}</span>
        </div>
      </div>
    </footer>
  )
}
