<?php
/**
 * 订单控制器
 */

namespace app\controller;

use app\Controller;
use app\common\Jwt;

class Order extends Controller
{
    /**
     * 订单列表
     */
    public function index()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $status = $this->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $where = "`user_id` = ?";
        $params = [$userId];
        
        if ($status) {
            $where .= " AND `status` = ?";
            $params[] = $status;
        }
        
        $list = $this->db->select(
            "SELECT * FROM `orders` WHERE {$where} ORDER BY `created_at` DESC LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        
        // 获取订单商品
        foreach ($list as &$order) {
            $order['items'] = $this->db->select(
                "SELECT * FROM `order_items` WHERE `order_id` = ?",
                [$order['id']]
            );
        }
        
        $total = $this->db->count('orders', $where, $params);
        
        $this->json([
            'list' => $list,
            'total' => (int) $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * 创建订单
     */
    public function create()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $items = $this->post('items');
        $addressId = $this->post('address_id');
        $remark = $this->post('remark');
        $couponId = $this->post('coupon_id');
        
        if (empty($items) || !is_array($items)) {
            $this->error('請選擇商品');
        }
        
        // 获取收货地址
        $address = $this->db->find(
            "SELECT * FROM `addresses` WHERE `id` = ? AND `user_id` = ?",
            [$addressId, $userId]
        );
        
        if (!$address) {
            $this->error('請選擇收貨地址');
        }
        
        // 计算订单金额
        $totalAmount = 0;
        $orderItems = [];
        
        foreach ($items as $item) {
            $goods = $this->db->find(
                "SELECT * FROM `goods` WHERE `id` = ? AND `status` = 1",
                [$item['goods_id']]
            );
            
            if (!$goods) {
                $this->error('商品不存在或已下架');
            }
            
            $quantity = (int) ($item['quantity'] ?: 1);
            $price = (float) $goods['price'];
            $subtotal = $price * $quantity;
            
            $totalAmount += $subtotal;
            
            $orderItems[] = [
                'goods_id' => $goods['id'],
                'goods_name' => $goods['name'],
                'goods_image' => $goods['cover'],
                'specs' => isset($item['specs']) ? json_encode($item['specs']) : null,
                'price' => $price,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ];
        }
        
        // 计算运费（满额免运）
        $shippingFee = $totalAmount >= 199 ? 0 : 10;
        
        // 优惠券
        $discountAmount = 0;
        if ($couponId) {
            $coupon = $this->db->find(
                "SELECT * FROM `coupons` WHERE `id` = ? AND `status` = 1 AND `valid_from` <= NOW() AND `valid_to` >= NOW()",
                [$couponId]
            );
            
            if ($coupon) {
                if ($coupon['type'] === 'fixed') {
                    $discountAmount = (float) $coupon['value'];
                } elseif ($coupon['type'] === 'percent') {
                    $discountAmount = $totalAmount * ((float) $coupon['value'] / 100);
                    if ($coupon['max_discount']) {
                        $discountAmount = min($discountAmount, (float) $coupon['max_discount']);
                    }
                }
            }
        }
        
        $actualAmount = max(0, $totalAmount + $shippingFee - $discountAmount);
        
        // 生成订单号
        $orderNo = 'ORD' . date('YmdHis') . rand(1000, 9999);
        
        // 开始事务
        $this->db->begin();
        
        try {
            // 创建订单
            $orderId = $this->db->insert('orders', [
                'order_no' => $orderNo,
                'user_id' => $userId,
                'total_amount' => $totalAmount,
                'discount_amount' => $discountAmount,
                'shipping_fee' => $shippingFee,
                'actual_amount' => $actualAmount,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'shipping_name' => $address['name'],
                'shipping_phone' => $address['phone'],
                'shipping_province' => $address['province'],
                'shipping_city' => $address['city'],
                'shipping_district' => $address['district'],
                'shipping_address' => $address['address'],
                'remark' => $remark,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            
            // 创建订单商品
            foreach ($orderItems as &$item) {
                $item['order_id'] = $orderId;
                $item['created_at'] = date('Y-m-d H:i:s');
                $this->db->insert('order_items', $item);
            }
            
            // 标记优惠券已使用
            if ($couponId) {
                $this->db->insert('user_coupons', [
                    'user_id' => $userId,
                    'coupon_id' => $couponId,
                    'order_id' => $orderId,
                    'used_at' => date('Y-m-d H:i:s'),
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
            }
            
            $this->db->commit();
            
            // 返回订单信息
            $order = $this->db->find("SELECT * FROM `orders` WHERE `id` = ?", [$orderId]);
            $order['items'] = $orderItems;
            
            $this->json([
                'order' => $order,
                'order_id' => $orderId,
                'order_no' => $orderNo,
            ], '訂單創建成功');
            
        } catch (\Exception $e) {
            $this->db->rollback();
            $this->error('訂單創建失敗：' . $e->getMessage());
        }
    }
    
    /**
     * 订单详情
     */
    public function detail($id)
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $order = $this->db->find(
            "SELECT * FROM `orders` WHERE `id` = ? AND `user_id` = ?",
            [$id, $userId]
        );
        
        if (!$order) {
            $this->error('訂單不存在', 404);
        }
        
        $order['items'] = $this->db->select(
            "SELECT * FROM `order_items` WHERE `order_id` = ?",
            [$id]
        );
        
        // 处理规格JSON
        foreach ($order['items'] as &$item) {
            if ($item['specs']) {
                $item['specs'] = json_decode($item['specs'], true);
            }
        }
        
        $this->json(['order' => $order]);
    }
    
    /**
     * 取消订单
     */
    public function cancel()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $orderId = (int) $this->post('order_id');
        
        $order = $this->db->find(
            "SELECT * FROM `orders` WHERE `id` = ? AND `user_id` = ?",
            [$orderId, $userId]
        );
        
        if (!$order) {
            $this->error('訂單不存在', 404);
        }
        
        // 只有待付款的订单可以取消
        if ($order['status'] !== 'pending') {
            $this->error('當前狀態無法取消訂單');
        }
        
        $this->db->update('orders', [
            'status' => 'cancelled',
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$orderId]);
        
        $this->json([], '訂單已取消');
    }
    
    /**
     * 确认收货
     */
    public function confirm()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $orderId = (int) $this->post('order_id');
        
        $order = $this->db->find(
            "SELECT * FROM `orders` WHERE `id` = ? AND `user_id` = ?",
            [$orderId, $userId]
        );
        
        if (!$order) {
            $this->error('訂單不存在', 404);
        }
        
        // 只有已发货的订单可以确认收货
        if ($order['status'] !== 'delivering') {
            $this->error('當前狀態無法確認收貨');
        }
        
        $this->db->update('orders', [
            'status' => 'delivered',
            'received_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$orderId]);
        
        $this->json([], '已確認收貨');
    }
}
