// ============================================================================
// SeoServicePage — универсальный шаблон SEO-лендинга под услугу ЦТО касс
// Используется для всех новых страниц: ремонт по брендам, ФН, ОФД, ЭДО, и т.д.
// ============================================================================

import Link from 'next/link'
import { Phone, CheckCircle2, ArrowRight, ChevronRight, MapPin, Tag, LayoutGrid, ShoppingCart } from 'lucide-react'
import { JsonLdData } from '@/components/JsonLd'
import { ProductsPreview } from '@/components/ProductsPreview'
import { FeedbackForm } from '@/components/FeedbackForm'
import { SITE_URL } from '@/config/site'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'

export interface FaqItem {
  q: string
  a: string
}

export interface PriceItem {
  service: string
  price: string
  note?: string
}

export interface SeoServicePageProps {
  // Метаданные
  slug: string
  title: string           // <title>
  description: string     // meta description
  h1: string              // H1 на странице
  keywords?: string[]

  // Hero
  heroSubtitle: string
  heroCta?: { label: string; href: string }

  // Тело
  intro: string           // вводный абзац после H1
  sections: { heading: string; paragraphs: string[] }[]

  // Услуги / цены
  pricesTitle?: string
  prices?: PriceItem[]

  // FAQ
  faq?: FaqItem[]

  // Хлебные крошки
  breadcrumbs?: { label: string; href?: string }[]

  // Гео (для Schema.org)
  areaServed?: string[]   // список городов/регионов

  // Скрыть калькулятор из CTA (для хаб-страниц и страниц, где он неуместен)
  hideCalculator?: boolean

  // Кнопка "Купить" в Hero — ведёт прямо на карточку товара в каталоге
  buyButton?: { label: string; href: string }
}

export function SeoServicePage({
  slug, title, description, h1, keywords,
  heroSubtitle, heroCta,
  intro, sections,
  pricesTitle = 'Цены на услуги', prices = [],
  faq = [],
  breadcrumbs = [],
  areaServed = [],
  hideCalculator = false,
  buyButton,
}: SeoServicePageProps) {
  const canonical = `${SITE_URL}/${slug}`

  const jsonLdService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: h1,
    description,
    provider: {
      '@type': 'Organization',
      name: 'ООО «Теллур-Интех»',
      telephone: '+78124659457',
      email: 'push@tellur.spb.ru',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Заслонова, 32-34',
        addressLocality: 'Санкт-Петербург',
        addressRegion: 'Санкт-Петербург',
        postalCode: '192007',
        addressCountry: 'RU',
      },
    },
    areaServed: areaServed.map(a => ({ '@type': 'City', name: a })),
    serviceType: h1,
    url: canonical,
  }

  const jsonLdFaq = faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  } : null

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
      ...(breadcrumbs || []).map((b, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: b.label,
        item: b.href ? `${SITE_URL}${b.href}` : undefined,
      })),
    ],
  }

  return (
    <>
      <JsonLdData data={jsonLdService} />
      {jsonLdFaq && <JsonLdData data={jsonLdFaq} />}
      <JsonLdData data={jsonLdBreadcrumbs} />

      <div className="bg-gradient-to-br from-[#163A5F] to-[#1E4A78] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Хлебные крошки */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/60 mb-2 flex-wrap">
              <Link href="/" className="hover:text-white">Главная</Link>
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3" />
                  {b.href ? (
                    <Link href={b.href} className="hover:text-white">{b.label}</Link>
                  ) : (
                    <span className="text-white/80">{b.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-6">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-1.5 sm:mb-2 tracking-tight">
                {h1}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-snug mx-auto sm:mx-0">
                {heroSubtitle}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 flex-shrink-0">
              <Link
                href="/katalog-kass"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl transition-colors text-sm whitespace-nowrap border border-white/20"
              >
                <LayoutGrid className="w-4 h-4" />
                Каталог
              </Link>
              <a
                href={CITY_PHONE_HREF}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                {CITY_PHONE}
              </a>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Промокод-бейдж — компактно, отцентровано */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-xs sm:text-sm text-amber-800">
              Промокод <b className="tracking-wider text-amber-700">{PROMOCODE}</b> — спеццена при звонке с сайта
            </span>
          </div>
        </div>

        {/* Intro */}
        <div className="max-w-3xl mx-auto mb-10">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{intro}</p>
        </div>

        {/* Контент секции */}
        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((section, idx) => (
            <section key={idx}>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#163A5F] mb-4 tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, pidx) => (
                <p key={pidx} className="text-base text-slate-700 leading-relaxed mb-4">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Цены */}
        {prices.length > 0 && (
          <section className="max-w-4xl mx-auto mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#163A5F] mb-6 text-center tracking-tight">
              {pricesTitle}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {prices.map((p, idx) => (
                <div
                  key={idx}
                  className={`flex items-start justify-between gap-4 p-5 ${idx !== prices.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{p.service}</div>
                    {p.note && <div className="text-sm text-slate-500 mt-1">{p.note}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-[#163A5F] whitespace-nowrap">{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 text-center mt-4">
              Точную стоимость рассчитаем после диагностики. Гарантия на все работы.
            </p>
          </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#163A5F] mb-6 tracking-tight">
              Частые вопросы
            </h2>
            <div className="space-y-3">
              {faq.map((item, idx) => (
                <details key={idx} className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <summary className="cursor-pointer p-5 font-semibold text-slate-900 list-none flex items-center justify-between gap-4 hover:bg-slate-50">
                    <span>{item.q}</span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
                  </summary>
                  <div className="px-5 pb-5 text-slate-700 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Превью каталога касс */}
        <ProductsPreview
          title="Кассы в наличии"
          subtitle="Продаём с установкой под ключ. Все модели онлайн-касс для маркировки, алкоголя, услуг."
        />

        {/* CTA */}
        <section className="mt-16 grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Левая часть — текст + кнопки */}
          <div className="bg-gradient-to-r from-[#163A5F] to-[#1E4A78] rounded-2xl p-8 sm:p-10 text-white flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Нужна помощь с кассой в СПб или ЛО?
            </h2>
            <p className="text-white/80 mb-6">
              Бесплатная консультация по телефону. Выезд инженера в день обращения.
              Работаем с 1995 года, многолетний опыт.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={CITY_PHONE_HREF}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
                {CITY_PHONE}
              </a>
              {buyButton && (
                <Link
                  href={buyButton.href}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {buyButton.label}
                </Link>
              )}
              <Link
                href="/katalog-kass"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-medium rounded-xl transition-colors border border-white/20"
              >
                <LayoutGrid className="w-5 h-5" />
                Каталог
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
              <MapPin className="w-4 h-4" />
              <span>СПб, Пушкин, Гатчина · Выезд по всей ЛО</span>
            </div>
          </div>

          {/* Правая часть — форма обратной связи */}
          <FeedbackForm />
        </section>
      </main>
    </>
  )
}

// Метаданные для генерации (используется в page.tsx каждой страницы)
export function buildMetadata(props: SeoServicePageProps) {
  return {
    title: props.title,
    description: props.description,
    keywords: props.keywords?.join(', '),
    alternates: { canonical: `/${props.slug}` },
    openGraph: {
      title: props.title,
      description: props.description,
      url: `${SITE_URL}/${props.slug}`,
      type: 'website',
    },
  }
}
