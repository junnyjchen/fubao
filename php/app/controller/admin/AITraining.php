<?php
namespace app\controller;

use app\common\Jwt;

/**
 * AI训练知识库管理
 */
class AITraining extends Controller
{
    protected $userId;
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = $this->connectDB();
    }

    /**
     * 获取知识库列表
     */
    public function knowledgeList()
    {
        $this->verifyAdmin();

        $page = max(1, (int) $this->get('page', 1));
        $pageSize = min(100, max(10, (int) $this->get('page_size', 20)));
        $category = $this->get('category', '');
        $status = $this->get('status', '');
        $keyword = $this->get('keyword', '');

        $where = '1=1';
        $params = [];

        if ($category) {
            $where .= ' AND category = ?';
            $params[] = $category;
        }

        if ($status) {
            $where .= ' AND status = ?';
            $params[] = $status;
        }

        if ($keyword) {
            $where .= ' AND (title LIKE ? OR content LIKE ?)';
            $params[] = "%{$keyword}%";
            $params[] = "%{$keyword}%";
        }

        $offset = ($page - 1) * $pageSize;
        $countSql = "SELECT COUNT(*) FROM ai_training_knowledge WHERE {$where}";
        $total = (int) $this->db->find($countSql, $params)['COUNT(*)'];

        $listSql = "SELECT * FROM ai_training_knowledge WHERE {$where} ORDER BY created_at DESC LIMIT {$pageSize} OFFSET {$offset}";
        $list = $this->db->select($listSql, $params);

        // 转换tags JSON
        foreach ($list as &$item) {
            if ($item['tags']) {
                $item['tags'] = json_decode($item['tags'], true) ?: [];
            }
        }

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'page_size' => $pageSize,
            'total_pages' => ceil($total / $pageSize),
        ]);
    }

    /**
     * 获取知识库详情
     */
    public function knowledgeDetail()
    {
        $this->verifyAdmin();

        $id = (int) $this->get('id');

        $item = $this->db->find("SELECT * FROM ai_training_knowledge WHERE id = ?", [$id]);

        if (!$item) {
            $this->error('知識庫記錄不存在');
        }

        if ($item['tags']) {
            $item['tags'] = json_decode($item['tags'], true) ?: [];
        }
        if ($item['embedding_vector']) {
            $item['embedding_vector'] = json_decode($item['embedding_vector'], true);
        }

        $this->json(['item' => $item]);
    }

    /**
     * 添加知识库
     */
    public function knowledgeCreate()
    {
        $this->verifyAdmin();

        $title = trim($this->post('title'));
        $content = trim($this->post('content'));
        $category = $this->post('category', 'general');
        $sourceType = $this->post('source_type', 'text');
        $sourceUrl = $this->post('source_url', '');
        $tags = $this->post('tags', []);
        $status = $this->post('status', 'draft');

        if (!$title) {
            $this->error('請輸入標題');
        }

        if (!$content) {
            $this->error('請輸入內容');
        }

        $id = $this->db->insert('ai_training_knowledge', [
            'title' => $title,
            'content' => $content,
            'category' => $category,
            'source_type' => $sourceType,
            'source_url' => $sourceUrl,
            'tags' => json_encode($tags, JSON_UNESCAPED_UNICODE),
            'status' => $status,
            'admin_id' => $this->adminId,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        $this->json(['id' => $id], '添加成功');
    }

    /**
     * 更新知识库
     */
    public function knowledgeUpdate()
    {
        $this->verifyAdmin();

        $id = (int) $this->post('id');
        $title = trim($this->post('title'));
        $content = trim($this->post('content'));
        $category = $this->post('category', 'general');
        $sourceType = $this->post('source_type', 'text');
        $sourceUrl = $this->post('source_url', '');
        $tags = $this->post('tags', []);
        $status = $this->post('status', 'draft');

        if (!$id) {
            $this->error('缺少ID');
        }

        $item = $this->db->find("SELECT * FROM ai_training_knowledge WHERE id = ?", [$id]);
        if (!$item) {
            $this->error('知識庫記錄不存在');
        }

        $data = [
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        if ($title) $data['title'] = $title;
        if ($content) $data['content'] = $content;
        if ($category) $data['category'] = $category;
        if ($sourceType) $data['source_type'] = $sourceType;
        if ($sourceUrl !== null) $data['source_url'] = $sourceUrl;
        if (is_array($tags)) $data['tags'] = json_encode($tags, JSON_UNESCAPED_UNICODE);
        if ($status) $data['status'] = $status;

        $this->db->update('ai_training_knowledge', $data, 'id = ?', [$id]);

        $this->json([], '更新成功');
    }

    /**
     * 删除知识库
     */
    public function knowledgeDelete()
    {
        $this->verifyAdmin();

        $id = (int) $this->post('id');

        if (!$id) {
            $this->error('缺少ID');
        }

        $item = $this->db->find("SELECT * FROM ai_training_knowledge WHERE id = ?", [$id]);
        if (!$item) {
            $this->error('知識庫記錄不存在');
        }

        $this->db->delete('ai_training_knowledge', 'id = ?', [$id]);

        // 同时删除关联的问答对
        $this->db->delete('ai_qa_pairs', 'knowledge_id = ?', [$id]);

        $this->json([], '刪除成功');
    }

    /**
     * 批量导入知识库（文本内容）
     */
    public function knowledgeBatchImport()
    {
        $this->verifyAdmin();

        $data = $this->post('data', []);
        $category = $this->post('category', 'general');

        if (empty($data) || !is_array($data)) {
            $this->error('請提供導入數據');
        }

        $imported = 0;
        $failed = 0;
        $errors = [];

        foreach ($data as $index => $item) {
            if (empty($item['title']) || empty($item['content'])) {
                $failed++;
                $errors[] = "第{$index}條：缺少標題或內容";
                continue;
            }

            try {
                $this->db->insert('ai_training_knowledge', [
                    'title' => trim($item['title']),
                    'content' => trim($item['content']),
                    'category' => $item['category'] ?? $category,
                    'source_type' => 'text',
                    'tags' => isset($item['tags']) ? json_encode($item['tags'], JSON_UNESCAPED_UNICODE) : null,
                    'status' => 'draft',
                    'admin_id' => $this->adminId,
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
                $imported++;
            } catch (\Exception $e) {
                $failed++;
                $errors[] = "第{$index}條：導入失敗";
            }
        }

        $this->json([
            'imported' => $imported,
            'failed' => $failed,
            'errors' => $errors,
        ], '導入完成');
    }

    /**
     * 获取问答对列表
     */
    public function qaList()
    {
        $this->verifyAdmin();

        $page = max(1, (int) $this->get('page', 1));
        $pageSize = min(100, max(10, (int) $this->get('page_size', 20)));
        $category = $this->get('category', '');
        $knowledgeId = (int) $this->get('knowledge_id', 0);

        $where = '1=1';
        $params = [];

        if ($category) {
            $where .= ' AND category = ?';
            $params[] = $category;
        }

        if ($knowledgeId > 0) {
            $where .= ' AND knowledge_id = ?';
            $params[] = $knowledgeId;
        }

        $offset = ($page - 1) * $pageSize;
        $countSql = "SELECT COUNT(*) FROM ai_qa_pairs WHERE {$where}";
        $total = (int) $this->db->find($countSql, $params)['COUNT(*)'];

        $listSql = "SELECT * FROM ai_qa_pairs WHERE {$where} ORDER BY created_at DESC LIMIT {$pageSize} OFFSET {$offset}";
        $list = $this->db->select($listSql, $params);

        foreach ($list as &$item) {
            if ($item['keywords']) {
                $item['keywords'] = json_decode($item['keywords'], true) ?: [];
            }
        }

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'page_size' => $pageSize,
        ]);
    }

    /**
     * 添加问答对
     */
    public function qaCreate()
    {
        $this->verifyAdmin();

        $question = trim($this->post('question'));
        $answer = trim($this->post('answer'));
        $category = $this->post('category', 'general');
        $knowledgeId = (int) $this->post('knowledge_id', 0);
        $keywords = $this->post('keywords', []);

        if (!$question) {
            $this->error('請輸入問題');
        }

        if (!$answer) {
            $this->error('請輸入回答');
        }

        $id = $this->db->insert('ai_qa_pairs', [
            'question' => $question,
            'answer' => $answer,
            'category' => $category,
            'knowledge_id' => $knowledgeId > 0 ? $knowledgeId : null,
            'keywords' => is_array($keywords) ? json_encode($keywords, JSON_UNESCAPED_UNICODE) : null,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        $this->json(['id' => $id], '添加成功');
    }

    /**
     * 更新问答对
     */
    public function qaUpdate()
    {
        $this->verifyAdmin();

        $id = (int) $this->post('id');
        $question = trim($this->post('question'));
        $answer = trim($this->post('answer'));
        $category = $this->post('category', 'general');
        $keywords = $this->post('keywords', []);
        $isActive = $this->post('is_active');

        if (!$id) {
            $this->error('缺少ID');
        }

        $data = [
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        if ($question) $data['question'] = $question;
        if ($answer) $data['answer'] = $answer;
        if ($category) $data['category'] = $category;
        if (is_array($keywords)) $data['keywords'] = json_encode($keywords, JSON_UNESCAPED_UNICODE);
        if ($isActive !== null) $data['is_active'] = $isActive ? 1 : 0;

        $this->db->update('ai_qa_pairs', $data, 'id = ?', [$id]);

        $this->json([], '更新成功');
    }

    /**
     * 删除问答对
     */
    public function qaDelete()
    {
        $this->verifyAdmin();

        $id = (int) $this->post('id');

        if (!$id) {
            $this->error('缺少ID');
        }

        $this->db->delete('ai_qa_pairs', 'id = ?', [$id]);

        $this->json([], '刪除成功');
    }

    /**
     * 从知识库生成问答对
     */
    public function generateQA()
    {
        $this->verifyAdmin();

        $knowledgeId = (int) $this->post('knowledge_id');

        if (!$knowledgeId) {
            $this->error('請選擇知識庫');
        }

        $knowledge = $this->db->find("SELECT * FROM ai_training_knowledge WHERE id = ?", [$knowledgeId]);

        if (!$knowledge) {
            $this->error('知識庫不存在');
        }

        // 这里可以调用AI生成问答对
        // 为了简化，这里直接创建基础问答对
        $qaCount = 0;

        // 简单的问答生成逻辑
        $lines = explode("\n", $knowledge['content']);
        foreach ($lines as $line) {
            $line = trim($line);
            if (strlen($line) > 10) {
                $question = "關於" . $knowledge['title'] . "的問題";
                $this->db->insert('ai_qa_pairs', [
                    'question' => $question,
                    'answer' => $line,
                    'category' => $knowledge['category'],
                    'knowledge_id' => $knowledgeId,
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
                $qaCount++;
            }
        }

        $this->json(['count' => $qaCount], "成功生成{$qaCount}個問答對");
    }

    /**
     * 获取训练任务列表
     */
    public function taskList()
    {
        $this->verifyAdmin();

        $page = max(1, (int) $this->get('page', 1));
        $pageSize = min(50, max(10, (int) $this->get('page_size', 10)));
        $status = $this->get('status', '');

        $where = '1=1';
        $params = [];

        if ($status) {
            $where .= ' AND status = ?';
            $params[] = $status;
        }

        $offset = ($page - 1) * $pageSize;
        $countSql = "SELECT COUNT(*) FROM ai_training_tasks WHERE {$where}";
        $total = (int) $this->db->find($countSql, $params)['COUNT(*)'];

        $listSql = "SELECT * FROM ai_training_tasks WHERE {$where} ORDER BY created_at DESC LIMIT {$pageSize} OFFSET {$offset}";
        $list = $this->db->select($listSql, $params);

        foreach ($list as &$item) {
            if ($item['knowledge_ids']) {
                $item['knowledge_ids'] = json_decode($item['knowledge_ids'], true) ?: [];
            }
        }

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'page_size' => $pageSize,
        ]);
    }

    /**
     * 创建训练任务
     */
    public function taskCreate()
    {
        $this->verifyAdmin();

        $name = trim($this->post('name'));
        $description = $this->post('description', '');
        $type = $this->post('type', 'incremental');
        $knowledgeIds = $this->post('knowledge_ids', []);

        if (!$name) {
            $this->error('請輸入任務名稱');
        }

        // 计算总记录数
        $totalRecords = 0;
        if (!empty($knowledgeIds)) {
            $ids = implode(',', array_map('intval', $knowledgeIds));
            $totalRecords = (int) $this->db->find(
                "SELECT COUNT(*) FROM ai_training_knowledge WHERE id IN ({$ids}) AND status = 'ready'",
                []
            )['COUNT(*)'];

            // 加上问答对数量
            $totalRecords += (int) $this->db->find(
                "SELECT COUNT(*) FROM ai_qa_pairs WHERE knowledge_id IN ({$ids}) AND is_active = 1",
                []
            )['COUNT(*)'];
        }

        $id = $this->db->insert('ai_training_tasks', [
            'name' => $name,
            'description' => $description,
            'type' => $type,
            'knowledge_ids' => json_encode($knowledgeIds, JSON_UNESCAPED_UNICODE),
            'total_records' => $totalRecords,
            'status' => 'pending',
            'admin_id' => $this->adminId,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        $this->json(['id' => $id], '任務創建成功');
    }

    /**
     * 启动训练任务
     */
    public function taskStart()
    {
        $this->verifyAdmin();

        $id = (int) $this->post('id');

        if (!$id) {
            $this->error('缺少任務ID');
        }

        $task = $this->db->find("SELECT * FROM ai_training_tasks WHERE id = ?", [$id]);

        if (!$task) {
            $this->error('任務不存在');
        }

        if ($task['status'] !== 'pending' && $task['status'] !== 'failed') {
            $this->error('任務狀態無法啟動');
        }

        $this->db->update('ai_training_tasks', [
            'status' => 'running',
            'progress' => 0,
            'started_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ], 'id = ?', [$id]);

        // 这里应该触发实际的训练任务
        // 为了简化，直接标记为完成
        $this->db->update('ai_training_tasks', [
            'status' => 'completed',
            'progress' => 100,
            'processed_records' => $task['total_records'],
            'completed_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ], 'id = ?', [$id]);

        $this->json([], '任務已啟動');
    }

    /**
     * 取消训练任务
     */
    public function taskCancel()
    {
        $this->verifyAdmin();

        $id = (int) $this->post('id');

        if (!$id) {
            $this->error('缺少任務ID');
        }

        $task = $this->db->find("SELECT * FROM ai_training_tasks WHERE id = ?", [$id]);

        if (!$task) {
            $this->error('任務不存在');
        }

        if (!in_array($task['status'], ['pending', 'running'])) {
            $this->error('任務狀態無法取消');
        }

        $this->db->update('ai_training_tasks', [
            'status' => 'cancelled',
            'updated_at' => date('Y-m-d H:i:s'),
        ], 'id = ?', [$id]);

        $this->json([], '任務已取消');
    }

    /**
     * 获取统计信息
     */
    public function stats()
    {
        $this->verifyAdmin();

        // 知识库统计
        $knowledgeTotal = (int) $this->db->find("SELECT COUNT(*) FROM ai_training_knowledge", [])['COUNT(*)'];
        $knowledgeReady = (int) $this->db->find("SELECT COUNT(*) FROM ai_training_knowledge WHERE status = 'ready'", [])['COUNT(*)'];
        $knowledgePending = (int) $this->db->find("SELECT COUNT(*) FROM ai_training_knowledge WHERE status = 'draft' OR status = 'training'", [])['COUNT(*)'];

        // 问答对统计
        $qaTotal = (int) $this->db->find("SELECT COUNT(*) FROM ai_qa_pairs", [])['COUNT(*)'];
        $qaActive = (int) $this->db->find("SELECT COUNT(*) FROM ai_qa_pairs WHERE is_active = 1", [])['COUNT(*)'];

        // 训练任务统计
        $taskTotal = (int) $this->db->find("SELECT COUNT(*) FROM ai_training_tasks", [])['COUNT(*)'];
        $taskCompleted = (int) $this->db->find("SELECT COUNT(*) FROM ai_training_tasks WHERE status = 'completed'", [])['COUNT(*)'];

        // 分类统计
        $categoryStats = $this->db->select(
            "SELECT category, COUNT(*) as count FROM ai_training_knowledge GROUP BY category",
            []
        );

        $this->json([
            'knowledge' => [
                'total' => $knowledgeTotal,
                'ready' => $knowledgeReady,
                'pending' => $knowledgePending,
            ],
            'qa' => [
                'total' => $qaTotal,
                'active' => $qaActive,
            ],
            'task' => [
                'total' => $taskTotal,
                'completed' => $taskCompleted,
            ],
            'categories' => $categoryStats,
        ]);
    }

    /**
     * 搜索相关知识
     */
    public function searchKnowledge()
    {
        $query = trim($this->get('query', ''));
        $category = $this->get('category', '');
        $limit = min(20, max(1, (int) $this->get('limit', 5)));

        if (!$query) {
            $this->error('請輸入搜索關鍵詞');
        }

        $where = "(title LIKE ? OR content LIKE ?)";
        $params = ["%{$query}%", "%{$query}%"];

        if ($category) {
            $where .= " AND category = ?";
            $params[] = $category;
        }

        $sql = "SELECT * FROM ai_training_knowledge WHERE {$where} AND status = 'ready' ORDER BY usage_count DESC LIMIT {$limit}";
        $list = $this->db->select($sql, $params);

        // 增加使用次数
        foreach ($list as $item) {
            $this->db->update('ai_training_knowledge', [
                'usage_count' => $item['usage_count'] + 1,
            ], 'id = ?', [$item['id']]);
        }

        $this->json(['list' => $list]);
    }

    /**
     * 获取推荐问答
     */
    public function getRecommendedQA()
    {
        $query = trim($this->get('query', ''));
        $limit = min(10, max(1, (int) $this->get('limit', 3)));

        if (!$query) {
            $this->error('請輸入搜索關鍵詞');
        }

        // 简单的关键词匹配
        $keywords = preg_split('/[\s,]+/', $query);
        $keywordConditions = [];
        $params = [];

        foreach ($keywords as $keyword) {
            if (strlen($keyword) >= 2) {
                $keywordConditions[] = "question LIKE ? OR keywords LIKE ?";
                $params[] = "%{$keyword}%";
                $params[] = "%{$keyword}%";
            }
        }

        if (empty($keywordConditions)) {
            $this->json(['list' => []]);
            return;
        }

        $where = '(' . implode(' OR ', $keywordConditions) . ') AND is_active = 1';
        $sql = "SELECT * FROM ai_qa_pairs WHERE {$where} ORDER BY usage_count DESC, accuracy DESC LIMIT {$limit}";
        $list = $this->db->select($sql, $params);

        foreach ($list as &$item) {
            if ($item['keywords']) {
                $item['keywords'] = json_decode($item['keywords'], true) ?: [];
            }
            // 增加使用次数
            $this->db->update('ai_qa_pairs', [
                'usage_count' => $item['usage_count'] + 1,
            ], 'id = ?', [$item['id']]);
        }

        $this->json(['list' => $list]);
    }
}
