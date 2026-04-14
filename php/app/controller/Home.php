<?php
/**
 * 首页控制器
 */

namespace app\controller;

use app\Controller;

class Home extends Controller
{
    /**
     * 首页数据
     */
    public function index()
    {
        // 精选商品
        $featured = $this->db->select(
            "SELECT `id`, `name`, `cover`, `price`, `original_price`, `sales` 
             FROM `goods` 
             WHERE `status` = 1 AND `is_featured` = 1 
             ORDER BY `sort` DESC, `created_at` DESC 
             LIMIT 10"
        );
        
        // 推荐商品
        $recommended = $this->db->select(
            "SELECT `id`, `name`, `cover`, `price`, `original_price`, `sales` 
             FROM `goods` 
             WHERE `status` = 1 AND `is_recommended` = 1 
             ORDER BY `sort` DESC, `created_at` DESC 
             LIMIT 10"
        );
        
        // 热销商品
        $hot = $this->db->select(
            "SELECT `id`, `name`, `cover`, `price`, `original_price`, `sales` 
             FROM `goods` 
             WHERE `status` = 1 
             ORDER BY `sales` DESC, `views` DESC 
             LIMIT 10"
        );
        
        // 最新商品
        $new = $this->db->select(
            "SELECT `id`, `name`, `cover`, `price`, `original_price`, `sales` 
             FROM `goods` 
             WHERE `status` = 1 
             ORDER BY `created_at` DESC 
             LIMIT 10"
        );
        
        // 分类
        $categories = $this->db->select(
            "SELECT `id`, `name`, `icon`, `cover` 
             FROM `categories` 
             WHERE `status` = 1 AND `parent_id` = 0 
             ORDER BY `sort` DESC, `id` ASC 
             LIMIT 8"
        );
        
        // 文章
        $articles = $this->db->select(
            "SELECT `id`, `title`, `cover`, `excerpt`, `views`, `created_at` 
             FROM `articles` 
             WHERE `status` = 1 
             ORDER BY `created_at` DESC 
             LIMIT 5"
        );
        
        // Banner
        $banners = $this->db->select(
            "SELECT `id`, `title`, `image`, `link`, `type` 
             FROM `banners` 
             WHERE `status` = 1 
             ORDER BY `sort` DESC, `id` ASC"
        );
        
        $this->json([
            'featured' => $featured,
            'recommended' => $recommended,
            'hot' => $hot,
            'new' => $new,
            'categories' => $categories,
            'articles' => $articles,
            'banners' => $banners,
        ]);
    }
    
    /**
     * Banner列表
     */
    public function banners()
    {
        $list = $this->db->select(
            "SELECT * FROM `banners` WHERE `status` = 1 ORDER BY `sort` DESC, `id` ASC"
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 文章列表
     */
    public function articles()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 10);
        $categoryId = $this->get('category_id');
        
        $offset = ($page - 1) * $limit;
        
        $where = "`status` = 1";
        $params = [];
        
        if ($categoryId) {
            $where .= " AND `category_id` = ?";
            $params[] = $categoryId;
        }
        
        $list = $this->db->select(
            "SELECT `id`, `title`, `cover`, `excerpt`, `views`, `created_at` 
             FROM `articles` 
             WHERE {$where}
             ORDER BY `created_at` DESC 
             LIMIT {$limit} OFFSET {$offset}",
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
    public function article($id)
    {
        $article = $this->db->find(
            "SELECT * FROM `articles` WHERE `id` = ? AND `status` = 1",
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
        
        // 处理内容中的图片
        $article['content'] = htmlspecialchars_decode($article['content']);
        
        $this->json(['article' => $article]);
    }
}
