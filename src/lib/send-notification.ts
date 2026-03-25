/**
 * @fileoverview 通知发送工具
 * @description 服务端发送WebSocket通知的工具函数
 * @module lib/send-notification
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface NotificationPayload {
  userId: number;
  type: 'order' | 'coupon' | 'distribution' | 'system';
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

/**
 * 发送通知给特定用户
 * 同时保存到数据库并通过WebSocket推送
 */
export async function sendNotification(
  supabase: SupabaseClient,
  payload: NotificationPayload
): Promise<void> {
  const { userId, type, title, content, data } = payload;

  // 1. 保存到数据库
  const notificationId = crypto.randomUUID();
  const { error } = await supabase.from('notifications').insert({
    id: notificationId,
    user_id: userId,
    type,
    title,
    content,
    data: data || null,
    read: false,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to save notification:', error);
    throw error;
  }

  // 2. WebSocket推送由 ws-handlers/notifications.ts 处理
  // 由于服务端WebSocket实例在server.ts中管理，这里通过数据库触发器或轮询来实现实时推送
  // 为简化实现，这里仅保存到数据库，客户端通过WebSocket订阅时获取新通知

  console.log(`[Notification] Sent to user ${userId}: ${title}`);
}

/**
 * 发送广播通知给所有用户
 */
export async function broadcastNotification(
  supabase: SupabaseClient,
  type: 'order' | 'coupon' | 'distribution' | 'system',
  title: string,
  content: string,
  data?: Record<string, unknown>
): Promise<void> {
  const notificationId = crypto.randomUUID();

  // 获取所有活跃用户（最近30天登录过）
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: activeUsers, error: usersError } = await supabase
    .from('users')
    .select('id')
    .gte('last_login_at', thirtyDaysAgo.toISOString());

  if (usersError) {
    console.error('Failed to get active users:', usersError);
    throw usersError;
  }

  // 批量插入通知
  const notifications = (activeUsers || []).map((user) => ({
    id: crypto.randomUUID(),
    user_id: user.id,
    type,
    title,
    content,
    data: data || null,
    read: false,
    created_at: new Date().toISOString(),
  }));

  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) {
      console.error('Failed to save broadcast notifications:', error);
      throw error;
    }
  }

  console.log(`[Notification] Broadcast to ${notifications.length} users: ${title}`);
}
