import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/site'
import { ALL_SEO_PAGES } from '@/config/seo-services'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL
  const now = new Date()

  // Существующие страницы
  const existing = [
    { url: baseUrl, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/katalog-kass`, changeFrequency: 'weekly' as const, priority: 0.95 },
    { url: `${baseUrl}/kkt-spb`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/kalkulyatory`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/kalkulyatory/markirovka`, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/instructions`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/services`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/nastroyka-kassy-markirovka`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/podklyuchenie-chestnyy-znak`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/kakuyu-kassu-dlya-markirovki`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/integraciya-1c`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/markirovka-odezhdy`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/markirovka-obuvi`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/markirovka-tabaka`, changeFrequency: 'monthly' as const, priority: 0.8 },
    // Существующие сервисные SEO-страницы
    // /zamena-fn удалён — 301 редирект на /zamena-fn-15-mesyacev в .htaccess
    { url: `${baseUrl}/registraciya-kkt`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/podklyuchenie-ofd`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/remont-kassovogo-oborudovaniya`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/obsluzhivanie-kkt`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/nastroyka-edo`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/contacts`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/instructions/kak-podklyuchit-kabinet-chestnyznak`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/instructions/kakie-kassy-podhodyat-dlya-markirovki`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/instructions/povtornaya-pechat-data-matrix`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/oferta`, changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  // Новые SEO-страницы (из конфига)
  const newPages = ALL_SEO_PAGES
    .filter(p => p.slug !== 'kkt-spb') // уже в existing
    .map(p => ({
      url: `${baseUrl}/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [...existing, ...newPages].map(p => ({
    ...p,
    lastModified: now,
  }))
}
