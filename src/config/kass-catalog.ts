// ============================================================================
// kass-catalog.ts — каталог онлайн-касс (упрощённый для быстрого деплоя)
// ============================================================================

export interface KassaProduct {
  id: string
  brand: string
  model: string
  name: string
  price: number
  oldPrice?: number
  images?: string[]
  badge?: string
  shortDesc: string
  features: string[]
  type: 'smart' | 'mobile' | 'register' | 'autonomous'
  hasAcquiring?: boolean
  inStock: boolean
  gift?: string
  warranty: string
}

export const KASSA_CATALOG: KassaProduct[] = [
  {
    id: 'mercury-185f', brand: 'Меркурий', model: '185Ф', name: 'Меркурий 185Ф',
    price: 11100, oldPrice: 13320,
    images: ['/kass-photo/mercury-185f_1.jpg', '/kass-photo/mercury-185f_2.jpg', '/kass-photo/mercury-185f_3.jpg'],
    badge: 'ХИТ',
    shortDesc: 'Популярная автономная касса с Wi-Fi и 3G',
    features: ['ФФД 1.2 (маркировка)', 'Wi-Fi + 3G', 'Встроенный принтер', 'Аккумулятор до 12ч'],
    type: 'autonomous', inStock: true,
    gift: 'ОФД на 15 месяцев + настройка в подарок', warranty: '12 месяцев',
  },
  {
    id: 'mercury-105f', brand: 'Меркурий', model: '105Ф', name: 'Меркурий 105Ф',
    price: 19100, oldPrice: 22920,
    images: ['/kass-photo/mercury-105f_1.jpg', '/kass-photo/mercury-105f_2.jpg', '/kass-photo/mercury-105f_3.jpg', '/kass-photo/mercury-105f_4.jpg'],
    badge: 'ХИТ',
    shortDesc: 'Бюджетная автономная касса для ИП',
    features: ['ФФД 1.2', 'Wi-Fi + 3G', 'Встроенный принтер', 'Аккумулятор'],
    type: 'autonomous', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽ + сим-карта', warranty: '12 месяцев',
  },
  {
    id: 'aqsi-5', brand: 'AQSI', model: '5Ф', name: 'AQSI 5Ф (без эквайринга)',
    price: 23400, oldPrice: 28080,
    images: ['/kass-photo/aqsi-5_1.webp', '/kass-photo/aqsi-5_2.png', '/kass-photo/aqsi-5_3.webp', '/kass-photo/aqsi-5_4.png'],
    badge: '-17%',
    shortDesc: 'Бюджетный смарт-терминал с сенсорным экраном',
    features: ['ФФД 1.2', 'Сенсорный экран 5.5"', 'Wi-Fi + 4G', 'Android'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽ + сим-карта', warranty: '12 месяцев',
  },
  {
    id: 'aqsi-5-acq', brand: 'AQSI', model: '5Ф', name: 'AQSI 5Ф (с эквайрингом)',
    price: 24600, oldPrice: 29520,
    images: ['/kass-photo/aqsi-5-acq_1.webp', '/kass-photo/aqsi-5-acq_2.webp', '/kass-photo/aqsi-5-acq_3.webp', '/kass-photo/aqsi-5-acq_4.png'],
    badge: 'С эквайрингом',
    shortDesc: 'Касса с встроенным приёмом банковских карт',
    features: ['ФФД 1.2', 'Эквайринг (Мир/Visa/MC)', 'Wi-Fi + 4G', 'Android'],
    type: 'smart', hasAcquiring: true, inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ + 0% комиссия 1 мес', warranty: '12 месяцев',
  },
  {
    id: 'aqsi-6-acq', brand: 'AQSI', model: '6Ф', name: 'AQSI 6Ф (с эквайрингом)',
    price: 25900, oldPrice: 31080,
    images: ['/kass-photo/aqsi-6-acq_1.webp', '/kass-photo/aqsi-6-acq_2.webp', '/kass-photo/aqsi-6-acq_3.jpg', '/kass-photo/aqsi-6-acq_4.png'],
    badge: 'NEW',
    shortDesc: 'Новая касса с эквайрингом и улучшенным экраном',
    features: ['ФФД 1.2', 'Сенсорный экран 6"', 'Эквайринг', 'Wi-Fi + 4G'],
    type: 'smart', hasAcquiring: true, inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ + 0% комиссия 2 мес', warranty: '18 месяцев',
  },
  {
    id: 'atol-30f', brand: 'АТОЛ', model: '30Ф', name: 'АТОЛ 30Ф',
    price: 21900, oldPrice: 26280,
    images: ['/kass-photo/atol-30f_1.png', '/kass-photo/atol-30f_2.jpg', '/kass-photo/atol-30f_3.jpg', '/kass-photo/atol-30f_4.jpg'],
    badge: '-17%',
    shortDesc: 'Бюджетный фискальный регистратор для малого бизнеса',
    features: ['ФФД 1.2', 'USB + RS-232', 'Ширина чека 80 мм', 'Совместимость с 1С'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
  },
  {
    id: 'atol-22v2f', brand: 'АТОЛ', model: '22 v2 Ф', name: 'АТОЛ 22 v2 Ф',
    price: 29900, oldPrice: 35880,
    images: ['/kass-photo/atol-22v2f_1.jpg', '/kass-photo/atol-22v2f_2.png', '/kass-photo/atol-22v2f_3.jpg', '/kass-photo/atol-22v2f_4.png', '/kass-photo/atol-22v2f_5.png'],
    badge: '-17%',
    shortDesc: 'Фискальный регистратор с автоотрезчиком',
    features: ['ФФД 1.2', 'Автоотрезчик', 'Скорость 200 мм/сек', 'Совместимость с 1С'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '18 месяцев',
  },
  {
    id: 'atol-35f', brand: 'АТОЛ', model: '35Ф', name: 'АТОЛ 35Ф',
    price: 26900, oldPrice: 32280,
    images: ['/kass-photo/atol-35f_1.png', '/kass-photo/atol-35f_2.png', '/kass-photo/atol-35f_3.png', '/kass-photo/atol-35f_4.png'],
    shortDesc: 'Фискальный регистратор с быстрой печатью',
    features: ['ФФД 1.2', 'Автоотрезчик', 'USB + Ethernet', 'Для 1С'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '18 месяцев',
  },
  {
    id: 'atol-55f', brand: 'АТОЛ', model: '55Ф v2', name: 'АТОЛ 55Ф v2',
    price: 29900, oldPrice: 35880,
    images: ['/kass-photo/atol-55f_1.jpg', '/kass-photo/atol-55f_2.jpg', '/kass-photo/atol-55f_3.jpg'],
    shortDesc: 'Фискальный регистратор с автоотрезчиком',
    features: ['ФФД 1.2', 'Автоотрезчик', 'USB', 'Совместимость с 1С'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '18 месяцев',
  },
  {
    id: 'atol-27f', brand: 'АТОЛ', model: '27Ф', name: 'АТОЛ 27Ф',
    price: 32400, oldPrice: 38880,
    images: ['/kass-photo/atol-27f_1.png', '/kass-photo/atol-27f_2.png', '/kass-photo/atol-27f_3.png', '/kass-photo/atol-27f_4.png', '/kass-photo/atol-27f_5.jpg'],
    badge: 'ХИТ',
    shortDesc: 'Фискальный регистратор для высокой нагрузки',
    features: ['ФФД 1.2', 'Автоотрезчик (1.5 млн отрезов)', 'Скорость 300 мм/сек', 'USB + Ethernet'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '18 месяцев',
  },
  {
    id: 'evotor-6', brand: 'Эвотор', model: '6', name: 'Эвотор 6',
    price: 18900, oldPrice: 22680,
    images: ['/kass-photo/evotor-6_1.png', '/kass-photo/evotor-6_2.png', '/kass-photo/evotor-6_3.jpg'],
    shortDesc: 'Смарт-терминал с экраном 6" для розницы',
    features: ['ФФД 1.2', 'Сенсорный экран 6"', 'Wi-Fi + 3G', 'Эвотор.Маркет'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽ + 3 приложения', warranty: '12 месяцев',
  },
  {
    id: 'evotor-7-3', brand: 'Эвотор', model: '7.3', name: 'Эвотор 7.3',
    price: 33600, oldPrice: 40320,
    images: ['/kass-photo/evotor-7-3_1.jpeg'],
    badge: '-17%',
    shortDesc: 'Популярный смарт-терминал для розницы и общепита',
    features: ['ФФД 1.2', 'Сенсорный экран 7"', '5 USB-портов', 'Аккумулятор до 14ч'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽ + 5 приложений', warranty: '18 месяцев',
  },
  {
    id: 'evotor-10', brand: 'Эвотор', model: '10', name: 'Эвотор 10',
    price: 38900, oldPrice: 46680,
    images: ['/kass-photo/evotor-10_1.jpg', '/kass-photo/evotor-10_2.jpg', '/kass-photo/evotor-10_3.jpg'],
    badge: '-17%',
    shortDesc: 'Смарт-терминал с большим экраном для ресторанов',
    features: ['ФФД 1.2', 'Сенсорный экран 10.1"', '6 USB-портов', 'Wi-Fi + 4G'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽ + настройка 1С', warranty: '18 месяцев',
  },
]

export const KASSA_PREVIEW = [
  KASSA_CATALOG.find(k => k.id === 'mercury-185f')!,
  KASSA_CATALOG.find(k => k.id === 'aqsi-5-acq')!,
  KASSA_CATALOG.find(k => k.id === 'evotor-7-3')!,
  KASSA_CATALOG.find(k => k.id === 'atol-22v2f')!,
]

export const BRAND_ICONS: Record<string, string> = {
  'Меркурий': '/brands/mercury.webp',
  'AQSI': '/brands/aqsi.webp',
  'АТОЛ': '/brands/atol.webp',
  'Эвотор': '/brands/evotor.webp',
  'Штрих-М': '/brands/shuttle.webp',
  'Пионер': '/brands/pioneer.webp',
}

// Конфигуратор «под ключ» — ФН + ОФД + услуги + допы
export interface ConfiguratorOption {
  id: string
  name: string
  desc: string
  price: number
  oldPrice?: number
  category: 'fn' | 'ofd' | 'service' | 'extra'
  badge?: string
}

export const CONFIGURATOR_OPTIONS: ConfiguratorOption[] = [
  // ─── ФН (фискальный накопитель) ─────────────────────────────────────────
  { id: 'fn-15', name: 'ФН на 15 месяцев', desc: 'Для маркировки, алкоголя, ОСН', price: 14200, oldPrice: 15900, category: 'fn', badge: 'Обязательно' },
  { id: 'fn-36', name: 'ФН на 36 месяцев', desc: 'Для УСН, ПСН, услуг — выгоднее', price: 21000, oldPrice: 23000, category: 'fn', badge: 'Выгоднее' },
  // ─── ОФД (Такском — со скидкой 68% при покупке кассы) ────────────────────
  { id: 'ofd-15', name: 'ОФД Такском на 15 месяцев', desc: 'Со скидкой 68% при покупке кассы', price: 2200, oldPrice: 6900, category: 'ofd', badge: 'СКИДКА 68%' },
  { id: 'ofd-36', name: 'ОФД Такском на 36 месяцев', desc: 'Со скидкой 68% при покупке кассы', price: 3800, oldPrice: 12000, category: 'ofd', badge: 'СКИДКА 68%' },
  // ─── Услуги ──────────────────────────────────────────────────────────────
  { id: 'reg-fns', name: 'Регистрация ККТ в ФНС', desc: 'Подача заявления, фискализация', price: 3000, category: 'service', badge: 'Обязательно' },
  // setup — всегда включена, нельзя снять (см. ConfiguratorModal)
  { id: 'setup', name: 'Настройка кассы под ключ', desc: 'Загрузка товаров, обучение, тестовый чек (обязательно)', price: 3000, oldPrice: 5000, category: 'service', badge: 'Обязательно' },
  // ─── Доставка (зависит от города — выбирается в конфигураторе) ──────────
  { id: 'delivery-pushkin', name: 'Доставка по Пушкину', desc: 'Привезём, подключим, проверим', price: 600, category: 'service' },
  { id: 'delivery-spb', name: 'Доставка по СПб', desc: 'Привезём, подключим, проверим', price: 900, category: 'service' },
  // ─── Обучение и тех.сопровождение ───────────────────────────────────────
  { id: 'training', name: 'Обучение работе с кассой', desc: 'Практическое занятие — сканирование, приём товара, возвраты', price: 1300, category: 'service' },
  { id: 'tech-support-month', name: 'Тех.сопровождение на 1 месяц', desc: 'Приоритетная поддержка, обновление ПО, диагностика, скидка на ремонт', price: 850, category: 'service', badge: '1 мес' },
  { id: 'tech-support-year', name: 'Тех.сопровождение на 1 год', desc: 'Регулярное ТО 1-4 раза в год, приоритетный выезд, бесплатная диагностика, скидка 20-30% на ремонт', price: 9180, category: 'service', badge: '12 мес' },
  // ─── Доп. оборудование ─────────────────────────────────────────────────
  { id: 'scanner-2d', name: '2D-сканер штрихкодов', desc: 'Для маркировки — DataMatrix', price: 4500, oldPrice: 6000, category: 'extra', badge: 'Для маркировки' },
  { id: 'cash-drawer', name: 'Денежный ящик', desc: 'Для хранения наличных', price: 2500, category: 'extra' },
  { id: 'label-printer', name: 'Принтер этикеток', desc: 'Печать ценников и штрихкодов', price: 8500, oldPrice: 10000, category: 'extra' },
]
