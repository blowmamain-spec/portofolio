import { useTranslation } from 'react-i18next'

export default function Hero() {
  const { t } = useTranslation()

  return (
    <section id="hero" className="mx-auto flex max-w-5xl flex-col items-start px-6 py-24 md:py-32">
      <p className="text-brand-600 dark:text-brand-500 font-medium">{t('hero.greeting')}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">{t('hero.name')}</h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">{t('hero.tagline')}</p>
      <a
        href="#projects"
        className="bg-brand-600 hover:bg-brand-700 mt-8 inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors"
      >
        {t('hero.cta')}
      </a>
    </section>
  )
}
