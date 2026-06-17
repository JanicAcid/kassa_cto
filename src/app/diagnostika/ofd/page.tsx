import Link from 'next/link'
import { ArrowLeft, Wifi, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'

// ============================================================================
// Диагностика ОФД — Проверка статуса оператора фискальных данных (скоро)
// /diagnostika/ofd
// ============================================================================

export default function OfdDiagnostikaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Breadcrumbs items={[{ label: 'Диагностика', href: '/diagnostika' }, { label: 'Проверка ОФД' }]} />

      <div className="text-center mt-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#163A5F]/5 flex items-center justify-center">
          <Wifi className="w-10 h-10 text-[#163A5F]/40" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#163A5F] mb-3">
          Проверка статуса ОФД
        </h1>

        <p className="text-base sm:text-lg text-slate-500 mb-2">
          Инструмент находится в разработке
        </p>
        <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          Автоматическая проверка связи с оператором фискальных данных:
          получение и отправка чеков, статус договоров, история фискальных документов.
        </p>

        {/* Превью возможностей */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-8 text-left">
          <h2 className="text-sm font-bold text-[#163A5F] mb-3">Что будет проверять инструмент:</h2>
          <div className="space-y-2.5">
            {[
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />, text: 'Активность договора с ОФД' },
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />, text: 'Своевременность доставки чеков' },
              { icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />, text: 'Непереданные или ошибочные чеки' },
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />, text: 'Соответствие ФФД требованиям' },
              { icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />, text: 'Истекающий срок действия договора' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/diagnostika"
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#163A5F]/20 text-[#163A5F] text-sm font-semibold rounded-xl hover:bg-[#163A5F] hover:text-white hover:border-[#163A5F] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Все диагностики
          </Link>
          <a
            href="https://max.ru/u/f9LHodD0cOLz83AdDdqqOHf53_ZdGSiYyzbFb4HtjphM0C99jNiCW_lIrCo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-bold rounded-xl transition-colors"
          >
            <Clock className="w-4 h-4" />
            Проверить вручную
          </a>
        </div>
      </div>
    </div>
  )
}
