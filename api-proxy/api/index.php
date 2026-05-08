<?php
/**
 * kassa-cto.ru API Router v8 — Google Sheets via Apps Script
 *
 * Эндпоинты:
 *   GET  /api/captcha    — генерация капчи
 *   POST /api/log-order  — отправка заказа в Google Sheets (через Apps Script Web App)
 *
 * Удалено из v7:
 *   - Весь Telegram Bot API (send-order, chat/*)
 *   - Данные чата (chat-data/)
 *   - Admin endpoints
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) { jsonResponse(['error' => 'API not configured'], 500); exit; }

$config = require $configPath;
$appsScriptUrl = $config['APPS_SCRIPT_URL'] ?? '';

if (empty($appsScriptUrl)) { jsonResponse(['error' => 'API not configured'], 500); exit; }

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = preg_replace('#^/api/#', '', parse_url($requestUri, PHP_URL_PATH));
$path = rtrim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ("$method $path") {
        case 'GET captcha': handleCaptcha(); break;
        case 'POST log-order': handleLogOrder($appsScriptUrl); break;
        default: jsonResponse(['error' => 'Not Found'], 404);
    }
} catch (Throwable $e) { error_log("API: " . $e->getMessage()); jsonResponse(['error' => 'Internal Server Error'], 500); }

// ==================== CAPTCHA ====================

function handleCaptcha(): void {
    $a = rand(1, 20); $b = rand(1, 20);
    $ops = ['+', '-', '*']; $op = $ops[array_rand($ops)];
    switch ($op) {
        case '+': $ans = $a + $b; $q = "$a + $b = ?"; break;
        case '-': $ans = $a - $b; $q = "$a - $b = ?"; break;
        case '*': $ans = $a * $b; $q = "$a x $b = ?"; break;
    }
    jsonResponse(['id' => bin2hex(random_bytes(4)), 'question' => $q, 'token' => base64_encode(json_encode(['answer' => $ans, 'ts' => time()]))]);
}

// ==================== LOG ORDER → APPS SCRIPT ====================

function handleLogOrder(string $appsScriptUrl): void {
    $input = getJsonInput();
    if (empty($input['orderNum']) || empty($input['clientName'])) {
        jsonResponse(['error' => 'Missing fields: orderNum, clientName'], 400);
        return;
    }

    // Формируем данные для Apps Script (соответствие колонок в Google Таблице)
    $payload = [
        'orderNum'      => $input['orderNum'] ?? '',
        'clientName'    => $input['clientName'] ?? '',
        'phone'         => $input['phone'] ?? '',
        'email'         => $input['email'] ?? '',
        'kkmType'       => $input['kkmType'] ?? '',
        'kkmCondition'  => $input['kkmCondition'] ?? '',
        'services'      => is_array($input['services'] ?? null) ? implode(', ', $input['services']) : ($input['services'] ?? ''),
        'total'         => $input['total'] ?? 0,
        'comment'       => $input['comment'] ?? '',
        'subject'       => $input['subject'] ?? ('Заказ #' . $input['orderNum']),
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $appsScriptUrl,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json;charset=utf-8'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,   // Apps Script может редиректить
        CURLOPT_MAXREDIRS      => 5,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        error_log("Apps Script curl error: $curlErr");
        jsonResponse(['success' => false, 'error' => 'Connection error'], 502);
        return;
    }

    if ($code === 200 && $resp) {
        $data = json_decode($resp, true) ?: [];
        jsonResponse([
            'success' => true,
            'sheets'  => $data['sheets'] ?? 'ok',
            'email'   => $data['email'] ?? 'ok',
        ]);
    } else {
        error_log("Apps Script HTTP $code: " . substr($resp, 0, 500));
        jsonResponse(['success' => false, 'error' => 'Apps Script returned HTTP ' . $code], 502);
    }
}

// ==================== HELPERS ====================

function jsonResponse(array $d, int $s = 200): void { http_response_code($s); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function getJsonInput(): array { $r = file_get_contents('php://input'); return is_array($d = json_decode($r, true)) ? $d : []; }
