<?php
/**
 * 商家中心控制器
 * 处理商家登录、商品管理、订单管理、个人资料
 */

namespace app\controller;

use app\common\Jwt;
use app\common\Response;
use app\common\Validator;

class MerchantCenter
{
    private $db;

    public function __construct()
    {
        $this->db = \app\common\Database::getInstance();
        $this->checkAuth();
    }

    /**
     * 验证商家登录态
     */
    private function checkAuth()
    {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $token);

        if (!$token && isset($_COOKIE['auth_token'])) {
            $token = $_COOKIE['auth_token'];
        }

        if (!$token) {
            Response::error('未登录', 401);
        }

        $payload = Jwt::verify($token);
        if (!$payload) {
            Response::error('登录已过期', 401);
        }

        // 验证是否是商家
        $merchant = $this->db->query(
            "SELECT * FROM merchants WHERE user_id = ? AND status = 'active'",
            [$payload['user_id']]
        );

        if (empty($merchant)) {
            Response::error('非商家用户', 403);
        }

        $this->merchant = $merchant[0];
        $this->merchantId = $merchant[0]['id'];
    }

    /**
     * 商家登录
     * POST /api/merchant/login
     */
    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $rules = [
            'account' => 'required',
            'password' => 'required',
        ];

        $errors = Validator::validate($data, $rules);
        if ($errors) {
            Response::error($errors[0], 400);
        }

        $merchant = $this->db->query(
            "SELECT * FROM merchants WHERE login_account = ? AND status = 'active'",
            [$data['account']]
        );

        if (empty($merchant) || !password_verify($data['password'], $merchant[0]['password'])) {
            Response::error('账号或密码错误', 401);
        }

        $token = Jwt::generate([
            'user_id' => $merchant[0]['user_id'],
            'merchant_id' => $merchant[0]['id'],
            'type' => 'merchant',
        ]);

        Response::success([
            'token' => $token,
            'merchant' => $merchant[0],
        ], '登录成功');
    }

    /**
     * 获取商家资料
     * GET /api/merchant/profile
     */
    public function profile()
    {
        $merchant = $this->db->query(
            "SELECT id, name, logo, description, contact_phone, contact_email, status, created_at FROM merchants WHERE id = ?",
            [$this->merchantId]
        );

        Response::success($merchant[0] ?? null);
    }

    /**
     * 获取商家商品列表
     * GET /api/merchant/goods
     */
    public function goods()
    {
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $status = $_GET['status'] ?? null;

        $where = "WHERE merchant_id = ?";
        $params = [$this->merchantId];

        if ($status !== null) {
            $where .= " AND status = ?";
            $params[] = $status;
        }

        $total = $this->db->query(
            "SELECT COUNT(*) as count FROM goods $where",
            $params
        )[0]['count'];

        $goods = $this->db->query(
            "SELECT * FROM goods $where ORDER BY created_at DESC LIMIT ? OFFSET ?",
            array_merge($params, [$limit, $offset])
        );

        Response::success([
            'data' => $goods,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
        ]);
    }

    /**
     * 创建商品
     * POST /api/merchant/goods
     */
    public function createGoods()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $rules = [
            'name' => 'required|max:200',
            'price' => 'required|numeric',
        ];

        $errors = Validator::validate($data, $rules);
        if ($errors) {
            Response::error($errors[0], 400);
        }

        $id = $this->db->insert('goods', [
            'merchant_id' => $this->merchantId,
            'name' => $data['name'],
            'subtitle' => $data['subtitle'] ?? '',
            'main_image' => $data['main_image'] ?? '',
            'images' => is_array($data['images'] ?? null) ? json_encode($data['images']) : ($data['images'] ?? ''),
            'price' => $data['price'],
            'original_price' => $data['original_price'] ?? $data['price'],
            'stock' => $data['stock'] ?? 0,
            'category_id' => $data['category_id'] ?? null,
            'description' => $data['description'] ?? '',
            'status' => $data['status'] ?? 0,
            'sales' => 0,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        Response::success(['id' => $id], '商品创建成功');
    }

    /**
     * 更新商品
     * PUT /api/merchant/goods/:id
     */
    public function updateGoods($id)
    {
        // 验证商品归属
        $goods = $this->db->query("SELECT * FROM goods WHERE id = ? AND merchant_id = ?", [$id, $this->merchantId]);
        if (empty($goods)) {
            Response::error('商品不存在或无权操作', 404);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $updateData = [];
        $allowFields = ['name', 'subtitle', 'main_image', 'images', 'price', 'original_price', 'stock', 'category_id', 'description', 'status'];

        foreach ($allowFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $field === 'images' && is_array($data[$field])
                    ? json_encode($data[$field])
                    : $data[$field];
            }
        }

        if (!empty($updateData)) {
            $updateData['updated_at'] = date('Y-m-d H:i:s');
            $this->db->update('goods', $updateData, ['id' => $id, 'merchant_id' => $this->merchantId]);
        }

        Response::success(null, '更新成功');
    }

    /**
     * 删除商品
     * DELETE /api/merchant/goods/:id
     */
    public function deleteGoods($id)
    {
        $goods = $this->db->query("SELECT * FROM goods WHERE id = ? AND merchant_id = ?", [$id, $this->merchantId]);
        if (empty($goods)) {
            Response::error('商品不存在或无权操作', 404);
        }

        $this->db->delete('goods', ['id' => $id, 'merchant_id' => $this->merchantId]);
        Response::success(null, '删除成功');
    }

    /**
     * 获取商家订单列表
     * GET /api/merchant/orders
     */
    public function orders()
    {
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $status = $_GET['status'] ?? null;

        $where = "WHERE merchant_id = ?";
        $params = [$this->merchantId];

        if ($status !== null) {
            $where .= " AND status = ?";
            $params[] = $status;
        }

        $total = $this->db->query(
            "SELECT COUNT(*) as count FROM orders $where",
            $params
        )[0]['count'];

        $orders = $this->db->query(
            "SELECT * FROM orders $where ORDER BY created_at DESC LIMIT ? OFFSET ?",
            array_merge($params, [$limit, $offset])
        );

        Response::success([
            'data' => $orders,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * 发货
     * POST /api/merchant/orders/ship
     */
    public function shipOrder()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['order_id']) || empty($data['tracking_number'])) {
            Response::error('缺少必要参数', 400);
        }

        $order = $this->db->query(
            "SELECT * FROM orders WHERE id = ? AND merchant_id = ?",
            [$data['order_id'], $this->merchantId]
        );

        if (empty($order)) {
            Response::error('订单不存在', 404);
        }

        if ($order[0]['status'] !== 'paid') {
            Response::error('订单状态不允许发货', 400);
        }

        $this->db->update('orders', [
            'status' => 'shipped',
            'tracking_number' => $data['tracking_number'],
            'shipping_company' => $data['shipping_company'] ?? '',
            'shipped_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ], ['id' => $data['order_id'], 'merchant_id' => $this->merchantId]);

        Response::success(null, '发货成功');
    }
}
