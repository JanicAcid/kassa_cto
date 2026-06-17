<?php
/**
 * kassa-cto.ru API Router v11
 * Apps Script УБРАН — PHP пишет в Sheets напрямую.
 * Email: mail() (primary, Beget local MTA + DKIM) → SMTP smtp.beget.com:465 (fallback).
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-store, no-cache, must-revalidate');

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
// CAPTCHA
// ══════════════════════════════════════════════════════════════════

function handleCaptcha(): void      { jsonResponse(makeCaptcha()); }
function handleAdminCaptcha(): void { jsonResponse(makeCaptcha()); }

function makeCaptcha(): array {
    $a = rand(2, 15); $b = rand(2, 15);
    $ops = ['+', '-', '*']; $op = $ops[array_rand($ops)];
    switch ($op) {
        case '+': $ans = $a + $b; $q = "$a + $b = ?"; break;
        case '-': if ($a < $b) [$a,$b] = [$b,$a]; $ans = $a - $b; $q = "$a − $b = ?"; break;
        default:  $a = rand(2,9); $b = rand(2,9); $ans = $a * $b; $q = "$a × $b = ?"; break;
    }
    return ['id' => bin2hex(random_bytes(4)), 'question' => $q,
            'token' => base64_encode(json_encode(['answer' => $ans, 'ts' => time()]))];
}

function verifyCaptcha(string $token, string $answer, int $maxAge = 300): bool {
    $d = json_decode(base64_decode($token), true);
    if (!$d || !isset($d['answer'], $d['ts'])) return false;
    if (time() - $d['ts'] > $maxAge) return false;
    return (string)$d['answer'] === trim($answer);
}

// ══════════════════════════════════════════════════════════════════
// LOG ORDER — пишем напрямую в Google Sheets + отправляем email
// ══════════════════════════════════════════════════════════════════

function handleLogOrder(array $config): void {
    $input = getJsonInput();
    if (empty($input['orderNum']) || empty($input['clientName'])) {
        jsonResponse(['error' => 'Missing fields'], 400);
    }

    $sheetsId = $config['GOOGLE_SHEETS_ID'] ?? '';
    $saEmail  = $config['GOOGLE_SA_EMAIL'] ?? '';
    $saKey    = $config['GOOGLE_SA_PRIVATE_KEY'] ?? '';
    $notify   = $config['NOTIFY_EMAIL'] ?? 'janicacid@gmail.com';

    $orderNum    = $input['orderNum']    ?? '';
    $clientName  = $input['clientName']  ?? '';
    $phone       = $input['phone']       ?? '';
    $email       = $input['email']       ?? '';
    $kkmType     = $input['kkmType']     ?? '';
    $kkmCond     = $input['kkmCondition'] ?? '';
    $services    = is_array($input['services'] ?? null)
                   ? implode(', ', $input['services'])
                   : ($input['services'] ?? '');
    $total       = $input['total']       ?? 0;
    $comment     = $input['comment']     ?? '';

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

    // Список получателей: основной + копия на доменный ящик (для надёжности)
    $recipients = array_unique(array_filter([$to, 'admin@kassa-cto.ru']));
    emailLog("Recipients: " . implode(', ', $recipients));

    $anyOk = false;

    // ── Способ 1: SMTP smtp.beget.com:465 (SSL) — PRIMARY ─────────────
    //    Авторизованная отправка от admin@kassa-cto.ru с DKIM-подписью Beget.
    //    Beget шлёт валидный sender, Gmail принимает без переписывания From.
    foreach ($recipients as $rcpt) {
        emailLog("Trying SMTP:465 → {$rcpt}");
        $smtpOk = smtpSend(
            host:    'smtp.beget.com',
            port:    465,
            user:    'admin@kassa-cto.ru',
            pass:    'K1slotn1k!',
            from:    'admin@kassa-cto.ru',
            fromName: 'Теллур-Интех',
            to:      $rcpt,
            subject: $subject,
            html:    $html,
            plain:   $plain
        );
        emailLog("SMTP:465 result for {$rcpt}: " . ($smtpOk ? 'OK' : 'FAIL'));
        if ($smtpOk) $anyOk = true;
    }

    // Если SMTP сработал хотя бы для одного получателя — считаем успешным
    if ($anyOk) {
        emailLog("SUCCESS via SMTP for order #{$orderNum}");
        return true;
    }

    // ── Способ 2: SMTP smtp.beget.com:587 (STARTTLS) — fallback ───────
    //    На случай если порт 465 заблокирован файрволом shared-хостинга.
    emailLog("Port 465 failed for all recipients, trying 587 STARTTLS...");
    foreach ($recipients as $rcpt) {
        emailLog("Trying SMTP:587 → {$rcpt}");
        $smtpOk = smtpSend(
            host:    'smtp.beget.com',
            port:    587,
            user:    'admin@kassa-cto.ru',
            pass:    'K1slotn1k!',
            from:    'admin@kassa-cto.ru',
            fromName: 'Теллур-Интех',
            to:      $rcpt,
            subject: $subject,
            html:    $html,
            plain:   $plain
        );
        emailLog("SMTP:587 result for {$rcpt}: " . ($smtpOk ? 'OK' : 'FAIL'));
        if ($smtpOk) $anyOk = true;
    }
    if ($anyOk) {
        emailLog("SUCCESS via SMTP:587 for order #{$orderNum}");
        return true;
    }

    // ── Способ 3: PHP mail() — LAST RESORT ────────────────────────────
    //    ВНИМАНИЕ: на Beget shared mail() переписывает From на
    //    noreply@unverified.beget.ru → Gmail кладёт в Спам.
    //    Используем только если оба SMTP-порта не сработали.
    emailLog("Both SMTP ports failed, trying mail() as last resort...");
    foreach ($recipients as $rcpt) {
        $mailOk = sendViaMail('admin@kassa-cto.ru', 'Теллур-Интех', $rcpt, $subject, $html, $plain);
        emailLog("mail() result for {$rcpt}: " . ($mailOk ? 'true' : 'false'));
        if ($mailOk) $anyOk = true;
    }

    emailLog("FINAL for order #{$orderNum}: " . ($anyOk ? 'SUCCESS (some method worked)' : 'ALL FAILED'));
    return $anyOk;
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

function smtpSend(string $host, int $port, string $user, string $pass,
                  string $from, string $fromName, string $to,
                  string $subject, string $html, string $plain = ''): bool {

    $log = function(string $m) { emailLog("  [smtp {$port}] {$m}"); };
    $log("connect to {$host}:{$port}");

    $ctx = stream_context_create(['ssl' => [
        'verify_peer'       => false,
        'verify_peer_name'  => false,
        'allow_self_signed' => true,
    ]]);

    // 465 = SSL с самого начала, 587 = STARTTLS после EHLO
    $scheme = ($port == 465) ? 'ssl://' : 'tcp://';
    $sock = @stream_socket_client(
        "{$scheme}{$host}:{$port}", $errno, $errstr, 15,
        STREAM_CLIENT_CONNECT, $ctx
    );
    if (!$sock) {
        $log("connect FAILED: {$errno} {$errstr}");
        error_log("SMTP {$port} connect failed: {$errno} {$errstr}");
        return false;
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
    if (!str_contains($r, '250')) { fclose($sock); return false; }

    // Для порта 587 (tcp://) — нужно поднять STARTTLS перед AUTH
    if ($port == 587) {
        $r = $cmd("STARTTLS");
        $log("STARTTLS: " . trim($r));
        if (!str_contains($r, '220')) { fclose($sock); return false; }
        if (!@stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            $log("TLS handshake FAILED");
            fclose($sock);
            return false;
        }
        $log("TLS handshake OK");
        // После STARTTLS нужно ещё раз EHLO
        $r = $cmd("EHLO kassa-cto.ru");
        $log("EHLO after TLS: " . trim($r));
        if (!str_contains($r, '250')) { fclose($sock); return false; }
    }

    $r = $cmd("AUTH LOGIN");
    $log("AUTH LOGIN: " . trim($r));
    $r = $cmd(base64_encode($user));
    $r = $cmd(base64_encode($pass));
    $log("AUTH result: " . trim($r));
    if (!str_contains($r, '235')) { fclose($sock); return false; }

    $r = $cmd("MAIL FROM:<{$from}>");
    $log("MAIL FROM: " . trim($r));
    if (!str_contains($r, '250')) { fclose($sock); return false; }
    $r = $cmd("RCPT TO:<{$to}>");
    $log("RCPT TO: " . trim($r));
    if (!str_contains($r, '250') && !str_contains($r, '251')) { fclose($sock); return false; }
    $r = $cmd("DATA");
    $log("DATA: " . trim($r));
    if (!str_contains($r, '354')) { fclose($sock); return false; }

    $boundary   = 'b2_' . md5(uniqid('', true));
    $subjectB64 = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $fromB64    = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
    $msgId      = '<' . uniqid('order@', true) . '>';
    $date       = date('r');

    $headers = "Date: {$date}\r\n"
         . "From: {$fromB64} <{$from}>\r\n"
         . "To: {$to}\r\n"
         . "Subject: {$subjectB64}\r\n"
         . "Message-ID: {$msgId}\r\n"
         . "MIME-Version: 1.0\r\n"
         . "Reply-To: {$from}\r\n"
         . "Auto-Submitted: auto-generated\r\n";

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
    return $ok;
}

// ══════════════════════════════════════════════════════════════════
// ADMIN AUTH
// ══════════════════════════════════════════════════════════════════

function handleAdminLogin(array $config): void {
    $input    = getJsonInput();
    $login    = trim($input['login']    ?? '');
    $password = trim($input['password'] ?? '');
    $token    = $input['captchaToken']  ?? '';
    $answer   = (string)($input['captchaAnswer'] ?? '');

    if (!verifyCaptcha($token, $answer))
        jsonResponse(['error' => 'Неверный ответ на капчу или время истекло'], 400);

    $expLogin = $config['ADMIN_LOGIN']    ?? '';
    $expPass  = $config['ADMIN_PASSWORD'] ?? '';
    if (!$expLogin || !$expPass)
        jsonResponse(['error' => 'CRM не настроен'], 500);

    if (!hash_equals($expLogin, $login) || !hash_equals($expPass, $password))
        jsonResponse(['error' => 'Неверный логин или пароль'], 401);

    $secret = $config['ADMIN_JWT_SECRET'] ?? '';
    if (!$secret) jsonResponse(['error' => 'JWT secret не настроен'], 500);

    $jwt    = createJwt($secret);
    $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    setcookie('admin_jwt', $jwt, [
        'expires' => time() + 86400 * 30, 'path' => '/',
        'secure' => $secure, 'httponly' => true, 'samesite' => 'Lax',
    ]);
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

    // 4. Email — детальный тест всех методов
    $out .= '<h3>4. Email → '.$notify.' (полный тест всех методов)</h3>';
    $testHtml  = '<div style="font-family:Arial;padding:20px"><h2 style="color:#1e3a5f">🔧 Тест kassa-cto.ru</h2>'
               . '<p><b>Время:</b> ' . date('d.m.Y H:i:s') . '</p>'
               . '<p>Это тестовое письмо от /api/test. Если оно пришло — заявки тоже будут приходить.</p>'
               . '<p>From: admin@kassa-cto.ru (SMTP)</p></div>';
    $testPlain = "Тест kassa-cto.ru\nВремя: " . date('d.m.Y H:i:s');

    emailLog("=== /api/test START ===");

    // 4a. SMTP :465
    $out .= '<div class=box><b>4a. SMTP smtp.beget.com:465 (SSL) → '.$notify.'</b><br>';
    $smtp465 = smtpSend(
        host: 'smtp.beget.com', port: 465,
        user: 'admin@kassa-cto.ru', pass: 'K1slotn1k!',
        from: 'admin@kassa-cto.ru', fromName: 'Теллур-Интех (SMTP 465 тест)',
        to: $notify, subject: 'Тест kassa-cto SMTP:465',
        html: $testHtml, plain: $testPlain
    );
    $out .= $smtp465 ? '<span class=ok>✅ SMTP:465 → письмо отправлено (From: admin@kassa-cto.ru, проверь ящик)</span>'
                     : '<span class=err>❌ SMTP:465 не смог (см. лог ниже)</span>';
    $out .= '</div>';

    // 4b. SMTP :587 STARTTLS
    $out .= '<div class=box><b>4b. SMTP smtp.beget.com:587 (STARTTLS) → '.$notify.'</b><br>';
    $smtp587 = smtpSend(
        host: 'smtp.beget.com', port: 587,
        user: 'admin@kassa-cto.ru', pass: 'K1slotn1k!',
        from: 'admin@kassa-cto.ru', fromName: 'Теллур-Интех (SMTP 587 тест)',
        to: $notify, subject: 'Тест kassa-cto SMTP:587',
        html: $testHtml, plain: $testPlain
    );
    $out .= $smtp587 ? '<span class=ok>✅ SMTP:587 → письмо отправлено</span>'
                     : '<span class=err>❌ SMTP:587 не смог</span>';
    $out .= '</div>';

    // 4c. mail() (last resort — будет от noreply@unverified.beget.ru)
    $out .= '<div class=box><b>4c. PHP mail() → '.$notify.'</b><br>';
    $mailOk = sendViaMail('admin@kassa-cto.ru', 'Теллур-Интех (mail тест)', $notify,
                          'Тест kassa-cto mail()', $testHtml, $testPlain);
    $out .= $mailOk ? '<span class=ok>✅ mail() → true (ВНИМАНИЕ: придёт от noreply@unverified.beget.ru → Спам)</span>'
                    : '<span class=err>❌ mail() → false</span>';
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
