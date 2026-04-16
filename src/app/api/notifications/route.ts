/* @ts-nocheck */
/**
 * @fileoverview 用户通知API
 * @description 获取用户通知列表
 * @module app/api/notifications/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '無效的令牌' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // 构建查询
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('获取通知失败:', error);
      return NextResponse.json(
        { error: '獲取通知失敗' },
        { status: 500 }
      );
    }

    // 获取未读数量
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    return NextResponse.json({
      success: true,
      data: notifications || [],
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('通知API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}

// 标记通知为已读
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '無效的令牌' }, { status: 401 });
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { notificationId, all } = body;

    if (all) {
      // 标记所有通知为已读
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('标记所有通知已读失败:', error);
        return NextResponse.json(
          { error: '操作失敗' },
          { status: 500 }
        );
      }
    } else if (notificationId) {
      // 标记单个通知为已读
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('标记通知已读失败:', error);
        return NextResponse.json(
          { error: '操作失敗' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: '缺少參數' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('标记已读API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}

// 删除通知
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '無效的令牌' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    if (all) {
      // 删除所有通知
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('删除所有通知失败:', error);
        return NextResponse.json(
          { error: '操作失敗' },
          { status: 500 }
        );
      }
    } else if (notificationId) {
      // 删除单个通知
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('删除通知失败:', error);
        return NextResponse.json(
          { error: '操作失敗' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: '缺少參數' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除通知API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
