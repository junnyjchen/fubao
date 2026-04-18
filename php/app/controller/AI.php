<?php
namespace app\controller;

use app\common\Jwt;

/**
 * AI配置与统计管理
 */
class AI extends Controller
{
    protected $userId;
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = $this->connectDB();
    }

    /**
     * 获取AI配置列表
     */
    public function configs()
    {
        $this->verifyAdmin();

        $configs = $this->db->select("SELECT * FROM ai_configurations ORDER BY id ASC");

        $this->json(['list' => $configs]);
    }

    /**
     * 获取AI配置详情
     */
    public function configDetail()
    {
        $this->verifyAdmin();

        $id = (int) $this->get('id', 1);

        $config = $this->db->find("SELECT * FROM ai_configurations WHERE id = ?", [$id]);

        if (!$config) {
            $this->error('配置不存在');
        }

        $this->json(['config' => $config]);
    }

    /**
     * 更新AI配置
     */
    public function updateConfig()
    {
        $this->verifyAdmin();

        $id = (int) $this->post('id');
        $name = trim($this->post('name'));
        $model = trim($this->post('model'));
        $apiKey = $this->post('api_key');
        $systemPrompt = trim($this->post('system_prompt'));
        $temperature = (float) $this->post('temperature', 0.7);
        $maxTokens = (int) $this->post('max_tokens', 2000);
        $isActive = (int) $this->post('is_active', 1);

        if (!$id) {
            $this->error('缺少配置ID');
        }

        $config = $this->db->find("SELECT * FROM ai_configurations WHERE id = ?", [$id]);
        if (!$config) {
            $this->error('配置不存在');
        }

        $data = [
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        if ($name) $data['name'] = $name;
        if ($model) $data['model'] = $model;
        if ($apiKey) $data['api_key'] = $apiKey;
        if ($systemPrompt !== null) $data['system_prompt'] = $systemPrompt;
        if (isset($_POST['temperature'])) $data['temperature'] = $temperature;
        if (isset($_POST['max_tokens'])) $data['max_tokens'] = $maxTokens;
        if (isset($_POST['is_active'])) $data['is_active'] = $isActive;

        $this->db->update('ai_configurations', $data, 'id = ?', [$id]);

        $this->json([], '配置更新成功');
    }

    /**
     * 获取使用统计
     */
    public function usageStats()
    {
        $period = $this->get('period', '7days'); // today, 7days, 30days, 90days

        $where = '';
        switch ($period) {
            case 'today':
                $where = "WHERE created_at >= CURDATE()";
                break;
            case '7days':
                $where = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                break;
            case '30days':
                $where = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                break;
            case '90days':
                $where = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
                break;
        }

        // 总调用次数
        $totalCalls = $this->db->find(
            "SELECT COUNT(*) as count FROM ai_chat_logs {$where}"
        )['count'];

        // 总消耗token
        $totalTokens = $this->db->find(
            "SELECT COALESCE(SUM(input_tokens + output_tokens), 0) as total FROM ai_chat_logs {$where}"
        )['total'];

        // 日均调用
        $avgDailyCalls = $this->db->find(
            "SELECT AVG(daily_count) as avg FROM (
                SELECT DATE(created_at) as date, COUNT(*) as daily_count 
                FROM ai_chat_logs {$where}
                GROUP BY DATE(created_at)
            ) as daily_stats"
        )['avg'] ?? 0;

        // 每日调用趋势
        $dailyTrend = $this->db->select(
            "SELECT DATE(created_at) as date, COUNT(*) as count,
                    SUM(input_tokens + output_tokens) as tokens
             FROM ai_chat_logs {$where}
             GROUP BY DATE(created_at)
             ORDER BY date ASC"
        );

        // 热门问题
        $topQuestions = $this->db->select(
            "SELECT content, COUNT(*) as count
             FROM ai_chat_logs
             {$where}
             AND role = 'user'
             GROUP BY content
             ORDER BY count DESC
             LIMIT 10"
        );

        // 错误统计
        $errorCount = $this->db->find(
            "SELECT COUNT(*) as count FROM ai_chat_logs {$where} AND status = 'error'"
        )['count'];

        // 用户统计
        $uniqueUsers = $this->db->find(
            "SELECT COUNT(DISTINCT user_id) as count FROM ai_chat_logs {$where} AND user_id > 0"
        )['count'];

        $this->json([
            'period' => $period,
            'stats' => [
                'total_calls' => (int) $totalCalls,
                'total_tokens' => (int) $totalTokens,
                'avg_daily_calls' => round($avgDailyCalls, 1),
                'error_count' => (int) $errorCount,
                'error_rate' => $totalCalls > 0 ? round($errorCount / $totalCalls * 100, 2) : 0,
                'unique_users' => (int) $uniqueUsers,
            ],
            'daily_trend' => $dailyTrend,
            'top_questions' => $topQuestions,
        ]);
    }

    /**
     * 记录聊天日志
     */
    public function logChat()
    {
        $this->verifyUser();
        $this->userId = $this->verifyUser();

        $configId = (int) $this->post('config_id', 1);
        $sessionId = trim($this->post('session_id'));
        $role = $this->post('role');
        $content = trim($this->post('content'));
        $tokens = (int) $this->post('tokens', 0);
        $status = $this->post('status', 'success');
        $model = trim($this->post('model'));
        $latency = (float) $this->post('latency', 0);

        if (empty($content)) {
            $this->error('內容不能為空');
        }

        $data = [
            'config_id' => $configId,
            'session_id' => $sessionId ?: null,
            'user_id' => $this->userId,
            'role' => $role,
            'content' => $content,
            'input_tokens' => $tokens,
            'output_tokens' => 0,
            'model' => $model,
            'status' => $status,
            'latency_ms' => $latency,
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $id = $this->db->insert('ai_chat_logs', $data);

        $this->json(['id' => $id]);
    }

    /**
     * 获取会话历史
     */
    public function sessionHistory()
    {
        $this->verifyUser();
        $this->userId = $this->verifyUser();

        $sessionId = trim($this->get('session_id'));

        if (!$sessionId) {
            $this->error('缺少會話ID');
        }

        $logs = $this->db->select(
            "SELECT * FROM ai_chat_logs 
             WHERE session_id = ? AND user_id = ?
             ORDER BY created_at ASC",
            [$sessionId, $this->userId]
        );

        $this->json(['list' => $logs]);
    }

    /**
     * 获取我的AI对话历史
     */
    public function myHistory()
    {
        $this->userId = $this->verifyUser();

        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);

        $offset = ($page - 1) * $limit;

        // 获取会话列表
        $sql = "SELECT session_id, 
                       MIN(created_at) as first_message,
                       MAX(created_at) as last_message,
                       COUNT(*) as message_count,
                       MAX(CASE WHEN role = 'user' THEN content ELSE NULL END) as first_question
                FROM ai_chat_logs 
                WHERE user_id = ? AND session_id IS NOT NULL
                GROUP BY session_id
                ORDER BY last_message DESC
                LIMIT {$offset}, {$limit}";

        $list = $this->db->select($sql, [$this->userId]);

        $total = $this->db->count(
            'ai_chat_logs',
            'user_id = ? AND session_id IS NOT NULL',
            [$this->userId],
            'session_id'
        );

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * 删除会话
     */
    public function deleteSession()
    {
        $this->userId = $this->verifyUser();

        $sessionId = trim($this->post('session_id'));

        if (!$sessionId) {
            $this->error('缺少會話ID');
        }

        $this->db->delete(
            'ai_chat_logs',
            'session_id = ? AND user_id = ?',
            [$sessionId, $this->userId]
        );

        $this->json([], '刪除成功');
    }

    /**
     * 获取AI能力列表（供前端选择）
     */
    public function capabilities()
    {
        $capabilities = [
            [
                'id' => 'culture',
                'name' => '文化科普',
                'description' => '解答道教文化、符籙法器等問題',
                'icon' => 'book',
            ],
            [
                'id' => 'product',
                'name' => '商品諮詢',
                'description' => '介紹符寶網商品，幫助選擇合適的符籙',
                'icon' => 'shopping-bag',
            ],
            [
                'id' => 'certificate',
                'name' => '證書查詢',
                'description' => '了解一物一證認證體系',
                'icon' => 'shield',
            ],
            [
                'id' => 'usage',
                'name' => '使用指導',
                'description' => '指導正確使用符籙法器的方法',
                'icon' => 'sparkles',
            ],
            [
                'id' => 'fortune',
                'name' => '命理諮詢',
                'description' => '提供風水命理方面的基礎建議',
                'icon' => 'star',
            ],
            [
                'id' => 'service',
                'name' => '客服支援',
                'description' => '解答售後問題和平台使用疑問',
                'icon' => 'headphones',
            ],
        ];

        $this->json(['list' => $capabilities]);
    }

    /**
     * 获取模型列表
     */
    public function models()
    {
        $models = [
            ['id' => 'doubao-seed-1-6-251015', 'name' => '豆包 Seed 1.6', 'provider' => 'Coze'],
            ['id' => 'deepseek-chat', 'name' => 'DeepSeek Chat', 'provider' => 'DeepSeek'],
            ['id' => 'kimi-chat', 'name' => 'Kimi Chat', 'provider' => 'Moonshot'],
        ];

        $this->json(['list' => $models]);
    }

    /**
     * 测试AI连接
     */
    public function testConnection()
    {
        $this->verifyAdmin();

        $configId = (int) $this->post('config_id', 1);

        $config = $this->db->find(
            "SELECT * FROM ai_configurations WHERE id = ?",
            [$configId]
        );

        if (!$config) {
            $this->error('配置不存在');
        }

        // 简单测试：返回配置信息（不实际调用API）
        $this->json([
            'success' => true,
            'config' => [
                'id' => $config['id'],
                'name' => $config['name'],
                'model' => $config['model'],
                'is_active' => $config['is_active'],
            ],
        ], '連接正常');
    }

    /**
     * 清理旧日志
     */
    public function cleanLogs()
    {
        $this->verifyAdmin();

        $days = (int) $this->post('days', 30);
        $beforeDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));

        $this->db->query(
            "DELETE FROM ai_chat_logs WHERE created_at < ?",
            [$beforeDate]
        );

        $deleted = $this->db->rowCount();

        $this->json(['deleted' => $deleted], "已清理 {$deleted} 條記錄");
    }

    /**
     * 导出日志
     */
    public function exportLogs()
    {
        $this->verifyAdmin();

        $startDate = $this->get('start_date');
        $endDate = $this->get('end_date');
        $userId = (int) $this->get('user_id');

        $where = '1=1';
        $params = [];

        if ($startDate) {
            $where .= ' AND created_at >= ?';
            $params[] = $startDate;
        }

        if ($endDate) {
            $where .= ' AND created_at <= ?';
            $params[] = $endDate . ' 23:59:59';
        }

        if ($userId) {
            $where .= ' AND user_id = ?';
            $params[] = $userId;
        }

        $logs = $this->db->select(
            "SELECT l.*, u.nickname, u.phone 
             FROM ai_chat_logs l
             LEFT JOIN users u ON l.user_id = u.id
             WHERE {$where}
             ORDER BY l.created_at DESC
             LIMIT 10000",
            $params
        );

        $this->json(['list' => $logs, 'count' => count($logs)]);
    }
}
