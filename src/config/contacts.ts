// ============================================================================
// КОНТАКТЫ — единый источник правды
// ============================================================================

// Городской телефон — в шапке сайта (для солидности)
export const CITY_PHONE = '+7 (812) 465-94-57'
export const CITY_PHONE_HREF = 'tel:+78124659457'

// Мобильный — для блока контактов (3 канала связи)
export const MOBILE_PHONE = '+7 (921) 932-41-63'
export const MOBILE_PHONE_HREF = 'tel:+79219324163'

// Мессенджеры — привязаны к мобильному номеру
export const MAX_PROFILE_URL = 'tel:+79219324163'
export const TELEGRAM_CHAT_URL = 'https://t.me/+79219324163'

// Все городские телефоны (для страницы контактов)
export const PHONES = [
  { label: '+7 (812) 465-94-57', href: 'tel:+78124659457' },
  { label: '+7 (812) 451-80-18', href: 'tel:+78124518018' },
  { label: '+7 (812) 321-06-06', href: 'tel:+78123210606' },
  { label: '+7 (921) 932-41-63', href: 'tel:+79219324163' },
  { label: '+7 (921) 903-43-26', href: 'tel:+79219034326' },
  { label: '+7 (813) 714-08-95', href: 'tel:+78137140895' },
]

export interface Branch {
  name: string
  address: string
  email: string
  phones: string[]
  schedule: string
}

export const BRANCHES: Branch[] = [
  {
    name: 'Теллур-Центр',
    address: 'г. Санкт-Петербург, ул. Константина Заслонова д. 32-34, лит. А, пом. 1Н',
    email: 'tellur@tellur.spb.ru',
    phones: ['+7 (812) 321-06-06', '+7 (921) 903-43-26'],
    schedule: 'пн–пт 09:30–17:30',
  },
  {
    name: 'Теллур-Пушкин',
    address: 'г. Пушкин, Октябрьский бульвар д. 50/30',
    email: 'push@tellur.spb.ru',
    phones: ['+7 (812) 465-94-57', '+7 (812) 451-80-18', '+7 (921) 932-41-63'],
    schedule: 'пн–пт 09:00–17:00',
  },
  {
    name: 'Теллур-Гатчина',
    address: 'г. Гатчина, ул. Хохлова д. 6, пом. 2',
    email: 'gtn@tellur.spb.ru',
    phones: ['+7 (813) 714-08-95'],
    schedule: 'пн–пт 09:00–17:00',
  },
]
