<?php
/**
 * 管理员 - 用户管理
 */

namespace app\controller\admin;

use app\Controller;
use app\middleware\AdminAuth;

class User extends Controller
{
    public function __construct()
    {
        $this->middleware();
    }
    
    private function middleware()
    {
        $payload = AdminAuth::check();
        
        if (!$payload) {
            $this->error('請先登錄', 401);
        }
    }
    
    /**
     * 用户列表
     */
    public function index()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $keyword = $this->get('keyword');
        $status = $this->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $where = "1=1";
        $params = [];
        
        if ($keyword) {
            $where .= " AND (`username` LIKE ? OR `email` LIKE ? OR `phone` LIKE ?)";
            $params[] = "%{$keyword}%";
            $params[] = "%{$keyword}%";
            $params[] = "%{$keyword}%";
        }
        
        if ($status !== null && $status !== '') {
            $where .= " AND `status` = ?";
            $params[] = (int) $status;
        }
        
        $list = $this->db->select(
            "SELECT * FROM `users` WHERE {$where} ORDER BY `id` DESC LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        
        // 获取用户订单数、消费金额
        foreach ($list as &$user) {
            $user['order_count'] = $this->db->count('orders', '`user_id` = ?', [$user['id']]);
            $user['total_spent'] = $this->db->value(
                "SELECT COALESCE(SUM(`actual_amount`), 0) FROM `orders` WHERE `user_id` = ? AND `status` NOT IN ('cancelled')",
                [$user['id']]
            );
            
            // 移除敏感信息
            unset($user['password']);
        }
        
        $total = $this->db->value(
            "SELECT COUNT(*) FROM `users` WHERE {$where}",
            $params
        );
        
        $this->json([
            'list' => $list,
            'total' => (int) $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * 用户详情
     */
    public function detail($id)
    {
        $user = $this->db->find("SELECT * FROM `users` WHERE `id` = ?", [$id]);
        
        if (!$user) {
            $this->error('用戶不存在', 404);
        }
        
        unset($user['password']);
        
        // 获取用户订单
        $user['orders'] = $this->db->select(
            "SELECT * FROM `orders` WHERE `user_id` = ? ORDER BY `created_at` DESC LIMIT 10",
            [$id]
        );
        
        // 获取用户收藏
        $user['favorites'] = $this->db->count('favorites', '`user_id` = ?', [$id]);
        
        // 获取用户收货地址
        $user['addresses'] = $this->db->select(
            "SELECT * FROM `addresses` WHERE `user_id` = ? ORDER BY `is_default` DESC",
            [$id]
        );
        
        $this->json(['user' => $user]);
    }
    
    /**
     * 更新用户状态
     */
    public function updateStatus()
    {
        $id = (int) $this->post('id');
        $status = (int) $this->post('status');
        
        if (!$id) {
            $this->error('請指定用戶');
        }
        
        $this->db->update('users', [
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$id]);
        
        $this->json([], '更新成功');
    }
    
    /**
     * 删除用户
     */
    public function delete()
    {
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定用戶');
        }
        
        $this->db->delete('users', '`id` = ?', [$id]);
        
        // 同时删除用户相关数据
        $this->db->delete('addresses', '`user_id` = ?', [$id]);
        $this->db->delete('favorites', '`user_id` = ?', [$id]);
        $this->db->delete('cart_items', '`user_id` = ?', [$id]);
        
        $this->json([], '刪除成功');
    }
}
