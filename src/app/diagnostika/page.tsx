import type { Metadata } from 'next'
import { MarkingQuiz } from '@/components/MarkingQuiz'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'
import { Phone, CheckCircle2, Clock, ShieldCheck } from 'lucide-react'
import { SITE_URL } from '@/config/site'

export const metadata: Metadata = {
  title: 'Что такое маркировка — бесплатная диагностика и настройка в СПб | Теллур-Интех',
  description: 'Что такое маркировка товаров? Как настроить маркировку на кассе? Бесплатная диагностика за 6 вопросов — получите план внедрения маркировки под ключ в СПб. Честный ЗНАК, ЭДО, ТС ПИоТ, ФФД 1.2. ЦТО с 1995 года.',
  alternates: { canonical: '/diagnostika' },
  keywords: ['что такое маркировка', 'как настроить маркировку', 'диагностика маркировки', 'проверка маркировки', 'проверить кассу маркировка', 'аудит маркировки', 'диагностика кассы спб', 'готовность к маркировке', 'план внедрения маркировки', 'настройка маркировки спб', 'маркировка товаров спб', 'честный знак настройка', 'как работает маркировка', 'маркировка для ип', 'маркировка для ооо', 'маркировка как подключить', 'маркировка с чего начать', 'маркировка пошагово', 'маркировка под ключ спб', 'фнд 1.2 настройка', 'тс пиот настройка', 'эдо для маркировки'],
  openGraph: {
    title: 'Что такое маркировка — бесплатная диагностика и настройка в СПб',
    description: 'Бесплатная диагностика маркировки за 6 вопросов. План внедрения под ключ. Честный ЗНАК, ЭДО, ТС ПИоТ, ФФД 1.2. СПб и ЛО.',
    url: `${SITE_URL}/diagnostika`,
    type: 'website',
  },
}

export default function DiagnostikaPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumbs items={[
        { label: 'Главная', href: '/' },
        { label: 'Диагностика маркировки' },
      ]} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#163A5F] to-[#1E4A78] rounded-2xl p-6 sm:p-8 text-white mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Бесплатная диагностика маркировки
        </h1>
        <p className="text-white/80 text-sm sm:text-base mb-4">
          Ответьте на 6 вопросов — получите бесплатную консультацию и план
          внедрения маркировки под ключ. Перезвоним за 15 минут.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm text-white/90">
            <CheckCircle2 className="w-5 h-5 text-[#F59E0B] shrink-0" />
            Бесплатный аудит
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <ShieldCheck className="w-5 h-5 text-[#F59E0B] shrink-0" />
            План под ключ
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Clock className="w-5 h-5 text-[#F59E0B] shrink-0" />
            Перезвоним за 15 мин
          </div>
        </div>
      </div>

      {/* Квиз */}
      <MarkingQuiz />

      {/* Дополнительно */}
      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-5">
          <h3 className="font-bold text-[#163A5F] mb-2">Что вы получите</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>✅ Бесплатный аудит ваших процессов</li>
            <li>✅ План внедрения маркировки под ключ</li>
            <li>✅ Индивидуальные рекомендации</li>
            <li>✅ Расчёт стоимости (касса + ФН + ОФД + настройка)</li>
            <li>✅ Промокод САЙТ — спеццена</li>
          </ul>
        </div>
        <div className="bg-slate-50 rounded-xl p-5">
          <h3 className="font-bold text-[#163A5F] mb-2">Для кого</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>✅ Производители и импортёры</li>
            <li>✅ Оптовики и дистрибьюторы</li>
            <li>✅ Розничные магазины</li>
            <li>✅ Онлайн-магазины и маркетплейсы</li>
            <li>✅ Все категории маркированных товаров</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 mb-3">Предпочитаете позвонить?</p>
        <a
          href={CITY_PHONE_HREF}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#163A5F] hover:bg-[#1E4A78] text-white font-bold rounded-xl transition-colors"
        >
          <Phone className="w-4 h-4" />
          {CITY_PHONE}
        </a>
      </div>
    </main>
  )
}
