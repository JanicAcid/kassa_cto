'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Phone, Loader2, Send } from 'lucide-react'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'

interface QuizStep {
  question: string
  subtitle?: string
  options: { label: string; value: string }[]
}

const STEPS: QuizStep[] = [
  {
    question: 'Укажите тип продукции, на которую нужна маркировка',
    subtitle: 'Шаг 1 из 6',
    options: [
      { label: 'Одежда', value: 'clothes' },
      { label: 'Обувь', value: 'shoes' },
      { label: 'Парфюмерия', value: 'perfume' },
      { label: 'Безалкогольные напитки / вода', value: 'water' },
      { label: 'Молочная продукция', value: 'milk' },
      { label: 'Табак', value: 'tobacco' },
      { label: 'Покрышки / шины', value: 'tires' },
      { label: 'Пиво и слабоалкогольные напитки', value: 'beer' },
      { label: 'Прочее', value: 'other' },
    ],
  },
  {
    question: 'Страна изготовления товара',
    subtitle: 'Шаг 2 из 6',
    options: [
      { label: 'Россия', value: 'ru' },
      { label: 'Страны таможенного союза (ЕАЭС)', value: 'eaeu' },
      { label: 'Китай', value: 'china' },
      { label: 'Индия', value: 'india' },
      { label: 'Турция', value: 'turkey' },
      { label: 'Европа', value: 'europe' },
      { label: 'Другая', value: 'other' },
    ],
  },
  {
    question: 'Когда требуется маркировка?',
    subtitle: 'Шаг 3 из 6',
    options: [
      { label: 'Ещё вчера — срочно', value: 'urgent' },
      { label: 'В течение недели', value: 'week' },
      { label: 'В течение месяца', value: 'month' },
      { label: 'В течение квартала или больше', value: 'quarter' },
    ],
  },
  {
    question: 'Вы первый раз маркируете товар?',
    subtitle: 'Шаг 4 из 6',
    options: [
      { label: 'Да, в первый раз — нужно всё под ключ', value: 'new' },
      { label: 'Нет, нужно сопровождение / домаркировка', value: 'existing' },
      { label: 'Другое', value: 'other' },
    ],
  },
  {
    question: 'Есть ли у вас касса с поддержкой ФФД 1.2?',
    subtitle: 'Шаг 5 из 6',
    options: [
      { label: 'Да, касса есть и поддерживает ФФД 1.2', value: 'yes' },
      { label: 'Касса есть, но не знаю про ФФД 1.2', value: 'unsure' },
      { label: 'Кассы нет — нужна новая', value: 'none' },
    ],
  },
  {
    question: 'Есть ли у вас ЭЦП (электронная подпись)?',
    subtitle: 'Шаг 6 из 6',
    options: [
      { label: 'Да, есть', value: 'yes' },
      { label: 'Нет, нужно оформить', value: 'no' },
      { label: 'Не знаю что это', value: 'unsure' },
    ],
  },
]

export function MarkingQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [`step${step}`]: value })
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !agreed) return

    setSending(true)
    try {
      const orderNum = `КВИЗ-${Date.now().toString().slice(-6)}`
      const answersText = STEPS.map((s, i) => {
        const ans = answers[`step${i}`]
        const opt = s.options.find(o => o.value === ans)
        return `${s.question}: ${opt?.label || '—'}`
      }).join('\n')

      await fetch('/api/log-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNum,
          clientName: name.trim(),
          phone: phone.trim(),
          kkmType: '',
          kkmCondition: '',
          services: ['Диагностика маркировки (квиз)'],
          total: 0,
          comment: `Промокод: ${PROMOCODE}. Ответы квиза:\n${answersText}`,
          subject: `Квиз маркировки: ${name.trim()} | ${phone.trim()}`,
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
        <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-emerald-800 mb-1">Заявка отправлена!</h3>
        <p className="text-sm text-emerald-700 mb-4">
          Спасибо, {name.trim()}! Специалист перезвонит вам по номеру {phone.trim()} в течение 15 минут.
          Подготовим план маркировки под ваш бизнес.
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

  // Финальный шаг — форма
  if (step === STEPS.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="font-bold text-[#163A5F] text-lg mb-1">Почти готово!</h3>
          <p className="text-sm text-slate-500">
            Заполните контактные данные и получите бесплатную консультацию + план маркировки под ключ
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ваше имя"
            autoComplete="name"
            required
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
            </span>
          </label>
        </form>
        <button
          onClick={() => setStep(STEPS.length - 1)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#163A5F] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Назад
        </button>
      </div>
    )
  }

  const currentStep = STEPS[step]
  const progress = ((step + 1) / (STEPS.length + 1)) * 100

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Прогресс-бар */}
      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full bg-[#F59E0B] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5 sm:p-6">
        {/* Заголовок */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-1">{currentStep.subtitle}</p>
          <h3 className="font-bold text-[#163A5F] text-base sm:text-lg leading-tight">
            {currentStep.question}
          </h3>
        </div>

        {/* Варианты ответов */}
        <div className="space-y-2">
          {currentStep.options.map(opt => {
            const isSelected = answers[`step${step}`] === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 ${
                  isSelected
                    ? 'border-[#F59E0B] bg-[#F59E0B]/5 text-[#163A5F] font-semibold'
                    : 'border-slate-100 hover:border-[#163A5F]/30 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#F59E0B] shrink-0" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Навигация */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
              step === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-[#163A5F]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Назад
          </button>
          <span className="text-xs text-slate-400">
            {step + 1} / {STEPS.length + 1}
          </span>
        </div>
      </div>
    </div>
  )
}
