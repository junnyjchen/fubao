<?php
/**
 * 数据库配置文件
 */

return [
    // 数据库类型
    'type'            => 'mysql',
    
    // 服务器地址
    'hostname'        => getenv('DB_HOST') ?: '127.0.0.1',
    
    // 数据库名
    'database'        => getenv('DB_NAME') ?: 'fubao',
    
    // 用户名
    'username'        => getenv('DB_USER') ?: 'root',
    
    // 密码
    'password'        => getenv('DB_PASSWORD') ?: '',
    
    // 端口
    'hostport'        => getenv('DB_PORT') ?: '3306',
    
    // 连接参数
    'params'          => [
        PDO::ATTR_CASE => PDO::CASE_NATURAL,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_STRINGIFY_FETCHES => false,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
    
    // 数据库编码
    'charset'         => 'utf8mb4',
    
    // 主从
    'deploy'          => 0,
    
    // 读写分离
    'rw_separate'     => false,
    
    // 缓存
    'cache'           => false,
    
    // 表前缀
    'prefix'          => '',
    
    // 断线重连
    'break_reconnect' => false,
];
