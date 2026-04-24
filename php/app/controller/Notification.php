<?php
/**
 * 通知控制器
 */

namespace app\controller;

use app\Controller;

class Notification extends Controller
{
    /**
     * 通知列表
     */
    public function index()
    {
        $userId = $this->verifyUser();
        
        $page = (int) $this->get('page', 1);
        $limit = (int) $this->get('limit', 20);
        $unreadOnly = $this->get('unread_only', 0);
        
        $offset = ($page - 1) * $limit;
        
        $where = "`user_id` = ?";
        $params = [$userId];
        
        if ($unreadOnly) {
            $where .= " AND `is_read` = 0";
        }
        
        $list = $this->db->select(
            "SELECT * FROM `notifications` WHERE {$where} ORDER BY `created_at` DESC LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        
        $total = $this->db->count('notifications', $where, $params);
        $unreadCount = $this->db->count('notifications', '`user_id` = ? AND `is_read` = 0', [$userId]);
        
        $this->json([
            'list' => $list,
            'total' => (int) $total,
            'unread_count' => (int) $unreadCount,
            'page' => $page,
            'limit' => $limit,
        ]);
    }
    
    /**
     * 标记已读
     */
    public function markRead()
    {
        $userId = $this->verifyUser();
        
        $notificationId = (int) $this->post('id');
        
        if ($notificationId) {
            $this->db->update('notifications', [
                'is_read' => 1,
                'read_at' => date('Y-m-d H:i:s'),
            ], '`id` = ? AND `user_id` = ?', [$notificationId, $userId]);
        }
        
        $this->json([], '已標記為已讀');
    }
    
    /**
     * 全部标记已读
     */
    public function markAllRead()
    {
        $userId = $this->verifyUser();
        
        $this->db->update('notifications', [
            'is_read' => 1,
            'read_at' => date('Y-m-d H:i:s'),
        ], '`user_id` = ? AND `is_read` = 0', [$userId]);
        
        $this->json([], '已全部標記為已讀');
    }
    
    /**
     * 删除通知
     */
    public function delete()
    {
        $userId = $this->verifyUser();
        
        $notificationId = (int) $this->post('id');
        
        if (!$notificationId) {
            $this->error('請指定通知');
        }
        
        $notification = $this->db->find(
            "SELECT * FROM `notifications` WHERE `id` = ? AND `user_id` = ?",
            [$notificationId, $userId]
        );
        
        if (!$notification) {
            $this->error('通知不存在');
        }
        
        $this->db->delete('notifications', '`id` = ?', [$notificationId]);
        
        $this->json([], '刪除成功');
    }
    
    /**
     * 获取未读数量
     */
    public function unreadCount()
    {
        $userId = $this->verifyUser();
        
        $count = $this->db->count('notifications', '`user_id` = ? AND `is_read` = 0', [$userId]);
        
        $this->json(['count' => $count]);
    }
    
    /**
     * 发送通知（内部使用/管理员）
     */
    public function send()
    {
        $this->verifyAdmin();
        
        $userId = $this->post('user_id');
        $title = $this->post('title');
        $content = $this->post('content');
        $type = $this->post('type', 'system');
        $data = $this->post('data');
        
        if (!$title || !$content) {
            $this->error('標題和內容不能為空');
        }
        
        if ($userId) {
            // 发送给指定用户
            $this->db->insert('notifications', [
                'user_id' => $userId,
                'title' => $title,
                'content' => $content,
                'type' => $type,
                'data' => is_array($data) ? json_encode($data) : $data,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        } else {
            // 广播给所有用户
            $users = $this->db->select("SELECT id FROM `users`");
            foreach ($users as $user) {
                $this->db->insert('notifications', [
                    'user_id' => $user['id'],
                    'title' => $title,
                    'content' => $content,
                    'type' => $type,
                    'data' => is_array($data) ? json_encode($data) : $data,
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
            }
        }
        
        $this->json([], '發送成功');
    }
}
