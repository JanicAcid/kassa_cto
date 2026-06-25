// ============================================================================
// katalog-kass/layout.tsx — серверный, хранит metadata для SEO
// (клиентский page.tsx не может экспортировать metadata)
// ============================================================================

import type { Metadata } from 'next'
import { SITE_URL } from '@/config/site'

export const metadata: Metadata = {
  title: 'Каталог онлайн-касс в СПб — купить с установкой под ключ | Теллур-Интех',
  description: 'Каталог онлайн-касс: Меркурий, AQSI, АТОЛ, Эвотор. Купить с установкой под ключ в СПб. ФН, ОФД, регистрация в ФНС. Промокод САЙТ — спеццена. ЦТО с 1995 года.',
  keywords: ['купить онлайн кассу спб', 'каталог касс', 'меркурий 185ф купить', 'aqsi 5ф', 'атол 22ф', 'эвотор 7.3', 'касса с эквайрингом', 'смарт терминал'],
  alternates: { canonical: '/katalog-kass' },
  openGraph: {
    title: 'Каталог онлайн-касс в СПб — купить с установкой под ключ',
    description: 'Меркурий, AQSI, АТОЛ, Эвотор. Все модели в наличии. Установка под ключ. Промокод САЙТ — спеццена.',
    url: `${SITE_URL}/katalog-kass`,
    type: 'website',
  },
}

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
