<?php
/**
 * 商品控制器
 */

namespace app\controller;

use app\Controller;

class Goods extends Controller
{
    /**
     * 商品列表
     */
    public function index()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $categoryId = $this->get('category_id');
        $keyword = $this->get('keyword');
        $sort = $this->get('sort', 'created_at');
        $order = $this->get('order', 'desc');
        
        $offset = ($page - 1) * $limit;
        
        // 构建查询
        $where = "`g`.`status` = 1";
        $params = [];
        
        if ($categoryId) {
            $where .= " AND `g`.`category_id` = ?";
            $params[] = $categoryId;
        }
        
        if ($keyword) {
            $where .= " AND (`g`.`name` LIKE ? OR `g`.`description` LIKE ?)";
            $params[] = "%{$keyword}%";
            $params[] = "%{$keyword}%";
        }
        
        // 排序
        $allowedSorts = ['created_at', 'price', 'sales', 'views', 'rating'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'created_at';
        $order = strtolower($order) === 'asc' ? 'ASC' : 'DESC';
        
        // 查询商品
        $sql = "SELECT 
                    `g`.*,
                    `c`.`name` as `category_name`
                FROM `goods` `g`
                LEFT JOIN `categories` `c` ON `g`.`category_id` = `c`.`id`
                WHERE {$where}
                ORDER BY `g`.`{$sort}` {$order}
                LIMIT {$limit} OFFSET {$offset}";
        
        $list = $this->db->select($sql, $params);
        
        // 处理图片JSON
        foreach ($list as &$item) {
            if ($item['images']) {
                $item['images'] = json_decode($item['images'], true) ?: [];
            }
            if ($item['specs']) {
                $item['specs'] = json_decode($item['specs'], true) ?: [];
            }
            if ($item['tags']) {
                $item['tags'] = json_decode($item['tags'], true) ?: [];
            }
        }
        
        // 统计总数
        $countSql = "SELECT COUNT(*) FROM `goods` `g` WHERE {$where}";
        $total = $this->db->value($countSql, $params);
        
        $this->json([
            'list' => $list,
            'total' => (int) $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * 获取商品详情
     */
    public function detail($id)
    {
        $sql = "SELECT 
                    `g`.*,
                    `c`.`name` as `category_name`,
                    `m`.`name` as `merchant_name`,
                    `m`.`logo` as `merchant_logo`
                FROM `goods` `g`
                LEFT JOIN `categories` `c` ON `g`.`category_id` = `c`.`id`
                LEFT JOIN `merchants` `m` ON `g`.`merchant_id` = `m`.`id`
                WHERE `g`.`id` = ? AND `g`.`status` = 1";
        
        $goods = $this->db->find($sql, [$id]);
        
        if (!$goods) {
            $this->error('商品不存在', 404);
        }
        
        // 增加浏览量
        $this->db->query(
            "UPDATE `goods` SET `views` = `views` + 1 WHERE `id` = ?",
            [$id]
        );
        
        // 处理图片JSON
        if ($goods['images']) {
            $goods['images'] = json_decode($goods['images'], true) ?: [];
        }
        if ($goods['specs']) {
            $goods['specs'] = json_decode($goods['specs'], true) ?: [];
        }
        if ($goods['tags']) {
            $goods['tags'] = json_decode($goods['tags'], true) ?: [];
        }
        
        $this->json(['goods' => $goods]);
    }
    
    /**
     * 精选商品
     */
    public function featured()
    {
        $limit = (int) $this->get('limit', 10);
        
        $list = $this->db->select(
            "SELECT * FROM `goods` WHERE `status` = 1 AND `is_featured` = 1 ORDER BY `sort` DESC, `created_at` DESC LIMIT {$limit}"
        );
        
        foreach ($list as &$item) {
            if ($item['images']) {
                $item['images'] = json_decode($item['images'], true) ?: [];
            }
        }
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 推荐商品
     */
    public function recommended()
    {
        $limit = (int) $this->get('limit', 10);
        
        $list = $this->db->select(
            "SELECT * FROM `goods` WHERE `status` = 1 AND `is_recommended` = 1 ORDER BY `sort` DESC, `created_at` DESC LIMIT {$limit}"
        );
        
        foreach ($list as &$item) {
            if ($item['images']) {
                $item['images'] = json_decode($item['images'], true) ?: [];
            }
        }
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 热销商品
     */
    public function hot()
    {
        $limit = (int) $this->get('limit', 10);
        
        $list = $this->db->select(
            "SELECT * FROM `goods` WHERE `status` = 1 ORDER BY `sales` DESC, `views` DESC LIMIT {$limit}"
        );
        
        foreach ($list as &$item) {
            if ($item['images']) {
                $item['images'] = json_decode($item['images'], true) ?: [];
            }
        }
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 分类商品
     */
    public function byCategory($categoryId)
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $offset = ($page - 1) * $limit;
        
        $list = $this->db->select(
            "SELECT * FROM `goods` WHERE `status` = 1 AND `category_id` = ? ORDER BY `sort` DESC, `created_at` DESC LIMIT {$limit} OFFSET {$offset}",
            [$categoryId]
        );
        
        $total = $this->db->count('goods', "`status` = 1 AND `category_id` = ?", [$categoryId]);
        
        $this->json([
            'list' => $list,
            'total' => (int) $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
}
