<?php
/**
 * 新闻控制器
 */

namespace app\controller;

use app\common\Response;

class News
{
    private $db;

    public function __construct()
    {
        $this->db = \app\common\Database::getInstance();
    }

    /**
     * 新闻列表
     * GET /api/news
     */
    public function index()
    {
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $where = "WHERE status = 1";
        $params = [];

        if (!empty($_GET['category'])) {
            $where .= " AND category = ?";
            $params[] = $_GET['category'];
        }

        $total = $this->db->query("SELECT COUNT(*) as count FROM news $where", $params)[0]['count'];

        $news = $this->db->query(
            "SELECT id, title, slug, cover_image, summary, category, author, views, is_featured, published_at, created_at FROM news $where ORDER BY published_at DESC LIMIT ? OFFSET ?",
            array_merge($params, [$limit, $offset])
        );

        Response::success([
            'data' => $news,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
        ]);
    }

    /**
     * 新闻详情
     * GET /api/news/:slug
     */
    public function detail($slug)
    {
        $news = $this->db->query(
            "SELECT * FROM news WHERE slug = ? AND status = 1",
            [$slug]
        );

        if (empty($news)) {
            // 尝试按ID查找
            $news = $this->db->query("SELECT * FROM news WHERE id = ? AND status = 1", [$slug]);
        }

        if (empty($news)) {
            Response::error('新闻不存在', 404);
        }

        // 增加浏览量
        $this->db->query("UPDATE news SET views = views + 1 WHERE id = ?", [$news[0]['id']]);

        Response::success($news[0]);
    }
}
