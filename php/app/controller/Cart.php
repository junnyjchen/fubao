<?php
/**
 * 购物车控制器
 */

namespace app\controller;

use app\Controller;

class Cart extends Controller
{
    /**
     * 获取购物车列表
     */
    public function index()
    {
        $userId = $this->verifyUser();
        
        $items = $this->db->select(
            "SELECT 
                `c`.*,
                `g`.`name` as `goods_name`,
                `g`.`cover` as `goods_cover`,
                `g`.`price` as `goods_price`,
                `g`.`stock` as `goods_stock`,
                `g`.`status` as `goods_status`
            FROM `cart_items` `c`
            LEFT JOIN `goods` `g` ON `c`.`goods_id` = `g`.`id`
            WHERE `c`.`user_id` = ?
            ORDER BY `c`.`created_at` DESC",
            [$userId]
        );
        
        // 计算总计
        $totalAmount = 0;
        $totalCount = 0;
        
        foreach ($items as &$item) {
            $item['subtotal'] = $item['goods_price'] * $item['quantity'];
            $totalAmount += $item['subtotal'];
            $totalCount += $item['quantity'];
            
            if ($item['specs']) {
                $item['specs'] = json_decode($item['specs'], true);
            }
        }
        
        $this->json([
            'list' => $items,
            'total_amount' => $totalAmount,
            'total_count' => $totalCount,
        ]);
    }
    
    /**
     * 添加到购物车
     */
    public function add()
    {
        $userId = $this->verifyUser();
        
        $goodsId = (int) $this->post('goods_id');
        $quantity = (int) ($this->post('quantity') ?: 1);
        $specs = $this->post('specs');
        
        if (!$goodsId) {
            $this->error('請選擇商品');
        }
        
        // 检查商品
        $goods = $this->db->find(
            "SELECT * FROM `goods` WHERE `id` = ? AND `status` = 1",
            [$goodsId]
        );
        
        if (!$goods) {
            $this->error('商品不存在或已下架');
        }
        
        // 检查库存
        if ($goods['stock'] < $quantity) {
            $this->error('庫存不足');
        }
        
        // 检查是否已在购物车
        $specsHash = $specs ? md5(json_encode($specs)) : '';
        $existing = $this->db->find(
            "SELECT * FROM `cart_items` WHERE `user_id` = ? AND `goods_id` = ? AND `specs_hash` = ?",
            [$userId, $goodsId, $specsHash]
        );
        
        if ($existing) {
            // 更新数量
            $newQuantity = $existing['quantity'] + $quantity;
            if ($newQuantity > $goods['stock']) {
                $this->error('庫存不足');
            }
            
            $this->db->update('cart_items', [
                'quantity' => $newQuantity,
                'updated_at' => date('Y-m-d H:i:s'),
            ], '`id` = ?', [$existing['id']]);
            
            $this->json(['cart_id' => $existing['id']], '已添加到購物車');
        } else {
            // 新增
            $cartId = $this->db->insert('cart_items', [
                'user_id' => $userId,
                'goods_id' => $goodsId,
                'quantity' => $quantity,
                'specs' => $specs ? json_encode($specs) : null,
                'specs_hash' => $specsHash,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            
            $this->json(['cart_id' => $cartId], '已添加到購物車');
        }
    }
    
    /**
     * 更新购物车数量
     */
    public function update()
    {
        $userId = $this->verifyUser();
        
        $cartId = (int) $this->post('cart_id');
        $quantity = (int) $this->post('quantity');
        
        if (!$cartId) {
            $this->error('請選擇購物車商品');
        }
        
        // 检查购物车项
        $item = $this->db->find(
            "SELECT `c`.*, `g`.`stock` 
             FROM `cart_items` `c`
             LEFT JOIN `goods` `g` ON `c`.`goods_id` = `g`.`id`
             WHERE `c`.`id` = ? AND `c`.`user_id` = ?",
            [$cartId, $userId]
        );
        
        if (!$item) {
            $this->error('購物車商品不存在');
        }
        
        if ($quantity <= 0) {
            // 删除
            $this->db->delete('cart_items', '`id` = ?', [$cartId]);
            $this->json([], '已移除');
        }
        
        if ($quantity > $item['stock']) {
            $this->error('庫存不足');
        }
        
        $this->db->update('cart_items', [
            'quantity' => $quantity,
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$cartId]);
        
        $this->json([], '已更新');
    }
    
    /**
     * 删除购物车商品
     */
    public function delete()
    {
        $userId = $this->verifyUser();
        
        $cartId = (int) $this->post('cart_id');
        
        if (!$cartId) {
            $this->error('請選擇要刪除的商品');
        }
        
        $item = $this->db->find(
            "SELECT * FROM `cart_items` WHERE `id` = ? AND `user_id` = ?",
            [$cartId, $userId]
        );
        
        if (!$item) {
            $this->error('購物車商品不存在');
        }
        
        $this->db->delete('cart_items', '`id` = ?', [$cartId]);
        
        $this->json([], '已移除');
    }
    
    /**
     * 清空购物车
     */
    public function clear()
    {
        $userId = $this->verifyUser();
        
        $this->db->delete('cart_items', '`user_id` = ?', [$userId]);
        
        $this->json([], '已清空');
    }
    
    /**
     * 获取购物车数量
     */
    public function count()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->json(['count' => 0]);
        }
        
        $count = $this->db->value(
            "SELECT SUM(`quantity`) FROM `cart_items` WHERE `user_id` = ?",
            [$userId]
        );
        
        $this->json(['count' => (int) ($count ?: 0)]);
    }
}
