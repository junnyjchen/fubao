/**
 * @fileoverview 用户通知API
 * @description 获取用户通知列表、标记已读、删除通知
 * @module app/api/notifications/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, update, remove } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params: unknown[] = [userId];

    if (unreadOnly) {
      sql += ' AND `read` = ?';
      params.push(false);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const notifications = await query(sql, params);

    // 获取未读数量
    const unreadResult = await query(
      'SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND `read` = ?',
      [userId, false]
    );
    const unreadCount = (unreadResult as any[])?.[0]?.cnt || 0;

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('通知API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

// 标记通知为已读
export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, all } = body;

    if (all) {
      // 标记该用户所有通知为已读 - 先查询再逐个更新
      const unreadList = await query(
        'SELECT id FROM notifications WHERE user_id = ? AND `read` = ?',
        [userId, false]
      );
      for (const n of unreadList as any[]) {
        await update('notifications', { read: true }, { id: n.id, user_id: userId });
      }
    } else if (notificationId) {
      // 标记单个通知为已读
      await update('notifications', { read: true }, { id: notificationId, user_id: userId });
    } else {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('标记已读API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

// 删除通知
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    if (all) {
      // 删除该用户所有通知
      await remove('notifications', { user_id: userId });
    } else if (notificationId) {
      // 删除单个通知
      await remove('notifications', { id: parseInt(notificationId), user_id: userId });
    } else {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除通知API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
