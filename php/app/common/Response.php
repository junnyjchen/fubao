<?php
/**
 * 响应辅助类
 */

namespace app\common;

class Response
{
    /**
     * 成功响应
     */
    public static function success($data = null, $message = '操作成功', $code = 200)
    {
        return self::json([
            'code' => $code,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * 错误响应
     */
    public static function error($message = '操作失败', $code = 400, $data = null)
    {
        return self::json([
            'code' => $code,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * 分页响应
     */
    public static function paginate($list, $pagination, $message = '获取成功')
    {
        return self::json([
            'code' => 200,
            'message' => $message,
            'data' => $list,
            'pagination' => $pagination,
        ]);
    }

    /**
     * 返回 JSON
     */
    public static function json($data, $httpCode = 200)
    {
        http_response_code($httpCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * 返回 XML
     */
    public static function xml($data, $rootNode = 'root')
    {
        http_response_code(200);
        header('Content-Type: application/xml; charset=utf-8');
        echo self::arrayToXml($data, $rootNode);
        exit;
    }

    /**
     * 数组转 XML
     */
    public static function arrayToXml($data, $rootNode = 'root', $xml = null)
    {
        if ($xml === null) {
            $xml = new \SimpleXMLElement("<?xml version=\"1.0\" encoding=\"UTF-8\"?><{$rootNode}/>");
        }

        foreach ($data as $key => $value) {
            if (is_numeric($key)) {
                $key = 'item';
            }

            if (is_array($value) || is_object($value)) {
                $subNode = $xml->addChild($key);
                self::arrayToXml((array)$value, $key, $subNode);
            } else {
                $xml->addChild($key, htmlspecialchars($value));
            }
        }

        return $xml->asXML();
    }

    /**
     * 重定向
     */
    public static function redirect($url, $httpCode = 302)
    {
        http_response_code($httpCode);
        header("Location: $url");
        exit;
    }

    /**
     * 下载文件
     */
    public static function download($filepath, $filename = null, $mimeType = 'application/octet-stream')
    {
        if (!file_exists($filepath)) {
            return self::error('文件不存在', 404);
        }

        $filename = $filename ?: basename($filepath);

        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($filepath));
        header('Cache-Control: no-cache, must-revalidate');
        header('Pragma: public');

        readfile($filepath);
        exit;
    }

    /**
     * 输出图片
     */
    public static function image($filepath, $mimeType = 'image/jpeg')
    {
        if (!file_exists($filepath)) {
            http_response_code(404);
            exit;
        }

        header('Content-Type: ' . $mimeType);
        header('Cache-Control: max-age=86400');
        readfile($filepath);
        exit;
    }

    /**
     * 允许跨域
     */
    public static function allowCORS($allowedOrigins = '*')
    {
        header('Access-Control-Allow-Origin: ' . $allowedOrigins);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');

        // 如果是 OPTIONS 请求，直接返回
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit;
        }
    }

    /**
     * 设置缓存头
     */
    public static function setCache($seconds = 3600, $isPublic = true)
    {
        $type = $isPublic ? 'public' : 'private';
        header('Cache-Control: ' . $type . ', max-age=' . $seconds);
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $seconds) . ' GMT');
    }

    /**
     * 设置 JSONP 响应
     */
    public static function jsonp($data, $callback = 'callback')
    {
        http_response_code(200);
        header('Content-Type: application/javascript; charset=utf-8');
        
        $callback = isset($_GET[$callback]) ? $_GET[$callback] : 'callback';
        $json = json_encode($data, JSON_UNESCAPED_UNICODE);
        
        echo "$callback($json)";
        exit;
    }
}
