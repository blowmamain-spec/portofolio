import { useTranslation } from 'react-i18next'
import Section from '../layout/Section'

export default function About() {
  const { t } = useTranslation()

  return (
    <Section id="about" title={t('about.title')}>
      <p className="max-w-2xl text-slate-600 dark:text-slate-300">{t('about.body')}</p>
    </Section>
  )
}
