<?php
/**
 * 商家控制器
 */

namespace app\controller;

use app\Controller;

class Merchant extends Controller
{
    /**
     * 商家列表
     */
    public function index()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $status = $this->get('status', 'approved');
        
        $offset = ($page - 1) * $limit;
        
        $where = "1=1";
        $params = [];
        
        if ($status) {
            $where .= " AND `m`.`status` = ?";
            $params[] = $status;
        }
        
        $list = $this->db->select(
            "SELECT `m`.*, `u`.`username` as `owner_username`
             FROM `merchants` `m`
             LEFT JOIN `users` `u` ON `m`.`user_id` = `u`.`id`
             WHERE {$where}
             ORDER BY `m`.`created_at` DESC
             LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        
        $total = $this->db->value(
            "SELECT COUNT(*) FROM `merchants` `m` WHERE {$where}",
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
     * 商家详情
     */
    public function detail($id)
    {
        $merchant = $this->db->find(
            "SELECT `m`.*, `u`.`username` as `owner_username`
             FROM `merchants` `m`
             LEFT JOIN `users` `u` ON `m`.`user_id` = `u`.`id`
             WHERE `m`.`id` = ?",
            [$id]
        );
        
        if (!$merchant) {
            $this->error('商家不存在', 404);
        }
        
        // 获取商家商品数量
        $merchant['goods_count'] = $this->db->count('goods', '`merchant_id` = ? AND `status` = 1', [$id]);
        
        // 获取商家总销售额
        $merchant['total_sales'] = $this->db->value(
            "SELECT COALESCE(SUM(`actual_amount`), 0) 
             FROM `orders` `o`
             INNER JOIN `order_items` `oi` ON `o`.`id` = `oi`.`order_id`
             INNER JOIN `goods` `g` ON `oi`.`goods_id` = `g`.`id`
             WHERE `g`.`merchant_id` = ? AND `o`.`status` NOT IN ('cancelled')",
            [$id]
        );
        
        $this->json(['merchant' => $merchant]);
    }
    
    /**
     * 商家申请
     */
    public function apply()
    {
        $userId = $this->verifyUser();
        
        // 检查是否已有申请
        $existing = $this->db->find(
            "SELECT * FROM `merchants` WHERE `user_id` = ?",
            [$userId]
        );
        
        if ($existing) {
            $this->error('您已提交過申請');
        }
        
        $name = $this->post('name');
        $description = $this->post('description');
        $contactPhone = $this->post('contact_phone');
        $address = $this->post('address');
        
        if (empty($name)) {
            $this->error('請填寫商家名稱');
        }
        
        $id = $this->db->insert('merchants', [
            'user_id' => $userId,
            'name' => $name,
            'description' => $description,
            'contact_phone' => $contactPhone,
            'address' => $address,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        
        $this->json(['id' => $id], '申請已提交');
    }
    
    /**
     * 获取我的商家信息
     */
    public function mine()
    {
        $userId = $this->verifyUser();
        
        $merchant = $this->db->find(
            "SELECT * FROM `merchants` WHERE `user_id` = ?",
            [$userId]
        );
        
        if (!$merchant) {
            $this->json(['merchant' => null]);
            return;
        }
        
        // 获取统计数据
        $merchant['goods_count'] = $this->db->count('goods', '`merchant_id` = ? AND `status` = 1', [$merchant['id']]);
        $merchant['total_sales'] = $this->db->value(
            "SELECT COALESCE(SUM(`actual_amount`), 0) 
             FROM `orders` `o`
             INNER JOIN `order_items` `oi` ON `o`.`id` = `oi`.`order_id`
             WHERE `oi`.`goods_id` IN (SELECT id FROM `goods` WHERE `merchant_id` = ?)",
            [$merchant['id']]
        );
        
        $this->json(['merchant' => $merchant]);
    }
    
    /**
     * 更新商家信息
     */
    public function update()
    {
        $userId = $this->verifyUser();
        
        $merchant = $this->db->find(
            "SELECT * FROM `merchants` WHERE `user_id` = ?",
            [$userId]
        );
        
        if (!$merchant) {
            $this->error('商家不存在');
        }
        
        $data = [];
        
        $fields = ['name', 'logo', 'banner', 'description', 'contact_phone', 'address'];
        
        foreach ($fields as $field) {
            if ($value = $this->post($field)) {
                $data[$field] = $value;
            }
        }
        
        if (!empty($data)) {
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->db->update('merchants', $data, '`id` = ?', [$merchant['id']]);
        }
        
        $this->json([], '更新成功');
    }
    
    /**
     * 审核商家申请（管理员）
     */
    public function review()
    {
        $this->verifyAdmin();
        
        $id = (int) $this->post('id');
        $status = $this->post('status'); // approved, rejected
        $reason = $this->post('reason');
        
        if (!$id || !in_array($status, ['approved', 'rejected'])) {
            $this->error('請填寫完整資訊');
        }
        
        $merchant = $this->db->find("SELECT * FROM `merchants` WHERE `id` = ?", [$id]);
        
        if (!$merchant) {
            $this->error('商家不存在', 404);
        }
        
        $this->db->update('merchants', [
            'status' => $status,
            'reason' => $reason,
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$id]);
        
        // 发送通知
        $this->db->insert('notifications', [
            'user_id' => $merchant['user_id'],
            'title' => $status === 'approved' ? '商家申請已通過' : '商家申請未通過',
            'content' => $status === 'approved' 
                ? '恭喜！您的商家申請已通過審核，現在可以開始發布商品了。'
                : '抱歉，您的商家申請未通過：' . ($reason ?: '請聯繫客服了解詳情'),
            'type' => 'system',
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        
        $this->json([], '審核完成');
    }
}
