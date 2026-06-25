import { SeoServicePage, buildMetadata } from '@/components/SeoServicePage'
import { SEO_PAGES_MAP } from '@/config/seo-services'
import type { Metadata } from 'next'

const page = SEO_PAGES_MAP['kupit-aqsi-spb']
if (!page) throw new Error('SEO page not found: kupit-aqsi-spb')

export const metadata: Metadata = buildMetadata(page)

export default function Page() {
  return <SeoServicePage {...page} />
}
