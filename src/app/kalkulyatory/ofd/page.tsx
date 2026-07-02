'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Check, ArrowRight, ArrowLeft, ShieldCheck, Clock, Zap } from 'lucide-react'
import { OFD_PROVIDERS } from '@/config/ofd'
import { Breadcrumbs } from '@/components/Breadcrumbs'

type Step = 1 | 2 | 3

interface ClientData {
  name: string
  phone: string
  email: string
  comment: string
}

export default function OfdCalculatorPage() {
  const [step, setStep] = useState<Step>(1)
  const [providerId, setProviderId] = useState<string>('')
  const [period, setPeriod] = useState<'15' | '36'>('15')
  const [clientData, setClientData] = useState<ClientData>({
    name: '', phone: '', email: '', comment: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const provider = OFD_PROVIDERS.find(p => p.id === providerId)
  const totalPrice = provider ? provider.periods[period].price : 0

  const isPhoneValid = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 10
  }

  const canSubmit = clientData.name.trim() !== '' && isPhoneValid(clientData.phone)

  const handleSubmit = async () => {
    if (!canSubmit || !provider) return
    setIsSubmitting(true)
    try {
      const orderNum = 'OFD-' + Date.now().toString().slice(-6)
      await fetch('/api/log-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNum,
          clientName: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          kkmType: '',
          kkmCondition: '',
          services: `ОФД: ${provider.shortName}, ${period} мес`,
          total: totalPrice,
          comment: clientData.comment || `Подключение ОФД ${provider.shortName} на ${period} месяцев`,
        }),
      })
      setIsDone(true)
    } catch (e) {
      setIsDone(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // === ГОТОВО ===
  if (isDone) {
    return (
      <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e8ecf2] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Breadcrumbs items={[{ label: 'Калькуляторы', href: '/kalkulyatory' }, { label: 'ОФД' }]} />
          <div className="mt-6 bg-white rounded-2xl border-2 border-green-200 shadow-lg p-8 sm:p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#163A5F] mb-3">
              Заявка отправлена!
            </h1>
            <p className="text-base text-slate-600 mb-6">
              Мы свяжемся с вами в течение 30 минут для подключения ОФД {provider?.shortName} на {period} месяцев.
            </p>
            <div className="bg-slate-50 rounded-xl p-5 mb-6 text-left">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500">Провайдер ОФД:</span>
                <span className="font-semibold text-[#163A5F]">{provider?.shortName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500">Срок:</span>
                <span className="font-semibold text-[#163A5F]">{period} месяцев</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Стоимость:</span>
                <span className="font-bold text-[#163A5F] text-lg">{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+78124659457" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors">
                <Phone className="w-5 h-5" /> Позвонить
              </a>
              <Link href="/kalkulyatory" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#163A5F]/20 text-[#163A5F] font-semibold rounded-xl hover:bg-[#163A5F] hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" /> К калькуляторам
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#f0f4f8] to-[#e8ecf2] min-h-screen">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-step { animation: fadeInUp 0.3s ease-out forwards; }
      `}</style>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Breadcrumbs items={[{ label: 'Калькуляторы', href: '/kalkulyatory' }, { label: 'ОФД' }]} />

        <h1 className="sr-only">Калькулятор ОФД — расчёт стоимости подключения оператора фискальных данных | Теллур-Интех</h1>

        {/* Прогресс-бар */}
        <div className="max-w-lg mx-auto mb-4 sm:mb-5 mt-2">
          <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
            <span className="font-semibold text-[#163A5F]">Шаг {step} из 3</span>
            <span className="text-slate-500">
              {step === 1 && 'Выбор провайдера'}
              {step === 2 && 'Срок подключения'}
              {step === 3 && 'Контакты'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-300 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0 ${step > s ? 'bg-[#163A5F] text-white' : step === s ? 'bg-[#F59E0B] text-white ring-4 ring-[#F59E0B]/20' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {idx < 2 && <div className={`flex-1 h-1 rounded-full mx-1 transition-colors duration-300 ${step > s ? 'bg-[#163A5F]' : 'bg-slate-200'}`} style={{ minWidth: '30px' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* === ШАГ 1: ВЫБОР ПРОВАЙДЕРА === */}
        {step === 1 && (
          <div className="animate-step">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#163A5F] mb-2">Выберите оператора ОФД</h2>
              <p className="text-sm text-slate-500 mb-5">Все провайдеры сертифицированы ФНС. Цены актуальны.</p>

              <div className="space-y-3">
                {OFD_PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setProviderId(p.id); setStep(2); }}
                    className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${providerId === p.id ? 'border-[#F59E0B] bg-amber-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#163A5F] text-base sm:text-lg">{p.shortName}</span>
                          {p.partner && <span className="px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-bold rounded-full">ПАРТНЁР</span>}
                        </div>
                        <p className="text-sm text-slate-500">от {p.periods['15'].price.toLocaleString('ru-RU')} ₽ / 15 мес</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400 mb-0.5">от</div>
                        <div className="text-xl font-bold text-[#163A5F]">{p.periods['15'].price.toLocaleString('ru-RU')} ₽</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="text-xs text-slate-600">Сертифицированы ФНС</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Clock className="w-5 h-5 text-[#F59E0B] shrink-0" />
                  <span className="text-xs text-slate-600">Подключение за 1 день</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="text-xs text-slate-600">Передача чеков в ФНС</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === ШАГ 2: ВЫБОР СРОКА === */}
        {step === 2 && provider && (
          <div className="animate-step">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#163A5F]">Выберите срок подключения</h2>
                <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-[#163A5F] flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Назад
                </button>
              </div>

              <div className="mb-5 p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-slate-500">Провайдер:</span>
                <span className="font-bold text-[#163A5F]">{provider.shortName}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {(['15', '36'] as const).map(p => {
                  const data = provider.periods[p]
                  const discount = Math.round((1 - data.price / data.originalPrice) * 100)
                  return (
                    <button
                      key={p}
                      onClick={() => { setPeriod(p); setStep(3); }}
                      className={`p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md text-left ${period === p ? 'border-[#F59E0B] bg-amber-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#163A5F] text-lg">{p} месяцев</span>
                        {discount > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">-{discount}%</span>}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[#163A5F]">{data.price.toLocaleString('ru-RU')} ₽</span>
                        {data.originalPrice > data.price && <span className="text-sm text-slate-400 line-through">{data.originalPrice.toLocaleString('ru-RU')} ₽</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {p === '15' ? 'Для маркировки, алкоголя, ОСН' : 'Для УСН, ПСН, услуг'}
                      </p>
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong className="text-[#163A5F]">Нужна помощь?</strong> Позвоните — поможем выбрать оптимальный срок под ваш бизнес.
                </p>
                <a href="tel:+78124659457" className="mt-2 inline-flex items-center gap-2 text-[#163A5F] font-semibold text-sm">
                  <Phone className="w-4 h-4" /> +7 (812) 465-94-57
                </a>
              </div>
            </div>
          </div>
        )}

        {/* === ШАГ 3: КОНТАКТЫ === */}
        {step === 3 && provider && (
          <div className="animate-step">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#163A5F]">Контактные данные</h2>
                <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-[#163A5F] flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Назад
                </button>
              </div>

              <div className="mb-5 p-4 bg-slate-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Провайдер:</span>
                  <span className="font-semibold text-[#163A5F]">{provider.shortName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Срок:</span>
                  <span className="font-semibold text-[#163A5F]">{period} месяцев</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Итого:</span>
                  <span className="font-bold text-[#163A5F] text-lg">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Ваше имя *</label>
                  <input
                    type="text"
                    value={clientData.name}
                    onChange={e => setClientData({ ...clientData, name: e.target.value })}
                    className="w-full h-12 px-4 text-sm border-2 border-slate-100 rounded-lg focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
                    placeholder="Иван Петров"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Телефон *</label>
                  <input
                    type="tel"
                    value={clientData.phone}
                    onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                    className="w-full h-12 px-4 text-sm border-2 border-slate-100 rounded-lg focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email (необязательно)</label>
                  <input
                    type="email"
                    value={clientData.email}
                    onChange={e => setClientData({ ...clientData, email: e.target.value })}
                    className="w-full h-12 px-4 text-sm border-2 border-slate-100 rounded-lg focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
                    placeholder="ivan@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Комментарий (необязательно)</label>
                  <textarea
                    value={clientData.comment}
                    onChange={e => setClientData({ ...clientData, comment: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-lg focus:outline-none focus:border-[#163A5F] focus:ring-2 focus:ring-[#163A5F]/10 transition-all resize-none"
                    placeholder="Дополнительная информация..."
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`w-full mt-5 py-4 text-base sm:text-lg font-bold rounded-xl transition-all ${canSubmit ? 'bg-[#F59E0B] hover:bg-[#D97706] hover:shadow-lg hover:shadow-[#F59E0B]/20 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {isSubmitting ? 'Отправка...' : `Отправить заявку — ${totalPrice.toLocaleString('ru-RU')} ₽`}
              </button>

              <p className="text-xs text-slate-400 text-center mt-3">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="/privacy" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">политикой конфиденциальности</a>
                {' '}и{' '}
                <a href="/oferta" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">офертой</a>.
                {' '}Мы перезвоним в течение 30 минут.
              </p>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 mb-2">Не знаете какой ОФД выбрать?</p>
          <a href="tel:+78124659457" className="inline-flex items-center gap-2 text-[#163A5F] font-semibold text-sm hover:underline">
            <Phone className="w-4 h-4" /> +7 (812) 465-94-57
          </a>
        </div>
      </div>
    </div>
  )
}
