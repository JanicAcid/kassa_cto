// ============================================================================
// FloatingFeedback — плавающая форма обратной связи на ВСЕХ страницах
// Заметная (пульсирующая), но не мешает просмотру
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { Phone, X, Send, Loader2, CheckCircle, MessageSquareText } from 'lucide-react'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'

export function FloatingFeedback() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Показать подсказку через 5 секунд
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 5000)
    const hideTimer = setTimeout(() => setShowHint(false), 12000)
    return () => { clearTimeout(timer); clearTimeout(hideTimer) }
  }, [])

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

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
          services: ['Обратный звонок (плавающая форма)'],
          total: 0,
          comment: `Промокод: ${PROMOCODE}. Запрос с плавающей формы.`,
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

  return (
    <div className="fixed bottom-44 sm:bottom-40 left-4 sm:left-6 z-40 flex flex-col items-start gap-2.5">
      {/* Popup с формой */}
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-[#163A5F]/20 overflow-hidden transition-all duration-300 origin-bottom-left ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 w-[calc(100vw-2rem)] sm:w-80'
            : 'opacity-0 translate-y-4 scale-90 pointer-events-none w-0'
        }`}
        style={{ boxShadow: isOpen ? '0 25px 60px -12px rgba(22,58,95,0.3)' : undefined }}
      >
        {sent ? (
          /* Экран успеха */
          <div className="p-5 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-800 mb-1">Заявка отправлена!</p>
            <p className="text-xs text-emerald-600 mb-3">
              Перезвоним вам в течение 15 минут.
            </p>
            <button
              onClick={() => { setSent(false); setIsOpen(false); setName(''); setPhone(''); setAgreed(false) }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Закрыть
            </button>
          </div>
        ) : (
          /* Форма */
          <div>
            {/* Header */}
            <div className="bg-[#163A5F] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-white text-sm font-bold">Обратный звонок</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Закрыть">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-2.5">
              <p className="text-[11px] text-slate-500 mb-1">Перезвоним за 15 минут. Бесплатно.</p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
                autoComplete="name"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
              />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                autoComplete="tel"
                inputMode="tel"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
              />
              <button
                type="submit"
                disabled={!name.trim() || !phone.trim() || !agreed || sending}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  name.trim() && phone.trim() && agreed && !sending
                    ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Отправляем...</>
                ) : (
                  <><Send className="w-4 h-4" /> Получить консультацию</>
                )}
              </button>
              <label className="flex items-start gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-[#163A5F] focus:ring-[#163A5F]/20 shrink-0"
                  required
                />
                <span className="text-[10px] text-slate-500 leading-snug">
                  Согласен с{' '}
                  <a href="/privacy" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">конфиденциальностью</a>
                  {' '}и{' '}
                  <a href="/oferta" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">офертой</a>
                </span>
              </label>
            </form>
          </div>
        )}
      </div>

      {/* Подсказка-стрелка (показывается через 5 сек) */}
      {showHint && !isOpen && (
        <div className="bg-white rounded-xl shadow-lg border border-[#F59E0B]/30 px-3 py-2 animate-pulse">
          <p className="text-xs font-medium text-[#163A5F] whitespace-nowrap">
            Оставьте заявку →
          </p>
        </div>
      )}

      {/* Главная кнопка — пульсирующая */}
      <button
        onClick={() => { setIsOpen(v => !v); setShowHint(false) }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#F59E0B' }}
        aria-label={isOpen ? 'Закрыть форму' : 'Оставить заявку'}
        aria-expanded={isOpen}
      >
        {/* Пульсирующее кольцо */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#F59E0B] animate-ping opacity-30" />
        )}
        {isOpen ? (
          <X className="w-6 h-6 text-white relative z-10" />
        ) : (
          <MessageSquareText className="w-6 h-6 text-white relative z-10" />
        )}
      </button>
    </div>
  )
}
