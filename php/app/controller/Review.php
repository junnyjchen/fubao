<?php
/**
 * 评价管理控制器
 */

namespace app\controller;

use app\Controller;
use app\common\Validator;

class Review extends Controller
{
    /**
     * 获取评价列表
     */
    public function index()
    {
        $goods_id = (int) $this->get('goods_id', 0);
        $rating = (int) $this->get('rating', 0);
        $has_image = $this->get('has_image');
        $page = (int) $this->get('page', 1);
        $page_size = min((int) $this->get('page_size', 10), 50);

        $where = 'r.status = 1';
        $params = [];

        if ($goods_id > 0) {
            $where .= ' AND r.goods_id = ?';
            $params[] = $goods_id;
        }

        if ($rating > 0) {
            $where .= ' AND r.rating = ?';
            $params[] = $rating;
        }

        if ($has_image === 'true') {
            $where .= ' AND r.images != ""';
        }

        // Count total
        $count_sql = "SELECT COUNT(*) as total FROM reviews r WHERE {$where}";
        $total = $this->db->count($count_sql, $params);

        // Get list
        $offset = ($page - 1) * $page_size;
        $sql = "SELECT r.*, u.nickname as user_nickname, u.avatar as user_avatar,
                g.name as goods_name, m.name as merchant_name
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN goods g ON r.goods_id = g.id
                LEFT JOIN merchants m ON r.merchant_id = m.id
                WHERE {$where}
                ORDER BY r.created_at DESC
                LIMIT {$page_size} OFFSET {$offset}";

        $list = $this->db->select($sql, $params);

        // Process images
        foreach ($list as &$item) {
            $item['images'] = !empty($item['images']) ? json_decode($item['images'], true) : [];
            
            // Get reply if exists
            if ($item['id']) {
                $reply = $this->db->find(
                    "SELECT * FROM review_replies WHERE review_id = ? ORDER BY created_at DESC LIMIT 1",
                    [$item['id']]
                );
                $item['reply'] = $reply ?: null;
            }
        }

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'page_size' => $page_size,
            'total_pages' => ceil($total / $page_size),
        ]);
    }

    /**
     * 获取评价统计
     */
    public function stats()
    {
        $goods_id = (int) $this->get('goods_id', 0);
        
        if ($goods_id <= 0) {
            $this->error('请选择商品');
        }

        // Average rating
        $stats = $this->db->find(
            "SELECT AVG(rating) as average, COUNT(*) as total,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
             FROM reviews WHERE goods_id = ? AND status = 1",
            [$goods_id]
        );

        $distribution = [
            5 => (int) ($stats['rating_5'] ?? 0),
            4 => (int) ($stats['rating_4'] ?? 0),
            3 => (int) ($stats['rating_3'] ?? 0),
            2 => (int) ($stats['rating_2'] ?? 0),
            1 => (int) ($stats['rating_1'] ?? 0),
        ];

        $this->json([
            'average' => round($stats['average'] ?? 0, 1),
            'total' => (int) $stats['total'],
            'distribution' => $distribution,
        ]);
    }

    /**
     * 提交评价
     */
    public function create()
    {
        $user = $this->verifyUser();

        $data = $this->post();
        
        // Validate
        $rules = [
            'order_id' => 'required|number',
            'goods_id' => 'required|number',
            'rating' => 'required|number|min:1|max:5',
            'content' => 'required|min:5|max:500',
        ];

        $validator = new Validator();
        if (!$validator->validate($data, $rules)) {
            $this->error($validator->getError());
        }

        // Check if already reviewed
        $exists = $this->db->find(
            "SELECT id FROM reviews WHERE order_id = ? AND goods_id = ? AND user_id = ?",
            [$data['order_id'], $data['goods_id'], $user['id']]
        );

        if ($exists) {
            $this->error('该商品已评价');
        }

        // Create review
        $review_id = $this->db->insert('reviews', [
            'user_id' => $user['id'],
            'order_id' => $data['order_id'],
            'goods_id' => $data['goods_id'],
            'rating' => (int) $data['rating'],
            'content' => trim($data['content']),
            'images' => !empty($data['images']) ? json_encode($data['images']) : '',
            'status' => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        // Update order item status
        $this->db->update('order_items', [
            'is_reviewed' => 1,
        ], 'order_id = ? AND goods_id = ?', [$data['order_id'], $data['goods_id']]);

        // Update goods rating stats
        $this->updateGoodsRating($data['goods_id']);

        $this->json(['id' => $review_id], '评价成功');
    }

    /**
     * 商家回复评价
     */
    public function reply()
    {
        $user = $this->verifyUser();

        $data = $this->post();
        
        // Validate
        $rules = [
            'review_id' => 'required|number',
            'content' => 'required|min:2|max:500',
        ];

        $validator = new Validator();
        if (!$validator->validate($data, $rules)) {
            $this->error($validator->getError());
        }

        // Check review exists and get merchant
        $review = $this->db->find(
            "SELECT r.*, g.merchant_id FROM reviews r
             LEFT JOIN goods g ON r.goods_id = g.id
             WHERE r.id = ?",
            [$data['review_id']]
        );

        if (!$review) {
            $this->error('评价不存在');
        }

        // Check permission
        $merchant = $this->db->find(
            "SELECT id FROM merchants WHERE user_id = ? AND id = ?",
            [$user['id'], $review['merchant_id']]
        );

        if (!$merchant) {
            $this->error('无权限回复此评价');
        }

        // Create reply
        $this->db->insert('review_replies', [
            'review_id' => $data['review_id'],
            'merchant_id' => $review['merchant_id'],
            'content' => trim($data['content']),
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        $this->json([], '回复成功');
    }

    /**
     * 点赞评价
     */
    public function like()
    {
        $user = $this->verifyUser();

        $review_id = (int) $this->post('review_id', 0);

        if ($review_id <= 0) {
            $this->error('请选择评价');
        }

        // Check if already liked
        $exists = $this->db->find(
            "SELECT id FROM review_likes WHERE review_id = ? AND user_id = ?",
            [$review_id, $user['id']]
        );

        if ($exists) {
            // Unlike
            $this->db->delete('review_likes', 'review_id = ? AND user_id = ?', [$review_id, $user['id']]);
            $this->db->query("UPDATE reviews SET likes = likes - 1 WHERE id = ?", [$review_id]);
            $this->json(['liked' => false], '已取消点赞');
        } else {
            // Like
            $this->db->insert('review_likes', [
                'review_id' => $review_id,
                'user_id' => $user['id'],
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            $this->db->query("UPDATE reviews SET likes = likes + 1 WHERE id = ?", [$review_id]);
            $this->json(['liked' => true], '点赞成功');
        }
    }

    /**
     * 获取用户评价列表
     */
    public function myList()
    {
        $user = $this->verifyUser();

        $page = (int) $this->get('page', 1);
        $page_size = min((int) $this->get('page_size', 10), 50);

        $total = $this->db->count('reviews', 'user_id = ?', [$user['id']]);

        $offset = ($page - 1) * $page_size;
        $list = $this->db->select(
            "SELECT r.*, g.name as goods_name, g.image as goods_image
             FROM reviews r
             LEFT JOIN goods g ON r.goods_id = g.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC
             LIMIT {$page_size} OFFSET {$offset}",
            [$user['id']]
        );

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'page_size' => $page_size,
        ]);
    }

    /**
     * 更新商品评分
     */
    private function updateGoodsRating($goods_id)
    {
        $stats = $this->db->find(
            "SELECT AVG(rating) as average, COUNT(*) as total FROM reviews WHERE goods_id = ? AND status = 1",
            [$goods_id]
        );

        $this->db->update('goods', [
            'rating' => round($stats['average'] ?? 0, 1),
            'rating_count' => (int) $stats['total'],
        ], 'id = ?', [$goods_id]);
    }
}
