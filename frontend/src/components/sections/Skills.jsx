import { useTranslation } from 'react-i18next'
import Section from '../layout/Section'

// Placeholder data — will move to the Laravel API (or stay static config,
// TBD) once real content is written. Structure here is just to validate layout.
const SKILL_GROUPS = [
  { category: 'Backend', items: ['PHP', 'Laravel', 'PostgreSQL'] },
  { category: 'Frontend', items: ['React', 'Tailwind CSS', 'JavaScript'] },
  { category: 'Tools', items: ['Docker', 'Git'] },
  { category: 'Learning', items: ['Cybersecurity'] },
]

export default function Skills() {
  const { t } = useTranslation()

  return (
    <Section id="skills" title={t('skills.title')}>
      <div className="grid gap-6 sm:grid-cols-2">
        {SKILL_GROUPS.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {group.category}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
