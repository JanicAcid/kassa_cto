'use client'

// ============================================================================
// katalog-kass/page.tsx — каталог касс с галереей, корзиной, конфигуратором
// ----------------------------------------------------------------------------
// Из FIX14 (эталон): карточки с галереей + 2 кнопки:
//   - "В корзину" (зелёная) — быстрое добавление без конфигурации
//   - "Под ключ" (синяя) — открывает ConfiguratorModal
// Плавающая корзина справа снизу + CartModal
// ============================================================================

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Phone, CheckCircle2, ShoppingCart, Shield, Tag, Settings2 } from 'lucide-react'
import { KASSA_CATALOG, BRAND_ICONS, type KassaProduct } from '@/config/kass-catalog'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'
import { JsonLdData } from '@/components/JsonLd'
import { CartProvider, useCart } from '@/components/cart/CartContext'
import { CartModal } from '@/components/cart/CartModal'
import { FloatingCart } from '@/components/cart/FloatingCart'
import { ConfiguratorModal } from '@/components/cart/ConfiguratorModal'
import { CardGallery } from '@/components/catalog/CardGallery'
import { SpecsAccordion } from '@/components/catalog/SpecsAccordion'
import { CatalogFilters, applyFilters, DEFAULT_FILTER, type FilterState } from '@/components/catalog/CatalogFilters'

const jsonLdCatalog = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Каталог — Теллур-Интех',
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

function KassaCard({ kassa, onConfigure }: { kassa: KassaProduct; onConfigure: (k: KassaProduct) => void }) {
  const { addItem } = useCart()
  const brandIcon = BRAND_ICONS[kassa.brand]

  const handleQuickAdd = () => {
    addItem({
      kassaId: kassa.id,
      name: kassa.name,
      price: kassa.price,
      image: kassa.images?.[0] ?? '',
      qty: 1,
      services: [],
      extras: [],
      total: kassa.price,
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      {/* gallery */}
      <CardGallery images={kassa.images ?? []} alt={kassa.name} badge={kassa.badge} />

      {/* content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* brand + model */}
        <div className="flex items-center gap-2 mb-1.5">
          {brandIcon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brandIcon} alt={kassa.brand} className="w-5 h-5 object-contain" />
          )}
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{kassa.brand} {kassa.model}</span>
        </div>

        <h3 className="font-bold text-[#163A5F] text-base mb-1.5 leading-tight">{kassa.name}</h3>
        <p className="text-sm text-slate-600 mb-3 leading-snug">{kassa.shortDesc}</p>

        {/* features */}
        <ul className="space-y-1 mb-3 flex-1">
          {kassa.features.slice(0, 4).map((f, i) => (
            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* gift */}
        {kassa.gift && (
          <div className="mb-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-[11px] text-amber-700 font-medium flex items-start gap-1">
              <Tag className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{kassa.gift}</span>
            </div>
          </div>
        )}

        {/* price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-[#163A5F]">{kassa.price.toLocaleString('ru-RU')} ₽</span>
          {kassa.oldPrice && (
            <span className="text-sm text-slate-400 line-through">{kassa.oldPrice.toLocaleString('ru-RU')} ₽</span>
          )}
        </div>

        {/* buttons */}
        <div className="grid grid-cols-1 gap-2 mt-auto">
          <button
            onClick={() => onConfigure(kassa)}
            className="w-full py-2.5 bg-[#163A5F] hover:bg-[#1E4A78] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5"
          >
            <Settings2 className="w-4 h-4" />
            Под ключ
          </button>
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            В корзину
          </button>
        </div>

        <div className="text-[11px] text-slate-400 text-center mt-2">
          Гарантия: {kassa.warranty}
        </div>

        {/* Разворачиваемые характеристики */}
        {kassa.specGroups && kassa.specGroups.length > 0 && (
          <SpecsAccordion specGroups={kassa.specGroups} />
        )}
      </div>
    </div>
  )
}

function CatalogContent() {
  const [configKassa, setConfigKassa] = useState<KassaProduct | null>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)

  const openConfigurator = (k: KassaProduct) => {
    setConfigKassa(k)
    setConfigOpen(true)
  }

  const filteredKassas = useMemo(() => applyFilters(KASSA_CATALOG, filter), [filter])

  return (
    <>
      <JsonLdData data={jsonLdCatalog} />

      {/* HERO — компактный */}
      <div className="bg-gradient-to-br from-[#163A5F] to-[#1E4A78] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-[11px] text-white/60 mb-2">
            <Link href="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <span className="text-white/80">Каталог</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-1.5 sm:mb-2 tracking-tight">
                Каталог
              </h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-snug">
                Кассы с установкой под ключ: ФН, ОФД, регистрация в ФНС, маркировка. Промокод{' '}
                <b className="text-amber-200 tracking-wider">{PROMOCODE}</b> — спеццена.
              </p>
            </div>
            <a
              href={CITY_PHONE_HREF}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors text-sm whitespace-nowrap flex-shrink-0 self-start sm:self-end"
            >
              <Phone className="w-4 h-4" />
              {CITY_PHONE}
            </a>
          </div>
        </div>
      </div>

      {/* CATALOG */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <CatalogFilters state={filter} onChange={setFilter} resultsCount={filteredKassas.length} />

        <div id="catalog" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredKassas.map(kassa => (
            <KassaCard key={kassa.id} kassa={kassa} onConfigure={openConfigurator} />
          ))}
        </div>

        {filteredKassas.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-base mb-2">Ничего не найдено</p>
            <p className="text-sm">Попробуйте сбросить фильтры или изменить поисковый запрос.</p>
          </div>
        )}

        {/* TRUST */}
        <section className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
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
        </section>

        {/* CTA */}
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

      <ConfiguratorModal
        kassa={configKassa}
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
      />
      <CartModal />
      <FloatingCart />
    </>
  )
}

export default function KatalogKassPage() {
  return (
    <CartProvider>
      <CatalogContent />
    </CartProvider>
  )
}
