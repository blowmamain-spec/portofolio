import { useTranslation } from 'react-i18next'
import { useDarkMode } from '../../hooks/useDarkMode'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'

const SECTIONS = ['about', 'skills', 'projects', 'experience', 'blog', 'contact']

export default function Navbar() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useDarkMode()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#hero" className="font-semibold tracking-tight">
          Nabil<span className="text-brand-600 dark:text-brand-500">.</span>
        </a>

        <ul className="hidden gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          {SECTIONS.map((section) => (
            <li key={section}>
              <a href={`#${section}`} className="hover:text-brand-600 dark:hover:text-brand-500 transition-colors">
                {t(`nav.${section}`)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </nav>
    </header>
  )
}
