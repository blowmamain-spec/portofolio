import { useTranslation } from 'react-i18next'
import Section from '../layout/Section'

export default function Experience() {
  const { t } = useTranslation()

  return (
    <Section id="experience" title={t('experience.title')}>
      <ol className="border-l border-slate-200 pl-6 dark:border-slate-800">
        {/* Timeline items go here once real experience data is written. */}
      </ol>
    </Section>
  )
}
