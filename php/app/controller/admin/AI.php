<?php
namespace app\controller\admin;

use app\controller\Controller;

/**
 * AI管理后台
 */
class AI extends Controller
{
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->verifyAdmin();
        $this->db = $this->connectDB();
    }

    /**
     * AI配置列表
     */
    public function configs()
    {
        $configs = $this->db->select("SELECT * FROM ai_configurations ORDER BY id ASC");

        $this->json(['list' => $configs]);
    }

    /**
     * 创建AI配置
     */
    public function createConfig()
    {
        $name = trim($this->post('name'));
        $model = trim($this->post('model'));
        $apiKey = $this->post('api_key');
        $systemPrompt = trim($this->post('system_prompt', ''));
        $temperature = (float) $this->post('temperature', 0.7);
        $maxTokens = (int) $this->post('max_tokens', 2000);

        if (!$name || !$model) {
            $this->error('請填寫完整資訊');
        }

        $data = [
            'name' => $name,
            'model' => $model,
            'api_key' => $apiKey,
            'system_prompt' => $systemPrompt,
            'temperature' => $temperature,
            'max_tokens' => $maxTokens,
            'is_active' => 1,
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $id = $this->db->insert('ai_configurations', $data);

        $this->json(['id' => $id], '創建成功');
    }

    /**
     * 更新AI配置
     */
    public function updateConfig()
    {
        $id = (int) $this->post('id');

        if (!$id) {
            $this->error('缺少配置ID');
        }

        $data = [];
        $fields = ['name', 'model', 'api_key', 'system_prompt', 'temperature', 'max_tokens', 'is_active'];

        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                $data[$field] = $field === 'temperature' 
                    ? (float) $this->post($field)
                    : ($field === 'max_tokens' || $field === 'is_active')
                        ? (int) $this->post($field)
                        : $this->post($field);
            }
        }

        if (empty($data)) {
            $this->error('沒有要更新的欄位');
        }

        $data['updated_at'] = date('Y-m-d H:i:s');

        $this->db->update('ai_configurations', $data, 'id = ?', [$id]);

        $this->json([], '更新成功');
    }

    /**
     * 删除AI配置
     */
    public function deleteConfig()
    {
        $id = (int) $this->post('id');

        if (!$id) {
            $this->error('缺少配置ID');
        }

        // 检查是否是最后一个配置
        $count = $this->db->count('ai_configurations');
        if ($count <= 1) {
            $this->error('至少保留一個配置');
        }

        $this->db->delete('ai_configurations', 'id = ?', [$id]);

        $this->json([], '刪除成功');
    }

    /**
     * 使用統計儀表盤
     */
    public function dashboard()
    {
        $period = $this->get('period', '7days');

        // 时间范围
        switch ($period) {
            case 'today':
                $where = "WHERE DATE(created_at) = CURDATE()";
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
            default:
                $where = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }

        // 核心指标
        $totalCalls = $this->db->find(
            "SELECT COUNT(*) as count FROM ai_chat_logs {$where}"
        )['count'] ?? 0;

        $totalTokens = $this->db->find(
            "SELECT COALESCE(SUM(input_tokens + output_tokens), 0) as total FROM ai_chat_logs {$where}"
        )['total'] ?? 0;

        $errorCount = $this->db->find(
            "SELECT COUNT(*) as count FROM ai_chat_logs {$where} AND status = 'error'"
        )['count'] ?? 0;

        $uniqueUsers = $this->db->find(
            "SELECT COUNT(DISTINCT user_id) as count FROM ai_chat_logs {$where} AND user_id > 0"
        )['count'] ?? 0;

        // 今日指标
        $todayCalls = $this->db->find(
            "SELECT COUNT(*) as count FROM ai_chat_logs WHERE DATE(created_at) = CURDATE()"
        )['count'] ?? 0;

        $todayTokens = $this->db->find(
            "SELECT COALESCE(SUM(input_tokens + output_tokens), 0) as total FROM ai_chat_logs WHERE DATE(created_at) = CURDATE()"
        )['total'] ?? 0;

        // 平均响应时间
        $avgLatency = $this->db->find(
            "SELECT AVG(latency_ms) as avg FROM ai_chat_logs {$where} AND latency_ms > 0"
        )['avg'] ?? 0;

        // 每日趋势
        $dailyTrend = $this->db->select(
            "SELECT DATE(created_at) as date, 
                    COUNT(*) as calls,
                    SUM(input_tokens + output_tokens) as tokens,
                    AVG(latency_ms) as avg_latency
             FROM ai_chat_logs {$where}
             GROUP BY DATE(created_at)
             ORDER BY date ASC"
        );

        // 热门问题TOP10
        $topQuestions = $this->db->select(
            "SELECT content, COUNT(*) as count
             FROM ai_chat_logs
             {$where}
             AND role = 'user'
             GROUP BY content
             ORDER BY count DESC
             LIMIT 10"
        );

        // 错误分布
        $errorDistribution = $this->db->select(
            "SELECT 
                CASE 
                    WHEN error_code = 'timeout' THEN '超時'
                    WHEN error_code = 'rate_limit' THEN '頻率限制'
                    WHEN error_code = 'invalid_key' THEN 'API Key錯誤'
                    ELSE '其他錯誤'
                END as type,
                COUNT(*) as count
             FROM ai_chat_logs
             {$where} AND status = 'error'
             GROUP BY type"
        );

        // 活跃用户
        $recentUsers = $this->db->select(
            "SELECT u.id, u.nickname, u.avatar, COUNT(*) as call_count,
                    MAX(l.created_at) as last_used
             FROM ai_chat_logs l
             JOIN users u ON l.user_id = u.id
             {$where}
             GROUP BY u.id
             ORDER BY call_count DESC
             LIMIT 10"
        );

        $this->json([
            'period' => $period,
            'overview' => [
                'total_calls' => (int) $totalCalls,
                'total_tokens' => (int) $totalTokens,
                'error_count' => (int) $errorCount,
                'error_rate' => $totalCalls > 0 ? round($errorCount / $totalCalls * 100, 2) : 0,
                'unique_users' => (int) $uniqueUsers,
                'avg_latency' => round($avgLatency, 0),
            ],
            'today' => [
                'calls' => (int) $todayCalls,
                'tokens' => (int) $todayTokens,
            ],
            'daily_trend' => $dailyTrend,
            'top_questions' => $topQuestions,
            'error_distribution' => $errorDistribution,
            'recent_users' => $recentUsers,
        ]);
    }

    /**
     * 聊天日志列表
     */
    public function logs()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 50);
        $userId = (int) $this->get('user_id');
        $sessionId = $this->get('session_id');
        $status = $this->get('status');
        $startDate = $this->get('start_date');
        $endDate = $this->get('end_date');

        $where = '1=1';
        $params = [];

        if ($userId) {
            $where .= ' AND l.user_id = ?';
            $params[] = $userId;
        }

        if ($sessionId) {
            $where .= ' AND l.session_id = ?';
            $params[] = $sessionId;
        }

        if ($status) {
            $where .= ' AND l.status = ?';
            $params[] = $status;
        }

        if ($startDate) {
            $where .= ' AND l.created_at >= ?';
            $params[] = $startDate;
        }

        if ($endDate) {
            $where .= ' AND l.created_at <= ?';
            $params[] = $endDate . ' 23:59:59';
        }

        $total = $this->db->count('ai_chat_logs l', $where, $params);

        $offset = ($page - 1) * $limit;
        $sql = "SELECT l.*, u.nickname, u.avatar
                FROM ai_chat_logs l
                LEFT JOIN users u ON l.user_id = u.id
                WHERE {$where}
                ORDER BY l.created_at DESC
                LIMIT {$offset}, {$limit}";

        $list = $this->db->select($sql, $params);

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * 会话详情
     */
    public function sessionDetail()
    {
        $sessionId = trim($this->get('session_id'));

        if (!$sessionId) {
            $this->error('缺少會話ID');
        }

        $logs = $this->db->select(
            "SELECT l.*, u.nickname, u.avatar
             FROM ai_chat_logs l
             LEFT JOIN users u ON l.user_id = u.id
             WHERE l.session_id = ?
             ORDER BY l.created_at ASC",
            [$sessionId]
        );

        // 获取用户信息
        $userId = $logs[0]['user_id'] ?? 0;
        $user = null;
        if ($userId > 0) {
            $user = $this->db->find(
                "SELECT id, nickname, avatar, phone, created_at FROM users WHERE id = ?",
                [$userId]
            );
        }

        // 统计信息
        $stats = [
            'message_count' => count($logs),
            'total_tokens' => array_sum(array_column($logs, 'input_tokens')) + array_sum(array_column($logs, 'output_tokens')),
            'avg_latency' => count($logs) > 0 ? round(array_sum(array_column($logs, 'latency_ms')) / count($logs), 0) : 0,
            'start_time' => $logs[0]['created_at'] ?? null,
            'end_time' => end($logs)['created_at'] ?? null,
        ];

        $this->json([
            'logs' => $logs,
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    /**
     * 清理日志
     */
    public function cleanLogs()
    {
        $days = (int) $this->post('days', 30);
        $keepSession = (int) $this->post('keep_session', 0);

        $beforeDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));

        if ($keepSession) {
            // 只清理超过N天且会话已结束的数据
            $this->db->query(
                "DELETE FROM ai_chat_logs 
                 WHERE created_at < ? 
                 AND session_id IN (
                     SELECT session_id FROM (
                         SELECT session_id, MAX(created_at) as last_time
                         FROM ai_chat_logs
                         GROUP BY session_id
                         HAVING last_time < ?
                     ) as old_sessions
                 )",
                [$beforeDate, $beforeDate]
            );
        } else {
            $this->db->query(
                "DELETE FROM ai_chat_logs WHERE created_at < ?",
                [$beforeDate]
            );
        }

        $deleted = $this->db->rowCount();

        $this->json(['deleted' => $deleted], "已清理 {$deleted} 條記錄");
    }

    /**
     * 导出日志
     */
    public function export()
    {
        $startDate = $this->get('start_date');
        $endDate = $this->get('end_date');
        $format = $this->get('format', 'json'); // json, csv

        $where = '1=1';
        $params = [];

        if ($startDate) {
            $where .= ' AND l.created_at >= ?';
            $params[] = $startDate;
        }

        if ($endDate) {
            $where .= ' AND l.created_at <= ?';
            $params[] = $endDate . ' 23:59:59';
        }

        $logs = $this->db->select(
            "SELECT l.*, u.nickname, u.phone
             FROM ai_chat_logs l
             LEFT JOIN users u ON l.user_id = u.id
             WHERE {$where}
             ORDER BY l.created_at DESC",
            $params
        );

        if ($format === 'csv') {
            // CSV导出
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename=ai_logs_' . date('Ymd') . '.csv');
            
            $output = fopen('php://output', 'w');
            fputcsv($output, ['ID', '用戶', '角色', '內容', 'Token', '狀態', '延遲', '時間']);
            
            foreach ($logs as $log) {
                fputcsv($output, [
                    $log['id'],
                    $log['nickname'] ?? '訪客',
                    $log['role'],
                    $log['content'],
                    $log['input_tokens'] + $log['output_tokens'],
                    $log['status'],
                    $log['latency_ms'],
                    $log['created_at'],
                ]);
            }
            
            fclose($output);
            exit;
        }

        $this->json(['list' => $logs, 'count' => count($logs)]);
    }

    /**
     * 系统提示词模板
     */
    public function promptTemplates()
    {
        $templates = [
            [
                'id' => 'default',
                'name' => '預設助手',
                'prompt' => '你是符寶網的AI助手，專注於玄門文化科普與服務...',
            ],
            [
                'id' => 'expert',
                'name' => '專業道士',
                'prompt' => '你是一位資深道士，精通道教符籙、風水命理...',
            ],
            [
                'id' => 'customer',
                'name' => '客服專員',
                'prompt' => '你是符寶網的客服專員，專注於解答用戶問題...',
            ],
        ];

        $this->json(['list' => $templates]);
    }
}
