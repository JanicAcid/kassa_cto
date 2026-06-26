// ============================================================================
// ГЛОБАЛЬНЫЙ NAVBAR — обновлённый по новой визуальной системе
// Высота 72px, font 15px, hover opacity, бренд #163A5F, телефон как CTA
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, Menu, X, ChevronRight } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Главная', href: '/' },
  { label: 'Каталог', href: '/katalog-kass' },
  { label: 'Калькуляторы', href: '/kalkulyatory' },
  { label: 'Услуги', href: '/services' },
  { label: 'База знаний', href: '/instructions' },
  { label: 'Контакты', href: '/contacts' },
]

const MAIN_PHONE = '+7 (812) 465-94-57'
const MAIN_PHONE_HREF = 'tel:+78124659457'

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}
        style={{ borderBottom: '1px solid rgba(22,58,95,0.08)' }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Высота 72px на десктопе, 56px на мобильном */}
          <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto] items-center h-14 lg:h-[72px] gap-4">

            {/* Логотип — с воздухом слева */}
            <Link href="/" className="flex items-center gap-2.5" aria-label="Теллур-Интех — на главную">
              <Image src="/logo.webp" alt="Теллур-Интех" width={88} height={72} className="h-9 lg:h-11 w-auto" quality={100} />
              <div className="flex flex-col min-w-0">
                <span className="text-sm lg:text-base font-bold text-[#163A5F] leading-tight tracking-tight">
                  Теллур-Интех
                </span>
                <span className="text-[9px] lg:text-[10px] text-slate-500 leading-tight">
                  Поддержка пользователей ККТ
                </span>
              </div>
            </Link>

            {/* Десктоп: меню по центру */}
            <nav className="hidden lg:flex items-center gap-1 justify-center" aria-label="Основная навигация">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-[15px] font-medium transition-opacity duration-200 ${
                    isActive(item.href)
                      ? 'text-[#163A5F] font-semibold bg-[#163A5F]/8'
                      : 'text-slate-600 hover:opacity-80 hover:text-[#163A5F]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Телефон CTA + гамбургер */}
            <div className="flex items-center gap-2 justify-self-end">
              <a
                href={MAIN_PHONE_HREF}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#163A5F] hover:bg-[#1E4A78] text-white text-[14px] font-semibold rounded-lg transition-all duration-200"
              >
                <Phone className="w-4 h-4" />
                {MAIN_PHONE}
              </a>

              {/* Мобильный: иконка телефона (большая, 48px) */}
              <a
                href={MAIN_PHONE_HREF}
                className="sm:hidden inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#163A5F] hover:bg-[#1E4A78] text-white transition-colors shadow-md"
                aria-label="Позвонить"
              >
                <Phone className="w-5 h-5" />
              </a>

              {/* Гамбургер (мобильный + планшет) — 48px для удобного тапа */}
              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-xl text-[#163A5F] hover:bg-slate-100 transition-colors"
                aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="fixed top-14 left-0 right-0 bottom-0 z-40 bg-white lg:hidden overflow-y-auto"
            aria-label="Мобильная навигация"
          >
            <div className="px-4 py-5 space-y-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors min-h-[48px] ${
                    isActive(item.href)
                      ? 'bg-[#163A5F]/8 text-[#163A5F] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              ))}

              <div className="pt-5 mt-5 border-t border-slate-100">
                <a
                  href={MAIN_PHONE_HREF}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-[#163A5F] hover:bg-[#1E4A78] text-white text-[15px] font-semibold rounded-xl transition-colors min-h-[48px]"
                >
                  <Phone className="w-4 h-4" />
                  {MAIN_PHONE}
                </a>
                <div className="mt-4 space-y-1.5">
                  <p className="text-[11px] text-slate-400 text-center">Другие телефоны:</p>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
                    <a href="tel:+78123210606" className="hover:text-[#163A5F]">+7 (812) 321-06-06</a>
                    <a href="tel:+78137140895" className="hover:text-[#163A5F]">+7 (813) 714-08-95</a>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 text-center">
                <p className="text-[12px] text-slate-500">ООО «Теллур-Интех»</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Поддержка пользователей ККТ с 1995 года</p>
              </div>
            </div>
          </nav>
        </>
      )}

      {/* Spacer для fixed header */}
      <div className="h-14 lg:h-[72px]" />
    </>
  )
}
