// ============================================================================
// kass-catalog.ts — каталог онлайн-касс (упрощённый для быстрого деплоя)
// ============================================================================

export interface KassaSpec {
  label: string
  value: string
}

export interface KassaSpecGroup {
  name: string
  specs: KassaSpec[]
}

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
  // Подробные характеристики — показываются в карточке по кнопке «Характеристики»
  specGroups?: KassaSpecGroup[]
}

export const KASSA_CATALOG: KassaProduct[] = [
  {
    id: 'mercury-185f', brand: 'Меркурий', model: '185Ф', name: 'Меркурий 185Ф',
    price: 8800, oldPrice: 10560,
    images: ['/kass-photo/mercury-185f_1.jpg', '/kass-photo/mercury-185f_2.jpg', '/kass-photo/mercury-185f_3.jpg'],
    badge: 'ХИТ',
    shortDesc: 'Автономная касса с Wi-Fi и 3G. 8 800 ₽ базовая; 11 100 ₽ — для работы с банковским терминалом (нужна лицензия ФФД 1.2)',
    features: ['ФФД 1.2 (маркировка)', 'Wi-Fi + 3G', 'Встроенный принтер', 'Аккумулятор до 12ч'],
    type: 'autonomous', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
    specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'Инкотекс (Меркурий)' },
        { label: 'Тип', value: 'Автономная онлайн-касса' },
        { label: 'Год выпуска', value: '2019' },
        { label: 'Гарантия', value: '12 месяцев' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'Wi-Fi', value: 'Есть' },
        { label: '3G', value: 'Есть' },
        { label: 'USB', value: 'Есть (тип B)' },
        { label: 'Bluetooth', value: 'Нет' },
        { label: 'Ethernet', value: 'Нет' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Принтер', value: 'Встроенный' },
        { label: 'Ширина чека', value: '58 мм' },
        { label: 'Скорость', value: '50 мм/сек' },
        { label: 'Автоотрезчик', value: 'Нет' },
      ]},
      { name: 'Питание', specs: [
        { label: 'Аккумулятор', value: 'До 12 часов' },
        { label: 'От сети', value: '5V/2A' },
      ]},
      { name: 'Совместимость', specs: [
        { label: 'ФФД', value: '1.2 (маркировка)' },
        { label: 'ОФД', value: 'Все операторы' },
        { label: 'Маркировка', value: 'Поддерживается' },
        { label: 'Алкоголь (ЕГАИС)', value: 'Поддерживается' },
        { label: '1С', value: 'Через драйвер' },
      ]},
      { name: 'Габариты', specs: [
        { label: 'Размеры', value: '190×100×70 мм' },
        { label: 'Вес', value: '350 г' },
      ]},
    ],
  },
  {
    id: 'aqsi-5', brand: 'AQSI', model: '5Ф', name: 'AQSI 5Ф (без эквайринга)',
    price: 18650, oldPrice: 22380,
    images: ['/kass-photo/aqsi-5_1.webp', '/kass-photo/aqsi-5_2.png', '/kass-photo/aqsi-5_3.webp', '/kass-photo/aqsi-5_4.png'],
    badge: '-17%',
    shortDesc: 'Бюджетный смарт-терминал с сенсорным экраном',
    features: ['ФФД 1.2', 'Сенсорный экран 5.5"', 'Wi-Fi + 4G', 'Android'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'Аквариус (AQSI)' },
        { label: 'Тип', value: 'Смарт-терминал' },
        { label: 'Гарантия', value: '12 месяцев' },
      ]},
      { name: 'Экран', specs: [
        { label: 'Диагональ', value: '5.5"' },
        { label: 'Тип', value: 'Сенсорный, ёмкостный' },
        { label: 'Разрешение', value: 'HD' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'Wi-Fi', value: 'Есть' },
        { label: '4G', value: 'Есть' },
        { label: 'Bluetooth', value: 'Есть' },
        { label: 'USB', value: 'Есть' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Ширина чека', value: '58 мм' },
        { label: 'Скорость', value: '70 мм/сек' },
      ]},
      { name: 'ПО', specs: [
        { label: 'ОС', value: 'Android' },
        { label: 'Маркировка', value: 'Поддерживается' },
        { label: '1С', value: 'Через AQSI.Драйвер' },
      ]},
      { name: 'Габариты', specs: [
        { label: 'Размеры', value: '210×95×60 мм' },
        { label: 'Вес', value: '450 г' },
      ]},
    ],
  },
  {
    id: 'aqsi-5-acq', brand: 'AQSI', model: '5Ф', name: 'AQSI 5Ф (с эквайрингом)',
    price: 24600, oldPrice: 29520,
    images: ['/kass-photo/aqsi-5-acq_1.webp', '/kass-photo/aqsi-5-acq_2.webp', '/kass-photo/aqsi-5-acq_3.webp', '/kass-photo/aqsi-5-acq_4.png'],
    badge: 'С эквайрингом',
    shortDesc: 'Касса с встроенным приёмом банковских карт',
    features: ['ФФД 1.2', 'Эквайринг (Мир/Visa/MC)', 'Wi-Fi + 4G', 'Android'],
    type: 'smart', hasAcquiring: true, inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'Аквариус (AQSI)' },
        { label: 'Тип', value: 'Смарт-терминал с эквайрингом' },
        { label: 'Гарантия', value: '12 месяцев' },
      ]},
      { name: 'Экран', specs: [
        { label: 'Диагональ', value: '5.5"' },
        { label: 'Тип', value: 'Сенсорный' },
      ]},
      { name: 'Эквайринг', specs: [
        { label: 'Visa', value: 'Поддерживается' },
        { label: 'MasterCard', value: 'Поддерживается' },
        { label: 'МИР', value: 'Поддерживается' },
        { label: 'Бесконтактно (NFC)', value: 'Есть' },
        { label: 'Комиссия', value: 'От 1.2%' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'Wi-Fi', value: 'Есть' },
        { label: '4G', value: 'Есть' },
        { label: 'Bluetooth', value: 'Есть' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Ширина чека', value: '58 мм' },
      ]},
      { name: 'ПО', specs: [
        { label: 'ОС', value: 'Android' },
        { label: 'Маркировка', value: 'Поддерживается' },
      ]},
    ],
  },
  {
    id: 'aqsi-6-acq', brand: 'AQSI', model: '6Ф', name: 'AQSI 6Ф (с эквайрингом)',
    price: 25900, oldPrice: 31080,
    images: ['/kass-photo/aqsi-6-acq_1.webp', '/kass-photo/aqsi-6-acq_2.webp', '/kass-photo/aqsi-6-acq_3.jpg', '/kass-photo/aqsi-6-acq_4.png'],
    badge: 'NEW',
    shortDesc: 'Новая касса с эквайрингом и улучшенным экраном',
    features: ['ФФД 1.2', 'Сенсорный экран 6"', 'Эквайринг', 'Wi-Fi + 4G'],
    type: 'smart', hasAcquiring: true, inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'Аквариус (AQSI)' },
        { label: 'Тип', value: 'Смарт-терминал с эквайрингом' },
        { label: 'Год выпуска', value: '2024' },
        { label: 'Гарантия', value: '18 месяцев' },
      ]},
      { name: 'Экран', specs: [
        { label: 'Диагональ', value: '6"' },
        { label: 'Тип', value: 'Сенсорный, улучшенный' },
      ]},
      { name: 'Эквайринг', specs: [
        { label: 'Visa/MC/МИР', value: 'Поддерживается' },
        { label: 'NFC', value: 'Есть' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'Wi-Fi', value: 'Есть' },
        { label: '4G', value: 'Есть' },
        { label: 'Bluetooth', value: 'Есть' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Ширина чека', value: '58 мм' },
        { label: 'Скорость', value: '80 мм/сек' },
      ]},
      { name: 'ПО', specs: [
        { label: 'ОС', value: 'Android' },
        { label: 'Маркировка', value: 'Поддерживается' },
      ]},
    ],
  },
  {
    id: 'atol-30f', brand: 'АТОЛ', model: '30Ф', name: 'АТОЛ 30Ф',
    price: 21450, oldPrice: 25740,
    images: ['/kass-photo/atol-30f_1.png', '/kass-photo/atol-30f_2.jpg', '/kass-photo/atol-30f_3.jpg', '/kass-photo/atol-30f_4.jpg'],
    badge: '-17%',
    shortDesc: 'Бюджетный фискальный регистратор для малого бизнеса',
    features: ['ФФД 1.2', 'USB + RS-232', 'Ширина чека 80 мм', 'Совместимость с 1С'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'АТОЛ' },
        { label: 'Тип', value: 'Фискальный регистратор' },
        { label: 'Гарантия', value: '12 месяцев' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'USB', value: 'Есть' },
        { label: 'RS-232', value: 'Есть' },
        { label: 'Wi-Fi', value: 'Нет' },
        { label: 'Ethernet', value: 'Нет' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Метод', value: 'Термопечать' },
        { label: 'Ширина чека', value: '80 мм' },
        { label: 'Скорость', value: '75 мм/сек' },
        { label: 'Автоотрезчик', value: 'Нет' },
      ]},
      { name: 'Совместимость', specs: [
        { label: 'ФФД', value: '1.2' },
        { label: '1С', value: 'Полная' },
        { label: 'Маркировка', value: 'Поддерживается' },
        { label: 'ОС', value: 'Windows, Linux' },
      ]},
      { name: 'Габариты', specs: [
        { label: 'Размеры', value: '160×130×80 мм' },
        { label: 'Вес', value: '600 г' },
      ]},
    ],
  },
  {
    id: 'atol-22v2f', brand: 'АТОЛ', model: '22 v2 Ф', name: 'АТОЛ 22 v2 Ф',
    price: 30980, oldPrice: 37176,
    images: ['/kass-photo/atol-22v2f_1.jpg', '/kass-photo/atol-22v2f_2.png', '/kass-photo/atol-22v2f_3.jpg', '/kass-photo/atol-22v2f_4.png', '/kass-photo/atol-22v2f_5.png'],
    badge: '-17%',
    shortDesc: 'Фискальный регистратор с автоотрезчиком',
    features: ['ФФД 1.2', 'Автоотрезчик', 'Скорость 200 мм/сек', 'Совместимость с 1С'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'АТОЛ' },
        { label: 'Тип', value: 'Фискальный регистратор' },
        { label: 'Гарантия', value: '18 месяцев' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'USB', value: 'Есть' },
        { label: 'RS-232', value: 'Есть' },
        { label: 'Ethernet', value: 'Опционально' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Ширина чека', value: '80 мм' },
        { label: 'Скорость', value: '200 мм/сек' },
        { label: 'Автоотрезчик', value: 'Есть' },
        { label: 'Ресурс отрезчика', value: '1.5 млн отрезов' },
      ]},
      { name: 'Совместимость', specs: [
        { label: 'ФФД', value: '1.2' },
        { label: '1С', value: 'Полная' },
        { label: 'Маркировка', value: 'Поддерживается' },
      ]},
      { name: 'Габариты', specs: [
        { label: 'Размеры', value: '160×145×100 мм' },
        { label: 'Вес', value: '700 г' },
      ]},
    ],
  },
  {
    id: 'atol-35f', brand: 'АТОЛ', model: '35Ф', name: 'АТОЛ 35Ф',
    price: 20350, oldPrice: 24420,
    images: ['/kass-photo/atol-35f_1.png', '/kass-photo/atol-35f_2.png', '/kass-photo/atol-35f_3.png', '/kass-photo/atol-35f_4.png'],
    shortDesc: 'Фискальный регистратор с быстрой печатью',
    features: ['ФФД 1.2', 'Автоотрезчик', 'USB + Ethernet', 'Для 1С'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'АТОЛ' },
        { label: 'Тип', value: 'Фискальный регистратор' },
        { label: 'Гарантия', value: '18 месяцев' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'USB', value: 'Есть' },
        { label: 'Ethernet', value: 'Есть' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Ширина чека', value: '80 мм' },
        { label: 'Скорость', value: '200 мм/сек' },
        { label: 'Автоотрезчик', value: 'Есть' },
      ]},
      { name: 'Совместимость', specs: [
        { label: 'ФФД', value: '1.2' },
        { label: '1С', value: 'Полная' },
        { label: 'Маркировка', value: 'Поддерживается' },
      ]},
    ],
  },
  {
    id: 'atol-55f', brand: 'АТОЛ', model: '55Ф v2', name: 'АТОЛ 55Ф v2',
    price: 28950, oldPrice: 34740,
    images: ['/kass-photo/atol-55f_1.jpg', '/kass-photo/atol-55f_2.jpg', '/kass-photo/atol-55f_3.jpg'],
    shortDesc: 'Фискальный регистратор с автоотрезчиком',
    features: ['ФФД 1.2', 'Автоотрезчик', 'USB', 'Совместимость с 1С'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'АТОЛ' },
        { label: 'Тип', value: 'Фискальный регистратор' },
        { label: 'Гарантия', value: '18 месяцев' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'USB', value: 'Есть' },
        { label: 'RS-232', value: 'Есть' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Ширина чека', value: '80 мм' },
        { label: 'Скорость', value: '200 мм/сек' },
        { label: 'Автоотрезчик', value: 'Есть' },
      ]},
      { name: 'Совместимость', specs: [
        { label: 'ФФД', value: '1.2' },
        { label: '1С', value: 'Полная' },
        { label: 'Маркировка', value: 'Поддерживается' },
      ]},
    ],
  },
  {
    id: 'atol-27f', brand: 'АТОЛ', model: '27Ф', name: 'АТОЛ 27Ф',
    price: 31350, oldPrice: 37620,
    images: ['/kass-photo/atol-27f_1.png', '/kass-photo/atol-27f_2.png', '/kass-photo/atol-27f_3.png', '/kass-photo/atol-27f_4.png', '/kass-photo/atol-27f_5.jpg'],
    badge: 'ХИТ',
    shortDesc: 'Фискальный регистратор для высокой нагрузки',
    features: ['ФФД 1.2', 'Автоотрезчик (1.5 млн отрезов)', 'Скорость 300 мм/сек', 'USB + Ethernet'],
    type: 'register', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'АТОЛ' },
        { label: 'Тип', value: 'Фискальный регистратор (высоконагруженный)' },
        { label: 'Гарантия', value: '18 месяцев' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'USB', value: 'Есть' },
        { label: 'Ethernet', value: 'Есть' },
        { label: 'RS-232', value: 'Есть' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Ширина чека', value: '80 мм' },
        { label: 'Скорость', value: '300 мм/сек' },
        { label: 'Автоотрезчик', value: 'Есть (1.5 млн отрезов)' },
      ]},
      { name: 'Нагрузка', specs: [
        { label: 'Чеков в день', value: 'До 5000' },
        { label: 'Срок службы', value: '7+ лет' },
        { label: 'Для супермаркетов', value: 'Да' },
      ]},
      { name: 'Совместимость', specs: [
        { label: 'ФФД', value: '1.2' },
        { label: '1С', value: 'Полная' },
        { label: 'Маркировка', value: 'Поддерживается' },
      ]},
    ],
  },
  {
    id: 'evotor-6-action', brand: 'Эвотор', model: '6', name: 'Эвотор 6 — АКЦИЯ «Почти даром»',
    price: 100, oldPrice: 18900,
    images: ['/kass-photo/evotor-6_1.png', '/kass-photo/evotor-6_2.png', '/kass-photo/evotor-6_3.jpg'],
    badge: 'АКЦИЯ',
    shortDesc: 'Эвотор 6 за 100 ₽ при оформлении расчётного счёта в Сбербанке + ФН + ОФД + регистрация',
    features: ['ФФД 1.2', 'Сенсорный экран 6"', 'Wi-Fi + 3G', 'Эвотор.Маркет'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
  },
  {
    id: 'evotor-6', brand: 'Эвотор', model: '6', name: 'Эвотор 6',
    price: 18900, oldPrice: 22680,
    images: ['/kass-photo/evotor-6_1.png', '/kass-photo/evotor-6_2.png', '/kass-photo/evotor-6_3.jpg'],
    shortDesc: 'Смарт-терминал с экраном 6" для розницы',
    features: ['ФФД 1.2', 'Сенсорный экран 6"', 'Wi-Fi + 3G', 'Эвотор.Маркет'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'Эвотор' },
        { label: 'Тип', value: 'Смарт-терминал' },
        { label: 'Гарантия', value: '12 месяцев' },
      ]},
      { name: 'Экран', specs: [
        { label: 'Диагональ', value: '6"' },
        { label: 'Тип', value: 'Сенсорный' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'Wi-Fi', value: 'Есть' },
        { label: '3G', value: 'Есть' },
        { label: 'Bluetooth', value: 'Есть' },
        { label: 'USB-портов', value: '3' },
      ]},
      { name: 'Печать', specs: [
        { label: 'Ширина чека', value: '58 мм' },
      ]},
      { name: 'ПО', specs: [
        { label: 'ОС', value: 'Evotor OS (Android-based)' },
        { label: 'Магазин приложений', value: 'Эвотор.Маркет' },
        { label: 'Маркировка', value: 'Поддерживается' },
      ]},
    ],
  },
  {
    id: 'evotor-7-3', brand: 'Эвотор', model: '7.3', name: 'Эвотор 7.3',
    price: 33600, oldPrice: 40320,
    images: ['/kass-photo/evotor-7-3_1.jpeg'],
    badge: '-17%',
    shortDesc: 'Популярный смарт-терминал для розницы и общепита',
    features: ['ФФД 1.2', 'Сенсорный экран 7"', '5 USB-портов', 'Аккумулятор до 14ч'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'Эвотор' },
        { label: 'Тип', value: 'Смарт-терминал' },
        { label: 'Гарантия', value: '18 месяцев' },
      ]},
      { name: 'Экран', specs: [
        { label: 'Диагональ', value: '7"' },
        { label: 'Тип', value: 'Сенсорный, IPS' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'Wi-Fi', value: 'Есть' },
        { label: '3G', value: 'Есть' },
        { label: 'Bluetooth', value: 'Есть' },
        { label: 'USB-портов', value: '5' },
      ]},
      { name: 'Питание', specs: [
        { label: 'Аккумулятор', value: 'До 14 часов' },
        { label: 'Сменный', value: 'Да' },
      ]},
      { name: 'ПО', specs: [
        { label: 'ОС', value: 'Evotor OS' },
        { label: 'Магазин приложений', value: 'Эвотор.Маркет' },
        { label: 'Маркировка', value: 'Поддерживается' },
        { label: '1С', value: 'Поддерживается' },
      ]},
    ],
  },
  {
    id: 'evotor-10', brand: 'Эвотор', model: '10', name: 'Эвотор 10',
    price: 38700, oldPrice: 46440,
    images: ['/kass-photo/evotor-10_1.jpg', '/kass-photo/evotor-10_2.jpg', '/kass-photo/evotor-10_3.jpg'],
    badge: '-17%',
    shortDesc: 'Смарт-терминал с большим экраном для ресторанов',
    features: ['ФФД 1.2', 'Сенсорный экран 10.1"', '6 USB-портов', 'Wi-Fi + 4G'],
    type: 'smart', inStock: true,
    gift: 'ОФД Такском 15 мес — 2 200 ₽ вместо 6 900 ₽', warranty: '12 месяцев',
      specGroups: [
      { name: 'Основное', specs: [
        { label: 'Производитель', value: 'Эвотор' },
        { label: 'Тип', value: 'Смарт-терминал (большой экран)' },
        { label: 'Гарантия', value: '18 месяцев' },
      ]},
      { name: 'Экран', specs: [
        { label: 'Диагональ', value: '10.1"' },
        { label: 'Тип', value: 'Сенсорный, IPS' },
      ]},
      { name: 'Подключение', specs: [
        { label: 'Wi-Fi', value: 'Есть' },
        { label: '4G', value: 'Есть' },
        { label: 'USB-портов', value: '6' },
      ]},
      { name: 'Применение', specs: [
        { label: 'Рестораны', value: 'Оптимально' },
        { label: 'HoReCa', value: 'Да' },
        { label: 'Магазины', value: 'Да' },
      ]},
      { name: 'ПО', specs: [
        { label: 'ОС', value: 'Evotor OS' },
        { label: 'Маркировка', value: 'Поддерживается' },
        { label: '1С', value: 'Поддерживается' },
      ]},
    ],
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
  { id: 'delivery-spb', name: 'Доставка по СПб', desc: 'Привезём, подключим, проверим', price: 900, category: 'service' },
  // ─── Обучение и тех.сопровождение ───────────────────────────────────────
  { id: 'training', name: 'Обучение работе с кассой', desc: 'Практическое занятие — сканирование, приём товара, возвраты', price: 1300, category: 'service' },
  { id: 'tech-support-month', name: 'Тех.сопровождение на 1 месяц', desc: 'Приоритетная поддержка, обновление ПО, диагностика', price: 850, category: 'service', badge: '1 мес' },
  { id: 'tech-support-year', name: 'Тех.сопровождение на 1 год', desc: 'Регулярное ТО 1-4 раза в год, приоритетный выезд, бесплатная диагностика', price: 10200, category: 'service', badge: '12 мес' },
  // ─── Доп. оборудование: 2D-сканеры (2 варианта) ────────────────────────
  { id: 'scanner-2d-wire', name: '2D-сканер проводной', desc: 'Для маркировки — DataMatrix, подключение по USB', price: 4300, category: 'extra', badge: 'Для маркировки' },
  { id: 'scanner-2d-bt', name: '2D-сканер Bluetooth', desc: 'Беспроводной, для маркировки — DataMatrix', price: 5600, category: 'extra', badge: 'Беспроводной' },
  // ─── Доп. оборудование: Денежные ящики (2 варианта) ────────────────────
  { id: 'cash-drawer-small', name: 'Денежный ящик с ключом (245×320×90 мм)', desc: 'Компактный, чёрный, для хранения наличных', price: 3300, category: 'extra' },
  { id: 'cash-drawer-large', name: 'Денежный ящик с ключом (368×335×95 мм)', desc: 'Большой, чёрный, для хранения наличных', price: 4100, category: 'extra' },
  // ─── Принтер этикеток ──────────────────────────────────────────────────
  { id: 'label-printer', name: 'Принтер этикеток', desc: 'Печать ценников и штрихкодов', price: 8500, oldPrice: 10000, category: 'extra' },
]
