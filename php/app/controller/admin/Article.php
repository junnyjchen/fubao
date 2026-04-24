<?php
/**
 * 文章管理 - 管理员
 */

namespace app\controller\admin;

use app\Controller;

class Article extends Controller
{
    /**
     * 文章列表
     */
    public function index()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $status = $this->get('status');
        $categoryId = $this->get('category_id');
        $keyword = $this->get('keyword');

        $where = [];
        if ($status !== null && $status !== '') {
            $where[] = "`status` = {$status}";
        }
        if ($categoryId) {
            $where[] = "`category_id` = {$categoryId}";
        }
        if ($keyword) {
            $keyword = addslashes($keyword);
            $where[] = "(`title` LIKE '%{$keyword}%' OR `summary` LIKE '%{$keyword}%')";
        }

        $whereStr = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $limit;

        // 查询列表
        $list = $this->db->select(
            "SELECT * FROM articles {$whereStr} ORDER BY `id` DESC LIMIT {$limit} OFFSET {$offset}"
        );

        // 统计总数
        $total = $this->db->count('articles', $whereStr ? $where : null);

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
     * 创建文章
     */
    public function create()
    {
        $title = $this->post('title');
        $summary = $this->post('summary');
        $content = $this->post('content');
        $coverImage = $this->post('cover_image');
        $categoryId = (int) $this->post('category_id', 0);
        $author = $this->post('author', '管理员');
        $status = (int) $this->post('status', 1);
        $isFeatured = (int) $this->post('is_featured', 0);
        $tags = $this->post('tags', '');

        if (empty($title)) {
            $this->error('标题不能为空', 400);
        }

        $id = $this->db->insert('articles', [
            'title' => $title,
            'summary' => $summary,
            'content' => $content,
            'cover_image' => $coverImage,
            'category_id' => $categoryId,
            'author' => $author,
            'status' => $status,
            'is_featured' => $isFeatured,
            'tags' => $tags,
            'views' => 0,
            'likes' => 0,
            'published_at' => $status ? date('Y-m-d H:i:s') : null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        if (!$id) {
            $this->error('创建失败');
        }

        $this->json(['id' => $id], '创建成功');
    }

    /**
     * 更新文章
     */
    public function update()
    {
        $id = (int) $this->post('id');
        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        // 检查是否存在
        $article = $this->db->find("SELECT * FROM articles WHERE `id` = ?", [$id]);
        if (!$article) {
            $this->error('文章不存在', 404);
        }

        $data = [
            'title' => $this->post('title', $article['title']),
            'summary' => $this->post('summary', $article['summary']),
            'content' => $this->post('content', $article['content']),
            'cover_image' => $this->post('cover_image', $article['cover_image']),
            'category_id' => (int) $this->post('category_id', $article['category_id']),
            'author' => $this->post('author', $article['author']),
            'status' => (int) $this->post('status', $article['status']),
            'is_featured' => (int) $this->post('is_featured', $article['is_featured']),
            'tags' => $this->post('tags', $article['tags']),
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        // 如果状态从草稿改为发布
        if ($article['status'] == 0 && $data['status'] == 1 && !$article['published_at']) {
            $data['published_at'] = date('Y-m-d H:i:s');
        }

        $this->db->update('articles', $data, '`id` = ?', [$id]);

        $this->json(['id' => $id], '更新成功');
    }

    /**
     * 删除文章
     */
    public function delete()
    {
        $id = (int) $this->post('id');
        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $article = $this->db->find("SELECT * FROM articles WHERE `id` = ?", [$id]);
        if (!$article) {
            $this->error('文章不存在', 404);
        }

        // 软删除
        $this->db->update('articles', [
            'status' => -1,
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ?', [$id]);

        $this->json(['id' => $id], '删除成功');
    }

    /**
     * 文章详情
     */
    public function detail()
    {
        $id = (int) $this->get('id');
        if (!$id) {
            $this->error('ID不能为空', 400);
        }

        $article = $this->db->find("SELECT * FROM articles WHERE `id` = ?", [$id]);
        if (!$article) {
            $this->error('文章不存在', 404);
        }

        $this->json(['article' => $article]);
    }

    /**
     * 批量操作
     */
    public function batch()
    {
        $ids = $this->post('ids', []);
        $action = $this->post('action');

        if (empty($ids)) {
            $this->error('请选择文章', 400);
        }

        $idsStr = implode(',', array_map('intval', $ids));

        switch ($action) {
            case 'publish':
                $this->db->query(
                    "UPDATE articles SET `status` = 1, `published_at` = COALESCE(`published_at`, NOW()), `updated_at` = NOW() WHERE `id` IN ({$idsStr})"
                );
                $this->json(null, '批量发布成功');
                break;

            case 'unpublish':
                $this->db->query(
                    "UPDATE articles SET `status` = 0, `updated_at` = NOW() WHERE `id` IN ({$idsStr})"
                );
                $this->json(null, '批量取消发布成功');
                break;

            case 'delete':
                $this->db->query(
                    "UPDATE articles SET `status` = -1, `updated_at` = NOW() WHERE `id` IN ({$idsStr})"
                );
                $this->json(null, '批量删除成功');
                break;

            case 'featured':
                $this->db->query(
                    "UPDATE articles SET `is_featured` = 1, `updated_at` = NOW() WHERE `id` IN ({$idsStr})"
                );
                $this->json(null, '批量设置精选成功');
                break;

            default:
                $this->error('未知操作', 400);
        }
    }
}
