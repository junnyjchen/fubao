<?php
namespace app\controller;

use app\common\Jwt;

/**
 * 意见反馈管理
 */
class Feedback extends Controller
{
    protected $userId;
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = $this->connectDB();
    }

    /**
     * 获取反馈列表
     */
    public function index()
    {
        $this->verifyUser();
        $this->userId = $this->verifyUser();

        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $status = $this->get('status'); // pending, processing, resolved, rejected

        $where = 'user_id = ?';
        $params = [$this->userId];

        if ($status) {
            $where .= ' AND status = ?';
            $params[] = $status;
        }

        $total = $this->db->count('feedbacks', $where, $params);

        $offset = ($page - 1) * $limit;
        $sql = "SELECT * FROM feedbacks WHERE {$where} ORDER BY created_at DESC LIMIT {$offset}, {$limit}";
        $list = $this->db->select($sql, $params);

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * 提交反馈
     */
    public function submit()
    {
        $this->userId = $this->verifyUser();

        $type = $this->post('type'); // suggestion, complaint, bug, other
        $title = trim($this->post('title'));
        $content = trim($this->post('content'));
        $images = $this->post('images');
        $contact = trim($this->post('contact', ''));

        if (!$type) {
            $this->error('请选择反馈类型');
        }

        if (empty($title)) {
            $this->error('请输入反馈标题');
        }

        if (empty($content)) {
            $this->error('请输入反馈内容');
        }

        if (strlen($content) < 10) {
            $this->error('反馈内容至少10个字');
        }

        $data = [
            'user_id' => $this->userId,
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'images' => $images ? json_encode($images) : null,
            'contact' => $contact,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $id = $this->db->insert('feedbacks', $data);

        $this->json(['id' => $id], '提交成功');
    }

    /**
     * 获取反馈详情
     */
    public function detail()
    {
        $this->userId = $this->verifyUser();

        $id = (int) $this->get('id');

        if (!$id) {
            $this->error('缺少反馈ID');
        }

        $feedback = $this->db->find(
            "SELECT * FROM feedbacks WHERE id = ? AND user_id = ?",
            [$id, $this->userId]
        );

        if (!$feedback) {
            $this->error('反馈不存在');
        }

        // Parse images
        if ($feedback['images']) {
            $feedback['images'] = json_decode($feedback['images'], true);
        }

        // Get replies
        $replies = $this->db->select(
            "SELECT * FROM feedback_replies WHERE feedback_id = ? ORDER BY created_at ASC",
            [$id]
        );

        $feedback['replies'] = $replies;

        $this->json(['feedback' => $feedback]);
    }

    /**
     * 回复反馈（用户追加评论）
     */
    public function reply()
    {
        $this->userId = $this->verifyUser();

        $feedbackId = (int) $this->post('feedback_id');
        $content = trim($this->post('content'));

        if (!$feedbackId) {
            $this->error('缺少反馈ID');
        }

        if (empty($content)) {
            $this->error('回复内容不能为空');
        }

        $feedback = $this->db->find(
            "SELECT * FROM feedbacks WHERE id = ? AND user_id = ?",
            [$feedbackId, $this->userId]
        );

        if (!$feedback) {
            $this->error('反馈不存在');
        }

        $data = [
            'feedback_id' => $feedbackId,
            'user_id' => $this->userId,
            'content' => $content,
            'is_admin' => 0,
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $id = $this->db->insert('feedback_replies', $data);

        $this->json(['id' => $id], '回复成功');
    }

    /**
     * 删除反馈
     */
    public function delete()
    {
        $this->userId = $this->verifyUser();

        $id = (int) $this->post('id');

        if (!$id) {
            $this->error('缺少反馈ID');
        }

        $feedback = $this->db->find(
            "SELECT * FROM feedbacks WHERE id = ? AND user_id = ?",
            [$id, $this->userId]
        );

        if (!$feedback) {
            $this->error('反馈不存在');
        }

        // Only allow delete pending feedback
        if ($feedback['status'] !== 'pending') {
            $this->error('该反馈已处理，无法删除');
        }

        // Delete replies first
        $this->db->delete('feedback_replies', 'feedback_id = ?', [$id]);

        // Delete feedback
        $this->db->delete('feedbacks', 'id = ?', [$id]);

        $this->json([], '删除成功');
    }

    /**
     * 获取反馈类型列表
     */
    public function types()
    {
        $types = [
            ['id' => 'suggestion', 'name' => '功能建议', 'icon' => '💡'],
            ['id' => 'complaint', 'name' => '投诉', 'icon' => '⚠️'],
            ['id' => 'bug', 'name' => 'Bug反馈', 'icon' => '🐛'],
            ['id' => 'other', 'name' => '其他', 'icon' => '📝'],
        ];

        $this->json(['list' => $types]);
    }

    /**
     * 获取常见问题列表
     */
    public function faq()
    {
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 10);
        $category = $this->get('category');

        $where = 'is_published = 1';
        $params = [];

        if ($category) {
            $where .= ' AND category = ?';
            $params[] = $category;
        }

        $total = $this->db->count('faq', $where, $params);

        $offset = ($page - 1) * $limit;
        $sql = "SELECT id, question, answer, category, view_count, created_at 
                FROM faq WHERE {$where} 
                ORDER BY sort_order ASC, created_at DESC 
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
     * FAQ详情
     */
    public function faqDetail()
    {
        $id = (int) $this->get('id');

        if (!$id) {
            $this->error('缺少FAQ ID');
        }

        $faq = $this->db->find(
            "SELECT * FROM faq WHERE id = ? AND is_published = 1",
            [$id]
        );

        if (!$faq) {
            $this->error('FAQ不存在');
        }

        // Increment view count
        $this->db->query(
            "UPDATE faq SET view_count = view_count + 1 WHERE id = ?",
            [$id]
        );

        $this->json(['faq' => $faq]);
    }

    /**
     * 获取FAQ分类
     */
    public function faqCategories()
    {
        $sql = "SELECT category, COUNT(*) as count FROM faq WHERE is_published = 1 GROUP BY category";
        $list = $this->db->select($sql);

        $categories = [
            ['id' => 'account', 'name' => '账户问题', 'count' => 0],
            ['id' => 'order', 'name' => '订单问题', 'count' => 0],
            ['id' => 'payment', 'name' => '支付问题', 'count' => 0],
            ['id' => 'shipping', 'name' => '物流问题', 'count' => 0],
            ['id' => 'refund', 'name' => '退款问题', 'count' => 0],
            ['id' => 'other', 'name' => '其他问题', 'count' => 0],
        ];

        foreach ($list as $item) {
            foreach ($categories as &$cat) {
                if ($cat['id'] === $item['category']) {
                    $cat['count'] = $item['count'];
                    break;
                }
            }
        }

        $this->json(['list' => $categories]);
    }

    /**
     * 搜索FAQ
     */
    public function searchFaq()
    {
        $keyword = trim($this->get('keyword'));

        if (empty($keyword) || strlen($keyword) < 2) {
            $this->error('关键词至少2个字');
        }

        $sql = "SELECT id, question, LEFT(answer, 100) as answer, category 
                FROM faq 
                WHERE is_published = 1 
                AND (question LIKE ? OR answer LIKE ?)
                ORDER BY view_count DESC 
                LIMIT 10";

        $like = "%{$keyword}%";
        $list = $this->db->select($sql, [$like, $like]);

        $this->json(['list' => $list]);
    }
}
