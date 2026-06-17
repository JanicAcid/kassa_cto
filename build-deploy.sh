#!/usr/bin/env bash
# ============================================================================
# build-deploy.sh — Сборка деплой-архива для kassa-cto.ru
# ============================================================================
# Использование:  ./build-deploy.sh
# Результат:      kassa-cto-deploy-YYYYMMDD-HHMMSS.zip в корне проекта
#
# Архив собран так, чтобы файлы лежали В КОРНЕ (без обёртки out/).
# Распаковка прямо в public_html на Beget = автозамена всех файлов.
#
# ВАЖНО: api/config.php НЕ входит в архив (секреты!).
#        На сервере он уже должен существовать.
# ============================================================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# ── 1. Установка зависимостей (если нужно) ──────────────────────────────────
if [ ! -d "node_modules" ]; then
  echo "📦 Установка зависимостей..."
  npm install --production=false
fi

# ── 2. Сборка Next.js (static export → out/) ────────────────────────────────
echo "🔨 Сборка Next.js..."
npm run build

if [ ! -d "out" ]; then
  echo "❌ Ошибка: директория out/ не создана. Сборка провалилась."
  exit 1
fi

# ── 3. Добавляем PHP API proxy ──────────────────────────────────────────────
echo "📋 Копирование PHP API proxy..."
if [ -d "api-proxy/api" ]; then
  mkdir -p "out/api"
  cp "api-proxy/api/index.php" "out/api/index.php"
  echo "   ✅ api/index.php — скопирован"
  echo "   ⚠️  api/config.php — НЕ включён (секреты, уже на сервере)"
else
  echo "   ⚠️  api-proxy/api/ не найден, пропускаем"
fi

# ── 4. Убедимся что .htaccess на месте ──────────────────────────────────────
if [ ! -f "out/.htaccess" ]; then
  if [ -f "public/.htaccess" ]; then
    cp "public/.htaccess" "out/.htaccess"
    echo "📋 .htaccess скопирован из public/"
  else
    echo "⚠️  .htaccess не найден! API и редиректы НЕ будут работать."
  fi
else
  echo "✅ .htaccess уже в out/ (из public/)"
fi

# ── 5. Генерация уникального имени архива ────────────────────────────────────
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
ARCHIVE_NAME="kassa-cto-deploy-${TIMESTAMP}.zip"
ARCHIVE_PATH="$PROJECT_DIR/$ARCHIVE_NAME"

# Удаляем старые деплой-архивы в корне проекта
rm -f "$PROJECT_DIR"/kassa-cto-deploy-*.zip

# ── 6. Упаковка в ZIP (файлы в корне архива!) ───────────────────────────────
# ВАЖНО: robots.txt нужен в архиве, поэтому исключаем только *.txt-дубликаты
# страниц (например, index.txt), а robots.txt добавляем явно.
# admin.html и admin/ ВКЛЮЧЕНЫ — CRM-кабинет менеджера активно используется.
echo "📦 Упаковка архива $ARCHIVE_NAME ..."
cd out
zip -r "$ARCHIVE_PATH" . \
  -x "*.txt"
# Гарантированно добавляем robots.txt (если он не попал из-за -x "*.txt")
if [ -f "robots.txt" ]; then
  zip -u "$ARCHIVE_PATH" robots.txt 2>/dev/null || true
fi
cd "$PROJECT_DIR"

# ── 7. Отчёт ────────────────────────────────────────────────────────────────
SIZE=$(du -sh "$ARCHIVE_PATH" | cut -f1)
FILES_COUNT=$(unzip -l "$ARCHIVE_PATH" | tail -1 | awk '{print $2}')

echo ""
echo "✅ Архив готов: $ARCHIVE_NAME"
echo "   Размер: $SIZE"
echo "   Файлов: $FILES_COUNT"
echo ""
echo "📥 Деплой на Beget:"
echo "   1. Скачать $ARCHIVE_NAME"
echo "   2. Загрузить в public_html через файловый менеджер Beget"
echo "   3. Распаковать прямо в public_html (файлы заменятся автоматически)"
echo "   ⚠️  api/config.php НЕ затронут — секреты в безопасности"
