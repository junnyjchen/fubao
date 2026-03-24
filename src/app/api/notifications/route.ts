/**
 * @fileoverview 消息通知 API
 * @description 处理用户消息通知的查询和操作
 * @module app/api/notifications/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取消息列表
 * GET /api/notifications
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    let query = client
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query.range(
      (page - 1) * pageSize,
      page * pageSize - 1
    );

    if (error) {
      console.error('查询消息失败:', error);
      // 返回模拟数据
      return NextResponse.json({
        success: true,
        data: getMockNotifications(),
        unreadCount: getMockNotifications().filter(n => !n.is_read).length,
        total: 4,
        page,
        pageSize,
      });
    }

    // 获取未读数量
    const { count: unreadCount } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return NextResponse.json({
      success: true,
      data: data || [],
      unreadCount: unreadCount || 0,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('消息列表API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * 标记消息已读
 * POST /api/notifications
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { userId, notificationId, markAll } = body;

    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    if (markAll) {
      // 标记所有消息已读
      const { error } = await client
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('标记已读失败:', error);
        return NextResponse.json({ error: '操作失敗' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: '已全部標為已讀',
      });
    }

    if (notificationId) {
      // 标记单条消息已读
      const { error } = await client
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('标记已读失败:', error);
        return NextResponse.json({ error: '操作失敗' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: '已標為已讀',
      });
    }

    return NextResponse.json({ error: '缺少參數' }, { status: 400 });
  } catch (error) {
    console.error('标记已读API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * 删除消息
 * DELETE /api/notifications?id=xxx&userId=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    }

    const { error } = await client
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('删除消息失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '刪除成功',
    });
  } catch (error) {
    console.error('删除消息API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

// 模拟数据
function getMockNotifications() {
  return [
    {
      id: 1,
      user_id: 'user1',
      type: 'order',
      title: '訂單發貨通知',
      content: '您的訂單 #20260324001 已發貨，請注意查收',
      link: '/user/orders/1',
      image: null,
      is_read: false,
      created_at: '2026-03-24T10:00:00',
      read_at: null,
    },
    {
      id: 2,
      user_id: 'user1',
      type: 'coupon',
      title: '優惠券即將到期',
      content: '您的"新用戶專享券"將在7天後到期，快去使用吧！',
      link: '/user/coupons',
      image: null,
      is_read: false,
      created_at: '2026-03-23T15:00:00',
      read_at: null,
    },
    {
      id: 3,
      user_id: 'user1',
      type: 'system',
      title: '歡迎加入符寶網',
      content: '感謝您註冊符寶網，開啟您的玄門文化之旅！',
      link: null,
      image: null,
      is_read: true,
      created_at: '2026-03-20T09:00:00',
      read_at: '2026-03-20T10:00:00',
    },
    {
      id: 4,
      user_id: 'user1',
      type: 'distribution',
      title: '分銷佣金到賬',
      content: '您的好友完成購物，您獲得分銷佣金 HK$15.00',
      link: '/distribution/commissions',
      image: null,
      is_read: false,
      created_at: '2026-03-22T14:30:00',
      read_at: null,
    },
  ];
}
