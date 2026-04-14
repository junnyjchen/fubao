<?php
/**
 * 请求类
 */

namespace think;

class Request
{
    private static $instance = null;
    private $data = [];
    
    /**
     * 获取单例
     */
    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * 构造函数
     */
    public function __construct()
    {
        $this->data = array_merge($_GET, $_POST);
        
        // 解析JSON请求体
        $content = file_get_contents('php://input');
        if (!empty($content)) {
            $json = json_decode($content, true);
            if ($json) {
                $this->data = array_merge($this->data, $json);
            }
        }
    }
    
    /**
     * 获取输入数据
     */
    public static function input($key = null, $default = null)
    {
        $instance = self::instance();
        
        if ($key === null) {
            return $instance->data;
        }
        
        return isset($instance->data[$key]) ? $instance->data[$key] : $default;
    }
    
    /**
     * 获取POST数据
     */
    public static function post($key = null, $default = null)
    {
        if ($key === null) {
            return $_POST;
        }
        return isset($_POST[$key]) ? $_POST[$key] : $default;
    }
    
    /**
     * 获取GET数据
     */
    public static function get($key = null, $default = null)
    {
        if ($key === null) {
            return $_GET;
        }
        return isset($_GET[$key]) ? $_GET[$key] : $default;
    }
    
    /**
     * 获取请求方法
     */
    public static function method()
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }
    
    /**
     * 判断是否POST请求
     */
    public static function isPost()
    {
        return self::method() === 'POST';
    }
    
    /**
     * 获取请求路径
     */
    public static function path()
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        return parse_url($uri, PHP_URL_PATH);
    }
    
    /**
     * 获取客户端IP
     */
    public static function ip()
    {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
              $_SERVER['HTTP_X_REAL_IP'] ?? 
              $_SERVER['REMOTE_ADDR'] ?? 
              'unknown';
        return explode(',', $ip)[0];
    }
    
    /**
     * 获取所有请求头
     */
    public static function header($key = null, $default = null)
    {
        static $headers = [];
        
        if (empty($headers)) {
            foreach ($_SERVER as $key => $value) {
                if (strpos($key, 'HTTP_') === 0) {
                    $headers[str_replace('_', '-', substr($key, 5))] = $value;
                }
            }
        }
        
        if ($key === null) {
            return $headers;
        }
        
        $key = strtoupper(str_replace('-', '_', $key));
        return $headers[$key] ?? $default;
    }
}
