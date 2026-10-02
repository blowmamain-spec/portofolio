import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Section from '../layout/Section'
import { apiGet } from '../../lib/apiClient'

export default function Blog() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    apiGet('/api/blog-posts', []).then(setPosts)
  }, [])

  return (
    <Section id="blog" title={t('blog.title')}>
      {posts.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">{t('blog.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <a href={`/blog/${post.slug}`} className="hover:text-brand-600 dark:hover:text-brand-500 font-medium">
                {post.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
