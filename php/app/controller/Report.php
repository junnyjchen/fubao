<?php
namespace app\controller;

use app\common\Jwt;

/**
 * 举报管理
 */
class Report extends Controller
{
    protected $userId;
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = $this->connectDB();
    }

    /**
     * 提交举报
     */
    public function submit()
    {
        $this->userId = $this->verifyUser();

        $type = $this->post('type'); // goods, merchant, user, article
        $targetId = (int) $this->post('target_id');
        $reason = $this->post('reason'); // spam, counterfeit, fraud, infringement, illegal, other
        $description = trim($this->post('description'));
        $evidence = $this->post('evidence'); // 证据图片

        if (!$type) {
            $this->error('请选择举报类型');
        }

        if (!$targetId) {
            $this->error('缺少被举报对象ID');
        }

        if (!$reason) {
            $this->error('请选择举报原因');
        }

        if (empty($description)) {
            $this->error('请描述举报详情');
        }

        if (strlen($description) < 10) {
            $this->error('举报详情至少10个字');
        }

        // Check if target exists
        $targetExists = false;
        switch ($type) {
            case 'goods':
                $targetExists = $this->db->find("SELECT id FROM goods WHERE id = ?", [$targetId]);
                break;
            case 'merchant':
                $targetExists = $this->db->find("SELECT id FROM merchants WHERE id = ?", [$targetId]);
                break;
            case 'user':
                $targetExists = $this->db->find("SELECT id FROM users WHERE id = ?", [$targetId]);
                break;
            case 'article':
                $targetExists = $this->db->find("SELECT id FROM articles WHERE id = ?", [$targetId]);
                break;
        }

        if (!$targetExists) {
            $this->error('被举报对象不存在');
        }

        // Check duplicate report
        $duplicate = $this->db->find(
            "SELECT id FROM reports WHERE user_id = ? AND type = ? AND target_id = ? AND status = 'pending'",
            [$this->userId, $type, $targetId]
        );

        if ($duplicate) {
            $this->error('您已举报过该内容，请等待处理结果');
        }

        $data = [
            'user_id' => $this->userId,
            'type' => $type,
            'target_id' => $targetId,
            'reason' => $reason,
            'description' => $description,
            'evidence' => $evidence ? json_encode($evidence) : null,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $id = $this->db->insert('reports', $data);

        $this->json(['id' => $id], '举报已提交，我们会尽快处理');
    }

    /**
     * 获取我的举报列表
     */
    public function index()
    {
        $this->userId = $this->verifyUser();

        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $status = $this->get('status');

        $where = 'user_id = ?';
        $params = [$this->userId];

        if ($status) {
            $where .= ' AND status = ?';
            $params[] = $status;
        }

        $total = $this->db->count('reports', $where, $params);

        $offset = ($page - 1) * $limit;
        $sql = "SELECT * FROM reports WHERE {$where} ORDER BY created_at DESC LIMIT {$offset}, {$limit}";
        $list = $this->db->select($sql, $params);

        // Parse evidence
        foreach ($list as &$item) {
            if ($item['evidence']) {
                $item['evidence'] = json_decode($item['evidence'], true);
            }
            // Get target info
            $item['target_info'] = $this->getTargetInfo($item['type'], $item['target_id']);
        }

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * 举报详情
     */
    public function detail()
    {
        $this->userId = $this->verifyUser();

        $id = (int) $this->get('id');

        if (!$id) {
            $this->error('缺少举报ID');
        }

        $report = $this->db->find(
            "SELECT * FROM reports WHERE id = ? AND user_id = ?",
            [$id, $this->userId]
        );

        if (!$report) {
            $this->error('举报不存在');
        }

        if ($report['evidence']) {
            $report['evidence'] = json_decode($report['evidence'], true);
        }

        // Get target info
        $report['target_info'] = $this->getTargetInfo($report['type'], $report['target_id']);

        // Get admin response
        $responses = $this->db->select(
            "SELECT * FROM report_responses WHERE report_id = ? ORDER BY created_at ASC",
            [$id]
        );

        $report['responses'] = $responses;

        $this->json(['report' => $report]);
    }

    /**
     * 撤回举报
     */
    public function cancel()
    {
        $this->userId = $this->verifyUser();

        $id = (int) $this->post('id');

        if (!$id) {
            $this->error('缺少举报ID');
        }

        $report = $this->db->find(
            "SELECT * FROM reports WHERE id = ? AND user_id = ?",
            [$id, $this->userId]
        );

        if (!$report) {
            $this->error('举报不存在');
        }

        if ($report['status'] !== 'pending') {
            $this->error('该举报已在处理中，无法撤回');
        }

        $this->db->delete('reports', 'id = ?', [$id]);

        $this->json([], '举报已撤回');
    }

    /**
     * 获取举报类型列表
     */
    public function types()
    {
        $types = [
            [
                'id' => 'goods',
                'name' => '商品举报',
                'icon' => '📦',
                'reasons' => [
                    ['id' => 'counterfeit', 'name' => '假冒商品'],
                    ['id' => 'illegal', 'name' => '违禁品'],
                    ['id' => 'fraud', 'name' => '虚假宣传'],
                    ['id' => 'infringement', 'name' => '侵权商品'],
                    ['id' => 'other', 'name' => '其他问题'],
                ],
            ],
            [
                'id' => 'merchant',
                'name' => '商家举报',
                'icon' => '🏪',
                'reasons' => [
                    ['id' => 'fraud', 'name' => '欺诈行为'],
                    ['id' => 'illegal', 'name' => '非法经营'],
                    ['id' => 'infringement', 'name' => '侵权行为'],
                    ['id' => 'poor_service', 'name' => '服务态度差'],
                    ['id' => 'other', 'name' => '其他问题'],
                ],
            ],
            [
                'id' => 'user',
                'name' => '用户举报',
                'icon' => '👤',
                'reasons' => [
                    ['id' => 'spam', 'name' => '垃圾信息'],
                    ['id' => 'harassment', 'name' => '骚扰行为'],
                    ['id' => 'fraud', 'name' => '欺诈行为'],
                    ['id' => 'illegal', 'name' => '违法行为'],
                    ['id' => 'other', 'name' => '其他问题'],
                ],
            ],
            [
                'id' => 'article',
                'name' => '内容举报',
                'icon' => '📝',
                'reasons' => [
                    ['id' => 'spam', 'name' => '垃圾内容'],
                    ['id' => 'porn', 'name' => '色情低俗'],
                    ['id' => 'infringement', 'name' => '侵权内容'],
                    ['id' => 'illegal', 'name' => '违法内容'],
                    ['id' => 'false', 'name' => '虚假信息'],
                    ['id' => 'other', 'name' => '其他问题'],
                ],
            ],
        ];

        $this->json(['list' => $types]);
    }

    /**
     * 获取被举报对象信息
     */
    protected function getTargetInfo($type, $targetId)
    {
        switch ($type) {
            case 'goods':
                return $this->db->find(
                    "SELECT id, name, cover_image, price, status FROM goods WHERE id = ?",
                    [$targetId]
                );
            case 'merchant':
                return $this->db->find(
                    "SELECT id, name, logo, status FROM merchants WHERE id = ?",
                    [$targetId]
                );
            case 'user':
                return $this->db->find(
                    "SELECT id, nickname, avatar FROM users WHERE id = ?",
                    [$targetId]
                );
            case 'article':
                return $this->db->find(
                    "SELECT id, title, cover_image, status FROM articles WHERE id = ?",
                    [$targetId]
                );
            default:
                return null;
        }
    }
}
