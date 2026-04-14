<?php
/**
 * 符寶網 - ThinkPHP 核心引导文件
 */

// 定义版本
define('THINK_VERSION', '6.0');

// 定义路径常量
define('DS', DIRECTORY_SEPARATOR);
define('ROOT_PATH', dirname(__DIR__) . DS);
define('APP_PATH', ROOT_PATH . 'app' . DS);
define('CONFIG_PATH', ROOT_PATH . 'config' . DS);
define('RUNTIME_PATH', ROOT_PATH . 'runtime' . DS);

// 加载配置
require CONFIG_PATH . 'database.php';
require CONFIG_PATH . 'app.php';

// 自动加载类
spl_autoload_register(function ($class) {
    $class = str_replace('\\', '/', $class);
    
    // 应用类
    if (strpos($class, 'app\\') === 0) {
        $file = ROOT_PATH . substr($class, 4) . '.php';
        if (file_exists($file)) {
            require $file;
            return;
        }
    }
    
    // 核心类
    $file = __DIR__ . '/library/' . $class . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

// 错误处理
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    throw new \ErrorException($errstr, $errno, 0, $errfile, $errline);
});

set_exception_handler(function ($e) {
    $data = [
        'error' => true,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ];
    
    if (APP_DEBUG) {
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    } else {
        echo json_encode(['error' => true, 'message' => '服务器内部错误'], JSON_UNESCAPED_UNICODE);
    }
});

// 关闭显示错误
if (!APP_DEBUG) {
    error_reporting(0);
    ini_set('display_errors', 'Off');
}
