import React, { createContext, useContext, useState, useCallback } from 'react'
import { translations, type Lang } from './translations'

type TranslationType = typeof translations.zh | typeof translations.en
type I18nContextType = {
  lang: Lang
  t: TranslationType
  toggleLang: () => void
}

const I18nContext = createContext<I18nContextType>(null!)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem('gs-lang')
      return (stored === 'zh' || stored === 'en') ? stored : 'zh'
    } catch { return 'zh' }
  })

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'zh' ? 'en' : 'zh'
      try { localStorage.setItem('gs-lang', next) } catch {}
      return next
    })
  }, [])

  const t = translations[lang]

  return <I18nContext.Provider value={{ lang, t, toggleLang }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
