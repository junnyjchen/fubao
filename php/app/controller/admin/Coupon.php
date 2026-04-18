<?php
/**
 * 优惠券管理 - 管理员
 */

namespace app\controller\admin;

use app\Controller;

class Coupon extends Controller
{
    /**
     * 优惠券列表
     */
    public function index()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $status = $this->get('status');
        $type = $this->get('type');

        $where = [];
        if ($status !== null && $status !== '') {
            $where[] = "`status` = {$status}";
        }
        if ($type !== null && $type !== '') {
            $where[] = "`type` = '{$type}'";
        }

        $whereStr = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $limit;

        // 查询列表
        $list = $this->db->select(
            "SELECT * FROM coupons {$whereStr} ORDER BY `id` DESC LIMIT {$limit} OFFSET {$offset}"
        );

        // 统计总数
        $total = $this->db->count('coupons', $whereStr ? $where : null);

        // 获取领取统计
        foreach ($list as &$coupon) {
            $coupon['claim_count'] = $this->db->count('user_coupons', [
                'coupon_id' => $coupon['id']
            ]);
        }

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
     * 创建优惠券
     */
    public function create()
    {
        $name = $this->post('name');
        $type = $this->post('type', 'fixed'); // fixed-固定金额, percent-百分比, gift-礼品券
        $value = (float) $this->post('value', 0);
        $minAmount = (float) $this->post('min_amount', 0);
        $maxDiscount = $this->post('max_discount') !== null ? (float) $this->post('max_discount') : null;
        $totalCount = (int) $this->post('total_count', 0);
        $perUserLimit = (int) $this->post('per_user_limit', 1);
        $startTime = $this->post('start_time');
        $endTime = $this->post('end_time');
        $description = $this->post('description', '');
        $status = (int) $this->post('status', 1);
        $applicableGoods = $this->post('applicable_goods', ''); // 适用商品ID，逗号分隔
        $applicableCategories = $this->post('applicable_categories', ''); // 适用分类

        if (empty($name)) {
            $this->error('优惠券名称不能为空', 400);
        }

        if ($type === 'fixed' && $value <= 0) {
            $this->error('固定金额必须大于0', 400);
        }

        if ($type === 'percent' && ($value <= 0 || $value > 100)) {
            $this->error('折扣比例必须在1-100之间', 400);
        }

        $id = $this->db->insert('coupons', [
            'name' => $name,
            'type' => $type,
            'value' => $value,
            'min_amount' => $minAmount,
            'max_discount' => $maxDiscount,
            'total_count' => $totalCount,
            'per_user_limit' => $perUserLimit,
            'start_time' => $startTime ?: date('Y-m-d H:i:s'),
            'end_time' => $endTime ?: date('Y-m-d H:i:s', strtotime('+30 days')),
            'description' => $description,
            'status' => $status,
            'applicable_goods' => $applicableGoods,
            'applicable_categories' => $applicableCategories,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        if (!$id) {
            $this->error('创建失败');
        }

        $this->json(['id' => $id], '创建成功');
    }

    /**
     * 更新优惠券
     */
    public function update()
    {
        $id = (int) $this->post('id');
        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $coupon = $this->db->find("SELECT * FROM coupons WHERE `id` = ?", [$id]);
        if (!$coupon) {
            $this->error('优惠券不存在', 404);
        }

        // 检查是否已被领取
        $claimedCount = $this->db->count('user_coupons', ['coupon_id' => $id]);

        $data = [
            'name' => $this->post('name', $coupon['name']),
            'type' => $this->post('type', $coupon['type']),
            'value' => (float) $this->post('value', $coupon['value']),
            'min_amount' => (float) $this->post('min_amount', $coupon['min_amount']),
            'max_discount' => $this->post('max_discount') !== null ? (float) $this->post('max_discount') : $coupon['max_discount'],
            'total_count' => $this->post('total_count', $coupon['total_count']),
            'per_user_limit' => (int) $this->post('per_user_limit', $coupon['per_user_limit']),
            'start_time' => $this->post('start_time', $coupon['start_time']),
            'end_time' => $this->post('end_time', $coupon['end_time']),
            'description' => $this->post('description', $coupon['description']),
            'status' => (int) $this->post('status', $coupon['status']),
            'applicable_goods' => $this->post('applicable_goods', $coupon['applicable_goods']),
            'applicable_categories' => $this->post('applicable_categories', $coupon['applicable_categories']),
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        // 如果已被领取，不允许减少总量
        if ($claimedCount > 0 && $data['total_count'] < $claimedCount) {
            $this->error('优惠券已被领取，总量不能少于已领取数量', 400);
        }

        $this->db->update('coupons', $data, '`id` = ?', [$id]);

        $this->json(['id' => $id], '更新成功');
    }

    /**
     * 删除优惠券
     */
    public function delete()
    {
        $id = (int) $this->post('id');
        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $coupon = $this->db->find("SELECT * FROM coupons WHERE `id` = ?", [$id]);
        if (!$coupon) {
            $this->error('优惠券不存在', 404);
        }

        // 检查是否已被使用
        $usedCount = $this->db->count('user_coupons', [
            'coupon_id' => $id,
            'used_at' => null
        ]);

        // 有用户正在使用，不能删除
        $this->db->delete('coupons', '`id` = ?', [$id]);

        // 删除领取记录
        if ($usedCount > 0) {
            $this->db->delete('user_coupons', '`coupon_id` = ?', [$id]);
        }

        $this->json(['id' => $id], '删除成功');
    }

    /**
     * 优惠券详情
     */
    public function detail()
    {
        $id = (int) $this->get('id');
        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $coupon = $this->db->find("SELECT * FROM coupons WHERE `id` = ?", [$id]);
        if (!$coupon) {
            $this->error('优惠券不存在', 404);
        }

        // 获取领取统计
        $coupon['claim_count'] = $this->db->count('user_coupons', ['coupon_id' => $id]);

        $this->json(['coupon' => $coupon]);
    }

    /**
     * 优惠券领取记录
     */
    public function claims()
    {
        $id = (int) $this->get('id');
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);

        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $offset = ($page - 1) * $limit;

        $list = $this->db->select(
            "SELECT uc.*, u.username, u.email, u.phone 
             FROM user_coupons uc 
             LEFT JOIN users u ON uc.user_id = u.id 
             WHERE uc.coupon_id = ? 
             ORDER BY uc.claimed_at DESC 
             LIMIT {$limit} OFFSET {$offset}",
            [$id]
        );

        $total = $this->db->count('user_coupons', ['coupon_id' => $id]);

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
}
