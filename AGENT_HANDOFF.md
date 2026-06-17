# AGENT_HANDOFF.md — Журнал передачи контекста между AI-агентами

> **ВНИМАНИЕ! Это самый важный файл для нового агента. Прочитай его ПОЛНОСТЬЮ перед началом работы.**
> **Обновляй этот файл КАЖДЫЙ РАЗ при любых изменениях в коде, хостинге или настройках.**

---

## 🔑 Доступы

| Ресурс | Данные |
|---|---|
| GitHub (рабочий) | `JanicAcid/kassa_cto` (private), PAT: `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` |
| GitHub (архив) | `JanicAcid/tellur-markirovka-backup` (private, **НЕ РЕДАКТИРОВАТЬ!**) |
| Beget хостинг | Логин: `xdeck7ph`, Пароль: `89520955956Ff`, IP: `87.236.16.235` |
| FTP/SSH Beget | `xdeck7ph_cto` / `K1slotn1k!` |
| Почта домена | `admin@kassa-cto.ru` / `K1slotn1k!` (SMTP `smtp.beget.com:465` SSL) |
| CRM (admin/login) | Логин: `tellur`, Пароль: `Tellur2026!`, JWT secret: `k7Hm2pQw9xR4vN8jL3fY6tB5cA1dE0sZm` |
| Google Sheets ID | `1d73G5EtY2oLG07x8A7HnDg3VjKoGYWKAHQiHc874uSA` |
| Google SA email | `tellur-crm@avid-catalyst-445621-c0.iam.gserviceaccount.com` |
| Уведомления | `janicacid@gmail.com` |
| Yandex Metrika | ID: `108406091` |
| Google верификация | `google6d0854c5f9ec794a.html` |
| Яндекс верификация | `yandex_1a88703cc40147f3.html` |

---

## 📋 Суть проекта

Сайт ООО **«Теллур-Интех»** (СПб, с 1995 года) — ЦТО кассового оборудования.
Основной функционал: **онлайн-калькулятор стоимости подключения маркировки** (Честный ЗНАК, ЭДО, ТС ПИоТ, ФНС, ОФД).

**Продакшен**: https://kassa-cto.ru
**Телефон**: +7 (812) 465-94-57
**Email**: push@tellur.spb.ru

---

## 🏗️ Архитектура (КРИТИЧЕСКИ ВАЖНО)

```
┌─────────────────────────────────────────────────────────┐
│  Пользователь → kassa-cto.ru (Beget shared hosting)     │
│                     │                                    │
│     ┌───────────────┼───────────────┐                    │
│     ▼               ▼               ▼                    │
│  Статика         .htaccess      api/index.php            │
│  (Next.js        (роутинг +     (PHP proxy v7)           │
│   export)         заголовки)        │                    │
│                                      ▼                    │
│                                Telegram Bot API          │
│                                (уведомления + чат)       │
└─────────────────────────────────────────────────────────┘
```

**КЛЮЧЕВЫЕ ОГРАНИЧЕНИЯ `output: 'export'`:**
- Это **полностью статический сайт** — никакого SSR
- Next.js middleware **НЕ работает** — удалён, но файл `src/middleware.ts` ещё висит (мёртвый код)
- Next.js API routes **НЕ работают** — всё через PHP proxy
- `redirects()` и `headers()` из next.config.ts **НЕ применяются** — всё в `.htaccess`
- Security headers — **ТОЛЬКО** в `public/.htaccess`

---

## 🛠️ Технологический стек

| Технология | Версия | Примечание |
|---|---|---|
| Next.js (App Router, static export) | 15.5.x | `output: 'export'` |
| React | 19.x | |
| TypeScript | 5.x | `ignoreBuildErrors: true` |
| Tailwind CSS | 4.x | via @tailwindcss/postcss |
| shadcn/ui | Radix UI | primitives |
| PHP | 8.x | Beget, API proxy |
| Аналитика | Yandex Metrika | ID: 108406091 |

---

## 📂 Структура проекта

```
kassa_cto/
├── src/
│   ├── app/                    # Next.js App Router (30 страниц)
│   │   ├── page.tsx            # Главная
│   │   ├── layout.tsx          # Root layout + CookieConsent + Metrika
│   │   ├── sitemap.ts          # Автогенерация sitemap.xml
│   │   ├── globals.css         # Tailwind
│   │   ├── admin/              # Админ-кабинет (клиентская защита)
│   │   ├── kalkulyatory/       # Калькуляторы (маркировка, 1С, ОФД)
│   │   ├── instructions/       # Инструкции (2 статьи)
│   │   ├── diagnostika/        # Диагностика (ФНС, ОФД)
│   │   ├── faq/                # FAQ
│   │   ├── services/           # Услуги
│   │   ├── about/              # О компании
│   │   ├── contacts/           # Контакты
│   │   ├── privacy/            # Политика конфиденциальности
│   │   └── markirovka-*/       # SEO-лендинги (4 страницы)
│   │
│   ├── components/             # React-компоненты (30+)
│   │   ├── Navbar.tsx          # Навигация
│   │   ├── SiteFooter.tsx      # Подвал
│   │   ├── ChatWidget.tsx      # Telegram чат-виджет
│   │   ├── CookieConsent.tsx   # Баннер ФЗ-152
│   │   ├── JsonLd.tsx          # Schema.org разметка
│   │   ├── calculator/         # Шаги калькулятора (5 компонентов)
│   │   └── ui/                 # shadcn/ui primitives
│   │
│   ├── config/                 # ВСЯ конфигурация
│   │   ├── site.ts             # ⭐ SITE_URL, COMPANY_NAME (единственный источник!)
│   │   ├── telegram.ts         # Токен бота (env only, fallback убран)
│   │   ├── admin.ts            # Админ-доступ (env only, fallback убран)
│   │   ├── contacts.ts         # Телефоны, филиалы
│   │   ├── services.ts         # Услуги и цены (шаг 2)
│   │   ├── services-step2.ts   # Зависимости услуг от бренда
│   │   ├── services-step3.ts   # Доп. услуги (шаг 3)
│   │   ├── brands.ts           # 7 брендов касс
│   │   ├── ofd.ts              # Провайдеры ОФД
│   │   ├── kkt-catalog.ts      # Реестр ККТ ФНС (58 производителей)
│   │   ├── hints.ts            # Подсказки в калькуляторе
│   │   ├── articles.ts         # Статьи инструкций
│   │   ├── product-cards.ts    # Карточки продуктов
│   │   └── google-sheets.ts    # Google Sheets (ЗАГЛУШКА, Node.js only)
│   │
│   ├── lib/                    # Утилиты
│   │   ├── utils.ts, phone.ts, jwt.ts
│   │
│   └── middleware.ts           # ⚠️ МЁРТВЫЙ КОД — не работает с export!
│
├── api-proxy/                  # PHP API (деплоится на Beget)
│   └── api/
│       ├── index.php           # Роутер v7 (чат + заказы + капча)
│       └── config.php.example  # Шаблон (секреты НЕ в репо!)
│
├── functions/                  # ⚠️ МЁРТВЫЙ КОД — CF Functions (не задеплоен)
│
├── public/
│   ├── .htaccess               # ⭐ Security headers + API routing + редиректы
│   ├── robots.txt
│   ├── manifest.json
│   ├── brands/                 # Логотипы брендов касс
│   ├── services/               # Иконки услуг
│   ├── instructions/           # SVG для инструкций
│   └── (favicon, logo, og-image и т.д.)
│
├── build-deploy.sh             # ⭐ Скрипт сборки деплой-архива
├── PROJECT_GUIDE.md            # Руководство для AI-агентов
├── CHANGELOG.md                # История изменений
└── AGENT_HANDOFF.md            # ⭐ ЭТОТ ФАЙЛ — журнал передачи контекста
```

---

## 🚀 Деплой

### Как собрать архив:
```bash
cd /tmp/kassa_cto   # (или куда склонирован репо)
git pull origin main
./build-deploy.sh
```

Результат: `kassa-cto-deploy-YYYYMMDD-HHMMSS.zip` (~3.3MB, ~170 файлов)

### Как задеплоить на Beget:
1. Скачать архив
2. Загрузить в `public_html` через файловый менеджер Beget (https://login.beget.com)
3. Распаковать прямо в `public_html` — файлы заменятся автоматически
4. `api/config.php` **НЕ затрагивается** — секреты в безопасности

### Что входит в архив:
- ✅ Весь статический сайт (HTML, _next/, images)
- ✅ `api/index.php` (PHP proxy)
- ✅ `.htaccess` (роутинг + заголовки)
- ❌ `api/config.php` (секреты — уже на сервере)
- ❌ `*.txt` (дубликаты HTML)
- ❌ `admin.html` (клиентская админка через JS chunks)

---

## ⚠️ КОСТЫЛИ И ОПАСНЫЕ МЕСТА (НЕ ЛОМАТЬ!)

### 1. `output: 'export'` — главное ограничение
Всё, что требует сервера (middleware, API routes, SSR, ISR) — **НЕ РАБОТАЕТ**.
Любой код, зависящий от `next/headers`, `next/cookies`, `getServerSideProps` — мёртвый.

### 2. PHP proxy — единственный бекенд
`api/index.php` обрабатывает ВСЁ: чат, заказы, капчу. Сессии чата — **файлы в chat-data/**.
Нет базы данных. Заказы хранятся **только в Telegram** (нет постоянного хранилища).

### 3. `api/config.php` на сервере — НЕ ТРОГАТЬ
Содержит реальный токен бота и chat ID. Если перезапишешь шаблоном — чат и заказы перестанут работать.

### 4. `.htaccess` — единственный источник редиректов и заголовков
`next.config.ts` содержит `redirects()` и `headers()`, но они **НЕ применяются** при `output: 'export'`.
Все редиректы и заголовки — только в `public/.htaccess`.

### 5. `src/middleware.ts` — МЁРТВЫЙ КОД
Файл существует, но middleware не работает при static export. Админка защищена **только** клиентскими проверками (JWT в cookie).

### 6. `functions/` — МЁРТВЫЙ КОД CF Functions
Cloudflare Functions с JWT-авторизацией и Google Sheets. Никогда не деплоились. Оставить как есть до очистки.

### 7. Калькуляторы 1С и ОФД — ЗАГЛУШКИ
`/kalkulyatory/1c` и `/kalkulyatory/ofd` — это страницы-заглушки без реальной логики расчёта.

### 8. Диагностика ФНС/ОФД — ЗАГЛУШКИ
`/diagnostika/fns` и `/diagnostika/ofd` — страницы без реальной проверки.

### 9. `src/config/google-sheets.ts` — ЗАГЛУШКА
Логирование заказов в Google Sheets не работает. Нужен Apps Script Web App (OAuth на Beget невозможен).

### 10. `src/config/admin.ts` и `src/config/telegram.ts`
Hardcoded значения убраны, но fallback пустые строки. На Beget секреты — только в `config.php`.

---

## ✅ ЧТО УЖЕ СДЕЛАНО (последний коммит сверху)

| Коммит | Дата | Описание |
|---|---|---|
| (HEAD) | 2026-06-17 | **Актуализация из архива kassa-cto-deploy_11.zip**: api/index.php v8→v11 (Apps Script убран; PHP пишет в Google Sheets напрямую через Service Account; email: mail() primary + SMTP fallback с multipart/alternative + envelope sender -f admin@kassa-cto.ru). .htaccess: добавлены clean URLs (`/foo` → `foo.html`, 3 уровня), 301 `/diagnostika` → `/markirovka/diagnostika`, HTTP→HTTPS, www→non-www. build-deploy.sh: убрано исключение `admin.html` и `admin/*` (CRM-кабинет менеджера активно используется), добавлено явное включение `robots.txt`. config.php.example обновлён под v11. |
| `9178ea7` | 2026-06-03 | Архитектурный переход: убран Telegram Bot, добавлены Max/Telegram контакты, Google Sheets через Apps Script |
| `7b68068` | 2026-05-08 | Скрипт `build-deploy.sh`, удалены 6 старых ZIP (~15MB) |
| `6a7bcac` | 2026-05-08 | CookieConsent баннер (ФЗ-152) + страница /privacy |
| `cffef8c` | 2026-05-08 | Убраны hardcoded секреты, SITE_URL централизован, .htaccess, config.php.example |
| `1bb87f2` | 2026-04-26 | Исправлены дубли сообщений чата (sendingRef вместо state) |
| `031490e` | 2026-04-26 | sessionStorage вместо localStorage для сессий чата |
| `96ff2a9` | 2026-04-25 | PHP proxy v7 — multi-client чат с inline кнопками |
| `4e08852` | 2026-04-15 | CRO + SEO: CSP, CTAs, диагностика, хлебные крошки, SEO-страницы |
| `13e723a` | 2026-04-14 | Новый домен kassa-cto.ru (миграция с Cloudflare) |
| `ca900f9` | 2026-04-14 | Миграция с Cloudflare на Beget |
| `fcc3616` | 2026-04-13 | PHP API proxy для Telegram на Beget |

---

## 📋 ОЧЕРЕДЬ ЗАДАЧ (по приоритету)

### 🔥 Критические (бизнес-логика)
- [x] **Google Sheets логирование** — реализовано в api/index.php v10+ через Service Account (Apps Script не нужен)
- [x] **Постоянное хранилище заказов** — Google Sheets Лист1 (12 колонок: A-L)
- [x] **Email уведомления** — v11: `mail()` primary (через локальный MTA Beget с DKIM) + SMTP fallback. multipart/alternative + envelope sender `-f admin@kassa-cto.ru`.
- [x] **CRM кабинет менеджера** — `/admin/login` + `/admin`, JWT auth, чтение/правка заказов в Sheets
- [ ] **Ротация GitHub PAT** — токен в remote URL, нужно обновлять перед истечением

### ⚡ Высокие (функционал)
- [ ] **Калькулятор 1С** — сейчас заглушка `/kalkulyatory/1c`
- [ ] **Калькулятор ОФД** — сейчас заглушка `/kalkulyatory/ofd`
- [ ] **Диагностика ФНС** — реальная проверка через API ФНС
- [ ] **Диагностика ОФД** — реальная проверка через API ОФД

### 📱 Средние (UX/SEO)
- [ ] **Мобильная адаптация** — шапка, иконки, FAQ-виджет
- [ ] **FAQPage schema** — JSON-LD для всех FAQ-ответов
- [ ] **OG + Twitter Cards** — для всех страниц (сейчас не везде)
- [ ] **GTM события** — конверсии калькулятора, чата, заказов
- [ ] **Cookie consent** — интеграция с Yandex Metrika (блокировать до согласия)

### 🏗️ Технический долг
- [ ] **Удалить middleware.ts** — мёртвый код
- [ ] **Удалить functions/** — CF Functions, мёртвый код
- [ ] **Удалить out-with-api/** — старый билд, не нужен
- [ ] **Удалить dead code в next.config.ts** — `redirects()` и `headers()` не работают
- [ ] **TypeScript strict** — `ignoreBuildErrors: true` маскирует ошибки

### 🚀 Будущее (когда база готова)
- [ ] Онлайн-оплата (ЮKassa/Robokassa)
- [ ] Личный кабинет клиента
- [ ] PWA (offline + push-уведомления)

---

## 📐 ПРАВИЛА РАБОТЫ (ОБЯЗАТЕЛЬНО!)

1. **ПЕРВОЕ ДЕЙСТВИЕ**: прочитать `AGENT_HANDOFF.md` и `PROJECT_GUIDE.md`
2. `output: 'export'` = **статический сайт** — никакого SSR/middleware/API routes
3. **НЕ** добавлять fallback'ы с реальными секретами в код
4. **НЕ** коммитить `*.zip`, `out/`, `out-with-api/`, `config.php`, `.env*`
5. Деплой: `./build-deploy.sh` → загрузить ZIP на Beget → распаковать в `public_html`
6. Все URL — **только** из `src/config/site.ts`
7. При добавлении страниц — обновлять `sitemap.ts`
8. Контакты и цены — **только** в `src/config/`
9. API-эндпоинты — **только** через PHP proxy (`api-proxy/api/index.php`)
10. Security headers — **только** в `public/.htaccess`, не в `next.config.ts`
11. **Обновлять этот файл** при каждом изменении!
12. **Вести worklog** в `/home/z/my-project/worklog.md`

---

## 📊 СТАТИСТИКА ПРОЕКТА

| Метрика | Значение |
|---|---|
| Страниц | 30 (29 роутов + sitemap.xml) |
| Компонентов | 30+ |
| Конфигов | 14 |
| LOC | ~16 000 |
| Размер архива | ~3.3 MB |
| Коммитов | 30+ |
| Готовность | ~80% |

---

## 🔄 ИСТОРИЯ ИЗМЕНЕНИЙ (этот файл)

### 2026-06-17 — Актуализация из архива kassa-cto-deploy_11.zip
- **api/index.php v8 → v11**: убран Apps Script, PHP пишет в Google Sheets напрямую через Service Account. Email переписан: `mail()` primary (multipart/alternative + envelope sender `-f admin@kassa-cto.ru`) + SMTP `smtp.beget.com:465` fallback с проверкой каждого шага (MAIL FROM/RCPT TO/DATA).
- **.htaccess**: добавлены clean URLs (`/foo` → `foo.html`, до 3 уровней), 301 `/diagnostika` → `/markirovka/diagnostika`, HTTP→HTTPS, www→non-www редиректы.
- **build-deploy.sh**: убрано исключение `admin.html` и `admin/*` (CRM теперь в проде), добавлено явное включение `robots.txt`.
- **config.php.example**: переписан под структуру v11 (return array с ADMIN_*, GOOGLE_*, NOTIFY_EMAIL).
- **Доступы**: обновлён GitHub PAT, добавлены FTP/SSH, SMTP, CRM-credentials.
- Последний коммит в main: `9178ea7` (до этого коммита) → HEAD после пуша этой актуализации.

### 2026-05-08 — Создание AGENT_HANDOFF.md
- Создан файл журнала передачи контекста
- Актуализированы: доступы, архитектура, очередь задач, костыли
- Последний коммит в main: `7b68068`
