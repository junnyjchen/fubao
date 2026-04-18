<?php
/**
 * 管理员 - 分类管理
 */

namespace app\controller\admin;

use app\Controller;
use app\middleware\AdminAuth;

class Category extends Controller
{
    public function __construct()
    {
        $this->middleware();
    }
    
    private function middleware()
    {
        $payload = AdminAuth::check();
        
        if (!$payload) {
            $this->error('請先登錄', 401);
        }
    }
    
    /**
     * 分类列表
     */
    public function index()
    {
        $list = $this->db->select(
            "SELECT * FROM `categories` ORDER BY `sort` DESC, `id` ASC"
        );
        
        // 转为树形
        $tree = $this->buildTree($list);
        
        $this->json(['list' => $tree]);
    }
    
    /**
     * 创建分类
     */
    public function create()
    {
        $data = [
            'name' => $this->post('name'),
            'parent_id' => $this->post('parent_id', 0),
            'icon' => $this->post('icon'),
            'cover' => $this->post('cover'),
            'description' => $this->post('description'),
            'sort' => $this->post('sort', 0),
            'status' => $this->post('status', 1),
            'created_at' => date('Y-m-d H:i:s'),
        ];
        
        $id = $this->db->insert('categories', $data);
        
        $this->json(['id' => $id], '創建成功');
    }
    
    /**
     * 更新分类
     */
    public function update()
    {
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定分類');
        }
        
        $data = [];
        
        $fields = ['name', 'parent_id', 'icon', 'cover', 'description', 'sort', 'status'];
        
        foreach ($fields as $field) {
            if ($this->post($field) !== null) {
                $data[$field] = $this->post($field);
            }
        }
        
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        $this->db->update('categories', $data, '`id` = ?', [$id]);
        
        $this->json([], '更新成功');
    }
    
    /**
     * 删除分类
     */
    public function delete()
    {
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定分類');
        }
        
        // 检查是否有子分类
        $children = $this->db->count('categories', '`parent_id` = ?', [$id]);
        
        if ($children > 0) {
            $this->error('請先刪除子分類');
        }
        
        // 检查是否有商品
        $goods = $this->db->count('goods', '`category_id` = ?', [$id]);
        
        if ($goods > 0) {
            $this->error('該分類下有商品，無法刪除');
        }
        
        $this->db->delete('categories', '`id` = ?', [$id]);
        
        $this->json([], '刪除成功');
    }
    
    private function buildTree($list, $parentId = 0)
    {
        $tree = [];
        
        foreach ($list as $item) {
            if ($item['parent_id'] == $parentId) {
                $children = $this->buildTree($list, $item['id']);
                
                if (!empty($children)) {
                    $item['children'] = $children;
                }
                
                $tree[] = $item;
            }
        }
        
        return $tree;
    }
}
