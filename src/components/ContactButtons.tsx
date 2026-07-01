// ============================================================================
// ContactButtons — 2 канала связи: Телефон, Max
// Telegram убран по требованию пользователя
// ============================================================================

'use client'

import { Phone } from 'lucide-react'
import {
  MOBILE_PHONE,
  MOBILE_PHONE_HREF,
  MAX_PROFILE_URL,
  TELEGRAM_CHAT_URL,
} from '@/config/contacts'
import { MaxIcon } from '@/components/MaxIcon'

// Реэкспорт для обратной совместимости
export { MOBILE_PHONE, MOBILE_PHONE_HREF, MAX_PROFILE_URL, TELEGRAM_CHAT_URL }

interface ContactButtonsProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function ContactButtons({ variant = 'full', className = '' }: ContactButtonsProps) {
  const contacts = [
    {
      href: MOBILE_PHONE_HREF,
      icon: <Phone className="w-5 h-5" />,
      label: 'Телефон',
      short: MOBILE_PHONE,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      external: false,
    },
    {
      href: MAX_PROFILE_URL,
      icon: <MaxIcon size={20} />,
      label: 'Max',
      short: 'Написать в Max',
      color: 'bg-blue-500 hover:bg-blue-600',
      external: true,
    },
  ]

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        {contacts.map(c => (
          <a
            key={c.label}
            href={c.href}
            {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#163A5F] hover:text-[#F59E0B] transition-colors"
          >
            {c.icon}
            {c.short}
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${className}`}>
      {contacts.map(c => (
        <a
          key={c.label}
          href={c.href}
          {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={`flex flex-col items-center gap-2 ${c.color} text-white rounded-xl p-3 sm:p-4 transition-colors shadow-sm hover:shadow-md`}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            {c.icon}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{c.label}</span>
        </a>
      ))}
    </div>
  )
}
