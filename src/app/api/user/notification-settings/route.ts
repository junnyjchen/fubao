/**
 * @fileoverview 通知设置API
 * @description 管理用户通知偏好设置
 * @module app/api/user/notification-settings/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

// 默认通知设置
const defaultSettings = {
  order_updates: true,       // 订单状态更新
  promotions: true,          // 促销活动
  system: true,              // 系统通知
  messages: true,            // 站内消息
  email_notifications: false, // 邮件通知
  sms_notifications: false,   // 短信通知
};

/**
 * 获取通知设置
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '無效的令牌' }, { status: 401 });
    }

    const client = getSupabaseClient();
    
    // 获取用户设置
    const { data: settings, error } = await client
      .from('user_settings')
      .select('notification_settings')
      .eq('user_id', decoded.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('获取通知设置失败:', error);
      return NextResponse.json(
        { error: '獲取設置失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: settings?.notification_settings || defaultSettings,
    });
  } catch (error) {
    console.error('获取通知设置错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * 更新通知设置
 */
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

    const body = await request.json();
    const client = getSupabaseClient();

    // 更新或插入设置
    const { error } = await client
      .from('user_settings')
      .upsert({
        user_id: decoded.userId,
        notification_settings: body,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('更新通知设置失败:', error);
      return NextResponse.json(
        { error: '更新失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '設置已保存',
    });
  } catch (error) {
    console.error('更新通知设置错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
