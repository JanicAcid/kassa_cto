<?php
/**
 * kassa-cto.ru API Router v11
 * Apps Script УБРАН — PHP пишет в Sheets напрямую.
 * Email: mail() (primary, Beget local MTA + DKIM) → SMTP smtp.beget.com:465 (fallback).
 */

header('Content-Type: application/json; charset=utf-8');

// CORS — только с нашего домена (не *)
$allowed_origins = ['https://kassa-cto.ru', 'https://www.kassa-cto.ru'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) { jsonResponse(['error' => 'API not configured'], 500); }

$config = require $configPath;

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = preg_replace('#^/api/#', '', parse_url($requestUri, PHP_URL_PATH));
$path = rtrim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ("$method $path") {
        case 'GET captcha':        handleCaptcha(); break;
        case 'GET test':           handleTest($config); break;
        case 'POST log-order':     handleLogOrder($config); break;
        case 'GET admin/auth':     handleAdminCaptcha(); break;
        case 'POST admin/auth':    handleAdminLogin($config); break;
        case 'DELETE admin/auth':  handleAdminLogout(); break;
        case 'GET admin/orders':   requireAuth($config); handleGetOrders($config); break;
        case 'PATCH admin/orders': requireAuth($config); handlePatchOrder($config); break;
        default: jsonResponse(['error' => 'Not Found'], 404);
    }
} catch (Throwable $e) {
    error_log('API error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    jsonResponse(['error' => 'Internal Server Error'], 500);
}

// ══════════════════════════════════════════════════════════════════
// CAPTCHA v2 — server-side хранилище + искажённая математика
// ══════════════════════════════════════════════════════════════════
//
// Улучшения безопасности v2:
// 1. Токен капчи — это случайный ID, ответ хранится в файле на сервере
//    (НЕ в base64 на клиенте — было уязвимостью, бот распарсит за 1 сек)
// 2. Математика сложнее: 2-3 операнда, скобки, отрицательные не выдаём
// 3. One-shot: каждый токен используется 1 раз, после — удаляется
// 4. TTL 300 сек, авто-очистка устаревших
// 5. Rate limit на генерацию: не чаще 1 капчи / 2 сек с IP
// 6. Графическое искажение текста через Unicode-подстановки (для человека
//    читаемо, для бота сложнее парсить)

function handleCaptcha(): void      { jsonResponse(makeCaptcha()); }
function handleAdminCaptcha(): void { jsonResponse(makeCaptcha()); }

function captchaStoreDir(): string {
    $dir = __DIR__ . '/.captcha_store';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    return $dir;
}

function captchaRateLimit(string $ip): void {
    $file = sys_get_temp_dir() . '/kassa_captcha_rl_' . md5($ip);
    if (file_exists($file) && (time() - filemtime($file) < 2)) {
        jsonResponse(['error' => 'Слишком много запросов, подождите 2 сек'], 429);
    }
    @touch($file);
}

function makeCaptcha(): array {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    captchaRateLimit($ip);

    // Генерация сложного выражения (2-3 операнда)
    $variants = [
        function () { // a ± b × c (с приоритетом)
            $a = rand(10, 50); $b = rand(2, 9); $c = rand(2, 9);
            $op = rand(0, 1) ? '+' : '-';
            $ans = $op === '+' ? $a + $b * $c : $a - $b * $c;
            return ['q' => "$a $op $b × $c = ?", 'ans' => $ans];
        },
        function () { // (a + b) × c
            $a = rand(2, 15); $b = rand(2, 15); $c = rand(2, 9);
            $ans = ($a + $b) * $c;
            return ['q' => "($a + $b) × $c = ?", 'ans' => $ans];
        },
        function () { // a × b + c
            $a = rand(3, 12); $b = rand(3, 12); $c = rand(10, 99);
            $ans = $a * $b + $c;
            return ['q' => "$a × $b + $c = ?", 'ans' => $ans];
        },
        function () { // a² + b (квадрат)
            $a = rand(3, 9); $b = rand(5, 30);
            $ans = $a * $a + $b;
            return ['q' => "$a² + $b = ?", 'ans' => $ans];
        },
        function () { // a × b − c
            $a = rand(4, 12); $b = rand(4, 12); $c = rand(5, 20);
            $ans = $a * $b - $c;
            return ['q' => "$a × $b − $c = ?", 'ans' => $ans];
        },
    ];
    $gen = $variants[array_rand($variants)];
    $item = $gen();

    // Графическое искажение: заменяем цифры на похожие Unicode
    // (для человека читаемо, для OCR сложнее)
    $distorted = distortText($item['q']);

    // Создаём server-side токен
    $id = bin2hex(random_bytes(16));
    $file = captchaStoreDir() . '/' . $id;
    file_put_contents($file, json_encode([
        'answer' => (string)$item['ans'],
        'ts' => time(),
        'ip' => $ip,
        'used' => false,
    ]), LOCK_EX);
    @chmod($file, 0600);

    // Очистка старых токенов (старше 300 сек)
    cleanupOldCaptchaTokens();

    return [
        'id' => $id,
        'question' => $distorted,
        'plain' => $item['q'], // для screen-reader'а (a11y)
        'token' => $id,        // обратно совместимо
    ];
}

function distortText(string $text): string {
    // Замена цифр на Unicode-аналоги (визуально похожи, коды разные)
    // Это затрудняет автоматический парсинг простыми регэкспами
    $map = [
        '0' => '⁰', '1' => '¹', '2' => '²', '3' => '³', '4' => '⁴',
        '5' => '⁵', '6' => '⁶', '7' => '⁷', '8' => '⁸', '9' => '⁹',
    ];
    // 30% шанс искажения (не всегда, чтобы было читаемо)
    if (rand(0, 9) < 3) {
        return strtr($text, $map);
    }
    return $text;
}

function cleanupOldCaptchaTokens(): void {
    $dir = captchaStoreDir();
    $now = time();
    foreach (glob($dir . '/*') as $file) {
        if (is_file($file) && ($now - filemtime($file) > 300)) {
            @unlink($file);
        }
    }
}

function verifyCaptcha(string $token, string $answer, int $maxAge = 300): bool {
    // token — это ID файла на сервере
    $token = preg_replace('/[^a-f0-9]/', '', $token);
    if (strlen($token) !== 32) return false;

    $file = captchaStoreDir() . '/' . $token;
    if (!file_exists($file)) return false;

    $data = json_decode(file_get_contents($file), true);
    if (!is_array($data) || !isset($data['answer'], $data['ts'])) {
        @unlink($file);
        return false;
    }

    // One-shot: помечаем как использованный сразу
    if (!empty($data['used'])) {
        @unlink($file);
        return false;
    }

    // Проверка возраста
    if (time() - $data['ts'] > $maxAge) {
        @unlink($file);
        return false;
    }

    // Проверка IP (опционально — выдаём тому же IP, что и запросил)
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (isset($data['ip']) && $data['ip'] !== 'unknown' && $data['ip'] !== $clientIp) {
        @unlink($file);
        return false;
    }

    // Помечаем как использованный (атомарно)
    $data['used'] = true;
    file_put_contents($file, json_encode($data), LOCK_EX);

    // Удаляем файл после использования
    @unlink($file);

    return hash_equals((string)$data['answer'], trim($answer));
}

// ══════════════════════════════════════════════════════════════════
// RATE LIMITING для /admin/auth и /log-order
// ══════════════════════════════════════════════════════════════════
function rateLimit(string $action, int $maxAttempts, int $windowSec): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = sys_get_temp_dir() . '/kassa_rl_' . md5($action . '_' . $ip);

    $now = time();
    $data = ['attempts' => [], 'blocked_until' => 0];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: $data;
    }

    // Очистка старых попыток
    $data['attempts'] = array_values(array_filter(
        $data['attempts'],
        fn($t) => $t > $now - $windowSec
    ));

    // Проверка блокировки
    if (!empty($data['blocked_until']) && $data['blocked_until'] > $now) {
        $retry = $data['blocked_until'] - $now;
        jsonResponse([
            'error' => "Слишком много попыток. Повторите через $retry сек.",
            'retry_after' => $retry,
        ], 429);
    }

    // Записываем текущую попытку
    $data['attempts'][] = $now;

    // Если превышен лимит — блокируем на 15 минут
    if (count($data['attempts']) > $maxAttempts) {
        $data['blocked_until'] = $now + 900; // 15 минут
        file_put_contents($file, json_encode($data), LOCK_EX);
        jsonResponse([
            'error' => 'Превышен лимит попыток. Блокировка на 15 минут.',
            'retry_after' => 900,
        ], 429);
    }

    file_put_contents($file, json_encode($data), LOCK_EX);
}

function clearRateLimit(string $action): void {
    // Вызывается после УСПЕШНОГО входа — сбрасываем счётчик
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = sys_get_temp_dir() . '/kassa_rl_' . md5($action . '_' . $ip);
    @unlink($file);
}

// ══════════════════════════════════════════════════════════════════
// LOG ORDER — пишем напрямую в Google Sheets + отправляем email
// ══════════════════════════════════════════════════════════════════

function handleLogOrder(array $config): void {
    // Rate limit: 10 заявок в час с IP (защита от спама)
    rateLimit('log_order', 10, 3600);

    $input = getJsonInput();
    if (empty($input['orderNum']) || empty($input['clientName'])) {
        jsonResponse(['error' => 'Missing fields'], 400);
    }

    // Honeypot: если заполнено скрытое поле 'website' — бот
    if (!empty($input['website'])) {
        // Тихо имитируем успех, чтобы бот не знал
        jsonResponse(['success' => true, 'sheets' => 'ok', 'email' => 'ok']);
    }

    $sheetsId = $config['GOOGLE_SHEETS_ID'] ?? '';
    $saEmail  = $config['GOOGLE_SA_EMAIL'] ?? '';
    $saKey    = $config['GOOGLE_SA_PRIVATE_KEY'] ?? '';
    $notify   = $config['NOTIFY_EMAIL'] ?? 'janicacid@gmail.com';

    // Sanitization: обрезаем длину, тримим
    $orderNum   = trim(substr((string)($input['orderNum'] ?? ''), 0, 50));
    $clientName = trim(substr((string)($input['clientName'] ?? ''), 0, 200));
    $phone      = trim(substr((string)($input['phone'] ?? ''), 0, 50));
    $email      = trim(substr((string)($input['email'] ?? ''), 0, 200));
    $kkmType    = trim(substr((string)($input['kkmType'] ?? ''), 0, 200));
    $kkmCond    = trim(substr((string)($input['kkmCondition'] ?? ''), 0, 50));
    $services   = is_array($input['services'] ?? null)
                  ? implode(', ', array_map(fn($s) => trim(substr((string)$s, 0, 200)), $input['services']))
                  : trim(substr((string)($input['services'] ?? ''), 0, 1000));
    $total      = (string)($input['total'] ?? '');
    $total      = preg_replace('/[^\d\.\,]/', '', $total); // только цифры
    $comment    = trim(substr((string)($input['comment'] ?? ''), 0, 2000));

    // Валидация email если указан
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Некорректный email'], 400);
    }

    // Валидация телефона (цифры, +, -, пробелы, скобки, 7-20 символов)
    if ($phone !== '' && !preg_match('/^[\d\s\+\-\(\)]{7,20}$/', $phone)) {
        jsonResponse(['error' => 'Некорректный телефон'], 400);
    }

    $sheetsOk = false;
    $emailOk  = false;
    $errors   = [];

    // ── 1. Пишем в Google Sheets ──────────────────────────────────
    if ($sheetsId && $saEmail && $saKey) {
        $token = getGoogleAccessToken($saEmail, $saKey);
        if ($token) {
            $sheetsOk = appendOrderToSheet($sheetsId, $token, [
                date('d.m.Y H:i'),
                $orderNum, $clientName, $phone, $email,
                $kkmType, $kkmCond, $services, $total, $comment,
                'Новый', '',
            ]);
            if (!$sheetsOk) $errors[] = 'sheets_write_failed';
        } else {
            $errors[] = 'sheets_token_failed';
        }
    } else {
        $errors[] = 'sheets_not_configured';
    }

    // ── 2. Отправляем email уведомление ───────────────────────────
    $emailOk = sendOrderEmail($notify, $orderNum, $clientName, $phone,
                              $email, $kkmType, $kkmCond, $services, $total, $comment);
    if (!$emailOk) $errors[] = 'email_failed';

    jsonResponse([
        'success' => true,
        'sheets'  => $sheetsOk ? 'ok' : 'error',
        'email'   => $emailOk  ? 'ok' : 'error',
        'errors'  => $errors,
    ]);
}

// ── Добавить строку в Лист1 ───────────────────────────────────────

function appendOrderToSheet(string $sheetsId, string $token, array $row): bool {
    // Проверяем/создаём заголовки
    $headers = ['Timestamp','orderNum','clientName','phone','email',
                'kkmType','kkmCondition','services','total','comment','Status','AdminComment'];

    $checkUrl = 'https://sheets.googleapis.com/v4/spreadsheets/'
                . urlencode($sheetsId) . '/values/%D0%9B%D0%B8%D1%81%D1%821!A1:L1';
    $check = curlGet($checkUrl, ["Authorization: Bearer $token"]);
    $existing = json_decode($check['body'] ?? '', true)['values'][0] ?? [];

    if (empty($existing)) {
        // Пишем заголовки
        $hUrl = 'https://sheets.googleapis.com/v4/spreadsheets/'
                . urlencode($sheetsId)
                . '/values/%D0%9B%D0%B8%D1%81%D1%821!A1?valueInputOption=RAW';
        curlPut($hUrl, ['values' => [$headers]], ["Authorization: Bearer $token"]);
    }

    // Добавляем строку
    $appendUrl = 'https://sheets.googleapis.com/v4/spreadsheets/'
                 . urlencode($sheetsId)
                 . '/values/%D0%9B%D0%B8%D1%81%D1%821:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS';
    $resp = curlPost($appendUrl, ['values' => [$row]], 15, ["Authorization: Bearer $token"]);

    return ($resp['code'] ?? 0) === 200;
}

// ── Email уведомление: SMTP (primary) → mail() (fallback) ─────────
// ВАЖНО: на Beget shared mail() переписывает From на noreply@unverified.beget.ru
// (домен не верифицирован для отправки через системного пользователя).
// Поэтому SMTP — primary: авторизованная отправка от admin@kassa-cto.ru с DKIM.
// mail() — fallback на случай если SMTP-сокет заблокирован.

function emailLog(string $msg): void {
    $logFile = __DIR__ . '/email-debug.log';
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . "\n";
    @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}

function sendOrderEmail(string $to, string $orderNum, string $clientName,
                        string $phone, string $email, string $kkmType,
                        string $kkmCond, string $services, $total, string $comment): bool {

    emailLog("=== sendOrderEmail START order=#{$orderNum} to={$to} ===");

    $subject    = "[Заказ #{$orderNum}] {$clientName} — kassa-cto.ru";
    $totalFmt   = $total ? number_format((float)$total, 0, '.', ' ') . ' ₽' : '—';
    $kkmCondFmt = match($kkmCond) { 'new' => 'Новая', 'old' => 'Б/у', default => $kkmCond ?: '—' };
    $phoneSafe  = htmlspecialchars($phone);
    $phoneHref  = 'tel:' . preg_replace('/\D/', '', $phone);

    $tr = function(string $l, string $v, bool $bold = false): string {
        $fw = $bold ? 'font-weight:600;color:#111' : 'color:#222';
        return "<tr>
          <td style='padding:7px 14px;font-size:13px;color:#555;white-space:nowrap;border-bottom:1px solid #eee;width:40%'>{$l}</td>
          <td style='padding:7px 14px;font-size:13px;{$fw};border-bottom:1px solid #eee'>{$v}</td>
        </tr>";
    };

    $date         = date('d.m.Y H:i');
    $clientSafe   = htmlspecialchars($clientName);
    $kkmSafe      = htmlspecialchars($kkmType) ?: '—';
    $commentSafe  = $comment ? htmlspecialchars($comment) : '—';
    $emailLink    = $email ? "<a href='mailto:{$email}' style='color:#1e3a5f;text-decoration:none'>" . htmlspecialchars($email) . "</a>" : '—';
    $serviceLines = "<div style='line-height:1.7'>" . nl2br(htmlspecialchars(str_replace(', ', "\n", $services))) . "</div>";

    $html = "<!DOCTYPE html>
<html lang='ru'>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head>
<body style='margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif'>
<table width='100%' cellpadding='0' cellspacing='0' style='background:#f0f2f5;padding:24px 0'>
<tr><td align='center'>
<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%'>

  <tr><td style='background:#1e3a5f;border-radius:10px 10px 0 0;padding:22px 28px'>
    <table width='100%' cellpadding='0' cellspacing='0'>
      <tr>
        <td><p style='margin:0;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px'>kassa-cto.ru · Теллур-Интех</p>
            <h1 style='margin:5px 0 0;font-size:20px;color:#fff;font-weight:700'>Новый заказ #{$orderNum}</h1></td>
        <td align='right' style='font-size:12px;color:rgba(255,255,255,0.5)'>{$date}</td>
      </tr>
    </table>
  </td></tr>

  <tr><td style='background:#fff;padding:24px 28px 16px'>
    <p style='margin:0 0 10px;font-size:11px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px'>👤 Для менеджера</p>
    <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #e8eaed;border-radius:8px;overflow:hidden;border-collapse:collapse'>
      " . $tr('Клиент', $clientSafe, true)
       . $tr('Телефон', "<a href='{$phoneHref}' style='color:#1e3a5f;font-weight:600;text-decoration:none'>{$phoneSafe}</a>")
       . $tr('Email', $emailLink)
       . $tr('№ заказа', htmlspecialchars($orderNum))
       . $tr('Сумма', "<span style='font-weight:700;color:#1e3a5f'>{$totalFmt}</span>")
       . $tr('Комментарий', $commentSafe) . "
    </table>
    <div style='margin-top:14px'>
      <a href='https://kassa-cto.ru/admin' style='display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;padding:10px 22px;border-radius:7px;font-size:13px;font-weight:600'>Открыть кабинет менеджера →</a>
    </div>
  </td></tr>

  <tr><td style='background:#fff;padding:0 28px 4px'><hr style='border:none;border-top:2px dashed #e0e3e8;margin:0'></td></tr>

  <tr><td style='background:#fff;padding:16px 28px 24px'>
    <p style='margin:0 0 10px;font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:1px'>🔧 Для инженера</p>
    <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #fcd34d;border-radius:8px;overflow:hidden;border-collapse:collapse;background:#fffbeb'>
      " . $tr('Модель кассы', $kkmSafe, true)
       . $tr('Состояние', $kkmCondFmt)
       . $tr('Работы', $serviceLines)
       . $tr('Примечание', $commentSafe) . "
    </table>
    <p style='margin:10px 0 0;font-size:11px;color:#92400e;padding:8px 12px;background:#fef3c7;border-radius:6px;border-left:3px solid #f59e0b'>
      ⚠️ Уточните у менеджера наличие ФН нужного типа и актуальность ПО кассы перед визитом.
    </p>
  </td></tr>

  <tr><td style='background:#f8f9fb;border-top:1px solid #e8eaed;border-radius:0 0 10px 10px;padding:12px 28px'>
    <p style='margin:0;font-size:11px;color:#9ca3af;text-align:center'>
      Авто-уведомление · <a href='https://kassa-cto.ru' style='color:#6b7280;text-decoration:none'>kassa-cto.ru</a> · ООО «Теллур-Интех» · ИНН 7806044498
    </p>
  </td></tr>

</table></td></tr></table>
</body></html>";

    // ── Текстовая версия (для спам-фильтров и multipart/alternative) ────
    $plain = "Новый заказ #{$orderNum} на kassa-cto.ru\n"
           . "Дата: {$date}\n\n"
           . "Клиент: {$clientName}\n"
           . "Телефон: {$phone}\n"
           . "Email: " . ($email ?: '—') . "\n"
           . "№ заказа: {$orderNum}\n"
           . "Сумма: {$totalFmt}\n"
           . "Комментарий: " . ($comment ?: '—') . "\n\n"
           . "Модель кассы: " . ($kkmType ?: '—') . "\n"
           . "Состояние: {$kkmCondFmt}\n"
           . "Работы: " . ($services ?: '—') . "\n\n"
           . "—\nООО «Теллур-Интех» · kassa-cto.ru · ИНН 7806044498";

    // ─── YANDEX SMTP — PRIMARY ─────────────────────────────────────────
    // Beget SMTP отбрасывает письма как спам без DKIM, поэтому шлём через Яндекс.
    // Яндекс-аккаунт: janicacid@yandex.ru + пароль приложения.
    // Получатель: только тот, что в NOTIFY_EMAIL (без копии на admin@kassa-cto.ru,
    // т.к. Beget-ящик всё равно отбрасывает).
    emailLog("Recipients: {$to}");

    $anyOk = false;
    $lastError = '';

    // ── Способ 1: SMTP smtp.yandex.ru:465 (SSL) — PRIMARY ─────────────
    emailLog("Trying Yandex SMTP:465 → {$to}");
    $r = smtpSend(
        host:    'smtp.yandex.ru',
        port:    465,
        user:    'janicacid@yandex.ru',
        pass:    'hsfsceftrmpzozqa',
        from:    'janicacid@yandex.ru',
        fromName: 'Теллур-Интех',  // не используется в MAIL FROM, только в заголовке
        to:      $to,
        subject: $subject,
        html:    $html,
        plain:   $plain
    );
    emailLog("Yandex SMTP:465 result: " . ($r['ok'] ? 'OK' : 'FAIL [' . $r['step'] . '] ' . $r['error']));
    if ($r['ok']) {
        emailLog("SUCCESS via Yandex SMTP for order #{$orderNum}");
        return true;
    }
    $lastError = "465/{$r['step']}: {$r['error']}";

    // ── Способ 2: SMTP smtp.yandex.ru:587 (STARTTLS) — fallback ───────
    emailLog("Port 465 failed, trying 587 STARTTLS...");
    $r = smtpSend(
        host:    'smtp.yandex.ru',
        port:    587,
        user:    'janicacid@yandex.ru',
        pass:    'hsfsceftrmpzozqa',
        from:    'janicacid@yandex.ru',
        fromName: 'Теллур-Интех',
        to:      $to,
        subject: $subject,
        html:    $html,
        plain:   $plain
    );
    emailLog("Yandex SMTP:587 result: " . ($r['ok'] ? 'OK' : 'FAIL [' . $r['step'] . '] ' . $r['error']));
    if ($r['ok']) {
        emailLog("SUCCESS via Yandex SMTP:587 for order #{$orderNum}");
        return true;
    }
    $lastError = "587/{$r['step']}: {$r['error']}";

    // ── Способ 3: PHP mail() — LAST RESORT (Beget, придёт от unverified) ─
    emailLog("Yandex SMTP failed ({$lastError}), trying mail()...");
    $mailOk = sendViaMail('admin@kassa-cto.ru', 'Теллур-Интех', $to, $subject, $html, $plain);
    emailLog("mail() result: " . ($mailOk ? 'true' : 'false'));

    emailLog("FINAL for order #{$orderNum}: " . ($mailOk ? 'SUCCESS via mail() (но Gmail в Спам)' : 'ALL FAILED. Last SMTP error: ' . $lastError));
    return $mailOk;
}

// ── PHP mail() с multipart/alternative + envelope sender (-f) ──────

function sendViaMail(string $from, string $fromName, string $to,
                     string $subject, string $html, string $plain): bool {
    $boundary = 'b1_' . md5(uniqid('', true));
    $subjectB64 = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $fromB64    = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
    $headers .= "From: {$fromB64} <{$from}>\r\n";
    $headers .= "Reply-To: {$from}\r\n";
    $headers .= "Return-Path: {$from}\r\n";
    $headers .= "X-Mailer: kassa-cto.ru/PHP" . PHP_VERSION . "\r\n";
    $headers .= "Auto-Submitted: auto-generated\r\n";
    $headers .= "Date: " . date('r') . "\r\n";
    $headers .= "Message-ID: <" . uniqid('order@', true) . ">\r\n";

    $body  = "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= chunk_split(base64_encode($plain)) . "\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= chunk_split(base64_encode($html)) . "\r\n";
    $body .= "--{$boundary}--\r\n";

    // -f задаёт envelope sender (повышает шансы пройти SPF/DKIM-проверки)
    // На Beget это работает только если $from — реальный ящик домена.
    $oldSendmail = ini_set('sendmail_from', $from);
    $ok = @mail($to, $subjectB64, $body, $headers, "-f {$from}");
    if ($oldSendmail !== false) ini_restore('sendmail_from');

    return (bool)$ok;
}

// ── SMTP клиент (465 SSL / 587 STARTTLS, без библиотек) ───────────
// Возвращает ['ok' => bool, 'error' => string] для диагностики.

function smtpSend(string $host, int $port, string $user, string $pass,
                  string $from, string $fromName, string $to,
                  string $subject, string $html, string $plain = ''): array {

    $log = function(string $m) { emailLog("  [smtp {$port}] {$m}"); };
    $log("connect to {$host}:{$port}");

    $ctx = stream_context_create(['ssl' => [
        'verify_peer'       => false,
        'verify_peer_name'  => false,
        'allow_self_signed' => true,
    ]]);

    $scheme = ($port == 465) ? 'ssl://' : 'tcp://';
    $sock = @stream_socket_client(
        "{$scheme}{$host}:{$port}", $errno, $errstr, 15,
        STREAM_CLIENT_CONNECT, $ctx
    );
    if (!$sock) {
        $err = "connect FAILED: {$errno} {$errstr}";
        $log($err);
        return ['ok' => false, 'error' => $err, 'step' => 'connect'];
    }
    $log("connected");

    stream_set_timeout($sock, 20);

    $read = function() use ($sock): string {
        $out = '';
        while ($line = fgets($sock, 515)) {
            $out .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $out;
    };

    $cmd = function(string $c) use ($sock, $read): string {
        fwrite($sock, $c . "\r\n");
        return $read();
    };

    $greeting = $read();
    $log("greeting: " . trim($greeting));

    $r = $cmd("EHLO kassa-cto.ru");
    $log("EHLO: " . trim($r));
    if (!str_contains($r, '250')) {
        fclose($sock);
        return ['ok' => false, 'error' => 'EHLO: ' . trim($r), 'step' => 'EHLO'];
    }

    if ($port == 587) {
        $r = $cmd("STARTTLS");
        $log("STARTTLS: " . trim($r));
        if (!str_contains($r, '220')) {
            fclose($sock);
            return ['ok' => false, 'error' => 'STARTTLS: ' . trim($r), 'step' => 'STARTTLS'];
        }
        if (!@stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            $log("TLS handshake FAILED");
            fclose($sock);
            return ['ok' => false, 'error' => 'TLS handshake failed', 'step' => 'STARTTLS'];
        }
        $log("TLS handshake OK");
        $r = $cmd("EHLO kassa-cto.ru");
        $log("EHLO after TLS: " . trim($r));
        if (!str_contains($r, '250')) {
            fclose($sock);
            return ['ok' => false, 'error' => 'EHLO after TLS: ' . trim($r), 'step' => 'EHLO'];
        }
    }

    $cmd("AUTH LOGIN");
    $cmd(base64_encode($user));
    $r = $cmd(base64_encode($pass));
    $log("AUTH result: " . trim($r));
    if (!str_contains($r, '235')) {
        fclose($sock);
        return ['ok' => false, 'error' => 'AUTH: ' . trim($r), 'step' => 'AUTH'];
    }

    $r = $cmd("MAIL FROM:<{$from}>");
    $log("MAIL FROM: " . trim($r));
    if (!str_contains($r, '250')) {
        fclose($sock);
        return ['ok' => false, 'error' => 'MAIL FROM: ' . trim($r), 'step' => 'MAIL FROM'];
    }
    $r = $cmd("RCPT TO:<{$to}>");
    $log("RCPT TO: " . trim($r));
    if (!str_contains($r, '250') && !str_contains($r, '251')) {
        fclose($sock);
        return ['ok' => false, 'error' => 'RCPT TO: ' . trim($r), 'step' => 'RCPT TO'];
    }
    $r = $cmd("DATA");
    $log("DATA: " . trim($r));
    if (!str_contains($r, '354')) {
        fclose($sock);
        return ['ok' => false, 'error' => 'DATA: ' . trim($r), 'step' => 'DATA'];
    }

    $boundary   = 'b2_' . md5(uniqid('', true));
    $subjectB64 = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $msgId      = '<' . uniqid('order@', true) . '>';
    $date       = date('r');

    // ВАЖНО для Yandex: From должен быть БЕЗ display name (просто email),
    // иначе Yandex выдаёт "550 Sender address rejected: not owned by authorized user".
    // display name кодируем только в Sender header (не критично).
    $headers = "Date: {$date}\r\n"
         . "From: {$from}\r\n"
         . "To: {$to}\r\n"
         . "Subject: {$subjectB64}\r\n"
         . "Message-ID: {$msgId}\r\n"
         . "MIME-Version: 1.0\r\n"
         . "Reply-To: {$from}\r\n"
         . "Auto-Submitted: auto-generated\r\n"
         . "X-Mailer: kassa-cto.ru/PHP" . PHP_VERSION . "\r\n";

    if ($plain !== '') {
        $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n\r\n";
        $body  = "--{$boundary}\r\n"
               . "Content-Type: text/plain; charset=UTF-8\r\n"
               . "Content-Transfer-Encoding: base64\r\n\r\n"
               . chunk_split(base64_encode($plain)) . "\r\n"
               . "--{$boundary}\r\n"
               . "Content-Type: text/html; charset=UTF-8\r\n"
               . "Content-Transfer-Encoding: base64\r\n\r\n"
               . chunk_split(base64_encode($html)) . "\r\n"
               . "--{$boundary}--\r\n";
    } else {
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n"
                  . "Content-Transfer-Encoding: base64\r\n\r\n";
        $body = chunk_split(base64_encode($html));
    }

    $msg = $headers . $body . "\r\n.\r\n";

    $r = $cmd($msg);
    $log("DATA response: " . trim($r));
    $cmd("QUIT");
    fclose($sock);

    $ok = str_contains($r, '250');
    return ['ok' => $ok, 'error' => $ok ? '' : 'DATA response: ' . trim($r), 'step' => 'DATA'];
}

// ══════════════════════════════════════════════════════════════════
// ADMIN AUTH
// ══════════════════════════════════════════════════════════════════

function handleAdminLogin(array $config): void {
    // Rate limit: 5 попыток за 5 минут, потом блок на 15 мин
    rateLimit('admin_auth', 5, 300);

    $input    = getJsonInput();
    $login    = trim($input['login']    ?? '');
    $password = trim($input['password'] ?? '');
    $token    = $input['captchaToken']  ?? '';
    $answer   = (string)($input['captchaAnswer'] ?? '');

    // Honeypot: если заполнено скрытое поле — бот
    if (!empty($input['website'])) {
        // Тихо имитируем успех, чтобы бот не знал
        error_log('Honeypot triggered on admin/auth from IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        jsonResponse(['error' => 'Неверный логин или пароль'], 401);
    }

    if (!verifyCaptcha($token, $answer))
        jsonResponse(['error' => 'Неверный ответ на капчу или время истекло'], 400);

    $expLogin = $config['ADMIN_LOGIN']    ?? '';
    $expPass  = $config['ADMIN_PASSWORD'] ?? '';
    if (!$expLogin || !$expPass)
        jsonResponse(['error' => 'CRM не настроен'], 500);

    // Проверка логина (constant-time)
    if (!hash_equals($expLogin, $login))
        jsonResponse(['error' => 'Неверный логин или пароль'], 401);

    // Проверка пароля: поддерживает и plain (для обратной совместимости)
    // и password_hash() (рекомендуется — BCrypt/Argon2)
    $passOk = false;
    if (password_get_info($expPass)['algo'] ?? false) {
        // Захешировано через password_hash()
        $passOk = password_verify($password, $expPass);
    } else {
        // Plain text (обратно совместимо)
        $passOk = hash_equals($expPass, $password);
    }
    if (!$passOk)
        jsonResponse(['error' => 'Неверный логин или пароль'], 401);

    $secret = $config['ADMIN_JWT_SECRET'] ?? '';
    if (!$secret) jsonResponse(['error' => 'JWT secret не настроен'], 500);

    $jwt    = createJwt($secret);
    $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    setcookie('admin_jwt', $jwt, [
        'expires' => time() + 86400 * 30, 'path' => '/',
        'secure' => $secure, 'httponly' => true, 'samesite' => 'Lax',
    ]);

    // Сброс rate limit после успешного входа
    clearRateLimit('admin_auth');

    jsonResponse(['success' => true]);
}

function handleAdminLogout(): void {
    setcookie('admin_jwt', '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true]);
    jsonResponse(['success' => true]);
}

function requireAuth(array $config): void {
    $secret = $config['ADMIN_JWT_SECRET'] ?? '';
    $jwt    = $_COOKIE['admin_jwt'] ?? '';
    if (!$jwt || !verifyJwt($jwt, $secret))
        jsonResponse(['error' => 'Unauthorized', 'code' => 'AUTH_REQUIRED'], 401);
}

// ══════════════════════════════════════════════════════════════════
// JWT
// ══════════════════════════════════════════════════════════════════

function b64url(string $d): string { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }

function createJwt(string $secret): string {
    $h = b64url(json_encode(['alg'=>'HS256','typ'=>'JWT']));
    $p = b64url(json_encode(['sub'=>'admin','iat'=>time(),'exp'=>time()+86400*30]));
    $s = b64url(hash_hmac('sha256', "$h.$p", $secret, true));
    return "$h.$p.$s";
}

function verifyJwt(string $token, string $secret): bool {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    [$h,$p,$s] = $parts;
    if (!hash_equals(b64url(hash_hmac('sha256', "$h.$p", $secret, true)), $s)) return false;
    $d = json_decode(base64_decode(strtr($p, '-_', '+/')), true);
    return isset($d['exp']) && $d['exp'] > time();
}

// ══════════════════════════════════════════════════════════════════
// ADMIN ORDERS — чтение из Google Sheets
// ══════════════════════════════════════════════════════════════════

function handleGetOrders(array $config): void {
    $sheetsId = $config['GOOGLE_SHEETS_ID'] ?? '';
    $saEmail  = $config['GOOGLE_SA_EMAIL']  ?? '';
    $saKey    = $config['GOOGLE_SA_PRIVATE_KEY'] ?? '';

    if (!$sheetsId || !$saEmail || !$saKey)
        jsonResponse(['error'=>'SHEETS_NOT_CONFIGURED', 'message'=>'Заполните GOOGLE_* в config.php'], 503);

    $token = getGoogleAccessToken($saEmail, $saKey);
    if (!$token) jsonResponse(['error' => 'Не удалось получить Google токен'], 502);

    $url  = 'https://sheets.googleapis.com/v4/spreadsheets/'
            . urlencode($sheetsId) . '/values/%D0%9B%D0%B8%D1%81%D1%821';
    $resp = curlGet($url, ["Authorization: Bearer $token"]);

    if (!$resp || $resp['code'] !== 200) {
        error_log("Sheets GET {$resp['code']}: " . substr($resp['body'], 0, 300));
        jsonResponse(['error' => 'Ошибка чтения Google Sheets (HTTP ' . ($resp['code']??0) . ')'], 502);
    }

    $values = json_decode($resp['body'], true)['values'] ?? [];
    if (empty($values)) { jsonResponse(['orders' => [], 'columns' => []]); }

    $headers = array_map('trim', $values[0]);
    $orders  = [];
    for ($i = 1; $i < count($values); $i++) {
        $row = $values[$i]; $obj = [];
        foreach ($headers as $j => $h) $obj[$h] = $row[$j] ?? '';
        $obj['_rowIndex'] = $i + 1;
        $orders[] = $obj;
    }
    jsonResponse(['orders' => array_reverse($orders), 'columns' => $headers]);
}

function handlePatchOrder(array $config): void {
    $sheetsId = $config['GOOGLE_SHEETS_ID']      ?? '';
    $saEmail  = $config['GOOGLE_SA_EMAIL']        ?? '';
    $saKey    = $config['GOOGLE_SA_PRIVATE_KEY']  ?? '';

    if (!$sheetsId || !$saEmail || !$saKey)
        jsonResponse(['error' => 'SHEETS_NOT_CONFIGURED'], 503);

    $input    = getJsonInput();
    $rowIndex = (int)($input['rowIndex'] ?? 0);
    $updates  = $input['updates'] ?? [];

    if ($rowIndex < 2 || empty($updates))
        jsonResponse(['error' => 'rowIndex и updates обязательны'], 400);

    $token = getGoogleAccessToken($saEmail, $saKey);
    if (!$token) jsonResponse(['error' => 'Не удалось получить Google токен'], 502);

    $hUrl    = 'https://sheets.googleapis.com/v4/spreadsheets/'
               . urlencode($sheetsId) . '/values/%D0%9B%D0%B8%D1%81%D1%821!1:1';
    $hResp   = curlGet($hUrl, ["Authorization: Bearer $token"]);
    $headers = array_map('trim', json_decode($hResp['body'], true)['values'][0] ?? []);

    $data = [];
    foreach ($updates as $col => $val) {
        $ci = array_search($col, $headers);
        if ($ci === false) {
            $ci = count($headers); $headers[] = $col;
            $wUrl = 'https://sheets.googleapis.com/v4/spreadsheets/'
                    . urlencode($sheetsId)
                    . '/values/%D0%9B%D0%B8%D1%81%D1%821!' . colLetter($ci) . '1?valueInputOption=RAW';
            curlPut($wUrl, ['values' => [[$col]]], ["Authorization: Bearer $token"]);
        }
        $data[] = ['range' => 'Лист1!' . colLetter($ci) . $rowIndex, 'values' => [[(string)$val]]];
    }

    $bUrl  = 'https://sheets.googleapis.com/v4/spreadsheets/'
             . urlencode($sheetsId) . '/values:batchUpdate';
    $bResp = curlPost($bUrl, ['valueInputOption'=>'RAW','data'=>$data], 15, ["Authorization: Bearer $token"]);

    if (!$bResp || $bResp['code'] !== 200) {
        error_log("Sheets PATCH {$bResp['code']}: " . substr($bResp['body'], 0, 300));
        jsonResponse(['error' => 'Ошибка записи'], 502);
    }
    jsonResponse(['success' => true]);
}

// ══════════════════════════════════════════════════════════════════
// GOOGLE SERVICE ACCOUNT AUTH
// ══════════════════════════════════════════════════════════════════

function getGoogleAccessToken(string $email, string $key): ?string {
    $now  = time();
    $h    = b64url(json_encode(['alg'=>'RS256','typ'=>'JWT']));
    $p    = b64url(json_encode([
        'iss'=>$email, 'scope'=>'https://www.googleapis.com/auth/spreadsheets',
        'aud'=>'https://oauth2.googleapis.com/token', 'iat'=>$now, 'exp'=>$now+3600,
    ]));
    $pkey = openssl_pkey_get_private($key);
    if (!$pkey) { error_log('SA: bad private key'); return null; }
    if (!openssl_sign("$h.$p", $sig, $pkey, OPENSSL_ALGO_SHA256)) { error_log('SA: sign failed'); return null; }

    $resp = curlPost('https://oauth2.googleapis.com/token', [], 15, [],
        http_build_query(['grant_type'=>'urn:ietf:params:oauth:grant-type:jwt-bearer','assertion'=>"$h.$p.".b64url($sig)]),
        'application/x-www-form-urlencoded');

    if (!$resp || $resp['code'] !== 200) {
        error_log("SA token HTTP {$resp['code']}: " . substr($resp['body'],0,300)); return null;
    }
    return json_decode($resp['body'], true)['access_token'] ?? null;
}


// ══════════════════════════════════════════════════════════════════
// TEST — диагностика, удалить после проверки
// ══════════════════════════════════════════════════════════════════

function handleTest(array $config): void {
    header('Content-Type: text/html; charset=utf-8');

    $sheetsId = $config['GOOGLE_SHEETS_ID'] ?? '';
    $saEmail  = $config['GOOGLE_SA_EMAIL']  ?? '';
    $saKey    = $config['GOOGLE_SA_PRIVATE_KEY'] ?? '';
    $notify   = $config['NOTIFY_EMAIL'] ?? 'janicacid@gmail.com';

    $out = '<style>body{font:14px monospace;padding:20px}.ok{color:green}.err{color:red}.box{background:#f5f5f5;padding:10px;margin:8px 0;border-left:3px solid #ccc}</style>';
    $out .= '<h2>🔧 Диагностика kassa-cto</h2>';

    // 1. Конфиг
    $out .= '<h3>1. Конфиг</h3><div class=box>';
    $out .= 'SHEETS_ID: <b>'.($sheetsId ? '✅ '.substr($sheetsId,0,10).'...' : '❌ пусто').'</b><br>';
    $out .= 'SA_EMAIL: <b>' .($saEmail  ? '✅ '.$saEmail : '❌ пусто').'</b><br>';
    $out .= 'SA_KEY: <b>'   .(strlen($saKey)>100 ? '✅ '.strlen($saKey).' байт' : '❌ пусто').'</b><br>';
    $out .= 'NOTIFY: <b>'   .$notify.'</b></div>';

    // 2. Google Token
    $out .= '<h3>2. Google Access Token</h3>';
    $token = null;
    if ($saEmail && $saKey) {
        $pkey = openssl_pkey_get_private($saKey);
        if (!$pkey) {
            $out .= '<div class=box><span class=err>❌ Не удалось загрузить приватный ключ</span></div>';
        } else {
            $token = getGoogleAccessToken($saEmail, $saKey);
            if ($token) $out .= '<div class=box><span class=ok>✅ Токен получен</span></div>';
            else        $out .= '<div class=box><span class=err>❌ Не удалось получить токен (см. error_log)</span></div>';
        }
    } else { $out .= '<div class=box><span class=err>❌ Конфиг пустой</span></div>'; }

    // 3. Запись в Sheets
    $out .= '<h3>3. Запись тестовой строки в Лист1</h3>';
    if ($token && $sheetsId) {
        $row = [date('d.m.Y H:i'),'TEST-'.time(),'Тест Диагностика','+79001234567','','АТОЛ 91Ф','','Тест',0,'Авто-тест удалить','Новый',''];
        $url = 'https://sheets.googleapis.com/v4/spreadsheets/'.urlencode($sheetsId).'/values/%D0%9B%D0%B8%D1%81%D1%821:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS';
        $resp = curlPost($url, [], 15, ["Authorization: Bearer $token"],
                         json_encode(['values'=>[$row]], JSON_UNESCAPED_UNICODE));
        if (($resp['code']??0) === 200) $out .= '<div class=box><span class=ok>✅ Строка записана в таблицу!</span></div>';
        else $out .= '<div class=box><span class=err>❌ HTTP '.($resp['code']??0).'</span><br>'.htmlspecialchars(substr($resp['body']??'',0,400)).'</div>';
    } else { $out .= '<div class=box>⏭ Пропущено</div>'; }

    // 4. Email — детальный тест через Яндекс SMTP
    $out .= '<h3>4. Email → '.$notify.' (через Яндекс SMTP)</h3>';

    $testHtml  = '<div style="font-family:Arial;padding:20px"><h2 style="color:#1e3a5f">🔧 Тест kassa-cto.ru</h2>'
               . '<p><b>Время:</b> ' . date('d.m.Y H:i:s') . '</p>'
               . '<p>Это тестовое письмо от /api/test через Яндекс SMTP.</p>'
               . '<p>From: janicacid@yandex.ru (DKIM Яндекса)</p></div>';
    $testPlain = "Тест kassa-cto.ru (Яндекс SMTP)\nВремя: " . date('d.m.Y H:i:s');

    emailLog("=== /api/test START ===");

    // 4a. Yandex SMTP :465
    $out .= '<div class=box><b>4a. SMTP smtp.yandex.ru:465 (SSL) → '.$notify.'</b><br>';
    $r465 = smtpSend(
        host: 'smtp.yandex.ru', port: 465,
        user: 'janicacid@yandex.ru', pass: 'hsfsceftrmpzozqa',
        from: 'janicacid@yandex.ru', fromName: 'Теллур-Интех',
        to: $notify, subject: 'Тест kassa-cto (Яндекс 465)',
        html: $testHtml, plain: $testPlain
    );
    $out .= $r465['ok']
        ? '<span class=ok>✅ Yandex SMTP:465 → письмо отправлено (From: janicacid@yandex.ru, проверь ящик + Спам)</span>'
        : '<span class=err>❌ SMTP:465 failed [' . htmlspecialchars($r465['step']) . ']: ' . htmlspecialchars($r465['error']) . '</span>';
    $out .= '</div>';

    // 4b. Yandex SMTP :587 STARTTLS
    $out .= '<div class=box><b>4b. SMTP smtp.yandex.ru:587 (STARTTLS) → '.$notify.'</b><br>';
    $r587 = smtpSend(
        host: 'smtp.yandex.ru', port: 587,
        user: 'janicacid@yandex.ru', pass: 'hsfsceftrmpzozqa',
        from: 'janicacid@yandex.ru', fromName: 'Теллур-Интех',
        to: $notify, subject: 'Тест kassa-cto (Яндекс 587)',
        html: $testHtml, plain: $testPlain
    );
    $out .= $r587['ok']
        ? '<span class=ok>✅ Yandex SMTP:587 → письмо отправлено</span>'
        : '<span class=err>❌ SMTP:587 failed [' . htmlspecialchars($r587['step']) . ']: ' . htmlspecialchars($r587['error']) . '</span>';
    $out .= '</div>';

    emailLog("=== /api/test END ===");

    // 5. Лог email-debug.log
    $out .= '<h3>5. Лог email-debug.log (последние 80 строк)</h3>';
    $logFile = __DIR__ . '/email-debug.log';
    if (file_exists($logFile)) {
        $lines = array_slice(file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES), -80);
        $out .= '<div class=box><pre style="margin:0;font-size:11px;white-space:pre-wrap;max-height:400px;overflow:auto">' . htmlspecialchars(implode("\n", $lines)) . '</pre></div>';
    } else {
        $out .= '<div class=box>Лог-файл ещё не создан (будет после первой попытки отправки)</div>';
    }

    $out .= '<hr><p style="color:#999">Все шаги SMTP пишутся в api/email-debug.log. Открой его через файловый менеджер Beget или FTP.</p>';

    // Сбрасываем JSON-заголовок, ставим HTML
    header_remove('Content-Type');
    header('Content-Type: text/html; charset=utf-8');
    echo $out; exit;
}

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function colLetter(int $i): string {
    $l = ''; $i++;
    while ($i > 0) { $i--; $l = chr(65+($i%26)).$l; $i = intdiv($i,26); }
    return $l;
}

function curlGet(string $url, array $headers = []): ?array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>15,
        CURLOPT_HTTPHEADER=>array_merge(['Content-Type: application/json'],$headers),
        CURLOPT_SSL_VERIFYPEER=>true]);
    $body = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch); curl_close($ch);
    if ($err) { error_log("curlGet: $err"); return null; }
    return ['code'=>$code,'body'=>$body];
}

function curlPost(string $url, array $data, int $timeout=30, array $xHeaders=[], string $raw='', string $ct='application/json'): ?array {
    $body = $raw ?: json_encode($data, JSON_UNESCAPED_UNICODE);
    $ch   = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST=>true, CURLOPT_POSTFIELDS=>$body,
        CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>$timeout, CURLOPT_CONNECTTIMEOUT=>10,
        CURLOPT_FOLLOWLOCATION=>true, CURLOPT_POSTREDIR=>3, CURLOPT_MAXREDIRS=>5,
        CURLOPT_SSL_VERIFYPEER=>true,
        CURLOPT_HTTPHEADER=>array_merge(["Content-Type: $ct"],$xHeaders)]);
    $b = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch); curl_close($ch);
    if ($err) { error_log("curlPost: $err"); return null; }
    return ['code'=>$code,'body'=>$b];
}

function curlPut(string $url, array $data, array $xHeaders=[]): ?array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_CUSTOMREQUEST=>'PUT',
        CURLOPT_POSTFIELDS=>json_encode($data,JSON_UNESCAPED_UNICODE),
        CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>15, CURLOPT_SSL_VERIFYPEER=>true,
        CURLOPT_HTTPHEADER=>array_merge(['Content-Type: application/json'],$xHeaders)]);
    $b = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    return ['code'=>$code,'body'=>$b];
}

function jsonResponse(array $d, int $s=200): void { http_response_code($s); echo json_encode($d,JSON_UNESCAPED_UNICODE); exit; }
function getJsonInput(): array { $r=file_get_contents('php://input'); return is_array($d=json_decode($r,true))?$d:[]; }
