'use client'

// ============================================================================
// PromoCodeNotifier.tsx — глобальный клиентский компонент в layout.tsx
// ----------------------------------------------------------------------------
// Перехват кликов по a[href^="tel:"] → toast с промокодом САЙТ
// (только при звонке — когда клиент сам звонит)
// При отправке форм промокод НЕ показываем (менеджер сам перезвонит)
// ============================================================================

import { useEffect, useState } from 'react'
import { X, Tag } from 'lucide-react'
import { PROMOCODE } from '@/config/promocode'

export function PromoCodeNotifier() {
  const [toast, setToast] = useState<null | { phone?: string }>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const showToast = (data: { phone?: string }) => {
      setToast(data)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setToast(null), 8000)
    }

    // === Перехват кликов по tel: (когда клиент звонит) ===
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="tel:"]') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href') || ''
      const phone = href.replace('tel:', '')

      // помечаем что промокод показан
      try { localStorage.setItem('promo_applied', '1') } catch {}

      showToast({ phone })
    }

    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      if (timer) clearTimeout(timer)
    }
  }, [])

  if (!toast) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-300 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Tag className="w-4 h-4" />
            Промокод для спеццены
          </div>
          <button
            onClick={() => setToast(null)}
            aria-label="Закрыть"
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-600 mb-2">
            Вы позвонили{toast.phone ? ` на ${toast.phone}` : ''}. Назовите менеджеру промокод:
          </p>
          <div className="text-3xl font-bold text-amber-600 tracking-[0.2em] text-center py-2 bg-amber-50 rounded-xl">
            {PROMOCODE}
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Получите спеццену как на сайте. Перезвоним за 15 мин если занято.
          </p>
        </div>
      </div>
    </div>
  )
}
