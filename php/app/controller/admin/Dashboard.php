<?php
/**
 * 管理员 - 统计
 */

namespace app\controller\admin;

use app\Controller;
use app\middleware\AdminAuth;

class Dashboard extends Controller
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
     * 统计概览
     */
    public function index()
    {
        // 今日数据
        $today = date('Y-m-d');
        
        // 今日订单数
        $todayOrders = $this->db->value(
            "SELECT COUNT(*) FROM `orders` WHERE DATE(`created_at`) = ?",
            [$today]
        );
        
        // 今日销售额
        $todaySales = $this->db->value(
            "SELECT COALESCE(SUM(`actual_amount`), 0) FROM `orders` WHERE DATE(`created_at`) = ? AND `status` NOT IN ('cancelled')",
            [$today]
        );
        
        // 今日新增用户
        $todayUsers = $this->db->value(
            "SELECT COUNT(*) FROM `users` WHERE DATE(`created_at`) = ?",
            [$today]
        );
        
        // 总订单数
        $totalOrders = $this->db->count('orders');
        
        // 总销售额
        $totalSales = $this->db->value(
            "SELECT COALESCE(SUM(`actual_amount`), 0) FROM `orders` WHERE `status` NOT IN ('cancelled')"
        );
        
        // 总用户数
        $totalUsers = $this->db->count('users');
        
        // 总商品数
        $totalGoods = $this->db->count('goods', '`status` = 1');
        
        // 待处理订单
        $pendingOrders = $this->db->count('orders', '`status` = ?', ['pending']);
        $paidOrders = $this->db->count('orders', '`status` = ?', ['paid']);
        $processingOrders = $this->db->count('orders', '`status` = ?', ['processing']);
        
        $this->json([
            'today' => [
                'orders' => (int) $todayOrders,
                'sales' => (float) $todaySales,
                'users' => (int) $todayUsers,
            ],
            'total' => [
                'orders' => (int) $totalOrders,
                'sales' => (float) $totalSales,
                'users' => (int) $totalUsers,
                'goods' => (int) $totalGoods,
            ],
            'pending' => [
                'orders' => (int) $pendingOrders,
                'paid' => (int) $paidOrders,
                'processing' => (int) $processingOrders,
            ],
        ]);
    }
    
    /**
     * 销售统计
     */
    public function sales()
    {
        $type = $this->get('type', 'week'); // day, week, month, year
        
        $format = '%Y-%m-%d';
        $interval = 'INTERVAL 7 DAY';
        
        switch ($type) {
            case 'day':
                $format = '%H:00';
                $interval = 'INTERVAL 24 HOUR';
                break;
            case 'month':
                $format = '%Y-%m-%d';
                $interval = 'INTERVAL 30 DAY';
                break;
            case 'year':
                $format = '%Y-%m';
                $interval = 'INTERVAL 12 MONTH';
                break;
        }
        
        $list = $this->db->select(
            "SELECT 
                DATE_FORMAT(`created_at`, ?) as `date`,
                COUNT(*) as `orders`,
                COALESCE(SUM(`actual_amount`), 0) as `sales`
             FROM `orders` 
             WHERE `created_at` >= DATE_SUB(NOW(), {$interval})
             AND `status` NOT IN ('cancelled')
             GROUP BY DATE_FORMAT(`created_at`, ?)
             ORDER BY `date` ASC",
            [$format, $format]
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 商品销量排行
     */
    public function goodsRanking()
    {
        $limit = (int) $this->get('limit', 10);
        
        $list = $this->db->select(
            "SELECT 
                `g`.`id`,
                `g`.`name`,
                `g`.`cover`,
                `g`.`price`,
                COALESCE(SUM(`oi`.`quantity`), 0) as `sales_count`,
                COALESCE(SUM(`oi`.`subtotal`), 0) as `sales_amount`
             FROM `goods` `g`
             LEFT JOIN `order_items` `oi` ON `g`.`id` = `oi`.`goods_id`
             LEFT JOIN `orders` `o` ON `oi`.`order_id` = `o`.`id` AND `o`.`status` NOT IN ('cancelled')
             WHERE `g`.`status` = 1
             GROUP BY `g`.`id`
             ORDER BY `sales_count` DESC
             LIMIT {$limit}"
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 用户统计
     */
    public function users()
    {
        // 近7天新增用户
        $newUsers = $this->db->select(
            "SELECT DATE(`created_at`) as `date`, COUNT(*) as `count`
             FROM `users`
             WHERE `created_at` >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(`created_at`)
             ORDER BY `date` ASC"
        );
        
        // 总用户、活跃用户（最近30天有订单）
        $totalUsers = $this->db->count('users');
        $activeUsers = $this->db->value(
            "SELECT COUNT(DISTINCT `user_id`) FROM `orders` WHERE `created_at` >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );
        
        $this->json([
            'total' => (int) $totalUsers,
            'active' => (int) $activeUsers,
            'new_users' => $newUsers,
        ]);
    }
}
