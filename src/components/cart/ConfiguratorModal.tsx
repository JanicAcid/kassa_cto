'use client'

// ============================================================================
// ConfiguratorModal.tsx — конфигуратор «под ключ» для конкретной кассы
// ----------------------------------------------------------------------------
// Выбор: ФН (15/36) + ОФД (15/36 Такском со скидкой) + услуги + допы
// Итог = price + fn + ofd + services + extras  (БЕЗ скидки 5%)
// Кнопка «Добавить в корзину»
//
// Жёсткие правила:
//   1. «Настройка кассы под ключ» (setup) — ВСЕГДА включена, нельзя снять
//   2. Доставка — выбирается через город: Пушкин (600₽), СПб (900₽), Гатчина (нет)
// ============================================================================

import { useEffect, useState } from 'react'
import { X, Check, ShoppingCart, Settings2, Lock } from 'lucide-react'
import { CONFIGURATOR_OPTIONS, type KassaProduct, type ConfiguratorOption } from '@/config/kass-catalog'
import { useCart } from './CartContext'

interface Props {
  kassa: KassaProduct | null
  isOpen: boolean
  onClose: () => void
}

type City = 'pushkin' | 'spb' | 'gatchina' | null

export function ConfiguratorModal({ kassa, isOpen, onClose }: Props) {
  const { addItem } = useCart()

  const [fnId, setFnId] = useState('fn-15')
  const [ofdId, setOfdId] = useState('ofd-15')
  // services всегда содержит setup (жёстко), reg-fns, опционально training, tech-support
  const [services, setServices] = useState<Set<string>>(new Set(['reg-fns', 'setup']))
  const [extras, setExtras] = useState<Set<string>>(new Set())
  const [city, setCity] = useState<City>(null)

  // сброс при смене кассы
  useEffect(() => {
    if (kassa) {
      setFnId('fn-15')
      setOfdId('ofd-15')
      setServices(new Set(['reg-fns', 'setup']))
      setExtras(new Set())
      setCity(null)
    }
  }, [kassa])

  // блок скролла + Esc
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

  const fnOptions = CONFIGURATOR_OPTIONS.filter(o => o.category === 'fn')
  const ofdOptions = CONFIGURATOR_OPTIONS.filter(o => o.category === 'ofd')
  const serviceOptions = CONFIGURATOR_OPTIONS.filter(o => o.category === 'service' && o.id !== 'delivery-pushkin' && o.id !== 'delivery-spb')
  const extraOptions = CONFIGURATOR_OPTIONS.filter(o => o.category === 'extra')

  const fn = fnOptions.find(o => o.id === fnId)
  const ofd = ofdOptions.find(o => o.id === ofdId)
  const selectedServices = serviceOptions.filter(o => services.has(o.id))

  // Доставка в зависимости от города
  const deliveryOption: ConfiguratorOption | null = (() => {
    if (city === 'pushkin') return CONFIGURATOR_OPTIONS.find(o => o.id === 'delivery-pushkin') ?? null
    if (city === 'spb') return CONFIGURATOR_OPTIONS.find(o => o.id === 'delivery-spb') ?? null
    return null
  })()

  const selectedExtras = extraOptions.filter(o => extras.has(o.id))

  // ИТОГ = ПРОСТАЯ СУММА (БЕЗ скидки 5%)
  const total = kassa.price
    + (fn?.price ?? 0)
    + (ofd?.price ?? 0)
    + selectedServices.reduce((s, o) => s + o.price, 0)
    + (deliveryOption?.price ?? 0)
    + selectedExtras.reduce((s, o) => s + o.price, 0)

  const toggleService = (id: string) => {
    // setup нельзя снять — жёстко
    if (id === 'setup') return
    setServices(prev => {
      const next = new Set(prev)
      // tech-support — взаимоисключающие (можно выбрать только один)
      if (id === 'tech-support-month') next.delete('tech-support-year')
      if (id === 'tech-support-year') next.delete('tech-support-month')
      if (next.has(id)) next.delete(id)
      else next.add(id)
      // всегда держим setup
      next.add('setup')
      return next
    })
  }

  const toggleExtra = (id: string) => {
    setExtras(prev => {
      const next = new Set(prev)
      // 2D-сканеры — взаимоисключающие
      if (id === 'scanner-2d-wire') next.delete('scanner-2d-bt')
      if (id === 'scanner-2d-bt') next.delete('scanner-2d-wire')
      // Денежные ящики — взаимоисключающие
      if (id === 'cash-drawer-small') next.delete('cash-drawer-large')
      if (id === 'cash-drawer-large') next.delete('cash-drawer-small')
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddToCart = () => {
    if (!fn || !ofd) return
    // формируем финальный список services (включая доставку если выбран город)
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
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-[#163A5F] to-[#1E4A78] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Конфигуратор «под ключ»</h3>
              <p className="text-xs text-white/70">{kassa.name} — соберите готовый комплект</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center text-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* касса — базовая цена */}
          <div className="flex items-center justify-between p-3 bg-[#163A5F]/5 rounded-xl border border-[#163A5F]/10">
            <div>
              <div className="font-semibold text-[#163A5F]">{kassa.name}</div>
              <div className="text-xs text-slate-500">{kassa.shortDesc}</div>
            </div>
            <div className="font-bold text-[#163A5F]">{kassa.price.toLocaleString('ru-RU')} ₽</div>
          </div>

          {/* ФН */}
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">💳 Фискальный накопитель (обязательно)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fnOptions.map(o => (
                <button
                  key={o.id}
                  onClick={() => setFnId(o.id)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    fnId === o.id
                      ? 'border-[#163A5F] bg-[#163A5F]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#163A5F]">{o.name}</span>
                    {o.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{o.badge}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{o.desc}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-[#163A5F]">{o.price.toLocaleString('ru-RU')} ₽</span>
                    {o.oldPrice && (
                      <span className="text-xs text-slate-400 line-through">{o.oldPrice.toLocaleString('ru-RU')} ₽</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ОФД */}
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">📡 ОФД Такском — со скидкой 68% при покупке кассы</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ofdOptions.map(o => (
                <button
                  key={o.id}
                  onClick={() => setOfdId(o.id)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    ofdId === o.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#163A5F]">{o.name}</span>
                    {o.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">{o.badge}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{o.desc}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-emerald-600">{o.price.toLocaleString('ru-RU')} ₽</span>
                    {o.oldPrice && (
                      <span className="text-xs text-slate-400 line-through">{o.oldPrice.toLocaleString('ru-RU')} ₽</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Услуги */}
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">🛠 Услуги</h4>
            <div className="space-y-2">
              {serviceOptions.map(o => {
                const checked = services.has(o.id)
                const isLocked = o.id === 'setup'
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleService(o.id)}
                    disabled={isLocked}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${isLocked ? 'cursor-default opacity-95' : 'cursor-pointer'}`}
                  >
                    <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      checked ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                    }`}>
                      {checked && (isLocked ? <Lock className="w-3 h-3" /> : <Check className="w-3.5 h-3.5" />)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#163A5F] flex items-center gap-1.5">
                          {o.name}
                          {isLocked && <span className="text-[10px] text-slate-500 font-normal">(обязательно)</span>}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {o.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{o.badge}</span>
                          )}
                          <span className="font-bold text-[#163A5F] whitespace-nowrap">
                            {o.price === 0 ? '0 ₽' : `${o.price.toLocaleString('ru-RU')} ₽`}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{o.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Город доставки */}
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">🚚 Доставка (выберите город)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setCity('pushkin')}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  city === 'pushkin'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-[#163A5F] text-sm">Пушкин</div>
                <div className="text-xs text-slate-500 mt-0.5">Привезём, подключим, проверим</div>
                <div className="font-bold text-emerald-600 mt-1">600 ₽</div>
              </button>
              <button
                onClick={() => setCity('spb')}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  city === 'spb'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-[#163A5F] text-sm">Санкт-Петербург</div>
                <div className="text-xs text-slate-500 mt-0.5">Привезём, подключим, проверим</div>
                <div className="font-bold text-emerald-600 mt-1">900 ₽</div>
              </button>
              <div className="text-left p-3 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed">
                <div className="font-semibold text-slate-500 text-sm">Гатчина</div>
                <div className="text-xs text-slate-400 mt-0.5">Доставки нет — самовывоз</div>
                <div className="font-bold text-slate-400 mt-1">—</div>
              </div>
            </div>
            {city === null && (
              <p className="text-xs text-slate-400 mt-2">Доставка опциональна — можно забрать кассу из офиса в Пушкине, СПб или Гатчине.</p>
            )}
          </div>

          {/* Допы */}
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">📦 Доп. оборудование (по желанию)</h4>
            <p className="text-xs text-slate-400 mb-3">Сканеры и денежные ящики — выберите один вариант из каждой группы.</p>
            <div className="space-y-2">
              {extraOptions.map((o, idx) => {
                const checked = extras.has(o.id)
                // подзаголовки групп
                const showScannerHeader = idx === 0
                const showDrawerHeader = o.id === 'cash-drawer-small'
                const showPrinterHeader = o.id === 'label-printer'
                return (
                  <div key={o.id}>
                    {showScannerHeader && (
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-2 mb-1">2D-сканер (один из вариантов)</div>
                    )}
                    {showDrawerHeader && (
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1">Денежный ящик (один из вариантов)</div>
                    )}
                    {showPrinterHeader && (
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1">Принтер этикеток</div>
                    )}
                    <button
                      onClick={() => toggleExtra(o.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
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
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#163A5F]">{o.name}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {o.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{o.badge}</span>
                            )}
                            <span className="font-bold text-[#163A5F] whitespace-nowrap">
                              +{o.price.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{o.desc}</div>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* footer — итог + кнопка */}
        <div className="border-t border-slate-100 p-5 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Итого за комплект</div>
              <div className="text-3xl font-bold text-[#163A5F]">{total.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Касса: {kassa.price.toLocaleString('ru-RU')} ₽</div>
              <div>ФН: {fn?.price.toLocaleString('ru-RU') ?? 0} ₽</div>
              <div>ОФД: {ofd?.price.toLocaleString('ru-RU') ?? 0} ₽</div>
              <div>Услуги: {selectedServices.reduce((s, o) => s + o.price, 0).toLocaleString('ru-RU')} ₽</div>
              {deliveryOption && <div>Доставка ({city === 'pushkin' ? 'Пушкин' : 'СПб'}): {deliveryOption.price} ₽</div>}
              {selectedExtras.length > 0 && <div>Допы: {selectedExtras.reduce((s, o) => s + o.price, 0).toLocaleString('ru-RU')} ₽</div>}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  )
}
