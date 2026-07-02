// ============================================================================
// FloatingContact — плавающая кнопка связи на всех страницах (включая SEO)
// 2 канала: Телефон + MAX. БЕЗ Telegram, БЕЗ WhatsApp.
// Правильная иконка MaxIcon (оригинальный логотип maxicons.ru).
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { Phone, X, MessageCircle } from 'lucide-react'
import { MaxIcon } from '@/components/MaxIcon'
import {
  MOBILE_PHONE,
  MOBILE_PHONE_HREF,
  MAX_PROFILE_URL,
} from '@/config/contacts'

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false)

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <div className="hidden sm:flex fixed bottom-40 right-6 z-40 flex-col items-end gap-2.5">
      {/* Popup с 2 каналами */}
      <div
        className={`flex flex-col gap-2 transition-all duration-200 origin-bottom-right ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
        }`}
      >
        {/* Телефон */}
        <a
          href={MOBILE_PHONE_HREF}
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-slate-900 hover:scale-[1.03] active:scale-95 no-underline min-w-[210px]"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">Позвонить</p>
            <p className="text-xs text-slate-500 truncate">{MOBILE_PHONE}</p>
          </div>
        </a>

        {/* MAX — оригинальная иконка maxicons.ru */}
        <a
          href={MAX_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-slate-900 hover:scale-[1.03] active:scale-95 no-underline min-w-[210px]"
        >
          <div className="w-10 h-10 rounded-full bg-[#163A5F] flex items-center justify-center shrink-0">
            <MaxIcon size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">MAX</p>
            <p className="text-xs text-slate-500 truncate">Написать в чат</p>
          </div>
        </a>
      </div>

      {/* Главная круглая кнопка */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ backgroundColor: isOpen ? '#64748b' : '#163A5F' }}
        aria-label={isOpen ? 'Закрыть контакты' : 'Связаться с нами'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  )
}
