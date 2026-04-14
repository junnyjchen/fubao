<?php
/**
 * 优惠券控制器
 */

namespace app\controller;

use app\Controller;

class Coupon extends Controller
{
    /**
     * 获取可领取的优惠券列表
     */
    public function available()
    {
        $list = $this->db->select(
            "SELECT * FROM `coupons` 
             WHERE `status` = 1 
             AND `remain` > 0 
             AND `valid_from` <= NOW() 
             AND `valid_to` >= NOW()
             ORDER BY `created_at` DESC"
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 获取用户的优惠券
     */
    public function my()
    {
        $userId = $this->verifyUser();
        
        $status = $this->get('status'); // unused, available, expired
        
        $list = $this->db->select(
            "SELECT 
                `uc`.*,
                `c`.`name` as `coupon_name`,
                `c`.`type` as `coupon_type`,
                `c`.`value` as `coupon_value`,
                `c`.`min_amount` as `coupon_min_amount`,
                `c`.`max_discount` as `coupon_max_discount`,
                `c`.`valid_from`,
                `c`.`valid_to`
             FROM `user_coupons` `uc`
             LEFT JOIN `coupons` `c` ON `uc`.`coupon_id` = `c`.`id`
             WHERE `uc`.`user_id` = ?
             ORDER BY `uc`.`created_at` DESC",
            [$userId]
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 领取优惠券
     */
    public function claim()
    {
        $userId = $this->verifyUser();
        
        $couponId = (int) $this->post('coupon_id');
        
        if (!$couponId) {
            $this->error('請選擇優惠券');
        }
        
        // 检查优惠券是否存在且可领取
        $coupon = $this->db->find(
            "SELECT * FROM `coupons` WHERE `id` = ? AND `status` = 1 AND `remain` > 0 AND `valid_from` <= NOW() AND `valid_to` >= NOW()",
            [$couponId]
        );
        
        if (!$coupon) {
            $this->error('優惠券不存在或已領完');
        }
        
        // 检查是否已领取
        $claimed = $this->db->find(
            "SELECT * FROM `user_coupons` WHERE `user_id` = ? AND `coupon_id` = ?",
            [$userId, $couponId]
        );
        
        if ($claimed) {
            $this->error('您已領取過該優惠券');
        }
        
        // 领取优惠券
        $this->db->begin();
        
        try {
            // 减少库存
            $this->db->query(
                "UPDATE `coupons` SET `remain` = `remain` - 1 WHERE `id` = ? AND `remain` > 0",
                [$couponId]
            );
            
            // 添加用户优惠券
            $id = $this->db->insert('user_coupons', [
                'user_id' => $userId,
                'coupon_id' => $couponId,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
            
            $this->db->commit();
            
            $this->json(['id' => $id], '領取成功');
            
        } catch (\Exception $e) {
            $this->db->rollback();
            $this->error('領取失敗');
        }
    }
    
    /**
     * 检查优惠券是否可用
     */
    public function check()
    {
        $userId = $this->verifyUser();
        
        $couponId = (int) $this->post('coupon_id');
        $orderAmount = (float) $this->post('amount', 0);
        
        // 获取用户优惠券
        $userCoupon = $this->db->find(
            "SELECT 
                `uc`.*,
                `c`.`name` as `coupon_name`,
                `c`.`type` as `coupon_type`,
                `c`.`value` as `coupon_value`,
                `c`.`min_amount` as `coupon_min_amount`,
                `c`.`max_discount` as `coupon_max_discount`,
                `c`.`valid_from`,
                `c`.`valid_to`
             FROM `user_coupons` `uc`
             LEFT JOIN `coupons` `c` ON `uc`.`coupon_id` = `c`.`id`
             WHERE `uc`.`user_id` = ? AND `uc`.`coupon_id` = ? AND `uc`.`used_at` IS NULL",
            [$userId, $couponId]
        );
        
        if (!$userCoupon) {
            $this->json(['valid' => false, 'message' => '優惠券不存在或已使用']);
        }
        
        // 检查有效期
        if ($userCoupon['valid_to'] < date('Y-m-d H:i:s')) {
            $this->json(['valid' => false, 'message' => '優惠券已過期']);
        }
        
        // 检查最低消费
        if ($orderAmount < $userCoupon['coupon_min_amount']) {
            $this->json([
                'valid' => false, 
                'message' => "滿{$userCoupon['coupon_min_amount']}元可用"
            ]);
        }
        
        // 计算优惠金额
        $discount = 0;
        if ($userCoupon['coupon_type'] === 'fixed') {
            $discount = (float) $userCoupon['coupon_value'];
        } elseif ($userCoupon['coupon_type'] === 'percent') {
            $discount = $orderAmount * ((float) $userCoupon['coupon_value'] / 100);
            if ($userCoupon['coupon_max_discount']) {
                $discount = min($discount, (float) $userCoupon['coupon_max_discount']);
            }
        }
        
        $this->json([
            'valid' => true,
            'discount' => round($discount, 2),
            'coupon' => $userCoupon,
        ]);
    }
}
