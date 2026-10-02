import { useTranslation } from 'react-i18next'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <p>
        © {YEAR} Nabil — {t('footer.rights')}
      </p>
    </footer>
  )
}
