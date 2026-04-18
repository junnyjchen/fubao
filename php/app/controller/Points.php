<?php
/**
 * 积分管理控制器
 */

namespace app\controller;

use app\Controller;

class Points extends Controller
{
    /**
     * 获取积分信息
     */
    public function info()
    {
        $user = $this->verifyUser();

        $info = $this->db->find(
            "SELECT points, total_points, level, exp, created_at FROM users WHERE id = ?",
            [$user['id']]
        );

        // Get level info
        $level = $this->getLevelInfo($info['level'] ?? 1);
        
        // Get next level progress
        $current_exp = $info['exp'] ?? 0;
        $next_exp = $level['exp'];
        $progress = $level['exp'] > 0 ? round(($current_exp / $next_exp) * 100, 1) : 100;

        $this->json([
            'points' => $info['points'] ?? 0,
            'total_points' => $info['total_points'] ?? 0,
            'level' => $info['level'] ?? 1,
            'level_name' => $level['name'],
            'exp' => $current_exp,
            'next_exp' => $next_exp,
            'progress' => $progress,
            'level_icon' => $level['icon'],
        ]);
    }

    /**
     * 获取积分记录
     */
    public function logs()
    {
        $user = $this->verifyUser();

        $type = $this->get('type'); // earn, spend, all
        $page = (int) $this->get('page', 1);
        $page_size = min((int) $this->get('page_size', 20), 50);

        $where = 'user_id = ?';
        $params = [$user['id']];

        if ($type === 'earn') {
            $where .= ' AND points > 0';
        } elseif ($type === 'spend') {
            $where .= ' AND points < 0';
        }

        $total = $this->db->count('points_logs', $where, $params);

        $offset = ($page - 1) * $page_size;
        $list = $this->db->select(
            "SELECT * FROM points_logs WHERE {$where} ORDER BY created_at DESC LIMIT {$page_size} OFFSET {$offset}",
            $params
        );

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'page_size' => $page_size,
        ]);
    }

    /**
     * 积分规则列表
     */
    public function rules()
    {
        $rules = [
            [
                'type' => 'sign',
                'name' => '每日签到',
                'points' => 5,
                'description' => '每日签到可获得积分',
                'max_times' => 1,
                'period' => 'day',
            ],
            [
                'type' => 'order',
                'name' => '购物返积分',
                'points' => 0,
                'rate' => 0.1,
                'description' => '每消费1元返1积分（可设置）',
                'max_times' => 0,
            ],
            [
                'type' => 'review',
                'name' => '商品评价',
                'points' => 10,
                'description' => '完成商品评价可获得积分',
                'max_times' => 1,
                'period' => 'order',
            ],
            [
                'type' => 'invite',
                'name' => '邀请好友',
                'points' => 50,
                'description' => '成功邀请好友注册可获得积分',
                'max_times' => 0,
            ],
            [
                'type' => 'share',
                'name' => '分享商品',
                'points' => 2,
                'description' => '分享商品链接可获得积分',
                'max_times' => 5,
                'period' => 'day',
            ],
        ];

        $this->json(['rules' => $rules]);
    }

    /**
     * 签到
     */
    public function sign()
    {
        $user = $this->verifyUser();

        // Check if already signed today
        $today = date('Y-m-d');
        $signed = $this->db->find(
            "SELECT id FROM points_logs WHERE user_id = ? AND type = 'sign' AND DATE(created_at) = ?",
            [$user['id'], $today]
        );

        if ($signed) {
            $this->error('今日已签到');
        }

        // Calculate sign bonus (连续签到奖励)
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $consecutive = $this->db->count(
            "SELECT COUNT(*) FROM points_logs WHERE user_id = ? AND type = 'sign' AND DATE(created_at) >= ?",
            [$user['id'], date('Y-m-d', strtotime('-6 day'))]
        );

        // Base points + consecutive bonus
        $points = 5;
        if ($consecutive >= 6) {
            $points += 10; // 连续签到7天额外奖励
        } elseif ($consecutive >= 2) {
            $points += $consecutive;
        }

        // Add points
        $this->addPoints($user['id'], $points, 'sign', '每日签到');

        // Update user level
        $this->updateUserLevel($user['id']);

        $this->json([
            'points' => $points,
            'consecutive' => $consecutive + 1,
            'total_signs' => $this->db->count("SELECT COUNT(*) FROM points_logs WHERE user_id = ? AND type = 'sign'", [$user['id']]),
        ], '签到成功');
    }

    /**
     * 积分兑换
     */
    public function exchange()
    {
        $user = $this->verifyUser();

        $data = $this->post();
        $goods_id = (int) ($data['goods_id'] ?? 0);
        $quantity = (int) ($data['quantity'] ?? 1);

        if ($goods_id <= 0) {
            $this->error('请选择兑换商品');
        }

        // Get exchange goods
        $goods = $this->db->find(
            "SELECT * FROM points_goods WHERE id = ? AND status = 1",
            [$goods_id]
        );

        if (!$goods) {
            $this->error('兑换商品不存在');
        }

        if ($goods['stock'] < $quantity) {
            $this->error('库存不足');
        }

        $total_points = $goods['points'] * $quantity;

        // Check user points
        $user_info = $this->db->find("SELECT points FROM users WHERE id = ?", [$user['id']]);
        if ($user_info['points'] < $total_points) {
            $this->error('积分不足');
        }

        // Deduct points
        $this->db->query(
            "UPDATE users SET points = points - ? WHERE id = ?",
            [$total_points, $user['id']]
        );

        // Log
        $this->db->insert('points_logs', [
            'user_id' => $user['id'],
            'points' => -$total_points,
            'type' => 'exchange',
            'remark' => '兑换：' . $goods['name'] . ' x' . $quantity,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        // Create exchange order
        $order_no = 'PE' . date('YmdHis') . rand(1000, 9999);
        $this->db->insert('points_orders', [
            'order_no' => $order_no,
            'user_id' => $user['id'],
            'goods_id' => $goods_id,
            'quantity' => $quantity,
            'points' => $total_points,
            'address_id' => $data['address_id'] ?? 0,
            'status' => 1, // 待发货
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        // Update stock
        $this->db->query(
            "UPDATE points_goods SET stock = stock - ? WHERE id = ?",
            [$quantity, $goods_id]
        );

        $this->json(['order_no' => $order_no], '兑换成功');
    }

    /**
     * 添加积分
     */
    private function addPoints($user_id, $points, $type, $remark = '')
    {
        $this->db->query(
            "UPDATE users SET points = points + ?, total_points = total_points + ? WHERE id = ?",
            [$points, $points, $user_id]
        );

        $this->db->insert('points_logs', [
            'user_id' => $user_id,
            'points' => $points,
            'type' => $type,
            'remark' => $remark,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * 更新用户等级
     */
    private function updateUserLevel($user_id)
    {
        $user = $this->db->find("SELECT total_points, level FROM users WHERE id = ?", [$user_id]);
        
        // Level thresholds
        $levels = [
            1 => ['exp' => 100, 'name' => '青铜'],
            2 => ['exp' => 500, 'name' => '白银'],
            3 => ['exp' => 1000, 'name' => '黄金'],
            4 => ['exp' => 3000, 'name' => '铂金'],
            5 => ['exp' => 5000, 'name' => '钻石'],
        ];

        $new_level = 1;
        foreach ($levels as $level => $info) {
            if ($user['total_points'] >= $info['exp']) {
                $new_level = $level;
            }
        }

        if ($new_level > $user['level']) {
            $this->db->query("UPDATE users SET level = ?, exp = ? WHERE id = ?", [
                $new_level,
                $user['total_points'],
                $user_id
            ]);
        } else {
            $this->db->query("UPDATE users SET exp = ? WHERE id = ?", [
                $user['total_points'],
                $user_id
            ]);
        }
    }

    /**
     * 获取等级信息
     */
    private function getLevelInfo($level)
    {
        $levels = [
            1 => ['name' => '青铜', 'exp' => 100, 'icon' => '🥉'],
            2 => ['name' => '白银', 'exp' => 500, 'icon' => '🥈'],
            3 => ['name' => '黄金', 'exp' => 1000, 'icon' => '🥇'],
            4 => ['name' => '铂金', 'exp' => 3000, 'icon' => '💎'],
            5 => ['name' => '钻石', 'exp' => 5000, 'icon' => '👑'],
        ];

        return $levels[$level] ?? $levels[1];
    }
}
