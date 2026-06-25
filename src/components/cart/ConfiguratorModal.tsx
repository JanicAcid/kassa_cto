'use client'

// ============================================================================
// ConfiguratorModal.tsx — конфигуратор «под ключ» для конкретной кассы
// ----------------------------------------------------------------------------
// Выбор: ФН (15/36) + ОФД (15/36) + услуги (reg/setup/delivery) + допы (scanner/etc)
// Итог = price + fn + ofd + services + extras  (БЕЗ скидки 5%)
// Кнопка «Добавить в корзину»
// ============================================================================

import { useEffect, useState } from 'react'
import { X, Check, ShoppingCart, Settings2 } from 'lucide-react'
import { CONFIGURATOR_OPTIONS, type KassaProduct, type ConfiguratorOption } from '@/config/kass-catalog'
import { useCart } from './CartContext'

interface Props {
  kassa: KassaProduct | null
  isOpen: boolean
  onClose: () => void
}

export function ConfiguratorModal({ kassa, isOpen, onClose }: Props) {
  const { addItem } = useCart()

  const [fnId, setFnId] = useState('fn-15')
  const [ofdId, setOfdId] = useState('ofd-15')
  const [services, setServices] = useState<Set<string>>(new Set(['reg-fns', 'setup', 'delivery']))
  const [extras, setExtras] = useState<Set<string>>(new Set())

  // сброс при смене кассы
  useEffect(() => {
    if (kassa) {
      setFnId('fn-15')
      setOfdId('ofd-15')
      setServices(new Set(['reg-fns', 'setup', 'delivery']))
      setExtras(new Set())
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
  const serviceOptions = CONFIGURATOR_OPTIONS.filter(o => o.category === 'service')
  const extraOptions = CONFIGURATOR_OPTIONS.filter(o => o.category === 'extra')

  const fn = fnOptions.find(o => o.id === fnId)
  const ofd = ofdOptions.find(o => o.id === ofdId)
  const selectedServices = serviceOptions.filter(o => services.has(o.id))
  const selectedExtras = extraOptions.filter(o => extras.has(o.id))

  // ИТОГ = ПРОСТАЯ СУММА (БЕЗ скидки 5% — пользователь просил убрать)
  const total = kassa.price
    + (fn?.price ?? 0)
    + (ofd?.price ?? 0)
    + selectedServices.reduce((s, o) => s + o.price, 0)
    + selectedExtras.reduce((s, o) => s + o.price, 0)

  const toggleService = (id: string) => {
    setServices(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleExtra = (id: string) => {
    setExtras(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddToCart = () => {
    if (!fn || !ofd) return
    addItem({
      kassaId: kassa.id,
      name: kassa.name,
      price: kassa.price,
      image: kassa.images?.[0] ?? '',
      qty: 1,
      fn,
      ofd,
      services: selectedServices,
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
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">📡 ОФД — оператор фискальных данных</h4>
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
                    {o.price === 0 ? (
                      <span className="font-bold text-emerald-600">0 ₽ — ПОДАРОК</span>
                    ) : (
                      <span className="font-bold text-[#163A5F]">+{o.price.toLocaleString('ru-RU')} ₽</span>
                    )}
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
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">🛠 Услуги (отметьте нужные)</h4>
            <div className="space-y-2">
              {serviceOptions.map(o => {
                const checked = services.has(o.id)
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleService(o.id)}
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
                            {o.price === 0 ? '0 ₽' : `+${o.price.toLocaleString('ru-RU')} ₽`}
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

          {/* Допы */}
          <div>
            <h4 className="font-bold text-[#163A5F] mb-2 text-sm">📦 Доп. оборудование (по желанию)</h4>
            <div className="space-y-2">
              {extraOptions.map(o => {
                const checked = extras.has(o.id)
                return (
                  <button
                    key={o.id}
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
              <div>ОФД: {ofd?.price === 0 ? 'подарок' : `${ofd?.price.toLocaleString('ru-RU') ?? 0} ₽`}</div>
              <div>Услуги: {selectedServices.reduce((s, o) => s + o.price, 0).toLocaleString('ru-RU')} ₽</div>
              <div>Допы: {selectedExtras.reduce((s, o) => s + o.price, 0).toLocaleString('ru-RU')} ₽</div>
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
