# CHANGELOG — Реестр корректировок проекта kassa-cto.ru

> Формат: даты в UTC, все изменения документируются.

---

## [2026-06-17] — Актуализация из архива kassa-cto-deploy_11.zip + фикс email

**Автор:** Super Z (AI-агент), пользователь

### Причина
Репозиторий `JanicAcid/kassa_cto` отставал от актуального состояния продакшена. В архиве `kassa-cto-deploy_11.zip` был PHP API v10 (Apps Script убран, прямая запись в Google Sheets через Service Account, email через SMTP), а в репо лежал v8 (Apps Script). Также пользователь сообщил, что уведомления о заявках не приходят на почту.

### Изменения

#### `api-proxy/api/index.php` (v8 → v11)
- **Apps Script полностью убран** — PHP пишет в Google Sheets напрямую через Service Account (JWT → access_token → Sheets API v4 append).
- **Email переписан**: теперь `sendOrderEmail()` сначала пробует PHP `mail()` (через локальный MTA Beget — у него лучше IP-reputation и DKIM-подпись), а при неудаче падает на SMTP `smtp.beget.com:465` (SSL) с проверкой каждого шага (`MAIL FROM`, `RCPT TO`, `DATA`).
- Добавлена функция `sendViaMail()` — multipart/alternative (text/plain + text/html), envelope sender `-f admin@kassa-cto.ru` (повышает шансы пройти SPF/DKIM), корректные `Message-ID`, `Date`, `Reply-To`, `Auto-Submitted`.
- `smtpSend()` теперь принимает параметр `plain` и тоже шлёт multipart/alternative, проверяет ответы на каждом шаге, логирует ошибки в `error_log`.
- `/api/test` переписан: показывает результат обоих методов (`mail()` и SMTP) — удобно для отладки «почему не доходит».

#### `public/.htaccess`
- Добавлены **clean URLs**: `/foo` → `foo.html`, `/dir/bar` → `dir/bar.html`, 3-й уровень вложенности.
- 301 редирект `/diagnostika` → `/markirovka/diagnostika`.
- HTTP → HTTPS, www → non-www редиректы.
- `Redirect 301 /diagnostika` поставлен ПЕРЕД clean-URL правилами (важно: Apache применяет Redirect до Rewrite).

#### `build-deploy.sh`
- Убрано исключение `admin.html` и `admin/*` — CRM-кабинет менеджера теперь в проде.
- Добавлено явное включение `robots.txt` в архив (раньше падало жертвой `-x "*.txt"`).

#### `api-proxy/api/config.php.example`
- Переписан под структуру v11: `return [...]` массив с ключами `APPS_SCRIPT_URL`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `NOTIFY_EMAIL`, `GOOGLE_SHEETS_ID`, `GOOGLE_SA_EMAIL`, `GOOGLE_SA_PRIVATE_KEY`.

#### `AGENT_HANDOFF.md`
- Обновлён GitHub PAT (новый: `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`).
- Добавлены FTP/SSH, SMTP, CRM credentials.
- Отмечены выполненными: Google Sheets логирование, постоянное хранилище заказов, email уведомления, CRM кабинет.
- Добавлен раздел в историю изменений.

### Деплой
- Файл `api-proxy/api/index.php` — копируется в `out/api/index.php` при сборке.
- На сервере `api/config.php` НЕ трогается (секреты).
- Для применения фикса email: собрать архив (`./build-deploy.sh`) → загрузить в `public_html` на Beget → распаковать с заменой.
- Диагностика: `https://kassa-cto.ru/api/test` — показывает статус `mail()`, SMTP, Google Sheets.

---

## [2026-04-25 ~ 2026-04-26] — Полная миграция с Cloudflare на Beget

**Автор:** Super Z (AI-агент), пользователь

### Причина:

Мобильные устройства в РФ не могут загрузить сайт — Cloudflare CDN заблокирован/троттлится российскими провайдерами. Без VPN загрузка останавливается на ~50%. Решение: перенос на Beget shared hosting с IP 87.236.16.235.

### Инфраструктура — DNS:

| Изменение | Было | Стало |
|-----------|------|-------|
| NS | Cloudflare (`*.ns.cloudflare.com`) | Beget (`ns1.beget.com`, `ns2.beget.com`) |
| A-запись `kassa-cto.ru` | Cloudflare proxy | `87.236.16.235` |
| A-запись `www.kassa-cto.ru` | Cloudflare proxy | `87.236.16.235` |
| SSL | Cloudflare managed | Let's Encrypt (Beget, валиден до 21.07.2026) |

### Инфраструктура — Хостинг:

- Платформа: Beget shared hosting
- IP: 87.236.16.235
- Домен привязан к директории сайта в панели Beget
- WordPress автоустановлен Beget при привязке домена → удалён, файлы перезагружены
- Права доступа файлов: 600 → 755 (критично для Apache)

### Файлы:

- Статический экспорт Next.js (`output: 'export'`): 192 файла, ~3.7MB
- `kassa-cto-deploy.zip` — полный билд сайта
- `api-proxy.zip` — PHP-прокси для Telegram API

### PHP API-прокси (замена Cloudflare Functions):

| Endpoint | Метод | Функция | Статус |
|----------|-------|---------|--------|
| `/api/send-order` | POST | Отправка заказа в Telegram (HTML-документ) | ✅ Работает |
| `/api/chat/send` | POST | Чат-сообщение → Telegram | ✅ Работает |
| `/api/chat/poll` | GET | История чата (заглушка) | ✅ Заглушка |
| `/api/captcha` | GET | Генерация капчи (арифметика) | ✅ Работает |
| `/api/log-order` | POST | Логирование в Google Sheets (заглушка) | ✅ Заглушка |

### Файлы API-прокси:

- `api/index.php` — единый роутер для всех API-эндпоинтов
- `api/config.php` — конфигурация (Telegram bot token, chat ID)
- `.htaccess` — правило RewriteRule `/api/send-order` → `api/index.php`

### Задачи:

- [x] Создание ZIP-архива со статическим билдом
- [x] Загрузка на Beget через файловый менеджер (FTP заблокирован с не-РФ IP)
- [x] Перенос DNS с Cloudflare на Beget
- [x] Настройка A-записей (с www и без)
- [x] Выпуск SSL-сертификата Let's Encrypt
- [x] Привязка домена к директории сайта
- [x] Исправление прав доступа (755)
- [x] Удаление auto-установленного WordPress
- [x] Перезагрузка файлов после удаления WP
- [x] Создание и загрузка PHP API-прокси для Telegram
- [x] Тестирование всех API-эндпоинтов
- [x] Проверка отправки сообщений в Telegram
- [ ] Очистка проекта в Cloudflare (опционально)

### Примечания:

- FTP с не-российских IP заблокирован Beget — загрузка только через файловый менеджер в панели
- Google Sheets логирование недоступно на shared hosting (нет серверного OAuth) — заглушка
- Чат-виджет хранит только текущую сессию (no persistence)
- Cloudflare Functions не работают на статическом хостинге → заменены PHP-прокси

---

## [2026-04-23] — Починка мобильных устройств + CF оптимизация

**Автор:** Super Z (AI-агент)

### Изменения Cloudflare:

| Настройка | Было | Стало | Причина |
|-----------|------|-------|---------|
| `browser_cache_ttl` | 0 (нет кеша) | 14400 (4 часа) | Мобильные устройства загружали 154KB HTML при каждом запросе |
| `always_online` | off | on | Fallback при недоступности CF Pages |

### Изменения кода:

| Файл | Изменение | Причина |
|------|-----------|---------|
| `src/app/layout.tsx` | Убраны `maximumScale: 1` и `userScalable: false` из viewport | `user-scalable=no` блокирует рендер на некоторых мобильных браузерах |

### Задачи:

- [x] CF browser_cache_ttl → 14400
- [x] CF always_online → on
- [x] Viewport: убран user-scalable=no
- [ ] Деплой коммита 1fac7df (API-миграция в CF Functions) на CF Pages
- [ ] Проверка работоспособности с мобильных устройств

### Примечания:

- SSL режим остаётся `full` (норма для CF Pages — CF управляет сертификатом оригинала)
- `full_strict` недоступен для CF Pages зон
- HTML размер 154KB — аномально большой, рекомендуется рассмотреть разбиение на чанки в будущем

---

## [2026-04-17] — Миграция API в Cloudflare Pages Functions

**Автор:** предыдущий AI-агент (сессия "касса цто")

### Изменения кода:

- Удалены все Next.js API routes из `src/app/api/`
- Создан единый `functions/api/[[path]].ts` — Cloudflare Pages Function
- Обновлены URL в `src/components/calculator/DoneScreen.tsx` для CF Functions
- Обновлены канонические URL на всех страницах: `tellurmarkirovka.vercel.app` → `kassa-cto.ru`

### Примечания:

- Коммит `1fac7df` создан, но НЕ задеплоен на CF Pages (последний деплой: `13e723a`)

---

## [2026-04-14] — Миграция на Cloudflare Pages + смена домена

**Автор:** предыдущий AI-агент (сессия "касса цто")

### Инфраструктура:

- Создан проект Cloudflare Pages: `kassa-cto`
- DNS: CNAME `kassa-cto.ru` → `kassa-cto.pages.dev` (proxied)
- DNS: CNAME `www.kassa-cto.ru` → `kassa-cto.pages.dev` (proxied)
- SSL: активирован (сертификат Let's Encrypt через CF)
- Домены: `kassa-cto.ru`, `www.kassa-cto.ru`, `kassa-cto.pages.dev`

### Изменения кода:

- Все URL: `tellurmarkirovka.vercel.app` → `kassa-cto.ru`
- `next.config.ts`: добавлен 301-редирект со старого домена
- `robots.txt`: обновлён Host и Sitemap
- `sitemap.ts`: baseUrl = `https://kassa-cto.ru`
- Все canonical, OG, Schema обновлены

---

## [2026-04-09] — Создание бекапа

**Автор:** предыдущий AI-агент

- Создан приватный репозиторий `JanicAcid/tellur-markirovka-backup`
- Полная копия проекта (состояние на момент создания)
- Описание: "АрХИВНАЯ КОПИЯ — tellurmarkirovka.vercel.app — НЕ РЕДАКТИРОВАТЬ"

---

## [2026-04-05 ~ 2026-04-09] — Основная разработка

**Автор:** предыдущий AI-агент (сессия "касса цто")

### Реализовано:

- Полный сайт ООО «Теллур-Интех» на Next.js 15.5 + React 19 + Tailwind CSS 4
- Калькулятор маркировки (4-шаговый wizard)
- Telegram-чат виджет (бот @spbmarkirovka_bot)
- SEO-лендинги: настройка кассы, Честный ЗНАК, интеграция 1С
- Страницы по категориям: маркировка обуви, одежды, табака
- Диагностика ФНС и ОФД
- Справочник касс + интерактивная консультация
- SEO: JSON-LD, sitemap, мета-теги, верификация Яндекса/Google
- Безопасность: HSTS, CSP, X-Frame-Options
- Yandex Metrika (ID: 108406091)
- PROJECT_GUIDE.md — руководство для AI-агентов
