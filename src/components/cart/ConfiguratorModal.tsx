'use client'

// ============================================================================
// ConfiguratorModal.tsx — конфигуратор «под ключ» (мобило-адаптивный)
// ----------------------------------------------------------------------------
// Жёсткие правила:
//   1. Доставка: Пушкин 600₽ / СПб 900₽ / Гатчина нет
//   2. 2D-сканеры взаимоисключающие, ден.ящики взаимоисключающие
//   3. tech-support-month/year взаимоисключающие
// ============================================================================

import { useEffect, useState } from 'react'
import { X, Check, ShoppingCart, Settings2 } from 'lucide-react'
import { CONFIGURATOR_OPTIONS, type KassaProduct, type ConfiguratorOption } from '@/config/kass-catalog'
import { useCart } from './CartContext'

// Маппинг ID опций продления ОФД → иконки
const OFD_ICONS: Record<string, string> = {
  'takskom': '/brands/ofd-takskom.jpg',
  'platform': '/brands/ofd-platform.png',
  'first': '/brands/ofd-first.webp',
  'sbis': '/brands/ofd-sbis.png',
}

interface Props {
  kassa: KassaProduct | null
  isOpen: boolean
  onClose: () => void
}

type City = 'pushkin' | 'spb' | 'pickup-zaslonova' | 'pickup-pushkin' | 'pickup-gatchina' | null

export function ConfiguratorModal({ kassa, isOpen, onClose }: Props) {
  const { addItem } = useCart()

  const [fnId, setFnId] = useState('fn-15')
  const [ofdId, setOfdId] = useState('ofd-15')
  const [services, setServices] = useState<Set<string>>(new Set(['reg-fns']))
  const [extras, setExtras] = useState<Set<string>>(new Set())
  const [city, setCity] = useState<City>(null)

  useEffect(() => {
    if (kassa) {
      setFnId('fn-15')
      setOfdId('ofd-15')
      setServices(new Set(['reg-fns']))
      setExtras(new Set())
      setCity(null)
    }
  }, [kassa])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen || !kassa) return null

  const isFnCard = kassa.id.startsWith('fn-')

  const fnOptions = CONFIGURATOR_OPTIONS.filter(o => o.category === 'fn')
  const ofdOptions = CONFIGURATOR_OPTIONS.filter(o => o.category === 'ofd')
  const serviceOptions = kassa.id.startsWith('fn-')
    // Для карточек ФН — только замена ФН + продление ОФД (все 4 провайдера)
    ? CONFIGURATOR_OPTIONS.filter(o => o.category === 'service'
        && (o.id === 'fn-replace' || o.id.startsWith('ofd-renew-'))
      )
    // Для касс — все услуги кроме доставки/самовывоза
    : CONFIGURATOR_OPTIONS.filter(o => o.category === 'service'
        && o.id !== 'delivery-pushkin'
        && o.id !== 'delivery-spb'
        && o.id !== 'pickup-zaslonova'
        && o.id !== 'pickup-pushkin'
        && o.id !== 'pickup-gatchina'
      )
  const extraOptions = isFnCard ? [] : CONFIGURATOR_OPTIONS.filter(o => o.category === 'extra')

  const fn = fnOptions.find(o => o.id === fnId)
  const ofd = ofdOptions.find(o => o.id === ofdId)
  const selectedServices = serviceOptions.filter(o => services.has(o.id))

  const deliveryOption: ConfiguratorOption | null = (() => {
    if (city === 'pushkin') return CONFIGURATOR_OPTIONS.find(o => o.id === 'delivery-pushkin') ?? null
    if (city === 'spb') return CONFIGURATOR_OPTIONS.find(o => o.id === 'delivery-spb') ?? null
    if (city === 'pickup-zaslonova') return CONFIGURATOR_OPTIONS.find(o => o.id === 'pickup-zaslonova') ?? null
    if (city === 'pickup-pushkin') return CONFIGURATOR_OPTIONS.find(o => o.id === 'pickup-pushkin') ?? null
    if (city === 'pickup-gatchina') return CONFIGURATOR_OPTIONS.find(o => o.id === 'pickup-gatchina') ?? null
    return null
  })()

  const selectedExtras = extraOptions.filter(o => extras.has(o.id))

  const total = kassa.price
    + (isFnCard ? 0 : (fn?.price ?? 0))
    + (isFnCard ? 0 : (ofd?.price ?? 0))
    + selectedServices.reduce((s, o) => s + o.price, 0)
    + (deliveryOption?.price ?? 0)
    + selectedExtras.reduce((s, o) => s + o.price, 0)

  const toggleService = (id: string) => {
    setServices(prev => {
      const next = new Set(prev)
      if (id === 'tech-support-month') next.delete('tech-support-year')
      if (id === 'tech-support-year') next.delete('tech-support-month')
      // Продление ОФД — взаимоисключающие (любой один из всех)
      if (id.startsWith('ofd-renew-')) {
        const allOfdRenew = ['ofd-renew-takskom-15','ofd-renew-takskom-36','ofd-renew-platform-15','ofd-renew-platform-36','ofd-renew-first-15','ofd-renew-first-36','ofd-renew-sbis-15','ofd-renew-sbis-36']
        allOfdRenew.forEach(oid => { if (oid !== id) next.delete(oid) })
      }
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleExtra = (id: string) => {
    setExtras(prev => {
      const next = new Set(prev)
      if (id === 'scanner-2d-wire') next.delete('scanner-2d-bt')
      if (id === 'scanner-2d-bt') next.delete('scanner-2d-wire')
      if (id === 'cash-drawer-small') next.delete('cash-drawer-large')
      if (id === 'cash-drawer-large') next.delete('cash-drawer-small')
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddToCart = () => {
    if (!fn || !ofd) return
    const finalServices = [...selectedServices]
    if (deliveryOption) finalServices.push(deliveryOption)

    addItem({
      kassaId: kassa.id,
      name: kassa.name,
      price: kassa.price,
      image: kassa.images?.[0] ?? '',
      qty: 1,
      fn,
      ofd,
      services: finalServices,
      extras: selectedExtras,
      total,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-[#163A5F] to-[#1E4A78] text-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg truncate">Конфигуратор «под ключ»</h3>
              <p className="text-xs text-white/70 truncate">{kassa.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center text-white/80 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-5">
          {/* касса — базовая цена */}
          <div className="flex items-center justify-between gap-3 p-3 bg-[#163A5F]/5 rounded-xl border border-[#163A5F]/10">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[#163A5F] text-sm sm:text-base truncate">{kassa.name}</div>
              <div className="text-xs text-slate-500 truncate">{kassa.shortDesc}</div>
            </div>
            <div className="font-bold text-[#163A5F] text-sm sm:text-base whitespace-nowrap flex-shrink-0">
              {kassa.price.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {/* ФН — только при покупке кассы (не ФН) */}
          {!kassa.id.startsWith('fn-') && (
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">💳 Фискальный накопитель</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fnOptions.map(o => (
                <button
                  key={o.id}
                  onClick={() => setFnId(o.id)}
                  className={`text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all ${
                    fnId === o.id
                      ? 'border-[#163A5F] bg-[#163A5F]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-[#163A5F] text-xs sm:text-sm">{o.name}</span>
                    {o.badge && (
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 whitespace-nowrap flex-shrink-0">{o.badge}</span>
                    )}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mb-1.5 leading-snug">{o.desc}</div>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-bold text-[#163A5F] text-sm sm:text-base">{o.price.toLocaleString('ru-RU')} ₽</span>
                    {o.oldPrice && (
                      <span className="text-[11px] sm:text-xs text-slate-400 line-through">{o.oldPrice.toLocaleString('ru-RU')} ₽</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* ОФД — только при покупке кассы (не ФН) */}
          {!kassa.id.startsWith('fn-') && (
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">📡 ОФД Такском — скидка 68% при покупке кассы</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ofdOptions.map(o => (
                <button
                  key={o.id}
                  onClick={() => setOfdId(o.id)}
                  className={`text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all ${
                    ofdId === o.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-[#163A5F] text-xs sm:text-sm">{o.name}</span>
                    {o.badge && (
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 whitespace-nowrap flex-shrink-0">{o.badge}</span>
                    )}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mb-1.5 leading-snug">{o.desc}</div>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-bold text-emerald-600 text-sm sm:text-base">{o.price.toLocaleString('ru-RU')} ₽</span>
                    {o.oldPrice && (
                      <span className="text-[11px] sm:text-xs text-slate-400 line-through">{o.oldPrice.toLocaleString('ru-RU')} ₽</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Услуги */}
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">🛠 Услуги</h4>
            <div className="space-y-2">
              {serviceOptions.map(o => {
                const checked = services.has(o.id)
                const ofdIcon = o.id.startsWith('ofd-renew-') ? OFD_ICONS[o.id.split('-').slice(2,-1).join('-')] : null
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleService(o.id)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } cursor-pointer`}
                  >
                    <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      checked ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                    }`}>
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    {ofdIcon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ofdIcon} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-contain flex-shrink-0 rounded-lg bg-white border border-slate-100 p-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-[#163A5F] text-xs sm:text-sm leading-snug">
                          {o.name}
                        </span>
                        <div className="flex items-baseline gap-1.5 flex-shrink-0">
                          {o.oldPrice && (
                            <span className="text-[10px] sm:text-xs text-slate-400 line-through">{o.oldPrice.toLocaleString('ru-RU')} ₽</span>
                          )}
                          <span className="font-bold text-[#163A5F] text-xs sm:text-sm whitespace-nowrap">
                            {o.price === 0 ? '0 ₽' : `${o.price.toLocaleString('ru-RU')} ₽`}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">{o.desc}</div>
                      {o.badge && (
                        <span className="inline-block mt-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{o.badge}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Доставка / Самовывоз — аккордеон */}
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between text-sm font-bold text-[#163A5F] py-2 border-b border-slate-100">
              <span>🚚 Доставка или самовывоз {city && <span className="text-emerald-600 font-normal text-xs ml-1">✓ выбрано</span>}</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => setCity('pushkin')}
                className={`text-left p-2 rounded-lg border transition-all ${
                  city === 'pushkin' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-[#163A5F] text-xs">📦 Пушкин</div>
                <div className="font-bold text-emerald-600 text-xs">600 ₽</div>
              </button>
              <button
                onClick={() => setCity('spb')}
                className={`text-left p-2 rounded-lg border transition-all ${
                  city === 'spb' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-[#163A5F] text-xs">📦 СПб</div>
                <div className="font-bold text-emerald-600 text-xs">900 ₽</div>
              </button>
              <button
                onClick={() => setCity('pickup-zaslonova')}
                className={`text-left p-2 rounded-lg border transition-all ${
                  city === 'pickup-zaslonova' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-[#163A5F] text-xs">🏪 СПб</div>
                <div className="font-bold text-slate-500 text-xs">Заслонова</div>
              </button>
              <button
                onClick={() => setCity('pickup-pushkin')}
                className={`text-left p-2 rounded-lg border transition-all ${
                  city === 'pickup-pushkin' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-[#163A5F] text-xs">🏪 Пушкин</div>
                <div className="font-bold text-slate-500 text-xs">Октябрьский</div>
              </button>
              <button
                onClick={() => setCity('pickup-gatchina')}
                className={`text-left p-2 rounded-lg border transition-all ${
                  city === 'pickup-gatchina' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-[#163A5F] text-xs">🏪 Гатчина</div>
                <div className="font-bold text-slate-500 text-xs">Хохлова</div>
              </button>
            </div>
          </details>

          {/* Допы */}
          <div>
            <h4 className="font-bold text-[#163A5F] mb-1 text-sm">📦 Доп. оборудование</h4>
            <p className="text-[11px] sm:text-xs text-slate-400 mb-2 leading-snug">
              Сканеры и ящики — выберите один из вариантов.
            </p>
            <div className="space-y-2">
              {extraOptions.map((o, idx) => {
                const checked = extras.has(o.id)
                const showScannerHeader = idx === 0
                const showDrawerHeader = o.id === 'cash-drawer-small'
                const showPrinterHeader = o.id === 'label-printer'
                return (
                  <div key={o.id}>
                    {showScannerHeader && (
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-2 mb-1">2D-сканер</div>
                    )}
                    {showDrawerHeader && (
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1">Денежный ящик</div>
                    )}
                    {showPrinterHeader && (
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1">Принтер этикеток</div>
                    )}
                    <button
                      onClick={() => toggleExtra(o.id)}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 ${
                        checked
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 ${
                        checked ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                      }`}>
                        {checked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-[#163A5F] text-xs sm:text-sm leading-snug">{o.name}</span>
                          <span className="font-bold text-[#163A5F] text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
                            +{o.price.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">{o.desc}</div>
                        {o.badge && (
                          <span className="inline-block mt-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{o.badge}</span>
                        )}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* footer — итог + кнопка */}
        <div className="border-t border-slate-100 p-3 sm:p-5 bg-slate-50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">Итого за комплект</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#163A5F]">{total.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className="text-right text-[10px] sm:text-xs text-slate-500 flex-shrink-0">
              <div>{isFnCard ? 'ФН' : 'Касса'}: {kassa.price.toLocaleString('ru-RU')} ₽</div>
              {!isFnCard && fn && <div>ФН: {fn.price.toLocaleString('ru-RU')} ₽</div>}
              {!isFnCard && ofd && <div>ОФД: {ofd.price.toLocaleString('ru-RU')} ₽</div>}
              <div>Услуги: {selectedServices.reduce((s, o) => s + o.price, 0).toLocaleString('ru-RU')} ₽</div>
              {deliveryOption && <div>{deliveryOption.price === 0 ? 'Самовывоз' : 'Доставка'}: {deliveryOption.price === 0 ? 'бесплатно' : `${deliveryOption.price} ₽`}</div>}
              {selectedExtras.length > 0 && <div>Допы: {selectedExtras.reduce((s, o) => s + o.price, 0).toLocaleString('ru-RU')} ₽</div>}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full py-3 sm:py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <ShoppingCart className="w-5 h-5" />
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  )
}
