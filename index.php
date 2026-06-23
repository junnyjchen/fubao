<?php
/**
 * 符寶網 - 宝塔面板统一入口
 *
 * 这是宝塔 Nginx 环境下的入口文件。
 * 宝塔的 try_files 会把所有请求转发到此文件。
 *
 * 核心策略：
 * 1. 所有 /api/* 请求先转发给 Next.js (端口 5000)
 * 2. 如果 Next.js 返回有效响应，直接返回
 * 3. 如果 Next.js 不可用，降级到 PHP ThinkPHP 处理
 * 4. 非 /api/* 请求交给 Next.js 处理（前端页面）
 */

// ============================================================
// 判断请求类型
// ============================================================

$uri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($uri, PHP_URL_PATH) ?: '/';

// 只代理 /api/ 开头的请求到 Next.js
$isApiRequest = (strpos($path, '/api/') === 0);

// 检查是否禁用代理
$proxyDisabled = getenv('DISABLE_NXJS_PROXY') === 'true';

// 检查 cURL 扩展
$canProxy = function_exists('curl_init');

// ============================================================
// /api/* 请求 → 代理到 Next.js（优先）→ 降级 PHP
// ============================================================

if ($isApiRequest && !$proxyDisabled && $canProxy) {
    $nextjsHost = getenv('NEXTJS_HOST') ?: '127.0.0.1';
    $nextjsPort = getenv('NEXTJS_PORT') ?: '5000';
    $nextjsUrl = "http://{$nextjsHost}:{$nextjsPort}{$uri}";

    // 准备请求头
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $headerName = str_replace('_', '-', substr($key, 5));
            if (strtolower($headerName) !== 'host' && strtolower($headerName) !== 'content-length') {
                $headers[] = "{$headerName}: {$value}";
            }
        }
    }
    $headers[] = 'X-Forwarded-By: php-proxy';
    $headers[] = 'X-Real-IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');

    // 读取请求体
    $requestBody = null;
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        $requestBody = file_get_contents('php://input');
    }

    // 判断是否为 SSE 请求
    $isSSERequest = false;
    foreach ($headers as $h) {
        if (stripos($h, 'Accept:') !== false && stripos($h, 'text/event-stream') !== false) {
            $isSSERequest = true;
            break;
        }
    }
    if (strpos($path, '/api/ai/chat') === 0) {
        $isSSERequest = true;
    }

    // ============================================================
    // 代理请求到 Next.js
    // ============================================================

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $nextjsUrl);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, $isSSERequest ? 120 : 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HEADER, false);

    if ($requestBody !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);
    }

    if ($isSSERequest) {
        // ============================================================
        // SSE 流式代理
        // ============================================================

        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');

        curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) {
            $len = strlen($header);
            $parts = explode(':', $header, 2);
            if (count($parts) === 2) {
                $key = strtolower(trim($parts[0]));
                $value = trim($parts[1]);
                if (in_array($key, ['content-type', 'cache-control', 'x-accel-buffering'])) {
                    header("{$parts[0]}: {$value}");
                }
            }
            return $len;
        });

        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) {
            echo $data;
            ob_flush();
            flush();
            return strlen($data);
        });

        $success = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($success && $httpCode > 0) {
            http_response_code($httpCode);
            exit;
        }

        http_response_code(503);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'AI 服務暫時不可用，請稍後再試'], JSON_UNESCAPED_UNICODE);
        exit;

    } else {
        // ============================================================
        // 普通 API 代理
        // ============================================================

        $responseHeaders = [];
        curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) use (&$responseHeaders) {
            $len = strlen($header);
            $parts = explode(':', $header, 2);
            if (count($parts) === 2) {
                $key = strtolower(trim($parts[0]));
                $value = trim($parts[1]);
                $responseHeaders[$key] = $value;
            }
            return $len;
        });

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $responseBody = curl_exec($ch);
        $responseStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // Next.js 返回有效响应（非 5xx）→ 直接转发
        if ($responseStatusCode > 0 && $responseStatusCode < 500 && $responseBody !== false) {
            http_response_code($responseStatusCode);

            if (isset($responseHeaders['content-type'])) {
                header('Content-Type: ' . $responseHeaders['content-type']);
            }
            header('X-Served-By: nextjs-proxy');

            echo $responseBody;
            exit;
        }

        // Next.js 不可用 → 降级到 PHP ThinkPHP
        // 继续执行下面的 PHP 代码
    }
}

// ============================================================
// 非 /api/* 请求 或 Next.js 不可用时的降级处理
// ============================================================

// 如果是 /api/* 但代理失败，走 PHP ThinkPHP 处理
if ($isApiRequest) {
    // 加载 ThinkPHP
    define('APP_PATH', __DIR__ . '/php/app/');
    define('CONFIG_PATH', __DIR__ . '/php/config/');

    if (file_exists(APP_PATH . 'Controller.php')) {
        require APP_PATH . 'Controller.php';
        require APP_PATH . 'think/db/Connection.php';
        require APP_PATH . 'think/Request.php';
        require APP_PATH . 'common/Jwt.php';
        require __DIR__ . '/php/route/router.php';
        exit;
    }

    // ThinkPHP 也不可用
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => '服務暫時不可用，請稍後再試',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================================
// 非 /api/* 请求 → 转发到 Next.js（前端页面）
// ============================================================

if ($canProxy) {
    $nextjsHost = getenv('NEXTJS_HOST') ?: '127.0.0.1';
    $nextjsPort = getenv('NEXTJS_PORT') ?: '5000';
    $nextjsUrl = "http://{$nextjsHost}:{$nextjsPort}{$uri}";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $nextjsUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HEADER, false);

    $responseHeaders = [];
    curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) use (&$responseHeaders) {
        $len = strlen($header);
        $parts = explode(':', $header, 2);
        if (count($parts) === 2) {
            $key = strtolower(trim($parts[0]));
            $value = trim($parts[1]);
            $responseHeaders[$key] = $value;
        }
        return $len;
    });

    // 传递请求头
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $headerName = str_replace('_', '-', substr($key, 5));
            if (strtolower($headerName) !== 'host' && strtolower($headerName) !== 'content-length') {
                $headers[] = "{$headerName}: {$value}";
            }
        }
    }
    $headers[] = 'X-Forwarded-By: php-proxy';
    $headers[] = 'X-Real-IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    // POST 请求体
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        $requestBody = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);
    }

    $responseBody = curl_exec($ch);
    $responseStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($responseStatusCode > 0 && $responseBody !== false) {
        http_response_code($responseStatusCode);

        if (isset($responseHeaders['content-type'])) {
            header('Content-Type: ' . $responseHeaders['content-type']);
        }
        // 传递编码信息
        if (isset($responseHeaders['content-encoding'])) {
            // 不转发 content-encoding，因为我们没有编码
        }
        header('X-Served-By: nextjs-proxy');

        echo $responseBody;
        exit;
    }
}

// ============================================================
// 完全降级：Next.js 不可用，也不是 API 请求
// ============================================================
http_response_code(503);
echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>符寶網 - 維護中</title></head>';
echo '<body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#1a1a2e;color:#eee">';
echo '<div style="text-align:center"><h1>🔮 符寶網</h1><p>系統維護中，請稍後再試</p></div>';
echo '</body></html>';
