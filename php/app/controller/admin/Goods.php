<?php
/**
 * 管理员 - 商品管理
 */

namespace app\controller\admin;

use app\Controller;
use app\middleware\AdminAuth;

class Goods extends Controller
{
    public function __construct()
    {
        $this->middleware();
    }
    
    /**
     * 中间件：检查管理员登录
     */
    private function middleware()
    {
        $payload = AdminAuth::check();
        
        if (!$payload) {
            $this->error('請先登錄', 401);
        }
    }
    
    /**
     * 商品列表
     */
    public function index()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $keyword = $this->get('keyword');
        $status = $this->get('status');
        
        $offset = ($page - 1) * $limit;
        
        $where = "1=1";
        $params = [];
        
        if ($keyword) {
            $where .= " AND (`name` LIKE ? OR `description` LIKE ?)";
            $params[] = "%{$keyword}%";
            $params[] = "%{$keyword}%";
        }
        
        if ($status !== null && $status !== '') {
            $where .= " AND `status` = ?";
            $params[] = (int) $status;
        }
        
        $list = $this->db->select(
            "SELECT * FROM `goods` WHERE {$where} ORDER BY `id` DESC LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        
        $total = $this->db->value(
            "SELECT COUNT(*) FROM `goods` WHERE {$where}",
            $params
        );
        
        // 处理图片JSON
        foreach ($list as &$item) {
            if ($item['images']) {
                $item['images'] = json_decode($item['images'], true) ?: [];
            }
        }
        
        $this->json([
            'list' => $list,
            'total' => (int) $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * 创建商品
     */
    public function create()
    {
        $data = [
            'name' => $this->post('name'),
            'category_id' => $this->post('category_id'),
            'merchant_id' => $this->post('merchant_id'),
            'cover' => $this->post('cover'),
            'images' => $this->post('images'),
            'description' => $this->post('description'),
            'price' => $this->post('price'),
            'original_price' => $this->post('original_price'),
            'stock' => $this->post('stock', 0),
            'sales' => $this->post('sales', 0),
            'specs' => $this->post('specs'),
            'tags' => $this->post('tags'),
            'is_featured' => $this->post('is_featured', 0),
            'is_recommended' => $this->post('is_recommended', 0),
            'status' => $this->post('status', 1),
            'sort' => $this->post('sort', 0),
            'created_at' => date('Y-m-d H:i:s'),
        ];
        
        // 处理数组字段
        if (is_array($data['images'])) {
            $data['images'] = json_encode($data['images']);
        }
        if (is_array($data['specs'])) {
            $data['specs'] = json_encode($data['specs']);
        }
        if (is_array($data['tags'])) {
            $data['tags'] = json_encode($data['tags']);
        }
        
        $id = $this->db->insert('goods', $data);
        
        $this->json(['id' => $id], '創建成功');
    }
    
    /**
     * 更新商品
     */
    public function update()
    {
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定商品');
        }
        
        $data = [];
        
        $fields = ['name', 'category_id', 'merchant_id', 'cover', 'images', 'description', 
                   'price', 'original_price', 'stock', 'sales', 'specs', 'tags',
                   'is_featured', 'is_recommended', 'status', 'sort'];
        
        foreach ($fields as $field) {
            if ($this->post($field) !== null) {
                $value = $this->post($field);
                
                // 处理数组字段
                if (in_array($field, ['images', 'specs', 'tags']) && is_array($value)) {
                    $value = json_encode($value);
                }
                
                $data[$field] = $value;
            }
        }
        
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        $this->db->update('goods', $data, '`id` = ?', [$id]);
        
        $this->json([], '更新成功');
    }
    
    /**
     * 删除商品
     */
    public function delete()
    {
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定商品');
        }
        
        $this->db->delete('goods', '`id` = ?', [$id]);
        
        $this->json([], '刪除成功');
    }
    
    /**
     * 商品详情
     */
    public function detail($id)
    {
        $goods = $this->db->find("SELECT * FROM `goods` WHERE `id` = ?", [$id]);
        
        if (!$goods) {
            $this->error('商品不存在', 404);
        }
        
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
}
