'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Phone, ArrowRight, Clock, ShieldCheck,
  Monitor, Tag, ChevronRight, FileText, HelpCircle,
  CheckCircle, Star, Building2, Users, Wrench, Footprints, Package, QrCode, Shirt, Store, Settings, LayoutGrid, X
} from 'lucide-react'
import { CITY_PHONE_HREF, MAX_PROFILE_URL } from '@/config/contacts'
import { PROMOCODE } from '@/config/promocode'
import { ProductsPreview } from '@/components/ProductsPreview'
import { MaxIcon } from '@/components/MaxIcon'

// ============================================================================
// ГЛАВНАЯ — Центр поддержки пользователей ККТ
// Server Component (no 'use client')
// ============================================================================

const CALCULATORS = [
  {
    title: 'Калькулятор маркировки',
    desc: 'Расчёт стоимости подключения маркировки товаров: Честный ЗНАК, ТС ПИоТ, ЭДО, ОФД, регистрация ККТ.',
    href: '/kalkulyatory/markirovka',
    active: true,
    price: 'от 2 000 ₽',
  },
  {
    title: 'Калькулятор 1С',
    desc: 'Расчёт стоимости интеграции кассового оборудования с программами 1С: Предприятие.',
    href: '/kalkulyatory/1c',
    active: false,
    price: '',
  },
  {
    title: 'Расчёт ОФД',
    desc: 'Сравнение тарифов операторов фискальных данных: ТАКСКОМ, Контур, СБИС, Эвотор.',
    href: '/kalkulyatory/ofd',
    active: false,
    price: '',
  },
]

const STATS = [
  { value: 'С 1995 года', label: '30+ лет опыта' },
  { value: '5 000+', label: 'касс настроено' },
  { value: '3 000+', label: 'клиентов' },
  { value: '1–3 дня', label: 'срок подключения' },
]

const SERVICES = [
  {
    icon: <Tag className="w-6 h-6" />,
    title: 'Подключение маркировки',
    desc: 'Комплексная настройка: ЭДО, Честный ЗНАК, ТС ПИоТ, ККТ, ОФД — все 6 систем связаны.',
    href: '/kalkulyatory/markirovka',
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: 'Настройка кассы для маркировки',
    desc: 'Под ключ за 1 день. Меркурий, Атол, Эвотор, Штрих-М. ФФД 1.2, Честный ЗНАК, ТС ПИоТ.',
    href: '/nastroyka-kassy-markirovka',
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: 'Подключение Честного ЗНАК',
    desc: 'Регистрация в системе маркировки, настройка товарных групп, подпись соглашения с ЦРПТ.',
    href: '/podklyuchenie-chestnyy-znak',
  },
  {
    icon: <Store className="w-6 h-6" />,
    title: 'Какую кассу выбрать',
    desc: 'Обзор моделей Атол, Эвотор, Меркурий, Штрих-М. Подбор по типу бизнеса и бюджету.',
    href: '/kakuyu-kassu-dlya-markirovki',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Что такое маркировка товаров?',
    a: 'Система прослеживаемости, при которой каждая единица получает уникальный код Data Matrix. Код заносится в «Честный ЗНАК» и считывается кассой при продаже.',
  },
  {
    q: 'Сколько стоит подключение маркировки?',
    a: 'Частичная настройка — от 1 500 ₽, полная под ключ — от 6 000 ₽. Точная стоимость зависит от типа кассы и набора услуг. Рассчитайте бесплатно в калькуляторе.',
  },
  {
    q: 'Какие кассы подходят для маркировки?',
    a: 'Любая касса с поддержкой ФФД 1.2: Меркурий, Атол, Сигма, Эвотор, Штрих-М, Пионер, AQSI. Если касса старая — обновим прошивку.',
  },
]

const ARTICLES = [
  {
    title: 'Как подключить кабинет Честный ЗНАК',
    slug: 'kak-podklyuchit-kabinet-chestnyznak',
    category: 'Честный ЗНАК',
    readingTime: 12,
  },
  {
    title: 'Какую кассу выбрать для маркировки',
    href: '/kakuyu-kassu-dlya-markirovki',
    category: 'Кассы',
    readingTime: 10,
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showPromoModal, setShowPromoModal] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* CSS-only fade-in-up animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .anim-delay-1 { animation-delay: 0.1s; }
        .anim-delay-2 { animation-delay: 0.2s; }
        .anim-delay-3 { animation-delay: 0.3s; }
        .anim-delay-4 { animation-delay: 0.4s; }
        .anim-delay-5 { animation-delay: 0.5s; }
        .anim-delay-6 { animation-delay: 0.6s; }
      `}</style>

      {/* ================================================================== */}
      {/* HERO SECTION — обновлён по новой визуальной системе            */}
      {/* ================================================================== */}
      <section className="relative bg-gradient-to-br from-[#163A5F] via-[#1E4A78] to-[#163A5F] overflow-hidden">
        {/* Decorative elements — сдержанные, без ярких градиентов */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F59E0B]/8 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-[80px] text-center">
          <div className="anim-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs sm:text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 text-[#F59E0B]" />
              Центр технического обслуживания кассового оборудования
            </span>
          </div>

          <h1 className="anim-fade-in-up anim-delay-1 text-[32px] sm:text-[40px] md:text-[48px] font-bold text-white leading-[1.1] mb-5 sm:mb-6 tracking-tight">
            Поддержка пользователей ККТ
          </h1>

          <p className="anim-fade-in-up anim-delay-2 text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Центр технического обслуживания кассового оборудования&nbsp;— ООО&nbsp;«Теллур-Интех»
          </p>

          <div className="anim-fade-in-up anim-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="tel:+78124659457"
              onClick={(e) => {
                // На ПК открываем модалку с промокодом, на мобиле — звонилка
                if (window.innerWidth >= 768) {
                  e.preventDefault()
                  setShowPromoModal(true)
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 bg-[#F59E0B] hover:bg-[#D97706] text-white text-base sm:text-lg font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#F59E0B]/25 hover:shadow-xl hover:shadow-[#F59E0B]/35 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Phone className="w-5 h-5" />
              Позвонить
            </a>
            <Link
              href="/katalog-kass"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 bg-white/15 hover:bg-white/25 text-white text-base sm:text-lg font-medium rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30"
            >
              <LayoutGrid className="w-5 h-5" />
              Каталог
            </Link>
            <a
              href={MAX_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white text-base sm:text-lg font-medium rounded-xl transition-all duration-200 border border-white/15 hover:border-white/25"
            >
              <MaxIcon size={20} />
              Написать в Max
            </a>
          </div>

          {/* Доверительный блок — цифры под CTA */}
          <div className="anim-fade-in-up anim-delay-4 mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {STATS.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white leading-none tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/60 mt-2 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider — сдержанный */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ================================================================== */}
      {/* QUICK CALCULATOR CARDS */}
      {/* ================================================================== */}
      <ProductsPreview
        title="Каталог"
        subtitle="Продаём кассы с установкой под ключ: ФН, ОФД, регистрация в ФНС, настройка маркировки. Все модели в наличии, есть доставка."
      />

      {/* ================================================================== */}
      {/* SERVICES PREVIEW */}
      {/* ================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#163A5F]">
            Наши услуги
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Полный спектр услуг по обслуживанию кассового оборудования
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {SERVICES.map((service, idx) => (
            <Link
              key={idx}
              href={service.href}
              className="group bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 transition-all duration-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-[3px] hover:border-[#163A5F]/20"
            >
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#DBEAFE] flex items-center justify-center text-[#163A5F] shrink-0 group-hover:bg-[#163A5F] group-hover:text-white transition-colors duration-200">
                  {service.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#163A5F] leading-snug group-hover:text-[#F59E0B] transition-colors duration-200">
                    {service.title}
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 group-hover:text-[#163A5F] group-hover:translate-x-1 transition-all duration-200 ml-auto" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {service.desc}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/katalog-kass"
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#163A5F]/20 text-[#163A5F] text-sm font-semibold rounded-xl hover:bg-[#163A5F] hover:text-white hover:border-[#163A5F] transition-all"
          >
            Каталог
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/* МАРКИРОВКА ПО КАТЕГОРИЯМ */}
      {/* ================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#163A5F]">
            Маркировка по категориям товаров
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Подробные инструкции, требования и стоимость подключения для каждой категории
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {[
            { href: '/markirovka-odezhdy', icon: <Shirt className="w-6 h-6" />, title: 'Маркировка одежды', desc: 'Обязательна с 2021 года. Data Matrix коды на все товары лёгкой промышленности.' },
            { href: '/markirovka-obuvi', icon: <Footprints className="w-6 h-6" />, title: 'Маркировка обуви', desc: 'Обязательна с 2020 года. Коды на каждую пару, сканирование при продаже.' },
            { href: '/markirovka-tabaka', icon: <Package className="w-6 h-6" />, title: 'Маркировка табака', desc: 'Обязательна с 2019 года. Одна из первых категорий, ФН на 36 месяцев.' },
          ].map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 hover:shadow-md hover:border-[#F59E0B]/40 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] mb-3 group-hover:bg-[#F59E0B] group-hover:text-white transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-base font-bold text-[#163A5F] leading-snug mb-2 group-hover:text-[#F59E0B] transition-colors">
                {cat.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{cat.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#F59E0B] mt-3 group-hover:gap-2 transition-all">
                Подробнее <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* FAQ + USEFUL SECTION */}
      {/* ================================================================== */}
      <section className="bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {/* FAQ */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <HelpCircle className="w-5 h-5 text-[#F59E0B]" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#163A5F]">
                  Частые вопросы
                </h2>
              </div>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaq === idx
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50/50 transition-colors w-full text-left"
                      >
                        <h3 className="text-sm font-semibold text-[#163A5F] pr-4 leading-snug">{item.q}</h3>
                        <ChevronRight className={`w-4 h-4 text-slate-300 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3.5">
                          <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <Link
                href="/faq"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors"
              >
                Все вопросы <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Useful */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#163A5F]">
                  Полезное
                </h2>
              </div>
              {ARTICLES.length > 0 ? (
                <div className="space-y-3">
                  {ARTICLES.map((article, idx) => (
                    <Link
                      key={idx}
                      href={article.href || `/instructions/${article.slug}`}
                      className="group block bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-[#163A5F]/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#163A5F] to-[#1E4A78] flex items-center justify-center text-white shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#163A5F] group-hover:text-[#F59E0B] transition-colors leading-snug">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-slate-400">{article.category}</span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-400">{article.readingTime} мин чтения</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-100 p-6 text-center">
                  <p className="text-sm text-slate-400">Статьи скоро появятся</p>
                </div>
              )}
              <Link
                href="/instructions"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors"
              >
                База знаний <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA BOTTOM */}
      {/* ================================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="bg-gradient-to-br from-[#163A5F] to-[#1E4A78] rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#F59E0B]/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

          <div className="relative">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3">
              Нужна помощь?
            </h2>
            <p className="text-white/70 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
              Позвоните или напишите нам — поможем с кассой, ответим на вопросы, подберём решение
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
              <a
                href="tel:+78124659457"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#F59E0B]/25"
              >
                <Phone className="w-5 h-5" />
                +7 (812) 465-94-57
              </a>
              <a
                href="tel:+78123210606"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white font-medium rounded-xl transition-colors border border-white/15"
              >
                <Phone className="w-5 h-5" />
                +7 (812) 321-06-06
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={MAX_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  <MaxIcon size={20} />
                  Max
                </a>
              </div>
              <a
                href="mailto:push@tellur.spb.ru"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                push@tellur.spb.ru
              </a>
          </div>
        </div>
      </section>

      {/* Модалка промокода при клике «Позвонить» на ПК */}
      {showPromoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <Tag className="w-4 h-4" />
                Спеццена по промокоду
              </div>
              <button
                onClick={() => setShowPromoModal(false)}
                aria-label="Закрыть"
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-slate-600 mb-3">
                Цены на сайте — спецусловия. Чтобы менеджер их учёл, назовите промокод:
              </p>
              <div className="text-4xl font-extrabold text-amber-600 tracking-[0.25em] py-3 bg-amber-50 rounded-xl border-2 border-amber-200 mb-4">
                {PROMOCODE}
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Промокод действует при звонке с сайта. Назовите его менеджеру — примените спеццену как на сайте.
              </p>
              <a
                href={CITY_PHONE_HREF}
                onClick={() => setShowPromoModal(false)}
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" />
                Позвонить: +7 (812) 465-94-57
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
