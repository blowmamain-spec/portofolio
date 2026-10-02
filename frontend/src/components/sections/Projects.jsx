import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Section from '../layout/Section'
import { apiGet } from '../../lib/apiClient'

export default function Projects() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    // GET /api/projects doesn't exist yet (lands in Phase 1-3 of the
    // backend roadmap) — apiGet falls back to [] so this renders the
    // empty state below until then.
    apiGet('/api/projects', []).then(setProjects)
  }, [])

  return (
    <Section id="projects" title={t('projects.title')}>
      {projects.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">{t('projects.empty')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="font-semibold">{project.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
            </article>
          ))}
        </div>
      )}
    </Section>
  )
}
