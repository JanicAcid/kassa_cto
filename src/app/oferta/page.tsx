import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'

export const metadata: Metadata = {
  title: 'Публичная оферта — ООО «Теллур-Интех» | kassa-cto.ru',
  description: 'Публичная оферта ООО «Теллур-Интех» — условия оказания услуг и продажи онлайн-касс. Регистрация ККТ, замена ФН, настройка маркировки, ТО.',
  alternates: { canonical: '/oferta' },
  robots: { index: true, follow: true },
}

export default function OfertaPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/" className="text-sm text-slate-500 hover:text-[#163A5F] mb-4 inline-block">← На главную</Link>
      
      <h1 className="text-2xl sm:text-3xl font-bold text-[#163A5F] mb-2">
        Публичная оферта
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        ООО «Теллур-Интех» · ИНН 7813006759 · ОГРН 1027809245840
      </p>

      <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6">
        <section>
          <h2 className="text-lg font-bold text-[#163A5F] mb-2">1. Общие положения</h2>
          <p className="text-slate-700">
            Настоящий документ является официальным предложением ООО «Теллур-Интех» (далее — Исполнитель) 
            для неопределённого круга лиц (далее — Заказчик) заключить договор на оказание услуг 
            и продажу товаров, связанных с кассовым оборудованием.
          </p>
          <p className="text-slate-700">
            Акцептом оферты считается оформление заявки через сайт kassa-cto.ru, 
            телефонный звонок или личное обращение в офис Исполнителя.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#163A5F] mb-2">2. Предмет договора</h2>
          <p className="text-slate-700 mb-2">Исполнитель оказывает Заказчику следующие услуги:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            <li>Продажа онлайн-касс и фискальных накопителей</li>
            <li>Регистрация и перерегистрация ККТ в ФНС</li>
            <li>Замена фискальных накопителей (ФН)</li>
            <li>Подключение к ОФД (оператору фискальных данных)</li>
            <li>Настройка маркировки товаров (Честный ЗНАК, ТС ПИоТ)</li>
            <li>Ремонт и техническое обслуживание касс</li>
            <li>Настройка ЭДО и ЭЦП</li>
            <li>Обучение работе с кассовым оборудованием</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#163A5F] mb-2">3. Цены и оплата</h2>
          <p className="text-slate-700">
            Стоимость услуг и товаров указана на сайте kassa-cto.ru в разделе «Каталог». 
            Цены могут быть изменены без предварительного уведомления. 
            Актуальная стоимость подтверждается при оформлении заявки.
          </p>
          <p className="text-slate-700">
            Оплата производится наличными или безналичным расчётом (для юридических лиц — с НДС). 
            Промокод «САЙТ» даёт право на спеццену при звонке с сайта.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#163A5F] mb-2">4. Сроки оказания услуг</h2>
          <p className="text-slate-700">
            Стандартный срок оказания услуг — 1 рабочий день с момента оплаты. 
            Срочный выезд — в день обращения (по СПб и ЛО). 
            Регистрация ККТ в ФНС — 1-3 рабочих дня. 
            Замена ФН — 1-2 часа на месте.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#163A5F] mb-2">5. Гарантии</h2>
          <p className="text-slate-700">
            Гарантия на товары — от 12 до 18 месяцев (указано в карточке товара). 
            Гарантия на работы — от 3 до 12 месяцев в зависимости от вида работ. 
            Гарантия не распространяется на поломки, возникшие по вине Заказчика 
            (механические повреждения, попадание влаги, самостоятельный ремонт).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#163A5F] mb-2">6. Возврат и обмен</h2>
          <p className="text-slate-700">
            Товары надлежащего качества возвращаются в течение 14 дней со дня покупки 
            при условии сохранения товарного вида и комплектации. 
            Фискальные накопители (ФН) возврату не подлежат после активации. 
            Услуги считаются оказанными после их фактического выполнения.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#163A5F] mb-2">7. Персональные данные</h2>
          <p className="text-slate-700">
            Исполнитель обрабатывает персональные данные Заказчика в соответствии с 
            <Link href="/privacy" className="text-[#163A5F] underline hover:text-[#1E4A78]"> политикой конфиденциальности</Link>. 
            Данные используются исключительно для оказания услуг и связи с Заказчиком.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#163A5F] mb-2">8. Реквизиты</h2>
          <p className="text-slate-700">
            ООО «Теллур-Интех»<br/>
            ИНН 7813006759 · ОГРН 1027809245840<br/>
            192007, г. Санкт-Петербург, ул. Заслонова, 32-34<br/>
            Тел: <a href={CITY_PHONE_HREF} className="text-[#163A5F] underline">{CITY_PHONE}</a><br/>
            Email: push@tellur.spb.ru
          </p>
        </section>

        <section>
          <p className="text-xs text-slate-500">
            Документ вступает в силу с момента публикации на сайте. 
            Последнее обновление: {new Date().getFullYear()} г.
          </p>
        </section>
      </div>

      <div className="mt-10 p-6 bg-slate-50 rounded-2xl text-center">
        <p className="text-sm text-slate-600 mb-3">Есть вопросы по условиям?</p>
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
