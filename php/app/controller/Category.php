<?php
/**
 * 分类控制器
 */

namespace app\controller;

use app\Controller;

class Category extends Controller
{
    /**
     * 分类列表
     */
    public function index()
    {
        $list = $this->db->select(
            "SELECT * FROM `categories` WHERE `status` = 1 ORDER BY `sort` DESC, `id` ASC"
        );
        
        // 转为树形结构
        $tree = $this->buildTree($list);
        
        $this->json(['list' => $tree]);
    }
    
    /**
     * 获取子分类
     */
    public function children($id)
    {
        $list = $this->db->select(
            "SELECT * FROM `categories` WHERE `parent_id` = ? AND `status` = 1 ORDER BY `sort` DESC, `id` ASC",
            [$id]
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 所有分类（扁平，带parent_id）
     */
    public function all()
    {
        $list = $this->db->select(
            "SELECT * FROM `categories` WHERE `status` = 1 ORDER BY `sort` DESC, `id` ASC"
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 构建分类树
     */
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
