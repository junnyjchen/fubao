<?php
/**
 * 应用配置文件
 */

return [
    // 应用调试模式
    'app_debug' => getenv('APP_DEBUG') !== 'false',
    
    // 应用Trace
    'app_trace' => false,
    
    // 默认时区
    'default_timezone' => 'Asia/Shanghai',
    
    // 默认语言
    'default_lang' => 'zh-cn',
    
    // JWT密钥
    'jwt_secret' => getenv('JWT_SECRET') ?: 'fubao-ltd-jwt-secret-key-2024',
    
    // JWT过期时间（秒）
    'jwt_expire' => 86400 * 7, // 7天
    
    // 允许的跨域来源
    'cors_origin' => '*',
    
    // 允许的请求方法
    'cors_methods' => 'GET,POST,PUT,DELETE,OPTIONS',
    
    // 允许的头部
    'cors_headers' => 'Content-Type,Authorization,X-Requested-With,Accept,Origin',
];
