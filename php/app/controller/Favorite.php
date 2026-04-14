<?php
/**
 * 收藏控制器
 */

namespace app\controller;

use app\Controller;

class Favorite extends Controller
{
    /**
     * 收藏列表
     */
    public function index()
    {
        $userId = $this->verifyUser();
        
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $offset = ($page - 1) * $limit;
        
        $list = $this->db->select(
            "SELECT 
                `f`.*,
                `g`.`name` as `goods_name`,
                `g`.`cover` as `goods_cover`,
                `g`.`price` as `goods_price`,
                `g`.`original_price` as `goods_original_price`,
                `g`.`stock` as `goods_stock`,
                `g`.`status` as `goods_status`
             FROM `favorites` `f`
             LEFT JOIN `goods` `g` ON `f`.`goods_id` = `g`.`id`
             WHERE `f`.`user_id` = ?
             ORDER BY `f`.`created_at` DESC
             LIMIT {$limit} OFFSET {$offset}",
            [$userId]
        );
        
        $total = $this->db->count('favorites', '`user_id` = ?', [$userId]);
        
        $this->json([
            'list' => $list,
            'total' => (int) $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * 添加收藏
     */
    public function add()
    {
        $userId = $this->verifyUser();
        
        $goodsId = (int) $this->post('goods_id');
        
        if (!$goodsId) {
            $this->error('請選擇商品');
        }
        
        // 检查商品是否存在
        $goods = $this->db->find(
            "SELECT * FROM `goods` WHERE `id` = ?",
            [$goodsId]
        );
        
        if (!$goods) {
            $this->error('商品不存在');
        }
        
        // 检查是否已收藏
        $exists = $this->db->find(
            "SELECT * FROM `favorites` WHERE `user_id` = ? AND `goods_id` = ?",
            [$userId, $goodsId]
        );
        
        if ($exists) {
            $this->json([], '已收藏');
        }
        
        $id = $this->db->insert('favorites', [
            'user_id' => $userId,
            'goods_id' => $goodsId,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        
        $this->json(['id' => $id], '已收藏');
    }
    
    /**
     * 取消收藏
     */
    public function remove()
    {
        $userId = $this->verifyUser();
        
        $goodsId = (int) $this->post('goods_id');
        
        if (!$goodsId) {
            $this->error('請選擇商品');
        }
        
        $this->db->delete('favorites', '`user_id` = ? AND `goods_id` = ?', [$userId, $goodsId]);
        
        $this->json([], '已取消收藏');
    }
    
    /**
     * 检查是否收藏
     */
    public function check()
    {
        $userId = Jwt::verify();
        
        $goodsId = (int) $this->get('goods_id');
        
        if (!$userId || !$goodsId) {
            $this->json(['favorited' => false]);
        }
        
        $exists = $this->db->find(
            "SELECT * FROM `favorites` WHERE `user_id` = ? AND `goods_id` = ?",
            [$userId, $goodsId]
        );
        
        $this->json(['favorited' => !!$exists]);
    }
    
    /**
     * 获取收藏数量
     */
    public function count()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->json(['count' => 0]);
        }
        
        $count = $this->db->count('favorites', '`user_id` = ?', [$userId]);
        
        $this->json(['count' => $count]);
    }
}
