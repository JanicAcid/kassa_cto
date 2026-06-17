'use client'

import { useState, useEffect } from 'react'

const CONSENT_KEY = 'tellur_consent'
const CONSENT_VERSION = 1

interface ConsentState {
  version: number
  analytics: boolean
  timestamp: number
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored) {
        const parsed: ConsentState = JSON.parse(stored)
        if (parsed.version === CONSENT_VERSION) {
          // Уже дали согласие — не показываем
          applyConsent(parsed.analytics)
          return
        }
      }
    } catch {}
    setVisible(true)
  }, [])

  function applyConsent(analyticsAllowed: boolean) {
    // Управляем Yandex Metrika
    if (typeof window !== 'undefined' && (window as any).ym) {
      try {
        if (analyticsAllowed) {
          ;(window as any).ym(108406091, 'init', {})
        }
      } catch {}
    }
  }

  function acceptAll() {
    const state: ConsentState = {
      version: CONSENT_VERSION,
      analytics: true,
      timestamp: Date.now(),
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
    applyConsent(true)
    setVisible(false)
  }

  function acceptSelected() {
    const state: ConsentState = {
      version: CONSENT_VERSION,
      analytics,
      timestamp: Date.now(),
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
    applyConsent(analytics)
    setVisible(false)
  }

  function rejectAll() {
    const state: ConsentState = {
      version: CONSENT_VERSION,
      analytics: false,
      timestamp: Date.now(),
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
    applyConsent(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-[#163A5F]/10 flex items-center justify-center mt-0.5">
              <svg className="w-4 h-4 text-[#163A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#163A5F] mb-1">
                Мы используем файлы cookie
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Мы используем файлы cookie для аналитики и улучшения работы сайта. Вы можете выбрать, какие cookie разрешить.{' '}
                <a href="/privacy" className="text-[#F59E0B] hover:underline font-medium">
                  Политика конфиденциальности
                </a>
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Необходимые</p>
                  <p className="text-[11px] text-slate-400">Для работы сайта. Не отключаются.</p>
                </div>
                <div className="w-9 h-5 bg-[#163A5F] rounded-full flex items-center px-0.5">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Аналитические</p>
                  <p className="text-[11px] text-slate-400">Яндекс.Метрика — как пользуются сайтом.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalytics(!analytics)}
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${analytics ? 'bg-[#163A5F]' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${analytics ? 'ml-auto' : ''}`} />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className="px-5 py-2.5 bg-[#163A5F] hover:bg-[#1E4A78] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Принять все
            </button>
            <button
              type="button"
              onClick={acceptSelected}
              className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Принять выбранные
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-500 text-xs font-medium rounded-xl transition-colors"
            >
              Только необходимые
            </button>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="sm:ml-auto text-xs text-[#F59E0B] hover:underline font-medium"
            >
              {showDetails ? 'Скрыть' : 'Настроить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
