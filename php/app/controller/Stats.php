<?php
/**
 * 统计管理控制器
 */

namespace app\controller;

use app\Controller;

class Stats extends Controller
{
    /**
     * 获取网站统计数据
     */
    public function index()
    {
        // 商品数量
        $goods_count = $this->db->count('goods', "status = 'active'");
        
        // 用户数量
        $user_count = $this->db->count('users', "status = 'active'");
        
        // 订单数量
        $order_count = $this->db->count('orders');
        
        // 今日订单数量
        $today = date('Y-m-d');
        $today_order_count = $this->db->count('orders', "DATE(created_at) = '{$today}'");
        
        // 今日收入
        $today_revenue = $this->db->find(
            "SELECT COALESCE(SUM(pay_amount), 0) as total FROM orders WHERE DATE(pay_time) = '{$today}' AND status IN ('paid', 'shipped', 'delivered', 'completed')"
        );
        
        // 总收入
        $total_revenue = $this->db->find(
            "SELECT COALESCE(SUM(pay_amount), 0) as total FROM orders WHERE status IN ('paid', 'shipped', 'delivered', 'completed')"
        );

        $this->json([
            'goods_count' => (int) $goods_count,
            'user_count' => (int) $user_count,
            'order_count' => (int) $order_count,
            'today_order_count' => (int) $today_order_count,
            'today_revenue' => (float) $today_revenue['total'],
            'revenue' => (float) $total_revenue['total'],
        ]);
    }

    /**
     * 获取销售统计
     */
    public function sales()
    {
        $type = $this->get('type', 'week'); // day, week, month, year
        $start_date = $this->get('start_date');
        $end_date = $this->get('end_date');

        // Date format based on type
        $date_format = '%Y-%m-%d';
        $interval = '1 DAY';
        
        switch ($type) {
            case 'day':
                $date_format = '%Y-%m-%d %H:00';
                $interval = '1 HOUR';
                break;
            case 'week':
                $date_format = '%Y-%m-%d';
                $interval = '1 DAY';
                break;
            case 'month':
                $date_format = '%Y-%m-%d';
                $interval = '1 WEEK';
                break;
            case 'year':
                $date_format = '%Y-%m';
                $interval = '1 MONTH';
                break;
        }

        // Default date range
        if (!$start_date) {
            $start_date = date('Y-m-d', strtotime("-7 days"));
        }
        if (!$end_date) {
            $end_date = date('Y-m-d');
        }

        // Get sales data
        $sql = "SELECT 
                    DATE_FORMAT(created_at, '{$date_format}') as date,
                    COUNT(*) as order_count,
                    COALESCE(SUM(pay_amount), 0) as revenue,
                    COALESCE(SUM(total_amount), 0) as total
                FROM orders 
                WHERE status IN ('paid', 'shipped', 'delivered', 'completed')
                AND created_at >= '{$start_date} 00:00:00'
                AND created_at <= '{$end_date} 23:59:59'
                GROUP BY DATE_FORMAT(created_at, '{$date_format}')
                ORDER BY date ASC";

        $data = $this->db->select($sql);

        $this->json([
            'list' => $data,
            'type' => $type,
            'start_date' => $start_date,
            'end_date' => $end_date,
        ]);
    }

    /**
     * 获取商品销售排行
     */
    public function goodsRanking()
    {
        $limit = min((int) $this->get('limit', 10), 50);
        $type = $this->get('type', 'sales'); // sales, amount, views

        $order_by = 'sales DESC';
        switch ($type) {
            case 'amount':
                $order_by = 'amount DESC';
                break;
            case 'views':
                $order_by = 'views DESC';
                break;
        }

        $sql = "SELECT 
                    id, name, image, price, sales, views,
                    COALESCE(SUM(oi.price * oi.quantity), 0) as amount
                FROM goods 
                LEFT JOIN order_items oi ON goods.id = oi.goods_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('paid', 'shipped', 'delivered', 'completed')
                WHERE goods.status = 'active'
                GROUP BY goods.id
                ORDER BY {$order_by}
                LIMIT {$limit}";

        $list = $this->db->select($sql);

        $this->json(['list' => $list]);
    }

    /**
     * 获取用户统计
     */
    public function users()
    {
        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $this_month = date('Y-m-01');

        // Total users
        $total = $this->db->count('users');
        
        // New users today
        $today_new = $this->db->count('users', "DATE(created_at) = '{$today}'");
        
        // New users yesterday
        $yesterday_new = $this->db->count('users', "DATE(created_at) = '{$yesterday}'");
        
        // New users this month
        $month_new = $this->db->count('users', "DATE(created_at) >= '{$this_month}'");

        // Active users (with orders in last 30 days)
        $active = $this->db->count(
            "SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );

        $this->json([
            'total' => (int) $total,
            'today_new' => (int) $today_new,
            'yesterday_new' => (int) $yesterday_new,
            'month_new' => (int) $month_new,
            'active' => (int) $active,
            'growth_rate' => $yesterday_new > 0 ? round((($today_new - $yesterday_new) / $yesterday_new) * 100, 1) : 0,
        ]);
    }

    /**
     * 获取分类统计
     */
    public function categories()
    {
        $sql = "SELECT 
                    c.id, c.name, c.icon,
                    COUNT(g.id) as goods_count,
                    COALESCE(SUM(oi.quantity), 0) as sales_count,
                    COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
                FROM categories c
                LEFT JOIN goods g ON c.id = g.category_id AND g.status = 'active'
                LEFT JOIN order_items oi ON g.id = oi.goods_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('paid', 'shipped', 'delivered', 'completed')
                WHERE c.status = 1
                GROUP BY c.id
                ORDER BY goods_count DESC";

        $list = $this->db->select($sql);

        $this->json(['list' => $list]);
    }

    /**
     * 获取地区统计
     */
    public function regions()
    {
        $sql = "SELECT 
                    province,
                    COUNT(*) as order_count,
                    COALESCE(SUM(pay_amount), 0) as revenue
                FROM orders o
                LEFT JOIN addresses a ON o.address_id = a.id
                WHERE o.status IN ('paid', 'shipped', 'delivered', 'completed')
                GROUP BY province
                ORDER BY revenue DESC
                LIMIT 20";

        $list = $this->db->select($sql);

        $this->json(['list' => $list]);
    }

    /**
     * 获取实时数据
     */
    public function realtime()
    {
        $today = date('Y-m-d');
        $online_time = date('Y-m-d H:i:s', strtotime('-5 minutes'));

        // Online users (visited in last 5 minutes)
        $online = $this->db->count(
            "SELECT COUNT(DISTINCT user_id) FROM access_logs WHERE created_at >= '{$online_time}' AND user_id > 0"
        );

        // Today's stats
        $today_stats = $this->db->find(
            "SELECT 
                COUNT(*) as orders,
                COALESCE(SUM(pay_amount), 0) as revenue,
                COUNT(DISTINCT user_id) as users
             FROM orders 
             WHERE DATE(created_at) = '{$today}'
             AND status IN ('paid', 'shipped', 'delivered', 'completed')"
        );

        // Orders in last hour
        $last_hour = $this->db->count(
            "SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)"
        );

        $this->json([
            'online' => (int) $online,
            'today_orders' => (int) ($today_stats['orders'] ?? 0),
            'today_revenue' => (float) ($today_stats['revenue'] ?? 0),
            'today_users' => (int) ($today_stats['users'] ?? 0),
            'last_hour_orders' => (int) $last_hour,
            'time' => date('Y-m-d H:i:s'),
        ]);
    }
}
