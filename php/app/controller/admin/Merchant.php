<?php
/**
 * 商家管理 - 管理员
 */

namespace app\controller\admin;

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
        $status = $this->get('status');
        $verified = $this->get('verified');
        $keyword = $this->get('keyword');

        $where = [];
        if ($status !== null && $status !== '') {
            $where[] = "`status` = {$status}";
        }
        if ($verified !== null && $verified !== '') {
            $where[] = "`verified_at` IS " . ($verified ? 'NOT NULL' : 'NULL');
        }
        if ($keyword) {
            $keyword = addslashes($keyword);
            $where[] = "(`name` LIKE '%{$keyword}%' OR `contact_name` LIKE '%{$keyword}%' OR `phone` LIKE '%{$keyword}%')";
        }

        $whereStr = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $limit;

        // 查询列表
        $list = $this->db->select(
            "SELECT m.*, 
                    (SELECT COUNT(*) FROM goods WHERE merchant_id = m.id AND status = 1) as goods_count,
                    (SELECT COUNT(*) FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE oi.merchant_id = m.id) as orders_count
             FROM merchants m 
             {$whereStr} 
             ORDER BY m.`id` DESC 
             LIMIT {$limit} OFFSET {$offset}"
        );

        // 统计总数
        $total = $this->db->count('merchants', $whereStr ? $where : null);

        $this->json([
            'list' => $list,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }

    /**
     * 商家详情
     */
    public function detail()
    {
        $id = (int) $this->get('id');
        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $merchant = $this->db->find("SELECT * FROM merchants WHERE `id` = ?", [$id]);
        if (!$merchant) {
            $this->error('商家不存在', 404);
        }

        // 获取统计数据
        $merchant['goods_count'] = $this->db->count('goods', [
            'merchant_id' => $id,
            'status' => 1
        ]);
        
        $merchant['orders_count'] = $this->db->query(
            "SELECT COUNT(*) as cnt FROM order_items WHERE merchant_id = ?",
            [$id]
        )[0]['cnt'] ?? 0;

        $merchant['total_sales'] = $this->db->query(
            "SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as total 
             FROM order_items oi 
             JOIN orders o ON oi.order_id = o.id 
             WHERE oi.merchant_id = ? AND o.status = 4",
            [$id]
        )[0]['total'] ?? 0;

        $this->json(['merchant' => $merchant]);
    }

    /**
     * 审核商家
     */
    public function review()
    {
        $id = (int) $this->post('id');
        $action = $this->post('action'); // approve-通过, reject-拒绝
        $reason = $this->post('reason', '');

        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        if (!in_array($action, ['approve', 'reject'])) {
            $this->error('无效的操作', 400);
        }

        $merchant = $this->db->find("SELECT * FROM merchants WHERE `id` = ?", [$id]);
        if (!$merchant) {
            $this->error('商家不存在', 404);
        }

        if ($merchant['status'] != 0) {
            $this->error('该商家已审核过', 400);
        }

        if ($action === 'approve') {
            $this->db->update('merchants', [
                'status' => 1,
                'verified_at' => date('Y-m-d H:i:s'),
                'reject_reason' => null,
                'updated_at' => date('Y-m-d H:i:s'),
            ], '`id` = ?', [$id]);

            // 发送通知
            $this->notifyUser($merchant['user_id'], '商家审核通过', '恭喜！您的商家申请已通过审核。', 'merchant_approved');

            $this->json(['id' => $id], '审核通过');
        } else {
            $this->db->update('merchants', [
                'status' => -1,
                'reject_reason' => $reason,
                'updated_at' => date('Y-m-d H:i:s'),
            ], '`id` = ?', [$id]);

            // 发送通知
            $this->notifyUser($merchant['user_id'], '商家审核未通过', '很抱歉，您的商家申请未通过：' . $reason, 'merchant_rejected');

            $this->json(['id' => $id], '审核拒绝');
        }
    }

    /**
     * 更新商家状态
     */
    public function updateStatus()
    {
        $id = (int) $this->post('id');
        $status = (int) $this->post('status');

        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $merchant = $this->db->find("SELECT * FROM merchants WHERE `id` = ?", [$id]);
        if (!$merchant) {
            $this->error('商家不存在', 404);
        }

        $this->db->update('merchants', [
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$id]);

        // 如果禁用商家，同时禁用其商品
        if ($status == -1) {
            $this->db->update('goods', [
                'status' => -1,
                'updated_at' => date('Y-m-d H:i:s'),
            ], '`merchant_id` = ?', [$id]);
        }

        $this->json(['id' => $id], '状态更新成功');
    }

    /**
     * 商家认证
     */
    public function verify()
    {
        $id = (int) $this->post('id');
        $verified = $this->post('verified', true);

        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $merchant = $this->db->find("SELECT * FROM merchants WHERE `id` = ?", [$id]);
        if (!$merchant) {
            $this->error('商家不存在', 404);
        }

        $this->db->update('merchants', [
            'verified_at' => $verified ? date('Y-m-d H:i:s') : null,
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$id]);

        $this->json(['id' => $id], $verified ? '认证成功' : '取消认证成功');
    }

    /**
     * 商家申请待审核列表
     */
    public function pending()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $offset = ($page - 1) * $limit;

        $list = $this->db->select(
            "SELECT m.*, u.username, u.email, u.phone 
             FROM merchants m 
             LEFT JOIN users u ON m.user_id = u.id 
             WHERE m.status = 0 
             ORDER BY m.`created_at` DESC 
             LIMIT {$limit} OFFSET {$offset}"
        );

        $total = $this->db->count('merchants', ['status' => 0]);

        $this->json([
            'list' => $list,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }

    /**
     * 发送通知给用户
     */
    private function notifyUser($userId, $title, $content, $type)
    {
        $this->db->insert('notifications', [
            'user_id' => $userId,
            'title' => $title,
            'content' => $content,
            'type' => $type,
            'is_read' => 0,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }
}
