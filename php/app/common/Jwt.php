<?php
/**
 * JWT 工具类
 */

namespace app\common;

class Jwt
{
    /**
     * 编码JWT
     */
    public static function encode($payload, $key = null)
    {
        $config = include CONFIG_PATH . 'app.php';
        $key = $key ?: $config['jwt_secret'];
        $expire = $config['jwt_expire'];
        
        // 添加过期时间
        $payload['iat'] = time();
        $payload['exp'] = time() + $expire;
        
        // JWT Header
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];
        
        // 编码
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        // 签名
        $signature = hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $key, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return "{$headerEncoded}.{$payloadEncoded}.{$signatureEncoded}";
    }
    
    /**
     * 解码JWT
     */
    public static function decode($token, $key = null)
    {
        $config = include CONFIG_PATH . 'app.php';
        $key = $key ?: $config['jwt_secret'];
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
        
        // 验证签名
        $signature = self::base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $key, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return null;
        }
        
        // 解析payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        
        // 检查过期
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }
        
        return $payload;
    }
    
    /**
     * Base64 URL 编码
     */
    private static function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL 解码
     */
    private static function base64UrlDecode($data)
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * 从请求中获取Token
     */
    public static function getTokenFromHeader()
    {
        $auth = \think\Request::header('Authorization', '');
        
        if (preg_match('/Bearer\s+(.+)/i', $auth, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
    /**
     * 验证Token并返回用户ID
     */
    public static function verify($token = null)
    {
        $token = $token ?: self::getTokenFromHeader();
        
        if (!$token) {
            return null;
        }
        
        $payload = self::decode($token);
        
        return $payload ? ($payload['userId'] ?? null) : null;
    }
}
