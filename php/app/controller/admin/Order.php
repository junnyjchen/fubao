<?php
/**
 * 管理员 - 订单管理
 */

namespace app\controller\admin;

use app\Controller;
use app\middleware\AdminAuth;

class Order extends Controller
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
     * 订单列表
     */
    public function index()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $status = $this->get('status');
        $keyword = $this->get('keyword');
        
        $offset = ($page - 1) * $limit;
        
        $where = "1=1";
        $params = [];
        
        if ($status) {
            $where .= " AND `o`.`status` = ?";
            $params[] = $status;
        }
        
        if ($keyword) {
            $where .= " AND (`o`.`order_no` LIKE ? OR `u`.`username` LIKE ? OR `o`.`shipping_name` LIKE ?)";
            $params[] = "%{$keyword}%";
            $params[] = "%{$keyword}%";
            $params[] = "%{$keyword}%";
        }
        
        $list = $this->db->select(
            "SELECT `o`.*, `u`.`username`, `u`.`phone` as `user_phone`
             FROM `orders` `o`
             LEFT JOIN `users` `u` ON `o`.`user_id` = `u`.`id`
             WHERE {$where}
             ORDER BY `o`.`created_at` DESC
             LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        
        // 获取订单商品
        foreach ($list as &$order) {
            $order['items'] = $this->db->select(
                "SELECT * FROM `order_items` WHERE `order_id` = ?",
                [$order['id']]
            );
        }
        
        $total = $this->db->value(
            "SELECT COUNT(*) FROM `orders` `o` LEFT JOIN `users` `u` ON `o`.`user_id` = `u`.`id` WHERE {$where}",
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
     * 订单详情
     */
    public function detail($id)
    {
        $order = $this->db->find(
            "SELECT `o`.*, `u`.`username`, `u`.`phone` as `user_phone`
             FROM `orders` `o`
             LEFT JOIN `users` `u` ON `o`.`user_id` = `u`.`id`
             WHERE `o`.`id` = ?",
            [$id]
        );
        
        if (!$order) {
            $this->error('訂單不存在', 404);
        }
        
        $order['items'] = $this->db->select(
            "SELECT * FROM `order_items` WHERE `order_id` = ?",
            [$id]
        );
        
        $this->json(['order' => $order]);
    }
    
    /**
     * 更新订单状态
     */
    public function updateStatus()
    {
        $id = (int) $this->post('id');
        $status = $this->post('status');
        
        if (!$id || !$status) {
            $this->error('請填寫完整資訊');
        }
        
        $allowedStatus = ['pending', 'paid', 'processing', 'shipped', 'delivering', 'delivered', 'completed', 'cancelled'];
        
        if (!in_array($status, $allowedStatus)) {
            $this->error('無效的狀態');
        }
        
        $data = [
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s'),
        ];
        
        // 支付时间
        if ($status === 'paid') {
            $data['paid_at'] = date('Y-m-d H:i:s');
        }
        
        // 发货时间
        if (in_array($status, ['shipped', 'delivering'])) {
            $data['shipped_at'] = date('Y-m-d H:i:s');
            $data['tracking_no'] = $this->post('tracking_no');
            $data['shipping_company'] = $this->post('shipping_company');
        }
        
        // 收货时间
        if ($status === 'delivered') {
            $data['received_at'] = date('Y-m-d H:i:s');
        }
        
        // 完成时间
        if ($status === 'completed') {
            $data['completed_at'] = date('Y-m-d H:i:s');
        }
        
        $this->db->update('orders', $data, '`id` = ?', [$id]);
        
        $this->json([], '更新成功');
    }
    
    /**
     * 导出订单
     */
    public function export()
    {
        $status = $this->get('status');
        
        $where = "1=1";
        $params = [];
        
        if ($status) {
            $where .= " AND `status` = ?";
            $params[] = $status;
        }
        
        $list = $this->db->select(
            "SELECT `o`.*, `u`.`username`, `u`.`phone` as `user_phone`
             FROM `orders` `o`
             LEFT JOIN `users` `u` ON `o`.`user_id` = `u`.`id`
             WHERE {$where}
             ORDER BY `o`.`created_at` DESC",
            $params
        );
        
        // CSV导出
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=orders_' . date('Ymd') . '.csv');
        
        // BOM for Excel
        echo "\xEF\xBB\xBF";
        
        // 表头
        echo "訂單號,用戶名,收貨人,電話,地址,商品,總金額,運費,優惠,實付,狀態,下單時間\n";
        
        foreach ($list as $order) {
            $items = $this->db->select(
                "SELECT `goods_name`, `quantity` FROM `order_items` WHERE `order_id` = ?",
                [$order['id']]
            );
            
            $goodsStr = '';
            foreach ($items as $item) {
                $goodsStr .= $item['goods_name'] . 'x' . $item['quantity'] . '; ';
            }
            
            $statusMap = [
                'pending' => '待付款',
                'paid' => '已付款',
                'processing' => '處理中',
                'shipped' => '已發貨',
                'delivering' => '配送中',
                'delivered' => '已收貨',
                'completed' => '已完成',
                'cancelled' => '已取消',
            ];
            
            $fullAddress = $order['shipping_province'] . $order['shipping_city'] . $order['shipping_district'] . $order['shipping_address'];
            
            echo sprintf("%s,%s,%s,%s,%s,%s,%.2f,%.2f,%.2f,%.2f,%s,%s\n",
                $order['order_no'],
                $order['username'],
                $order['shipping_name'],
                $order['shipping_phone'],
                $fullAddress,
                $goodsStr,
                $order['total_amount'],
                $order['shipping_fee'],
                $order['discount_amount'],
                $order['actual_amount'],
                $statusMap[$order['status']] ?? $order['status'],
                $order['created_at']
            );
        }
    }
}
