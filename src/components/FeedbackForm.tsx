// ============================================================================
// FeedbackForm — компактная форма обратной связи
// Встраивается в CTA-блоки на всех страницах
// Ссылки на оферту и конфиденциальность обязательны
// ============================================================================

'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle, Phone } from 'lucide-react'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'

export function FeedbackForm({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !agreed) return

    setSending(true)
    try {
      const orderNum = `ОБРАТ-${Date.now().toString().slice(-6)}`
      await fetch('/api/log-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNum,
          clientName: name.trim(),
          phone: phone.trim(),
          kkmType: '',
          kkmCondition: '',
          services: ['Обратный звонок'],
          total: 0,
          comment: `Промокод: ${PROMOCODE}. Запрос обратного звонка с сайта.`,
          subject: `Обратный звонок: ${name.trim()} | ${phone.trim()}`,
        }),
      }).catch(() => {})
      setSent(true)
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-emerald-800 mb-1">Заявка отправлена!</h3>
        <p className="text-sm text-emerald-700 mb-4">
          Спасибо, {name.trim()}! Мы перезвоним вам по номеру {phone.trim()} в течение 15 минут.
        </p>
        <a
          href={CITY_PHONE_HREF}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Phone className="w-4 h-4" />
          Позвонить сейчас: {CITY_PHONE}
        </a>
      </div>
    )
  }

  const isCompact = variant === 'compact'

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isCompact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'}`}>
      <div className="mb-4">
        <h3 className={`font-bold text-[#163A5F] mb-1 ${isCompact ? 'text-base' : 'text-lg'}`}>
          Обратный звонок
        </h3>
        <p className="text-xs text-slate-500">Перезвоним за 15 минут. Бесплатная консультация.</p>
      </div>

      <div className={`grid gap-3 mb-3 ${isCompact ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ваше имя"
          autoComplete="name"
          required
          className="px-4 py-3 rounded-xl border-2 border-slate-100 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
        />
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+7 (999) 123-45-67"
          autoComplete="tel"
          inputMode="tel"
          required
          className="px-4 py-3 rounded-xl border-2 border-slate-100 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={!name.trim() || !phone.trim() || !agreed || sending}
        className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
          name.trim() && phone.trim() && agreed && !sending
            ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-lg shadow-[#F59E0B]/25'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Отправляем...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Получить консультацию
          </>
        )}
      </button>

      {/* Чекбокс согласия + ссылки на оферту и конфиденциальность */}
      <label className="flex items-start gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#163A5F] focus:ring-[#163A5F]/20 shrink-0"
          required
        />
        <span className="text-[11px] text-slate-500 leading-snug">
          Я согласен с{' '}
          <a href="/privacy" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">
            политикой конфиденциальности
          </a>{' '}
          и{' '}
          <a href="/oferta" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">
            условиями оферты
          </a>
          . Нажимая кнопку, вы даёте согласие на обработку персональных данных.
        </span>
      </label>
    </form>
  )
}
