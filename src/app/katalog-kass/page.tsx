import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, CheckCircle2, ShoppingCart, Shield, Tag } from 'lucide-react'
import { KASSA_CATALOG, BRAND_ICONS } from '@/config/kass-catalog'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'
import { JsonLdData } from '@/components/JsonLd'
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

const jsonLdCatalog = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Каталог онлайн-касс Теллур-Интех',
  itemListElement: KASSA_CATALOG.map((kassa, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    item: {
      '@type': 'Product',
      name: kassa.name,
      description: kassa.shortDesc,
      brand: { '@type': 'Brand', name: kassa.brand },
      category: 'Онлайн-касса',
      offers: {
        '@type': 'Offer',
        price: kassa.price,
        priceCurrency: 'RUB',
        availability: kassa.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'ООО «Теллур-Интех»', telephone: '+78124659457' },
      },
    },
  })),
}

export default function KatalogKassPage() {
  return (
    <>
      <JsonLdData data={jsonLdCatalog} />

      <div className="bg-gradient-to-br from-[#163A5F] to-[#1E4A78] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-6">
            <Link href="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <span className="text-white/80">Каталог касс</span>
          </nav>
          <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold leading-[1.1] mb-4 tracking-tight">
            Каталог онлайн-касс в СПб
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-3xl leading-relaxed mb-6">
            Продаём кассы с установкой под ключ: ФН, ОФД, регистрация в ФНС, настройка маркировки.
            Все модели в наличии. Доставка по СПб и ЛО. Промокод{' '}
            <b className="text-amber-200 tracking-wider">{PROMOCODE}</b> — спеццена при звонке с сайта.
          </p>
          <a
            href={CITY_PHONE_HREF}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors"
          >
            <Phone className="w-5 h-5" />
            {CITY_PHONE}
          </a>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {KASSA_CATALOG.map((kassa) => {
            const brandIcon = BRAND_ICONS[kassa.brand]
            const mainImage = kassa.images && kassa.images.length > 0 ? kassa.images[0] : brandIcon
            return (
              <div
                key={kassa.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg hover:border-[#163A5F]/30 transition-all"
              >
                <div className="relative bg-slate-50 aspect-[4/3] flex items-center justify-center p-4 border-b border-slate-100">
                  {kassa.badge && (
                    <span className="absolute top-3 left-3 inline-block px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800 z-10">
                      {kassa.badge}
                    </span>
                  )}
                  {mainImage && (
                    <Image
                      src={mainImage}
                      alt={`${kassa.brand} ${kassa.model}`}
                      width={160}
                      height={120}
                      className="max-h-32 w-auto object-contain"
                      unoptimized
                    />
                  )}
                  {kassa.hasAcquiring && (
                    <span className="absolute bottom-3 right-3 inline-block px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      💳 эквайринг
                    </span>
                  )}
                  {kassa.images && kassa.images.length > 1 && (
                    <span className="absolute bottom-3 left-3 inline-block px-2 py-1 rounded text-[10px] font-bold bg-black/50 text-white">
                      📷 {kassa.images.length}
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {kassa.brand}
                  </div>
                  <h2 className="text-lg font-bold text-[#163A5F] mb-2">{kassa.name}</h2>
                  <p className="text-sm text-slate-600 mb-3 leading-snug">{kassa.shortDesc}</p>

                  <ul className="space-y-1 mb-4">
                    {kassa.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-[#163A5F]">
                        {kassa.price.toLocaleString('ru-RU')} ₽
                      </span>
                      {kassa.oldPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {kassa.oldPrice.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>
                    {kassa.gift && (
                      <div className="text-xs text-emerald-700 font-medium mb-3 bg-emerald-50 px-2 py-1 rounded">
                        🎁 {kassa.gift}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <a
                        href={CITY_PHONE_HREF}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#163A5F] hover:bg-[#1E4A78] text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Заказать
                      </a>
                      <a
                        href={CITY_PHONE_HREF}
                        className="inline-flex items-center justify-center px-3 py-2 border border-slate-200 hover:bg-slate-50 text-[#163A5F] text-sm font-medium rounded-lg transition-colors"
                        title={`Позвонить: ${CITY_PHONE}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <section className="mt-16 bg-slate-50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#163A5F] mb-6 text-center">
            Почему покупать кассу у нас
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#163A5F]/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-[#163A5F]" />
              </div>
              <h3 className="font-bold text-[#163A5F] mb-2">Гарантия и сервис</h3>
              <p className="text-sm text-slate-600">
                Официальная гарантия от 12 месяцев. Сервисный центр с 1995 года. Ремонт в день обращения.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-[#163A5F] mb-2">Всё под ключ</h3>
              <p className="text-sm text-slate-600">
                Касса + ФН + ОФД + регистрация в ФНС + настройка маркировки. Не нужно ничего искать отдельно.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-[#163A5F] mb-2">Промокод {PROMOCODE}</h3>
              <p className="text-sm text-slate-600">
                Назовите промокод «{PROMOCODE}» при звонке — примените спеццену как на сайте. Не переплачивайте.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-gradient-to-r from-[#163A5F] to-[#1E4A78] rounded-2xl p-8 sm:p-10 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Поможем выбрать кассу под ваш бизнес
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Бесплатная консультация по телефону. Подберём оптимальную модель под вашу систему налогообложения
            и тип товаров. Промокод {PROMOCODE} — спеццена при звонке.
          </p>
          <a
            href={CITY_PHONE_HREF}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors"
          >
            <Phone className="w-5 h-5" />
            {CITY_PHONE}
          </a>
        </section>
      </main>
    </>
  )
}
