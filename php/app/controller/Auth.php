<?php
/**
 * 会员认证控制器
 */

namespace app\controller;

use app\Controller;
use app\common\Jwt;

class Auth extends Controller
{
    /**
     * 用户登录
     */
    public function login()
    {
        $email = $this->post('email');
        $password = $this->post('password');
        $phone = $this->post('phone');
        
        if (empty($email) && empty($phone)) {
            $this->error('請輸入郵箱或手機號');
        }
        
        if (empty($password)) {
            $this->error('請輸入密碼');
        }
        
        // 构建查询条件
        $where = $email ? "`email` = ?" : "`phone` = ?";
        $param = $email ?: $phone;
        
        $sql = "SELECT * FROM `users` WHERE {$where} AND `status` = 1 LIMIT 1";
        $user = $this->db->find($sql, [$param]);
        
        if (!$user) {
            $this->error('用戶不存在');
        }
        
        // 验证密码
        if (!password_verify($password, $user['password'])) {
            $this->error('密碼錯誤');
        }
        
        // 生成JWT
        $payload = [
            'userId' => $user['id'],
            'email' => $user['email'],
        ];
        $token = Jwt::encode($payload);
        
        // 移除密码
        unset($user['password']);
        
        $this->json([
            'user' => $user,
            'token' => $token,
        ], '登錄成功');
    }
    
    /**
     * 用户注册
     */
    public function register()
    {
        $email = $this->post('email');
        $password = $this->post('password');
        $phone = $this->post('phone');
        $name = $this->post('name');
        
        if (empty($email)) {
            $this->error('請輸入郵箱');
        }
        
        if (empty($password)) {
            $this->error('請輸入密碼');
        }
        
        if (strlen($password) < 6) {
            $this->error('密碼長度不能少於6位');
        }
        
        // 检查邮箱是否已存在
        $exists = $this->db->find(
            "SELECT id FROM `users` WHERE `email` = ?",
            [$email]
        );
        
        if ($exists) {
            $this->error('該郵箱已被註冊');
        }
        
        // 检查手机号是否已存在
        if ($phone) {
            $phoneExists = $this->db->find(
                "SELECT id FROM `users` WHERE `phone` = ?",
                [$phone]
            );
            
            if ($phoneExists) {
                $this->error('該手機號已被註冊');
            }
        }
        
        // 创建用户
        $userId = $this->db->insert('users', [
            'email' => $email,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'phone' => $phone ?: null,
            'name' => $name ?: null,
            'status' => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        
        // 生成JWT
        $payload = [
            'userId' => $userId,
            'email' => $email,
        ];
        $token = Jwt::encode($payload);
        
        $this->json([
            'user' => [
                'id' => $userId,
                'email' => $email,
                'phone' => $phone,
                'name' => $name,
            ],
            'token' => $token,
        ], '註冊成功');
    }
    
    /**
     * 获取当前用户信息
     */
    public function me()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $user = $this->db->find(
            "SELECT id, email, phone, name, avatar, language, status, created_at FROM `users` WHERE id = ?",
            [$userId]
        );
        
        if (!$user) {
            $this->error('用戶不存在', 404);
        }
        
        $this->json(['user' => $user]);
    }
    
    /**
     * 用户登出
     */
    public function logout()
    {
        // JWT 是无状态的，前端删除token即可
        $this->json([], '已退出登錄');
    }
    
    /**
     * 发送验证码
     */
    public function sendCode()
    {
        $phone = $this->post('phone');
        $type = $this->post('type', 'register'); // register, login, bind
        
        if (empty($phone)) {
            $this->error('請輸入手機號');
        }
        
        if (!preg_match('/^1[3-9]\d{9}$/', $phone)) {
            $this->error('手機號格式錯誤');
        }
        
        // 检查手机号是否存在（根据类型）
        $exists = $this->db->find(
            "SELECT id FROM `users` WHERE `phone` = ?",
            [$phone]
        );
        
        if ($type === 'register' && $exists) {
            $this->error('該手機號已註冊');
        }
        
        if ($type === 'login' && !$exists) {
            $this->error('該手機號未註冊');
        }
        
        // 生成6位验证码
        $code = sprintf('%06d', mt_rand(0, 999999));
        
        // 存储验证码（实际项目中应使用Redis）
        // 这里简化为返回验证码
        // 真实项目中应调用短信接口发送
        
        $this->json([
            'code' => $code, // 测试用，生产环境删除
            'message' => '驗證碼已發送',
        ], '發送成功');
    }
    
    /**
     * 手机号登录
     */
    public function loginByPhone()
    {
        $phone = $this->post('phone');
        $code = $this->post('code');
        
        if (empty($phone)) {
            $this->error('請輸入手機號');
        }
        
        if (empty($code)) {
            $this->error('請輸入驗證碼');
        }
        
        // 查找用户
        $user = $this->db->find(
            "SELECT * FROM `users` WHERE `phone` = ? AND `status` = 1",
            [$phone]
        );
        
        if (!$user) {
            $this->error('用戶不存在');
        }
        
        // 验证验证码（测试环境简化处理）
        // 真实项目中应从Redis获取并验证
        if ($code !== '123456' && strlen($code) !== 6) {
            $this->error('驗證碼錯誤');
        }
        
        // 生成JWT
        $payload = [
            'userId' => $user['id'],
            'email' => $user['email'],
        ];
        $token = Jwt::encode($payload);
        
        unset($user['password']);
        
        $this->json([
            'user' => $user,
            'token' => $token,
        ], '登錄成功');
    }
}
