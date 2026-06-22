<?php
/**
 * 符寶網 - Next.js 反向代理 + PHP 降级入口
 *
 * 核心策略：
 * 1. 所有 /api/* 请求先转发给 Next.js (端口 5000)
 * 2. 如果 Next.js 返回有效响应 (2xx/3xx/4xx)，直接返回
 * 3. 如果 Next.js 不可用 (连接失败/5xx)，降级到 PHP 处理
 * 4. 非 /api/* 请求直接交给 Nginx/Next.js（不经过此文件）
 *
 * 这样无论宝塔面板怎么配置 Nginx，Next.js API Routes 都能生效。
 * SSE 流式输出也完整支持（AI 聊天等场景）。
 */

// ============================================================
// 第一步：判断是否需要代理到 Next.js
// ============================================================

$uri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($uri, PHP_URL_PATH) ?: '/';

// 只代理 /api/ 开头的请求
$isApiRequest = (strpos($path, '/api/') === 0);

// 检查是否禁用代理（环境变量控制）
$proxyDisabled = getenv('DISABLE_NXJS_PROXY') === 'true';

// 检查 cURL 扩展（代理依赖）
$canProxy = function_exists('curl_init');

if ($isApiRequest && !$proxyDisabled && $canProxy) {
    $nextjsHost = getenv('NEXTJS_HOST') ?: '127.0.0.1';
    $nextjsPort = getenv('NEXTJS_PORT') ?: '5000';
    $nextjsUrl = "http://{$nextjsHost}:{$nextjsPort}{$uri}";
    
    // 准备请求头
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $headerName = str_replace('_', '-', substr($key, 5));
            // 跳过 host 和 content-length（让 cURL 自动设置）
            if (strtolower($headerName) !== 'host' && strtolower($headerName) !== 'content-length') {
                $headers[] = "{$headerName}: {$value}";
            }
        }
    }
    // 添加转发标识
    $headers[] = 'X-Forwarded-By: php-proxy';
    $headers[] = 'X-Real-IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');

    // 读取请求体
    $requestBody = null;
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        $requestBody = file_get_contents('php://input');
    }

    // 判断是否为 SSE 请求（AI 聊天等）
    $isSSERequest = false;
    foreach ($headers as $h) {
        if (stripos($h, 'Accept:') !== false && stripos($h, 'text/event-stream') !== false) {
            $isSSERequest = true;
            break;
        }
    }
    // AI 聊天路由强制 SSE
    if (strpos($path, '/api/ai/chat') === 0) {
        $isSSERequest = true;
    }

    // ============================================================
    // 第二步：尝试代理到 Next.js
    // ============================================================
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $nextjsUrl);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, $isSSERequest ? 120 : 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3); // 快速失败
    curl_setopt($ch, CURLOPT_HEADER, false);      // 不包含响应头在 body 中
    
    if ($requestBody !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);
    }

    if ($isSSERequest) {
        // ============================================================
        // SSE 流式代理：逐块转发，支持 AI 聊天打字机效果
        // ============================================================
        
        // 清除所有输出缓冲
        while (ob_get_level()) {
            ob_end_clean();
        }
        
        // 设置 SSE 响应头
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no'); // Nginx 不缓冲
        
        // 收集响应状态码
        $responseHeaders = [];
        
        curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) use (&$responseHeaders) {
            $len = strlen($header);
            $parts = explode(':', $header, 2);
            if (count($parts) === 2) {
                $key = strtolower(trim($parts[0]));
                $value = trim($parts[1]);
                $responseHeaders[$key] = $value;
                
                // 转发重要的响应头
                if (in_array($key, ['content-type', 'cache-control', 'x-accel-buffering'])) {
                    header("{$parts[0]}: {$value}");
                }
            }
            return $len;
        });
        
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) {
            // 逐块输出 SSE 数据
            echo $data;
            
            // 强制刷新输出
            if (function_exists('fastcgi_finish_request')) {
                // 不用 fastcgi_finish_request，它会终止连接
            }
            ob_flush();
            flush();
            
            return strlen($data);
        });
        
        $success = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($success && $httpCode > 0) {
            // Next.js 成功响应，结束请求
            http_response_code($httpCode);
            exit;
        }
        
        // Next.js 不可用，关闭 SSE 流，降级到 PHP
        // （但 SSE 路由 PHP 也没有对应的处理器，返回错误）
        http_response_code(503);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'AI 服務暫時不可用，請稍後再試',
        ], JSON_UNESCAPED_UNICODE);
        exit;
        
    } else {
        // ============================================================
        // 普通 API 代理：缓冲完整响应
        // ============================================================
        
        $responseBody = '';
        $responseHeaders = [];
        $responseStatusCode = 0;
        
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
        
        // ============================================================
        // 第三步：判断是否使用 Next.js 响应
        // ============================================================
        
        $nextjsAvailable = ($responseStatusCode > 0 && $responseStatusCode < 500);
        
        if ($nextjsAvailable && $responseBody !== false) {
            // Next.js 响应有效，转发给客户端
            
            // 设置响应状态码
            http_response_code($responseStatusCode);
            
            // 转发重要响应头
            if (isset($responseHeaders['content-type'])) {
                header('Content-Type: ' . $responseHeaders['content-type']);
            }
            if (isset($responseHeaders['x-powered-by'])) {
                header('X-Powered-By: ' . $responseHeaders['x-powered-by']);
            }
            // 标记此响应来自 Next.js 代理
            header('X-Served-By: nextjs-proxy');
            
            echo $responseBody;
            exit;
        }
        
        // Next.js 不可用或返回 5xx，降级到 PHP 处理
        // 继续执行下面的 PHP 代码
    }
}

// ============================================================
// PHP 降级处理（仅在 Next.js 不可用时执行）
// ============================================================

// 定义应用目录
define('APP_PATH', __DIR__ . '/../app/');

// 定义配置目录
define('CONFIG_PATH', __DIR__ . '/../config/');

// 加载核心文件
require APP_PATH . 'Controller.php';
require APP_PATH . 'think/db/Connection.php';
require APP_PATH . 'think/Request.php';
require APP_PATH . 'common/Jwt.php';

// 加载路由
require __DIR__ . '/../route/router.php';
