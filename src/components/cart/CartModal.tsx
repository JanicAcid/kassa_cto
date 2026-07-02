'use client'

// ============================================================================
// CartModal.tsx — модалка корзины: список, +/−, удаление, форма заказа
// ============================================================================

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Plus, Minus, Trash2, ShoppingCart, Phone, Send, Stethoscope, Calculator } from 'lucide-react'
import { useCart } from './CartContext'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'

export function CartModal() {
  const { items, isOpen, closeCart, updateQty, removeItem, totalCount, totalPrice, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })

  // блокировка скролла body когда модалка открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Esc — закрыть
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setSubmitting(true)

    // помечаем что промокод применён
    try {
      localStorage.setItem('promo_applied', '1')
    } catch {}

    // отправляем в CRM через api/log-order
    try {
      const orderNum = `КОРЗ-${Date.now().toString().slice(-6)}`
      const itemsList = items.map(i => i.name).join(', ')
      const servicesList = items.flatMap(i => i.services.map(s => s.name)).join(', ')
      const orderData = {
        orderNum,
        clientName: form.name,
        phone: form.phone,
        kkmType: itemsList,
        kkmCondition: '',
        services: [servicesList || 'Корзина'],
        total: totalPrice,
        comment: `Промокод: ${PROMOCODE}. Позиций: ${items.length}. ${items.map(i => `${i.name} (×${i.qty})`).join('; ')}`,
        subject: `Заказ из каталога: ${form.name} | ${form.phone}`,
      }

      // отправляем без await — если упадёт, всё равно покажем "спасибо"
      fetch('/api/log-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      }).catch(() => {})
    } catch {}

    await new Promise(r => setTimeout(r, 400))
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={closeCart}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#163A5F] text-lg">Корзина</h3>
              <p className="text-xs text-slate-500">{totalCount} {totalCount === 1 ? 'товар' : totalCount < 5 ? 'товара' : 'товаров'}</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            aria-label="Закрыть"
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          // === success ===
          <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#163A5F] mb-2">Заявка отправлена!</h3>
            <p className="text-slate-600 mb-2 max-w-md">
              Перезвоним в течение 15 минут в рабочее время. Назовите промокод{' '}
              <b className="text-amber-600 tracking-wider">{PROMOCODE}</b> менеджеру — спеццена.
            </p>
            <a
              href={CITY_PHONE_HREF}
              className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-xl"
            >
              <Phone className="w-4 h-4" />
              Или позвоните: {CITY_PHONE}
            </a>

            {/* Блок предложений после заявки */}
            <div className="mt-6 w-full max-w-md">
              <p className="text-xs text-slate-500 mb-3">Пока ждёте звонка — проверьте свою кассу:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  href="/diagnostika"
                  onClick={() => {
                    clearCart()
                    setSubmitted(false)
                    setForm({ name: '', phone: '' })
                    closeCart()
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-slate-200 hover:border-[#163A5F] hover:bg-[#163A5F]/5 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#163A5F] text-xs">Диагностика кассы</div>
                    <div className="text-[10px] text-slate-500 leading-tight">8 вопросов за 3 минуты</div>
                  </div>
                </Link>
                <Link
                  href="/kalkulyatory/markirovka"
                  onClick={() => {
                    clearCart()
                    setSubmitted(false)
                    setForm({ name: '', phone: '' })
                    closeCart()
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-slate-200 hover:border-[#163A5F] hover:bg-[#163A5F]/5 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#163A5F] text-xs">Калькулятор маркировки</div>
                    <div className="text-[10px] text-slate-500 leading-tight">Рассчитать стоимость</div>
                  </div>
                </Link>
              </div>
            </div>

            <button
              onClick={() => {
                clearCart()
                setSubmitted(false)
                setForm({ name: '', phone: '' })
                closeCart()
              }}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Закрыть и очистить корзину
            </button>
          </div>
        ) : items.length === 0 ? (
          // === empty ===
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <ShoppingCart className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-[#163A5F] mb-2">Корзина пуста</h3>
            <p className="text-slate-500 mb-4 max-w-md">
              Добавьте кассу кнопкой «В корзину» или соберите комплект «под ключ» через конфигуратор.
            </p>
            <button
              onClick={closeCart}
              className="px-5 py-2.5 bg-[#163A5F] hover:bg-[#1E4A78] text-white font-semibold rounded-xl"
            >
              К каталогу
            </button>
          </div>
        ) : (
          // === list + form ===
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 border border-slate-200 rounded-xl">
                  {/* image */}
                  <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#163A5F] text-sm truncate">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.fn && <span>ФН: {item.fn.name}. </span>}
                      {item.ofd && <span>ОФД: {item.ofd.name}. </span>}
                      {item.services.length > 0 && <span>Услуги: {item.services.length}. </span>}
                      {item.extras.length > 0 && <span>Допы: {item.extras.length}.</span>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label="Уменьшить"
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-semibold text-[#163A5F] min-w-[24px] text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label="Увеличить"
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#163A5F]">{(item.total * item.qty).toLocaleString('ru-RU')} ₽</div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1 mt-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-red-500 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Очистить корзину
              </button>
            </div>

            {/* form */}
            <div className="border-t border-slate-100 p-5 bg-slate-50">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-slate-600">Итого:</span>
                <span className="text-2xl font-bold text-[#163A5F]">{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Ваше имя"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="Телефон"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>Отправка...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Оформить заказ
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-400 text-center">
                  Перезвоним за 15 мин. Промокод <b className="text-amber-600">{PROMOCODE}</b> — спеццена.
                </p>
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    required
                    defaultChecked
                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20 shrink-0"
                  />
                  <span className="text-[10px] text-slate-500 leading-snug text-left">
                    Согласен с{' '}
                    <Link href="/privacy" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">политикой конфиденциальности</Link>
                    {' '}и{' '}
                    <Link href="/oferta" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">офертой</Link>
                  </span>
                </label>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
