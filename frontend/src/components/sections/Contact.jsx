import { useTranslation } from 'react-i18next'
import Section from '../layout/Section'

export default function Contact() {
  const { t } = useTranslation()

  return (
    <Section id="contact" title={t('contact.title')}>
      <p className="max-w-xl text-slate-600 dark:text-slate-300">{t('contact.body')}</p>
    </Section>
  )
}
