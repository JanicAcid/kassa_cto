// ============================================================================
// FloatingFeedback — модальное окно обратной связи
// Открывается из шапки сайта (Navbar) — мигающая кнопка
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2, CheckCircle, MessageSquareText, X } from 'lucide-react'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'

export function FloatingFeedback({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [agreed, setAgreed] = useState(false)

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  // Сброс при закрытии
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setSent(false)
        setName('')
        setPhone('')
        setAgreed(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

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
          services: ['Обратный звонок (из шапки)'],
          total: 0,
          comment: `Промокод: ${PROMOCODE}. Запрос обратного звонка из шапки сайта.`,
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Затемнённый фон */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Модальное окно с формой */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'fadeInScale 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="bg-[#163A5F] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
              <MessageSquareText className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">Обратный звонок</h3>
              <p className="text-white/60 text-xs">Перезвоним за 15 минут</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Body */}
        {sent ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-emerald-800 mb-1">Заявка отправлена!</h4>
            <p className="text-sm text-emerald-600 mb-4">
              Спасибо, {name.trim()}! Мы перезвоним вам по номеру {phone.trim()} в течение 15 минут.
            </p>
            <a
              href={CITY_PHONE_HREF}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-bold rounded-xl transition-colors"
            >
              Позвонить сейчас: {CITY_PHONE}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя"
              autoComplete="name"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
            />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              autoComplete="tel"
              inputMode="tel"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
            />
            <button
              type="submit"
              disabled={!name.trim() || !phone.trim() || !agreed || sending}
              className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                name.trim() && phone.trim() && agreed && !sending
                  ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-lg shadow-[#F59E0B]/25'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Отправляем...</>
              ) : (
                <><Send className="w-4 h-4" /> Получить консультацию</>
              )}
            </button>
            <label className="flex items-start gap-2 cursor-pointer">
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
        )}
      </div>
    </div>
  )
}
