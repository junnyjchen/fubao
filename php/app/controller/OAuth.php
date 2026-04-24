<?php
/**
 * OAuth 控制器
 */

namespace app\controller;

use app\Controller;
use app\common\Jwt;

class OAuth extends Controller
{
    /**
     * 获取支持的OAuth提供商
     */
    public function providers()
    {
        $providers = $this->db->select(
            "SELECT `provider`, `name`, `enabled` FROM `oauth_providers` WHERE `enabled` = 1"
        );
        
        // 只返回基本信息，不暴露 client_id
        $list = [];
        foreach ($providers as $p) {
            $list[] = [
                'provider' => $p['provider'],
                'name' => $p['name'],
            ];
        }
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 获取授权URL
     */
    public function authorize()
    {
        $provider = $this->get('provider');
        
        if (!$provider) {
            $this->error('請選擇登錄方式');
        }
        
        // 获取提供商配置
        $config = $this->db->find(
            "SELECT * FROM `oauth_providers` WHERE `provider` = ? AND `enabled` = 1",
            [$provider]
        );
        
        if (!$config) {
            $this->error('不支援該登錄方式');
        }
        
        // 生成 state 参数防止 CSRF
        $state = bin2hex(random_bytes(16));
        
        // 存储 state 到会话
        session_start();
        $_SESSION['oauth_state'] = $state;
        $_SESSION['oauth_provider'] = $provider;
        
        // 构建授权 URL
        $redirectUri = $this->getBaseUrl() . '/api/oauth/callback';
        
        $authUrl = $this->buildAuthUrl($provider, $config, $redirectUri, $state);
        
        $this->json(['url' => $authUrl]);
    }
    
    /**
     * OAuth 回调
     */
    public function callback()
    {
        $code = $this->get('code');
        $state = $this->get('state');
        $error = $this->get('error');
        
        // 检查错误
        if ($error) {
            $this->error('授權失敗：' . $error);
        }
        
        // 验证 state
        session_start();
        if (!isset($_SESSION['oauth_state']) || $_SESSION['oauth_state'] !== $state) {
            $this->error('狀態驗證失敗，請重試');
        }
        
        $provider = $_SESSION['oauth_provider'];
        
        // 清除 state
        unset($_SESSION['oauth_state']);
        unset($_SESSION['oauth_provider']);
        
        // 获取 access token
        $tokenData = $this->exchangeCode($provider, $code);
        
        if (!$tokenData) {
            $this->error('獲取訪問令牌失敗');
        }
        
        // 获取用户信息
        $userInfo = $this->getUserInfo($provider, $tokenData['access_token']);
        
        if (!$userInfo) {
            $this->error('獲取用戶資訊失敗');
        }
        
        // 查找或创建用户
        $user = $this->findOrCreateOAuthUser($provider, $userInfo, $tokenData);
        
        // 生成 JWT
        $payload = [
            'userId' => $user['id'],
            'username' => $user['username'],
        ];
        $token = Jwt::encode($payload);
        
        $this->json([
            'user' => $user,
            'token' => $token,
        ], '登錄成功');
    }
    
    /**
     * 构建授权 URL
     */
    private function buildAuthUrl($provider, $config, $redirectUri, $state)
    {
        $params = [
            'client_id' => $config['client_id'],
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => $this->getProviderScope($provider),
            'state' => $state,
        ];
        
        switch ($provider) {
            case 'google':
                return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
                
            case 'facebook':
                return 'https://www.facebook.com/v12.0/dialog/oauth?' . http_build_query($params);
                
            case 'twitter':
                return 'https://twitter.com/i/oauth2/authorize?' . http_build_query($params);
                
            case 'wechat':
                // 微信需要特殊处理
                return 'https://open.weixin.qq.com/connect/qrconnect?' . http_build_query([
                    'appid' => $config['client_id'],
                    'redirect_uri' => urlencode($redirectUri),
                    'response_type' => 'code',
                    'scope' => 'snsapi_login',
                    'state' => $state,
                ]);
                
            default:
                return null;
        }
    }
    
    /**
     * 获取提供商权限范围
     */
    private function getProviderScope($provider)
    {
        $scopes = [
            'google' => 'email profile',
            'facebook' => 'email public_profile',
            'twitter' => 'tweet.read users.read',
            'wechat' => 'snsapi_login',
        ];
        
        return $scopes[$provider] ?? '';
    }
    
    /**
     * 交换 code 获取 token
     */
    private function exchangeCode($provider, $code)
    {
        $config = $this->db->find(
            "SELECT * FROM `oauth_providers` WHERE `provider` = ?",
            [$provider]
        );
        
        $redirectUri = $this->getBaseUrl() . '/api/oauth/callback';
        
        $tokenUrls = [
            'google' => 'https://oauth2.googleapis.com/token',
            'facebook' => 'https://graph.facebook.com/v12.0/oauth/access_token',
            'twitter' => 'https://api.twitter.com/2/oauth2/token',
        ];
        
        $url = $tokenUrls[$provider] ?? '';
        
        if (!$url) {
            return null;
        }
        
        $postData = [
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => $redirectUri,
        ];
        
        $response = $this->httpPost($url, $postData);
        
        if ($response) {
            return json_decode($response, true);
        }
        
        return null;
    }
    
    /**
     * 获取用户信息
     */
    private function getUserInfo($provider, $accessToken)
    {
        $urls = [
            'google' => 'https://www.googleapis.com/oauth2/v2/userinfo',
            'facebook' => 'https://graph.facebook.com/me?fields=id,name,email,picture',
            'twitter' => 'https://api.twitter.com/2/users/me',
        ];
        
        $url = $urls[$provider] ?? '';
        
        if (!$url) {
            return null;
        }
        
        $response = $this->httpGet($url, $accessToken);
        
        if ($response) {
            $data = json_decode($response, true);
            
            return $this->normalizeUserInfo($provider, $data);
        }
        
        return null;
    }
    
    /**
     * 标准化用户信息
     */
    private function normalizeUserInfo($provider, $data)
    {
        switch ($provider) {
            case 'google':
                return [
                    'provider_user_id' => $data['id'] ?? '',
                    'email' => $data['email'] ?? '',
                    'name' => $data['name'] ?? '',
                    'avatar' => $data['picture'] ?? '',
                ];
                
            case 'facebook':
                return [
                    'provider_user_id' => $data['id'] ?? '',
                    'email' => $data['email'] ?? '',
                    'name' => $data['name'] ?? '',
                    'avatar' => isset($data['picture']['url']) ? $data['picture']['url'] : '',
                ];
                
            case 'twitter':
                return [
                    'provider_user_id' => $data['data']['id'] ?? '',
                    'name' => $data['data']['name'] ?? '',
                    'username' => $data['data']['username'] ?? '',
                ];
                
            default:
                return $data;
        }
    }
    
    /**
     * 查找或创建 OAuth 用户
     */
    private function findOrCreateOAuthUser($provider, $userInfo, $tokenData)
    {
        // 查找已绑定的账号
        $oauthAccount = $this->db->find(
            "SELECT `user_id` FROM `user_oauth_accounts` WHERE `provider` = ? AND `provider_user_id` = ?",
            [$provider, $userInfo['provider_user_id']]
        );
        
        if ($oauthAccount) {
            // 已存在，返回用户信息
            $user = $this->db->find("SELECT * FROM `users` WHERE `id` = ?", [$oauthAccount['user_id']]);
            
            // 更新 token
            $this->db->update('user_oauth_accounts', [
                'access_token' => $tokenData['access_token'] ?? null,
                'refresh_token' => $tokenData['refresh_token'] ?? null,
                'expires_at' => isset($tokenData['expires_in']) 
                    ? date('Y-m-d H:i:s', time() + $tokenData['expires_in'])
                    : null,
            ], '`provider` = ? AND `provider_user_id` = ?', [$provider, $userInfo['provider_user_id']]);
            
            unset($user['password']);
            return $user;
        }
        
        // 检查邮箱是否已注册
        if (!empty($userInfo['email'])) {
            $user = $this->db->find("SELECT * FROM `users` WHERE `email` = ?", [$userInfo['email']]);
            
            if ($user) {
                // 绑定 OAuth 账号
                $this->bindOAuthAccount($user['id'], $provider, $userInfo, $tokenData);
                unset($user['password']);
                return $user;
            }
        }
        
        // 创建新用户
        $this->db->begin();
        
        try {
            $userId = $this->db->insert('users', [
                'username' => $userInfo['name'] ?? $userInfo['username'] ?? 'user_' . time(),
                'email' => $userInfo['email'] ?? null,
                'nickname' => $userInfo['name'] ?? $userInfo['username'] ?? null,
                'avatar' => $userInfo['avatar'] ?? null,
                'status' => 1,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            
            // 绑定 OAuth 账号
            $this->bindOAuthAccount($userId, $provider, $userInfo, $tokenData);
            
            $this->db->commit();
            
            $user = $this->db->find("SELECT * FROM `users` WHERE `id` = ?", [$userId]);
            unset($user['password']);
            return $user;
            
        } catch (\Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    /**
     * 绑定 OAuth 账号
     */
    private function bindOAuthAccount($userId, $provider, $userInfo, $tokenData)
    {
        $this->db->insert('user_oauth_accounts', [
            'user_id' => $userId,
            'provider' => $provider,
            'provider_user_id' => $userInfo['provider_user_id'],
            'access_token' => $tokenData['access_token'] ?? null,
            'refresh_token' => $tokenData['refresh_token'] ?? null,
            'expires_at' => isset($tokenData['expires_in']) 
                ? date('Y-m-d H:i:s', time() + $tokenData['expires_in'])
                : null,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }
    
    /**
     * 发送 HTTP POST 请求
     */
    private function httpPost($url, $data)
    {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return null;
        }
        
        return $response;
    }
    
    /**
     * 发送 HTTP GET 请求
     */
    private function httpGet($url, $accessToken)
    {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return null;
        }
        
        return $response;
    }
    
    /**
     * 获取基础 URL
     */
    private function getBaseUrl()
    {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $protocol . '://' . $host;
    }
}
