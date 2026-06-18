import { SeoServicePage, buildMetadata } from '@/components/SeoServicePage'
import { SEO_PAGES_MAP } from '@/config/seo-services'
import type { Metadata } from 'next'

const page = SEO_PAGES_MAP['registraciya-kkt-v-fns']
if (!page) throw new Error('SEO page not found: registraciya-kkt-v-fns')

export const metadata: Metadata = buildMetadata(page)

export default function Page() {
  return <SeoServicePage {...page} />
}
