<?php
/**
 * 商品多语言控制器
 */

namespace app\controller;

use app\common\Response;

class GoodsI18n
{
    private $db;

    public function __construct()
    {
        $this->db = \app\common\Database::getInstance();
    }

    /**
     * 查询商品翻译
     * GET /api/goods/i18n?goods_id=1&locale=en
     */
    public function index()
    {
        $goodsId = $_GET['goods_id'] ?? null;
        $locale = $_GET['locale'] ?? null;

        if (!$goodsId || !$locale) {
            Response::error('缺少goods_id或locale参数', 400);
        }

        $translation = $this->db->query(
            "SELECT * FROM goods_i18n WHERE goods_id = ? AND locale = ?",
            [$goodsId, $locale]
        );

        Response::success($translation[0] ?? null);
    }

    /**
     * 创建翻译
     * POST /api/goods/i18n
     */
    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['goods_id']) || empty($data['locale'])) {
            Response::error('缺少必要参数', 400);
        }

        $id = $this->db->insert('goods_i18n', [
            'goods_id' => $data['goods_id'],
            'locale' => $data['locale'],
            'name' => $data['name'] ?? '',
            'subtitle' => $data['subtitle'] ?? '',
            'description' => $data['description'] ?? '',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        Response::success(['id' => $id], '翻译创建成功');
    }

    /**
     * 更新翻译
     * PUT /api/goods/i18n/:id
     */
    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $allowFields = ['name', 'subtitle', 'description'];

        $updateData = [];
        foreach ($allowFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (!empty($updateData)) {
            $updateData['updated_at'] = date('Y-m-d H:i:s');
            $this->db->update('goods_i18n', $updateData, ['id' => $id]);
        }

        Response::success(null, '更新成功');
    }

    /**
     * 删除翻译
     * DELETE /api/goods/i18n/:id
     */
    public function delete($id)
    {
        $this->db->delete('goods_i18n', ['id' => $id]);
        Response::success(null, '删除成功');
    }
}
