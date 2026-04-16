<?php
namespace app\controller;

use app\common\Jwt;
use app\common\Response;

/**
 * 消息/私信管理
 */
class Message extends Controller
{
    protected $userId;
    protected $db;

    public function __construct()
    {
        parent::__construct();
        $this->db = $this->connectDB();
    }

    /**
     * 获取消息列表
     */
    public function index()
    {
        $this->verifyUser();
        $this->userId = $this->verifyUser();

        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $type = $this->get('type'); // system, order, activity, chat
        $isRead = $this->get('is_read');

        $where = 'user_id = ?';
        $params = [$this->userId];

        if ($type) {
            $where .= ' AND type = ?';
            $params[] = $type;
        }

        if ($isRead !== null) {
            $where .= ' AND is_read = ?';
            $params[] = (int) $isRead;
        }

        // Count total
        $total = $this->db->count('messages', $where, $params);

        // Get messages
        $offset = ($page - 1) * $limit;
        $sql = "SELECT * FROM messages WHERE {$where} ORDER BY created_at DESC LIMIT {$offset}, {$limit}";
        $list = $this->db->select($sql, $params);

        // Get unread count
        $unreadCount = $this->db->count('messages', 'user_id = ? AND is_read = 0', [$this->userId]);

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * 获取会话列表（私信）
     */
    public function conversations()
    {
        $this->userId = $this->verifyUser();

        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);

        // Get distinct conversations
        $offset = ($page - 1) * $limit;
        $sql = "SELECT 
                    *,
                    MAX(created_at) as last_time,
                    SUM(CASE WHEN is_read = 0 AND user_id = ? THEN 1 ELSE 0 END) as unread_count
                FROM messages 
                WHERE type = 'chat' AND (user_id = ? OR from_user_id = ?) 
                GROUP BY from_user_id 
                ORDER BY last_time DESC 
                LIMIT {$offset}, {$limit}";

        $list = $this->db->select($sql, [$this->userId, $this->userId, $this->userId]);

        // Get user info for each conversation
        foreach ($list as &$item) {
            $otherId = $item['from_user_id'] == $this->userId ? $item['user_id'] : $item['from_user_id'];
            $user = $this->db->find("SELECT id, nickname, avatar FROM users WHERE id = ?", [$otherId]);
            $item['other_user'] = $user;
        }

        $total = $this->db->count('messages', "type = 'chat' AND (user_id = ? OR from_user_id = ?)", [$this->userId, $this->userId]);

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * 获取与某用户的聊天记录
     */
    public function chatHistory()
    {
        $this->userId = $this->verifyUser();

        $otherId = (int) $this->get('other_id');
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 50);

        if (!$otherId) {
            $this->error('缺少用户ID');
        }

        $offset = ($page - 1) * $limit;

        // Get messages between two users
        $sql = "SELECT * FROM messages 
                WHERE type = 'chat' 
                AND ((user_id = ? AND from_user_id = ?) OR (user_id = ? AND from_user_id = ?))
                ORDER BY created_at DESC 
                LIMIT {$offset}, {$limit}";

        $list = $this->db->select($sql, [$this->userId, $otherId, $otherId, $this->userId]);

        // Mark as read
        $this->db->update('messages', [
            'is_read' => 1,
        ], 'user_id = ? AND from_user_id = ? AND is_read = 0', [$this->userId, $otherId]);

        // Reverse to chronological order
        $list = array_reverse($list);

        $total = $this->db->count('messages', 
            "type = 'chat' AND ((user_id = ? AND from_user_id = ?) OR (user_id = ? AND from_user_id = ?))",
            [$this->userId, $otherId, $otherId, $this->userId]
        );

        $this->json([
            'list' => $list,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * 发送私信
     */
    public function send()
    {
        $this->userId = $this->verifyUser();

        $toUserId = (int) $this->post('to_user_id');
        $content = trim($this->post('content'));
        $msgType = $this->post('msg_type', 'text'); // text, image, goods

        if (!$toUserId) {
            $this->error('请选择发送对象');
        }

        if (empty($content)) {
            $this->error('消息内容不能为空');
        }

        if ($toUserId == $this->userId) {
            $this->error('不能给自己发消息');
        }

        // Check if user exists
        $toUser = $this->db->find("SELECT id FROM users WHERE id = ?", [$toUserId]);
        if (!$toUser) {
            $this->error('用户不存在');
        }

        $data = [
            'user_id' => $this->userId,
            'from_user_id' => $toUserId,
            'type' => 'chat',
            'content' => $content,
            'msg_type' => $msgType,
            'is_read' => 0,
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $id = $this->db->insert('messages', $data);

        $this->json(['id' => $id], '发送成功');
    }

    /**
     * 获取消息详情
     */
    public function detail()
    {
        $this->userId = $this->verifyUser();

        $id = (int) $this->get('id');

        if (!$id) {
            $this->error('缺少消息ID');
        }

        $message = $this->db->find(
            "SELECT * FROM messages WHERE id = ? AND (user_id = ? OR from_user_id = ?)",
            [$id, $this->userId, $this->userId]
        );

        if (!$message) {
            $this->error('消息不存在');
        }

        // Mark as read
        if ($message['user_id'] == $this->userId && !$message['is_read']) {
            $this->db->update('messages', ['is_read' => 1], 'id = ?', [$id]);
            $message['is_read'] = 1;
        }

        $this->json(['message' => $message]);
    }

    /**
     * 标记消息已读
     */
    public function markRead()
    {
        $this->userId = $this->verifyUser();

        $ids = $this->post('ids');
        $type = $this->post('type');

        if (!empty($ids)) {
            $ids = is_array($ids) ? $ids : explode(',', $ids);
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "UPDATE messages SET is_read = 1 WHERE id IN ({$placeholders}) AND user_id = ?";
            $params = array_merge($ids, [$this->userId]);
            $this->db->query($sql, $params);
        } else if ($type) {
            $this->db->update('messages', ['is_read' => 1], 'user_id = ? AND type = ?', [$this->userId, $type]);
        } else {
            $this->db->update('messages', ['is_read' => 1], 'user_id = ?', [$this->userId]);
        }

        $this->json([], '标记成功');
    }

    /**
     * 删除消息
     */
    public function delete()
    {
        $this->userId = $this->verifyUser();

        $ids = $this->post('ids');

        if (empty($ids)) {
            $this->error('请选择要删除的消息');
        }

        $ids = is_array($ids) ? $ids : explode(',', $ids);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $sql = "DELETE FROM messages WHERE id IN ({$placeholders}) AND (user_id = ? OR from_user_id = ?)";
        $this->db->query($sql, array_merge($ids, [$this->userId, $this->userId]));

        $this->json([], '删除成功');
    }

    /**
     * 获取未读消息数
     */
    public function unreadCount()
    {
        $this->userId = $this->verifyUser();

        $total = $this->db->count('messages', 'user_id = ? AND is_read = 0', [$this->userId]);

        // By type
        $sql = "SELECT type, COUNT(*) as count FROM messages WHERE user_id = ? AND is_read = 0 GROUP BY type";
        $byType = $this->db->select($sql, [$this->userId]);

        $typeCounts = [];
        foreach ($byType as $item) {
            $typeCounts[$item['type']] = $item['count'];
        }

        $this->json([
            'total' => $total,
            'by_type' => $typeCounts,
        ]);
    }

    /**
     * 获取系统消息模板列表
     */
    public function templates()
    {
        $this->verifyUser();

        $templates = [
            [
                'id' => 1,
                'title' => '订单通知',
                'content' => '您有新订单，请及时处理',
            ],
            [
                'id' => 2,
                'title' => '物流更新',
                'content' => '您的包裹已发货',
            ],
            [
                'id' => 3,
                'title' => '优惠活动',
                'content' => '新用户首单立减',
            ],
            [
                'id' => 4,
                'title' => '账户安全',
                'content' => '您的账户信息已更新',
            ],
        ];

        $this->json(['list' => $templates]);
    }

    /**
     * 清理过期消息
     */
    public function cleanExpired()
    {
        $this->verifyAdmin();

        $days = (int) $this->post('days', 30);
        $beforeDate = date('Y-m-d H:i:s', strtotime("-{$days} days"));

        // Only clean read messages
        $sql = "DELETE FROM messages WHERE is_read = 1 AND created_at < ?";
        $this->db->query($sql, [$beforeDate]);

        $affected = $this->db->rowCount();

        $this->json(['deleted' => $affected], '清理完成');
    }
}
