import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Phone } from 'lucide-react'
import { CITY_PHONE, CITY_PHONE_HREF } from '@/config/contacts'

export const metadata: Metadata = {
  title: 'Повторная печать Data Matrix — можно ли перепечатать код маркировки | Теллур-Интех',
  description: 'Можно ли повторно распечатать код Data Matrix на новую упаковку? Процедура перемаркировки, ввод в оборот новых КМ. Помощь с маркировкой в СПб. ЦТО с 1995 года.',
  alternates: { canonical: '/instructions/povtornaya-pechat-data-matrix' },
  keywords: ['повторная печать data matrix', 'перепечатать код маркировки', 'перемаркировка', 'повторная печать честный знак', 'копирование кода data matrix', 'дублирование кода маркировки', 'переупаковка маркированного товара', 'печать кода на новую упаковку'],
}

export default function PovtornayaPechatPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Breadcrumbs items={[
        { label: 'Главная', href: '/' },
        { label: 'База знаний', href: '/instructions' },
        { label: 'Повторная печать Data Matrix' },
      ]} />

      <article className="prose prose-slate max-w-none">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#163A5F] mb-4">
          Повторная печать Data Matrix: можно ли перепечатать код маркировки?
        </h1>

        <p className="text-slate-600 leading-relaxed mb-6">
          Один из частых вопросов, с которым обращаются продавцы маркированных товаров:
          «Купил маркированную одежду, на упаковке производителя нанесены коды Data Matrix.
          Планирую переупаковывать — можно ли повторно распечатать коды на новую упаковку?»
        </p>

        <h2 className="text-xl font-bold text-[#163A5F] mb-3">Короткий ответ</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          <strong>Нет, повторно распечатать код Data Matrix нельзя.</strong> Код маркировки
          наносится один раз — производителем при вводе товара в оборот. Если вы хотите
          переупаковать товар и нанести код на новую упаковку, нужно пройти процедуру
          <strong> перемаркировки</strong> — вывести старый код из оборота и ввести новый.
        </p>

        <h2 className="text-xl font-bold text-[#163A5F] mb-3">Почему нельзя просто скопировать код?</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Каждый код Data Matrix уникален и привязан к конкретной единице товара в системе
          Честный ЗНАК. Код содержит:
        </p>
        <ul className="list-disc pl-6 text-slate-700 space-y-1 mb-4">
          <li>Идентификатор товара (GTIN)</li>
          <li>Серийный номер</li>
          <li>Криптографический ключ (защита от подделки)</li>
        </ul>
        <p className="text-slate-700 leading-relaxed mb-4">
          Система Честный ЗНАК отслеживает жизненный цикл каждого кода: ввод в оборот →
          передача по ЭДО → продажа (пробитие чека) → вывод из оборота. Если один и тот же
          код появится на двух упаковках одновременно — это нарушение, за которое предусмотрен
          штраф по ст. 15.12 КоАП РФ.
        </p>

        <h2 className="text-xl font-bold text-[#163A5F] mb-3">Что делать если нужно переупаковать товар?</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Есть два варианта:
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-amber-800 mb-2">Вариант 1: Перемаркировка</h3>
          <p className="text-sm text-amber-700">
            Вывести старый код из оборота (через Честный ЗНАК) и запросить новые коды
            маркировки. Новые коды распечатать и нанести на новую упаковку. Это правильный
            законный путь. Процедура называется «перемаркировка» — доступна в личном кабинете
            Честного ЗНАКа.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-emerald-800 mb-2">Вариант 2: Сохранить оригинальную упаковку</h3>
          <p className="text-sm text-emerald-700">
            Если код на упаковке читаем сканером — оставьте его как есть. Достаточно
            отсканировать код при продаже. Переупаковка не требуется, если код не повреждён.
          </p>
        </div>

        <h2 className="text-xl font-bold text-[#163A5F] mb-3">Как проходит перемаркировка</h2>
        <ol className="list-decimal pl-6 text-slate-700 space-y-2 mb-4">
          <li>В личном кабинете Честный ЗНАК → «Маркировка» → «Вывести из оборота»</li>
          <li>Указать причину: «переупаковка» или «утрата/повреждение»</li>
          <li>Запросить новые коды маркировки (КМ) на тот же товар</li>
          <li>Распечатать новые коды на принтере этикеток</li>
          <li>Ввести новые коды в оборот</li>
          <li>Нанести новые этикетки на товар</li>
        </ol>
        <p className="text-slate-700 leading-relaxed mb-4">
          Если товаров много (например, 1000 единиц) — ручной ввод каждого кода трудоёмок.
          Рекомендуем использовать загрузку кодов через Excel-шаблон или интеграцию с 1С.
        </p>

        <h2 className="text-xl font-bold text-[#163A5F] mb-3">Частые проблемы при перемаркировке</h2>
        <div className="space-y-3 mb-6">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-[#163A5F] mb-1">«Не могу найти где распечатать коды»</p>
            <p className="text-sm text-slate-600">Коды маркировки запрашиваются в личном кабинете Честный ЗНАК. После запроса коды скачиваются в виде PDF или CSV — их нужно распечатать на принтере этикеток.</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-[#163A5F] mb-1">«Код на упаковке не сканируется»</p>
            <p className="text-sm text-slate-600">Если код повреждён или нечитаем — это основание для перемаркировки. Выведите старый код из оборота с причиной «повреждение» и запросите новый.</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-[#163A5F] mb-1">«Нужно каждый код вводить вручную»</p>
            <p className="text-sm text-slate-600">При большом объёме используйте пакетный ввод через Excel-шаблон в Честном ЗНАКе или интеграцию с 1С/учётной системой.</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-[#163A5F] mb-1">«Принтер этикеток не печатает Data Matrix»</p>
            <p className="text-sm text-slate-600">Нужен принтер этикеток с поддержкой 2D-кодов. Подойдёт любой термопринтер (например, Zebra, Honeywell). Мы поможем подобрать и настроить принтер — 8 500 ₽.</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#163A5F] mb-3">Что будет если продать товар с повреждённым кодом?</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Если код на упаковке не сканируется при продаже — касса не сможет передать код
          в чек. Это нарушение: касса не передаёт код маркировки в ОФД → Честный ЗНАК не
          видит вывод кода из оборота → товар числится «в обороте» бесконечно. Штраф:
          для ИП от 5 000 ₽, для ООО от 50 000 ₽ (ст. 15.12 КоАП РФ).
        </p>

        <h2 className="text-xl font-bold text-[#163A5F] mb-3">Поможем с перемаркировкой</h2>
        <p className="text-slate-700 leading-relaxed mb-6">
          Если вам нужно переупаковать маркированный товар или коды повреждены — поможем:
          выведем старые коды из оборота, запросим новые, настроим принтер этикеток,
          обучим сотрудников. Работаем в СПб и ЛО, выезд в день обращения.
        </p>

        <div className="bg-gradient-to-r from-[#163A5F] to-[#1E4A78] rounded-2xl p-6 text-center text-white">
          <p className="mb-4">Нужна помощь с перемаркировкой или настройкой принтера этикеток?</p>
          <a
            href={CITY_PHONE_HREF}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4" />
            {CITY_PHONE}
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link href="/instructions" className="text-sm text-[#163A5F] hover:underline">
            ← Все статьи
          </Link>
        </div>
      </article>
    </main>
  )
}
