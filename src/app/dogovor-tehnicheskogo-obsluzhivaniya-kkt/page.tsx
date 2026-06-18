import { SeoServicePage, buildMetadata } from '@/components/SeoServicePage'
import { SEO_PAGES_MAP } from '@/config/seo-services'
import type { Metadata } from 'next'

const page = SEO_PAGES_MAP['dogovor-tehnicheskogo-obsluzhivaniya-kkt']
if (!page) throw new Error('SEO page not found: dogovor-tehnicheskogo-obsluzhivaniya-kkt')

export const metadata: Metadata = buildMetadata(page)

export default function Page() {
  return <SeoServicePage {...page} />
}
