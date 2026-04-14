<?php
/**
 * 地址控制器
 */

namespace app\controller;

use app\Controller;
use app\common\Jwt;

class Address extends Controller
{
    /**
     * 地址列表
     */
    public function index()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $list = $this->db->select(
            "SELECT * FROM `addresses` WHERE `user_id` = ? ORDER BY `is_default` DESC, `created_at` DESC",
            [$userId]
        );
        
        $this->json(['list' => $list]);
    }
    
    /**
     * 地址详情
     */
    public function detail($id)
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $address = $this->db->find(
            "SELECT * FROM `addresses` WHERE `id` = ? AND `user_id` = ?",
            [$id, $userId]
        );
        
        if (!$address) {
            $this->error('地址不存在', 404);
        }
        
        $this->json(['address' => $address]);
    }
    
    /**
     * 创建地址
     */
    public function create()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $name = $this->post('name');
        $phone = $this->post('phone');
        $province = $this->post('province');
        $city = $this->post('city');
        $district = $this->post('district');
        $address = $this->post('address');
        $isDefault = $this->post('is_default', 0);
        
        if (empty($name) || empty($phone) || empty($province) || empty($city) || empty($address)) {
            $this->error('請填寫完整資訊');
        }
        
        // 如果设为默认，先取消其他默认
        if ($isDefault) {
            $this->db->update('addresses', [
                'is_default' => 0,
                'updated_at' => date('Y-m-d H:i:s'),
            ], '`user_id` = ?', [$userId]);
        }
        
        $id = $this->db->insert('addresses', [
            'user_id' => $userId,
            'name' => $name,
            'phone' => $phone,
            'province' => $province,
            'city' => $city,
            'district' => $district,
            'address' => $address,
            'is_default' => $isDefault ? 1 : 0,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        
        $this->json(['id' => $id], '創建成功');
    }
    
    /**
     * 更新地址
     */
    public function update()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定地址');
        }
        
        // 检查地址归属
        $address = $this->db->find(
            "SELECT * FROM `addresses` WHERE `id` = ? AND `user_id` = ?",
            [$id, $userId]
        );
        
        if (!$address) {
            $this->error('地址不存在', 404);
        }
        
        $data = [];
        
        if ($name = $this->post('name')) $data['name'] = $name;
        if ($phone = $this->post('phone')) $data['phone'] = $phone;
        if ($province = $this->post('province')) $data['province'] = $province;
        if ($city = $this->post('city')) $data['city'] = $city;
        if ($district = $this->post('district')) $data['district'] = $district;
        if ($addr = $this->post('address')) $data['address'] = $addr;
        
        if ($isDefault = $this->post('is_default')) {
            // 如果设为默认，先取消其他默认
            $this->db->update('addresses', [
                'is_default' => 0,
                'updated_at' => date('Y-m-d H:i:s'),
            ], '`user_id` = ?', [$userId]);
        }
        
        $data['is_default'] = $isDefault ? 1 : 0;
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        $this->db->update('addresses', $data, '`id` = ?', [$id]);
        
        $this->json([], '更新成功');
    }
    
    /**
     * 删除地址
     */
    public function delete()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定要刪除的地址');
        }
        
        $address = $this->db->find(
            "SELECT * FROM `addresses` WHERE `id` = ? AND `user_id` = ?",
            [$id, $userId]
        );
        
        if (!$address) {
            $this->error('地址不存在', 404);
        }
        
        $this->db->delete('addresses', '`id` = ?', [$id]);
        
        // 如果删除的是默认地址，设为其他地址为默认
        if ($address['is_default']) {
            $first = $this->db->find(
                "SELECT id FROM `addresses` WHERE `user_id` = ? ORDER BY id ASC LIMIT 1",
                [$userId]
            );
            
            if ($first) {
                $this->db->update('addresses', [
                    'is_default' => 1,
                    'updated_at' => date('Y-m-d H:i:s'),
                ], '`id` = ?', [$first['id']]);
            }
        }
        
        $this->json([], '刪除成功');
    }
    
    /**
     * 设为默认地址
     */
    public function setDefault()
    {
        $userId = Jwt::verify();
        
        if (!$userId) {
            $this->error('請先登錄', 401);
        }
        
        $id = (int) $this->post('id');
        
        if (!$id) {
            $this->error('請指定地址');
        }
        
        // 取消其他默认
        $this->db->update('addresses', [
            'is_default' => 0,
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`user_id` = ?', [$userId]);
        
        // 设为默认
        $this->db->update('addresses', [
            'is_default' => 1,
            'updated_at' => date('Y-m-d H:i:s'),
        ], '`id` = ? AND `user_id` = ?', [$id, $userId]);
        
        $this->json([], '設置成功');
    }
}
