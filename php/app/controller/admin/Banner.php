<?php
/**
 * 管理员 - Banner管理
 */

namespace app\controller\admin;

use app\Controller;
use app\middleware\AdminAuth;

class Banner extends Controller
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
     * Banner列表
     */
    public function index()
    {
        $list = $this->db->select(
            "SELECT * FROM `banners` ORDER BY `sort` DESC, `id` ASC"
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 创建Banner
     */
    public function create()
    {
        $data = [
            'title' => $this->post('title'),
            'image' => $this->post('image'),
            'link' => $this->post('link'),
            'type' => $this->post('type', 'image'),
            'sort' => $this->post('sort', 0),
            'status' => $this->post('status', 1),
            'created_at' => date('Y-m-d H:i:s'),
        ];
        
        $id = $this->db->insert('banners', $data);
        
        $this->json(['id' => $id], '創建成功');
    }
    
    /**
     * 更新Banner
     */
    public function update()
    {
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定Banner');
        }
        
        $data = [];
        
        $fields = ['title', 'image', 'link', 'type', 'sort', 'status'];
        
        foreach ($fields as $field) {
            if ($this->post($field) !== null) {
                $data[$field] = $this->post($field);
            }
        }
        
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        $this->db->update('banners', $data, '`id` = ?', [$id]);
        
        $this->json([], '更新成功');
    }
    
    /**
     * 删除Banner
     */
    public function delete()
    {
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定Banner');
        }
        
        $this->db->delete('banners', '`id` = ?', [$id]);
        
        $this->json([], '刪除成功');
    }
}
