<?php
/**
 * 短信服务
 * 
 * 支持阿里云、腾讯云等短信服务商
 */

namespace app\common;

class Sms
{
    /**
     * 发送短信验证码
     * 
     * @param string $phone 手机号
     * @param string $code 验证码
     * @param string $type 验证码类型
     * @return bool
     */
    public static function sendCode($phone, $code, $type = 'login')
    {
        // 根据配置选择短信服务商
        $driver = getenv('SMS_DRIVER') ?: 'aliyun';
        
        switch ($driver) {
            case 'aliyun':
                return self::sendAliyun($phone, $code, $type);
            case 'tencent':
                return self::sendTencent($phone, $code, $type);
            default:
                return self::sendMock($phone, $code, $type);
        }
    }
    
    /**
     * 阿里云短信
     */
    private static function sendAliyun($phone, $code, $type)
    {
        $accessKeyId = getenv('SMS_ACCESS_KEY');
        $accessSecret = getenv('SMS_ACCESS_SECRET');
        $signName = getenv('SMS_SIGN_NAME') ?: '符寶網';
        
        // 短信模板
        $templates = [
            'login' => 'SMS_xxxxx',      // 登录模板
            'register' => 'SMS_xxxxx',   // 注册模板
            'bind' => 'SMS_xxxxx',       // 绑定模板
        ];
        
        $templateCode = $templates[$type] ?? $templates['login'];
        
        // 发送请求
        $params = [
            'AccessKeyId' => $accessKeyId,
            'Action' => 'SendSms',
            'Format' => 'JSON',
            'PhoneNumbers' => $phone,
            'SignName' => $signName,
            'TemplateCode' => $templateCode,
            'TemplateParam' => json_encode(['code' => $code]),
            'Version' => '2017-05-25',
        ];
        
        // 签名
        $signature = self::signAliyunRequest($params, $accessSecret);
        $params['Signature'] = $signature;
        
        $url = 'https://dysmsapi.aliyuncs.com/?' . http_build_query($params);
        
        $response = self::httpGet($url);
        $result = json_decode($response, true);
        
        return isset($result['Code']) && $result['Code'] === 'OK';
    }
    
    /**
     * 腾讯云短信
     */
    private static function sendTencent($phone, $code, $type)
    {
        $secretId = getenv('SMS_SECRET_ID');
        $secretKey = getenv('SMS_SECRET_KEY');
        $appId = getenv('SMS_APP_ID');
        $signName = getenv('SMS_SIGN_NAME') ?: '符寶網';
        
        $templates = [
            'login' => 123456,
            'register' => 123457,
            'bind' => 123458,
        ];
        
        $templateId = $templates[$type] ?? $templates['login'];
        
        // 发送请求
        $url = 'https://sms.tencentcloudapi.com';
        $params = [
            'Action' => 'SendSms',
            'Version' => '2021-01-11',
            'SmsSdkAppId' => $appId,
            'SignName' => $signName,
            'TemplateId' => $templateId,
            'PhoneNumberSet' => ['+86' . $phone],
            'TemplateParamSet' => [$code],
        ];
        
        // 签名
        $signature = self::signTencentRequest($params, $secretKey);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($params) . '&Signature=' . urlencode($signature));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $result = json_decode($response, true);
        return isset($result['Response']['SendStatusSet'][0]['Code']) && $result['Response']['SendStatusSet'][0]['Code'] === 'Ok';
    }
    
    /**
     * Mock 发送（用于测试）
     */
    private static function sendMock($phone, $code, $type)
    {
        // 仅在测试环境使用，记录到日志
        error_log("[SMS Mock] Phone: {$phone}, Code: {$code}, Type: {$type}");
        return true;
    }
    
    /**
     * 阿里云请求签名
     */
    private static function signAliyunRequest($params, $accessSecret)
    {
        ksort($params);
        $stringToSign = 'GET&%2F&' . urlencode(http_build_query($params, null, '&', PHP_QUERY_RFC3986));
        return base64_encode(hash_hmac('sha1', $stringToSign, $accessSecret . '&', true));
    }
    
    /**
     * 腾讯云请求签名
     */
    private static function signTencentRequest($params, $secretKey)
    {
        ksort($params);
        $stringToSign = 'GETsms.tencentcloudapi.com&' . urlencode(http_build_query($params, null, '&', PHP_QUERY_RFC3986));
        return base64_encode(hash_hmac('sha1', $stringToSign, $secretKey, true));
    }
    
    /**
     * HTTP GET 请求
     */
    private static function httpGet($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        curl_close($ch);
        return $response ?: '';
    }
}
