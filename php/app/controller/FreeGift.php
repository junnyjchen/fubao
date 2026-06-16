<?php
/**
 * 免费送活动控制器
 */

namespace app\controller;

use app\common\Response;

class FreeGift
{
    private $db;

    public function __construct()
    {
        $this->db = \app\common\Database::getInstance();
    }

    /**
     * 免费送列表
     * GET /api/free-gifts
     */
    public function index()
    {
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $status = $_GET['status'] ?? 'active';

        $where = "WHERE 1=1";
        $params = [];

        if ($status === 'active') {
            $where .= " AND status = 'active' AND end_time > NOW() AND stock > 0";
        } elseif ($status) {
            $where .= " AND status = ?";
            $params[] = $status;
        }

        $total = $this->db->query("SELECT COUNT(*) as count FROM free_gifts $where", $params)[0]['count'];

        $gifts = $this->db->query(
            "SELECT * FROM free_gifts $where ORDER BY created_at DESC LIMIT ? OFFSET ?",
            array_merge($params, [$limit, $offset])
        );

        Response::success([
            'data' => $gifts,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
        ]);
    }

    /**
     * 免费送详情
     * GET /api/free-gifts/:id
     */
    public function detail($id)
    {
        $gift = $this->db->query("SELECT * FROM free_gifts WHERE id = ?", [$id]);

        if (empty($gift)) {
            Response::error('活动不存在', 404);
        }

        Response::success($gift[0]);
    }

    /**
     * 领取免费送
     * POST /api/free-gifts/:id/claim
     */
    public function claim($id)
    {
        $userId = $this->getAuthUserId();
        if (!$userId) {
            Response::error('请先登录', 401);
        }

        $gift = $this->db->query("SELECT * FROM free_gifts WHERE id = ? AND status = 'active'", [$id]);
        if (empty($gift)) {
            Response::error('活动不存在或已结束', 404);
        }

        if ($gift[0]['stock'] <= 0) {
            Response::error('已领完', 400);
        }

        // 检查是否已领取
        $exists = $this->db->query(
            "SELECT id FROM free_gift_claims WHERE gift_id = ? AND user_id = ?",
            [$id, $userId]
        );

        if (!empty($exists)) {
            Response::error('您已领取过', 400);
        }

        $this->db->insert('free_gift_claims', [
            'gift_id' => $id,
            'user_id' => $userId,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        $this->db->query("UPDATE free_gifts SET stock = stock - 1 WHERE id = ? AND stock > 0", [$id]);

        Response::success(null, '领取成功');
    }

    private function getAuthUserId()
    {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $token);

        if (!$token && isset($_COOKIE['auth_token'])) {
            $token = $_COOKIE['auth_token'];
        }

        if (!$token) return null;

        $payload = \app\common\Jwt::verify($token);
        return $payload['user_id'] ?? null;
    }
}
