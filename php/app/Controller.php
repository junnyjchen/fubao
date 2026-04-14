<?php
/**
 * 控制器基类
 */

namespace app;

use think\db\Connection;

class Controller
{
    protected $db;
    protected $request;
    
    public function __construct()
    {
        $this->db = Connection::instance();
        $this->request = Request::instance();
        
        // 设置跨域头
        $this->setCorsHeaders();
    }
    
    /**
     * 设置跨域头
     */
    protected function setCorsHeaders()
    {
        $config = include CONFIG_PATH . 'app.php';
        
        header("Access-Control-Allow-Origin: " . $config['cors_origin']);
        header("Access-Control-Allow-Methods: " . $config['cors_methods']);
        header("Access-Control-Allow-Headers: " . $config['cors_headers']);
        header("Access-Control-Allow-Credentials: true");
        
        // 处理OPTIONS请求
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
        }
    }
    
    /**
     * 返回JSON成功响应
     */
    protected function json($data = [], $msg = 'success', $code = 200)
    {
        header('Content-Type: application/json');
        echo json_encode([
            'code' => $code,
            'message' => $msg,
            'data' => $data,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    /**
     * 返回JSON错误响应
     */
    protected function error($msg = 'error', $code = 400, $data = [])
    {
        header('Content-Type: application/json');
        http_response_code($code);
        echo json_encode([
            'code' => $code,
            'message' => $msg,
            'data' => $data,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    /**
     * 获取请求数据
     */
    protected function input($key = null, $default = null)
    {
        return Request::input($key, $default);
    }
    
    /**
     * 获取POST数据
     */
    protected function post($key = null, $default = null)
    {
        return Request::post($key, $default);
    }
    
    /**
     * 获取GET数据
     */
    protected function get($key = null, $default = null)
    {
        return Request::get($key, $default);
    }
}
