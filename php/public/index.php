<?php
/**
 * 符寶網 - ThinkPHP 后端入口
 */

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
