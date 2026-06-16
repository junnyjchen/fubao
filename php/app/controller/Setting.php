<?php
/**
 * 系统设置控制器
 */

namespace app\controller;

use app\common\Response;

class Setting
{
    private $db;

    public function __construct()
    {
        $this->db = \app\common\Database::getInstance();
    }

    /**
     * 获取设置（公开）
     * GET /api/settings
     */
    public function index()
    {
        $settings = $this->db->query("SELECT * FROM settings ORDER BY sort ASC");

        $grouped = [];
        foreach ($settings as $row) {
            $grouped[$row['key']] = $row['value'];
        }

        Response::success($grouped);
    }

    /**
     * 保存设置（管理员）
     * PUT /api/admin/settings
     */
    public function save()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data) || !is_array($data)) {
            Response::error('无效数据', 400);
        }

        foreach ($data as $key => $value) {
            $exists = $this->db->query("SELECT id FROM settings WHERE `key` = ?", [$key]);
            if (!empty($exists)) {
                $this->db->update('settings', ['value' => $value, 'updated_at' => date('Y-m-d H:i:s')], ['key' => $key]);
            } else {
                $this->db->insert('settings', [
                    'key' => $key,
                    'value' => is_array($value) ? json_encode($value) : $value,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            }
        }

        Response::success(null, '设置保存成功');
    }
}
