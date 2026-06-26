// ProductsPreview — перематываемый блок с кассами (carousel)
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { KASSA_PREVIEW, BRAND_ICONS } from '@/config/kass-catalog'

interface ProductsPreviewProps {
  title?: string
  subtitle?: string
  className?: string
}

export function ProductsPreview({
  title = 'Каталог онлайн-касс',
  subtitle = 'Продаём кассы с установкой под ключ. Все модели в наличии, доставка по СПб и ЛО.',
  className = '',
}: ProductsPreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / KASSA_PREVIEW.length
    el.scrollBy({ left: dir * cardWidth * 1.5, behavior: 'smooth' })
  }

  const items = KASSA_PREVIEW

  return (
    <section className={`max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 overflow-hidden ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-3xl font-bold text-[#163A5F] mb-1.5 sm:mb-2 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl leading-snug sm:leading-relaxed">
            {subtitle}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            aria-label="Назад"
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              canLeft
                ? 'border-[#163A5F] text-[#163A5F] hover:bg-[#163A5F] hover:text-white'
                : 'border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            aria-label="Вперёд"
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              canRight
                ? 'border-[#163A5F] text-[#163A5F] hover:bg-[#163A5F] hover:text-white'
                : 'border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Карусель — overflow-x-auto, карточки не вылезают за края благодаря overflow-hidden на section */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <style>{`.products-carousel::-webkit-scrollbar { display: none; }`}</style>
        <div className="products-carousel" style={{ display: 'contents' }}>
          {items.map((kassa) => {
            const brandIcon = BRAND_ICONS[kassa.brand]
            const mainImage = kassa.images && kassa.images.length > 0 ? kassa.images[0] : brandIcon
            return (
              <Link
                key={kassa.id}
                href="/katalog-kass"
                className="group snap-start shrink-0 w-[210px] sm:w-[260px] bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[#163A5F]/30 hover:-translate-y-0.5 flex flex-col"
              >
                <div className="relative bg-slate-50 aspect-[4/3] flex items-center justify-center p-3 sm:p-4 border-b border-slate-100">
                  {kassa.badge && (
                    <span className="absolute top-2 left-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 z-10">
                      {kassa.badge}
                    </span>
                  )}
                  {mainImage && (
                    <Image
                      src={mainImage}
                      alt={`${kassa.brand} ${kassa.model}`}
                      width={140}
                      height={100}
                      className="max-h-24 sm:max-h-28 w-auto object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      unoptimized
                    />
                  )}
                  {kassa.hasAcquiring && (
                    <span className="absolute bottom-2 right-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                      💳 эквайринг
                    </span>
                  )}
                </div>

                <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    {kassa.brand}
                  </div>
                  <h3 className="text-xs sm:text-base font-bold text-[#163A5F] leading-tight mb-1 sm:mb-1.5 group-hover:text-[#1E4A78]">
                    {kassa.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mb-2 sm:mb-3 line-clamp-2">
                    {kassa.shortDesc}
                  </p>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-lg font-bold text-[#163A5F]">
                        {kassa.price.toLocaleString('ru-RU')} ₽
                      </span>
                      {kassa.oldPrice && (
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                          {kassa.oldPrice.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>
                    {kassa.gift && (
                      <div className="mt-1 sm:mt-1.5 flex items-start gap-1 text-[10px] text-emerald-700 font-medium leading-tight">
                        <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{kassa.gift}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}

          <Link
            href="/katalog-kass"
            className="snap-start shrink-0 w-[180px] sm:w-[220px] bg-gradient-to-br from-[#163A5F] to-[#1E4A78] rounded-xl overflow-hidden flex flex-col items-center justify-center p-5 sm:p-6 text-white hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 flex items-center justify-center mb-2 sm:mb-3">
              <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-center mb-1">Все модели</h3>
            <p className="text-[11px] sm:text-xs text-white/70 text-center leading-snug">
              13 касс в каталоге
            </p>
          </Link>
        </div>
      </div>

      <div className="mt-2 sm:hidden text-center text-[11px] text-slate-400">
        ← листайте, чтобы увидеть все модели →
      </div>

      <div className="hidden sm:block text-center mt-6">
        <Link
          href="/katalog-kass"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#163A5F] hover:bg-[#1E4A78] text-white text-sm font-bold rounded-xl transition-colors"
        >
          Все модели в каталоге
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
