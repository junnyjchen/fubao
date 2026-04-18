<?php
/**
 * 管理员中间件
 */

namespace app\middleware;

use app\common\Jwt;

class AdminAuth
{
    /**
     * 检查管理员登录状态
     */
    public static function check()
    {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            $payload = Jwt::decode($matches[1]);
            
            // 检查是否有adminId
            if ($payload && isset($payload['adminId'])) {
                return $payload;
            }
        }
        
        return false;
    }
    
    /**
     * 检查是否是超级管理员
     */
    public static function isSuperAdmin($payload)
    {
        return isset($payload['role']) && $payload['role'] === 'super_admin';
    }
}
