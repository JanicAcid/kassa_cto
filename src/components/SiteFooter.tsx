// ============================================================================
// SiteFooter — единый подвал для всех страниц
// ============================================================================

import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MapPin, Tag } from 'lucide-react'
import { MAX_PROFILE_URL } from '@/config/contacts'
import { MaxIcon } from '@/components/MaxIcon'
import { PROMOCODE } from '@/config/promocode'

const NAV_LINKS = [
  { label: 'Главная', href: '/' },
  { label: 'Каталог', href: '/katalog-kass' },
  { label: 'Калькуляторы', href: '/kalkulyatory' },
  { label: 'База знаний', href: '/instructions' },
  { label: 'Услуги', href: '/services' },
  { label: 'Контакты', href: '/contacts' },
  { label: 'Кабинет', href: '/admin-orders' },
]

const SERVICE_LINKS = [
  { label: 'Подключение маркировки под ключ', href: '/kalkulyatory/markirovka' },
  { label: 'Настройка кассы для маркировки', href: '/nastroyka-kassy-markirovka' },
  { label: 'Какую кассу выбрать', href: '/kakuyu-kassu-dlya-markirovki' },
  { label: 'Подключение Честного ЗНАК', href: '/podklyuchenie-chestnyy-znak' },
  { label: 'Интеграция с 1С', href: '/integraciya-1c' },
  { label: 'Честный ЗНАК — инструкция', href: '/instructions/kak-podklyuchit-kabinet-chestnyznak' },
]

export function SiteFooter() {
  return (
    <footer className="bg-[#163A5F] text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Лого + описание */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <Image src="/logo.webp" alt="Теллур-Интех" width={88} height={72} className="h-10 w-auto brightness-0 invert" quality={100} />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Центр технического обслуживания кассового оборудования в Санкт-Петербурге с 1995 года.
              Подключение маркировки под ключ.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-white/90">Навигация</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Услуги */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-white/90">Услуги</h4>
            <ul className="space-y-2">
              {SERVICE_LINKS.map(link => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-white/90">Контакты</h4>
            <div className="space-y-2.5">
              <a href="tel:+78124659457" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                +7 (812) 465-94-57
              </a>
              <a href="tel:+78123210606" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                +7 (812) 321-06-06
              </a>
              <div className="flex flex-col gap-2 mt-1">
                <a href="tel:+79219324163" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors" title="Мобильный: +7 (921) 932-41-63">
                  <Phone className="w-4 h-4 shrink-0" />
                  +7 (921) 932-41-63
                </a>
                <a href={MAX_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors" title="Написать в мессенджер MAX">
                  <MaxIcon size={16} className="text-white/50" />
                  MAX
                </a>
              </div>
              <a href="mailto:push@tellur.spb.ru" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                push@tellur.spb.ru
              </a>
              <div className="flex items-start gap-2 text-sm text-white/50">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>СПб, ул. Заслонова 32-34</span>
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="mt-8 pt-5 border-t border-white/10">
          {/* Промокод-плашка — компактная, заметная */}
          <div className="mb-4 flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 rounded-xl shadow-lg shadow-amber-500/20">
            <Tag className="w-5 h-5 text-white shrink-0" />
            <div className="flex items-baseline gap-2 flex-wrap justify-center">
              <span className="text-sm font-medium text-white/90">Промокод</span>
              <b className="text-lg tracking-[0.2em] text-white font-extrabold">{PROMOCODE}</b>
              <span className="text-xs text-white/80">— спеццена при звонке</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
            <p className="order-2 sm:order-1">© {new Date().getFullYear()} ООО «Теллур-Интех». Все права защищены.</p>
            <p className="order-1 sm:order-2 text-center sm:text-right">Центр технического обслуживания кассового оборудования</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
