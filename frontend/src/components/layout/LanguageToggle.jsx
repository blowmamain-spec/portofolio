import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const next = i18n.resolvedLanguage === 'id' ? 'en' : 'id'

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={`Switch language to ${next.toUpperCase()}`}
      className="rounded-full px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
    >
      {i18n.resolvedLanguage === 'id' ? 'EN' : 'ID'}
    </button>
  )
}
