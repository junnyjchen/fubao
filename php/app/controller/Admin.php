<?php
/**
 * 管理员认证控制器
 */

namespace app\controller;

use app\Controller;
use app\common\Jwt;

class Admin extends Controller
{
    /**
     * 管理员登录
     */
    public function login()
    {
        $username = $this->post('username');
        $password = $this->post('password');
        
        if (empty($username) || empty($password)) {
            $this->error('請輸入用戶名和密碼');
        }
        
        // 查找管理员
        $admin = $this->db->find(
            "SELECT * FROM `admin_users` WHERE `username` = ? AND `status` = 1 LIMIT 1",
            [$username]
        );
        
        if (!$admin) {
            $this->error('用戶名或密碼錯誤');
        }
        
        // 验证密码
        if (!password_verify($password, $admin['password'])) {
            $this->error('用戶名或密碼錯誤');
        }
        
        // 更新最后登录信息
        $this->db->update('admin_users', [
            'last_login_at' => date('Y-m-d H:i:s'),
            'last_login_ip' => \think\Request::ip(),
        ], '`id` = ?', [$admin['id']]);
        
        // 生成JWT（带admin标记）
        $payload = [
            'adminId' => $admin['id'],
            'username' => $admin['username'],
            'role' => $admin['role'],
        ];
        $token = Jwt::encode($payload);
        
        // 移除密码
        unset($admin['password']);
        
        $this->json([
            'admin' => $admin,
            'token' => $token,
        ], '登錄成功');
    }
    
    /**
     * 管理员登出
     */
    public function logout()
    {
        $this->json([], '已退出登錄');
    }
    
    /**
     * 获取当前管理员信息
     */
    public function me()
    {
        // 从JWT获取adminId
        $token = \think\Request::header('Authorization', '');
        
        if (preg_match('/Bearer\s+(.+)/i', $token, $matches)) {
            $payload = Jwt::decode($matches[1]);
            
            if ($payload && isset($payload['adminId'])) {
                $admin = $this->db->find(
                    "SELECT id, username, name, email, role, status FROM `admin_users` WHERE id = ?",
                    [$payload['adminId']]
                );
                
                if ($admin) {
                    $this->json(['admin' => $admin]);
                }
            }
        }
        
        $this->error('未登錄', 401);
    }
    
    /**
     * 修改密码
     */
    public function changePassword()
    {
        $token = \think\Request::header('Authorization', '');
        
        if (!preg_match('/Bearer\s+(.+)/i', $token, $matches)) {
            $this->error('未登錄', 401);
        }
        
        $payload = Jwt::decode($matches[1]);
        
        if (!$payload || !isset($payload['adminId'])) {
            $this->error('登錄已過期', 401);
        }
        
        $oldPassword = $this->post('old_password');
        $newPassword = $this->post('new_password');
        
        if (empty($oldPassword) || empty($newPassword)) {
            $this->error('請填寫完整資訊');
        }
        
        if (strlen($newPassword) < 6) {
            $this->error('新密碼長度不能少於6位');
        }
        
        // 获取当前管理员
        $admin = $this->db->find(
            "SELECT password FROM `admin_users` WHERE id = ?",
            [$payload['adminId']]
        );
        
        if (!$admin) {
            $this->error('管理員不存在');
        }
        
        // 验证旧密码
        if (!password_verify($oldPassword, $admin['password'])) {
            $this->error('原密碼錯誤');
        }
        
        // 更新密码
        $this->db->update('admin_users', [
            'password' => password_hash($newPassword, PASSWORD_DEFAULT),
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$payload['adminId']]);
        
        $this->json([], '密碼修改成功');
    }
    
    /**
     * 管理员列表
     */
    public function list()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $offset = ($page - 1) * $limit;
        
        $admins = $this->db->select(
            "SELECT id, username, name, email, role, status, last_login_at, created_at 
             FROM `admin_users` 
             ORDER BY id DESC 
             LIMIT {$limit} OFFSET {$offset}"
        );
        
        $total = $this->db->count('admin_users');
        
        $this->json([
            'list' => $admins,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * 创建管理员
     */
    public function create()
    {
        $username = $this->post('username');
        $password = $this->post('password');
        $name = $this->post('name');
        $email = $this->post('email');
        $role = $this->post('role', 'admin');
        
        if (empty($username) || empty($password)) {
            $this->error('用戶名和密碼不能為空');
        }
        
        // 检查用户名是否存在
        $exists = $this->db->find(
            "SELECT id FROM `admin_users` WHERE `username` = ?",
            [$username]
        );
        
        if ($exists) {
            $this->error('用戶名已存在');
        }
        
        $id = $this->db->insert('admin_users', [
            'username' => $username,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'status' => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        
        $this->json(['id' => $id], '創建成功');
    }
    
    /**
     * 更新管理员
     */
    public function update()
    {
        $id = (int) $this->post('id');
        $name = $this->post('name');
        $email = $this->post('email');
        $role = $this->post('role');
        $status = $this->post('status');
        
        if (!$id) {
            $this->error('請指定要更新的管理員');
        }
        
        $data = [];
        if ($name !== null) $data['name'] = $name;
        if ($email !== null) $data['email'] = $email;
        if ($role !== null) $data['role'] = $role;
        if ($status !== null) $data['status'] = (int) $status;
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        $this->db->update('admin_users', $data, '`id` = ?', [$id]);
        
        $this->json([], '更新成功');
    }
    
    /**
     * 删除管理员
     */
    public function delete()
    {
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定要刪除的管理員');
        }
        
        // 不允许删除超级管理员
        $admin = $this->db->find("SELECT role FROM `admin_users` WHERE id = ?", [$id]);
        
        if ($admin && $admin['role'] === 'super_admin') {
            $this->error('無法刪除超級管理員');
        }
        
        $this->db->delete('admin_users', '`id` = ?', [$id]);
        
        $this->json([], '刪除成功');
    }
}
