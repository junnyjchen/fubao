<?php
/**
 * 文章控制器
 */

namespace app\controller;

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
        $categoryId = $this->get('category_id');
        $keyword = $this->get('keyword');
        $status = $this->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $where = "1=1";
        $params = [];
        
        if ($categoryId) {
            $where .= " AND `category_id` = ?";
            $params[] = $categoryId;
        }
        
        if ($keyword) {
            $where .= " AND (`title` LIKE ? OR `excerpt` LIKE ?)";
            $params[] = "%{$keyword}%";
            $params[] = "%{$keyword}%";
        }
        
        if ($status !== null && $status !== '') {
            $where .= " AND `status` = ?";
            $params[] = (int) $status;
        }
        
        $list = $this->db->select(
            "SELECT * FROM `articles` WHERE {$where} ORDER BY `created_at` DESC LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        
        $total = $this->db->value(
            "SELECT COUNT(*) FROM `articles` WHERE {$where}",
            $params
        );
        
        $this->json([
            'list' => $list,
            'total' => (int) $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * 文章详情
     */
    public function detail($id)
    {
        $article = $this->db->find(
            "SELECT * FROM `articles` WHERE `id` = ?",
            [$id]
        );
        
        if (!$article) {
            $this->error('文章不存在', 404);
        }
        
        // 增加浏览量
        $this->db->query(
            "UPDATE `articles` SET `views` = `views` + 1 WHERE `id` = ?",
            [$id]
        );
        
        $this->json(['article' => $article]);
    }
    
    /**
     * 创建文章
     */
    public function create()
    {
        $this->verifyAdmin();
        
        $title = $this->post('title');
        $content = $this->post('content');
        
        if (empty($title) || empty($content)) {
            $this->error('標題和內容不能為空');
        }
        
        $data = [
            'title' => $title,
            'category_id' => $this->post('category_id') ?: null,
            'cover' => $this->post('cover'),
            'excerpt' => $this->post('excerpt'),
            'content' => $content,
            'author' => $this->post('author'),
            'source' => $this->post('source'),
            'status' => $this->post('status', 1),
            'is_featured' => $this->post('is_featured', 0),
            'published_at' => $this->post('published_at') ?: date('Y-m-d H:i:s'),
            'created_at' => date('Y-m-d H:i:s'),
        ];
        
        $id = $this->db->insert('articles', $data);
        
        $this->json(['id' => $id], '創建成功');
    }
    
    /**
     * 更新文章
     */
    public function update()
    {
        $this->verifyAdmin();
        
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定文章');
        }
        
        $article = $this->db->find("SELECT * FROM `articles` WHERE `id` = ?", [$id]);
        
        if (!$article) {
            $this->error('文章不存在', 404);
        }
        
        $data = [];
        
        $fields = ['title', 'category_id', 'cover', 'excerpt', 'content', 'author', 'source', 'status', 'is_featured', 'published_at'];
        
        foreach ($fields as $field) {
            if ($this->post($field) !== null) {
                $data[$field] = $this->post($field);
            }
        }
        
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        $this->db->update('articles', $data, '`id` = ?', [$id]);
        
        $this->json([], '更新成功');
    }
    
    /**
     * 删除文章
     */
    public function delete()
    {
        $this->verifyAdmin();
        
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定文章');
        }
        
        $this->db->delete('articles', '`id` = ?', [$id]);
        
        $this->json([], '刪除成功');
    }
    
    /**
     * 点赞文章
     */
    public function like($id)
    {
        $article = $this->db->find("SELECT * FROM `articles` WHERE `id` = ?", [$id]);
        
        if (!$article) {
            $this->error('文章不存在', 404);
        }
        
        $this->db->query(
            "UPDATE `articles` SET `likes` = `likes` + 1 WHERE `id` = ?",
            [$id]
        );
        
        $this->json([], '點贊成功');
    }
}
