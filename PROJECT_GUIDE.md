# PROJECT_GUIDE.md — Руководство для AI-агентов

> **ОБЯЗАТЕЛЬНО ПРОЧИТАЙ ЭТОТ ФАЙЛ ПЕРЕД ЛЮБЫМИ ДЕЙСТВИЯМИ С ПРОЕКТОМ**

---

## 1. Что это за проект

Сайт ООО **«Теллур-Интех»** — Центр технического обслуживания кассового оборудования (СПб, с 1995 года).
Основная функция — **онлайн-калькулятор стоимости подключения маркировки товаров** (Честный ЗНАК, ЭДО, ТС ПИоТ, ФНС, ОФД).

- **Продакшен URL**: https://kassa-cto.ru
- **GitHub (рабочий)**: `JanicAcid/kassa_cto` (приватный)
- **GitHub (архив)**: `JanicAcid/tellur-markirovka-backup` (приватный, НЕ РЕДАКТИРОВАТЬ)
- **Хостинг**: Beget shared hosting, IP: 87.236.16.235
- **Деплой**: ручной (static export + загрузка на Beget через файловый менеджер)
- **API**: PHP proxy (api/index.php) на том же хостинге
- **Телефон**: +7 (812) 465-94-57 (основной)
- **Email**: push@tellur.spb.ru

---

## 2. Технологический стек

| Технология | Версия |
|---|---|
| Next.js (App Router, static export) | 15.5.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x (via @tailwindcss/postcss) |
| shadcn/ui | Radix UI primitives |
| Аналитика | Yandex Metrika (ID: 108406091) |
| API Backend | PHP 8 (Beget shared hosting) |
| Чат | Telegram Bot (@spbmarkirovka_bot) |

---

## 3. Архитектура деплоя

**ВНИМАНИЕ**: `output: 'export'` в next.config.ts означает:
- Это **полностью статический сайт** — никакого SSR
- Next.js middleware **НЕ работает** — админка защищена только клиентскими проверками
- API routes **НЕ работают** — все `/api/*` запросы идут к PHP proxy на Beget
- Security headers (CSP, HSTS) — настраиваются в `.htaccess`, НЕ в next.config.ts
- `redirects()` и `headers()` из next.config.ts **не применяются** — нужны в .htaccess

---

## 4. Структура проекта

```
src/
├── app/                                   # Next.js App Router страницы
│   ├── page.tsx                           # Главная
│   ├── layout.tsx                         # Root layout
│   ├── sitemap.ts                         # sitemap.xml
│   ├── globals.css                        # Tailwind
│   │
│   ├── kalkulyatory/                      # Калькуляторы
│   ├── instructions/                      # Инструкции
│   ├── diagnostika/                       # Диагностика
│   ├── admin/                             # Админ-кабинет
│   ├── faq/                               # FAQ
│   ├── services/                          # Услуги
│   ├── about/                             # О компании
│   ├── contacts/                          # Контакты
│   │
│   └── markirovka-*/                      # SEO-лендинги
│       nastroyka-kassy-markirovka/
│       podklyuchenie-chestnyy-znak/
│       integraciya-1c/
│       kakuyu-kassu-dlya-markirovki/
│
├── components/                            # React-компоненты
│   ├── Navbar.tsx, SiteFooter.tsx         # Навигация
│   ├── ChatWidget.tsx                     # Telegram чат
│   ├── calculator/                        # Шаги калькулятора
│   └── ui/                                # shadcn/ui
│
├── config/                                # КОНФИГУРАЦИЯ
│   ├── site.ts                            # SITE_URL, COMPANY_NAME (Единый конфиг!)
│   ├── telegram.ts                        # Токен бота (env only!)
│   ├── admin.ts                           # Админ-доступ (env only!)
│   ├── contacts.ts                        # Телефоны, филиалы
│   ├── services.ts, services-step2/3.ts   # Услуги и цены
│   ├── brands.ts                          # Бренды касс
│   ├── ofd.ts                             # Провайдеры ОФД
│   ├── kkt-catalog.ts                     # Реестр ККТ ФНС (58 произв.)
│   └── google-sheets.ts                   # Google Sheets (Node.js only!)
│
├── lib/                                   # Утилиты
│   ├── utils.ts, phone.ts, jwt.ts
│
└── middleware.ts                           # ⚠️ DEAD CODE — не работает с export!

api-proxy/                                 # PHP API (деплоится на Beget)
├── api/index.php                          # Роутер v7
├── api/config.php.example                 # Шаблон конфига (секреты!)

public/.htaccess                           # ⚠️ Security headers + API routing
```

---

## 5. Переменные окружения

| Переменная | Где используется |
|---|---|
| `TELEGRAM_BOT_TOKEN` | PHP proxy (config.php) |
| `OPERATOR_CHAT_ID` | PHP proxy (config.php) |
| `ADMIN_LOGIN` | CF Functions (не используется на Beget) |
| `ADMIN_PASSWORD` | CF Functions (не используется на Beget) |
| `ADMIN_JWT_SECRET` | CF Functions (не используется на Beget) |

**На Beget** секреты хранятся в `api/config.php` (НЕ в репо!).

**КРИТИЧЕСКИЕ ПРАВИЛА БЕЗОПАСНОСТИ:**
- **НИКОГДА** не добавлять fallback'ы с реальными значениями в код
- **НИКОГДА** не коммитить `.env` файлы, `config.php`
- **НИКОГДА** не использовать `NEXT_PUBLIC_` для секретов
- **НИКОГДА** не логировать токены, chat ID, или другие секреты

---

## 6. Калькулятор маркировки — логика

Калькулятор — 4-шаговый wizard:

1. **Шаг 1 — Бренд кассы**: 7 брендов + поиск по реестру ККТ ФНС
2. **Шаг 2 — Услуги**: зависят от бренда. При `marking_setup` скрывается `fns_reregistration`
3. **Шаг 3 — Доп. услуги**: ОФД, ТС ПИоТ, ЭЦП, обучение
4. **Шаг 4 — Итого + заказ**: форма → Telegram (HTML-документ)

Цены в `src/config/services*.ts`. Подсказки в `src/config/hints.ts`.

---

## 7. PHP API Proxy (Beget)

Единый роутер `api/index.php` обрабатывает:
- `POST /api/send-order` — заказ → Telegram
- `POST /api/chat/send` — сообщение чата → Telegram + inline Reply
- `GET /api/chat/poll` — long-poll ответов оператора
- `GET /api/chat/clean` — автозачистка старых сессий
- `GET /api/captcha` — арифметическая капча
- `POST /api/log-order` — заглушка (нет Google Sheets)

**Хранение сессий чата**: файлы в `chat-data/` (flat file storage)

---

## 8. SEO-структура

| URL | Приоритет | Canonical |
|---|---|---|
| `/` | 1.0 | `https://kassa-cto.ru` |
| `/kalkulyatory/markirovka` | 0.9 | `https://kassa-cto.ru/kalkulyatory/markirovka` |
| `/nastroyka-kassy-markirovka` | 0.9 | ... |
| Все остальные | 0.6-0.8 | ... |

Все canonical URL используют **non-www** (`kassa-cto.ru`), централизованно в `src/config/site.ts`.

---

## 9. Известные задачи и TODO

### Выполнено (2026-05-08)
- [x] Убраны hardcoded секреты (admin.ts, telegram.ts)
- [x] SITE_URL централизован в src/config/site.ts
- [x] sitemap.ts: исправлен www → non-www
- [x] Создан .htaccess для Beget (security headers + API routing)
- [x] Создан config.php.example (шаблон без секретов)
- [x] .gitignore: добавлены *.zip, out-with-api/, config.php, chat-data/
- [x] PROJECT_GUIDE.md обновлён

### В очереди
- [ ] Cookie consent banner
- [ ] FAQPage schema для всех FAQ
- [ ] OG + Twitter Cards для всех страниц
- [ ] Мобильная адаптация (шапка + иконки + FAQ-виджет)
- [ ] Google Sheets через Apps Script Web App
- [ ] Удалить мёртвый код (middleware.ts, CF Functions)
- [ ] GTM события конверсий
- [ ] Политика конфиденциальности
- [ ] Калькулятор 1С / Расчёт ОФД

---

## 10. Правила работы с проектом

1. **ВСЕГДА** читай этот файл перед началом работы
2. `output: 'export'` — это **статический сайт**, middleware/API routes не работают
3. **НЕ** добавляй fallback'ы с секретами в код
4. **НЕ** коммить `*.zip`, `out-with-api/`, `config.php`, `.env*`
5. Деплой: `npm run build` → загрузка `out/` на Beget вручную
6. Все URL — **только** из `src/config/site.ts`
7. При добавлении страниц — обновлять `sitemap.ts`
8. Контакты и цены — только в `src/config/`
9. API-эндпоинты — **только** через PHP proxy, не через Next.js API routes
10. Security headers — **только** в `public/.htaccess`, не в next.config.ts

---

*Последнее обновление: 2026-05-08*
