/**
 * @fileoverview 用户OAuth账号管理API
 * @description 获取和管理用户绑定的第三方账号
 * @module app/api/user/oauth-accounts/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 临时用户ID（开发环境使用） */
const TEMP_USER_ID = 'guest-user-001';

/**
 * 获取用户绑定的OAuth账号列表
 */
export async function GET() {
  try {
    const client = getSupabaseClient();

    // 获取认证用户
    const { data: { user: authUser } } = await client.auth.getUser();
    const userId = authUser?.id || TEMP_USER_ID;

    // 获取用户绑定的OAuth账号
    const { data: accounts, error } = await client
      .from('user_oauth_accounts')
      .select('id, provider, provider_email, provider_name, provider_avatar, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取OAuth账号列表失败:', error);
      return NextResponse.json({ error: '獲取賬號列表失敗' }, { status: 500 });
    }

    // 获取所有可用的OAuth提供商
    const { data: providers } = await client
      .from('oauth_providers')
      .select('provider, display_name, enabled, icon_url')
      .order('sort_order', { ascending: true });

    // 合并数据，显示每个提供商的绑定状态
    const result = (providers || []).map(p => {
      const bound = accounts?.find(a => a.provider === p.provider);
      return {
        provider: p.provider,
        display_name: p.display_name,
        enabled: p.enabled,
        icon_url: p.icon_url,
        bound: !!bound,
        account: bound ? {
          id: bound.id,
          email: bound.provider_email,
          name: bound.provider_name,
          avatar: bound.provider_avatar,
          bound_at: bound.created_at,
        } : null,
      };
    });

    return NextResponse.json({ providers: result });
  } catch (error) {
    console.error('获取OAuth账号列表失败:', error);
    return NextResponse.json({ error: '獲取賬號列表失敗' }, { status: 500 });
  }
}

/**
 * 解绑OAuth账号
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: '缺少提供商參數' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取认证用户
    const { data: { user: authUser } } = await client.auth.getUser();
    const userId = authUser?.id || TEMP_USER_ID;

    // 检查用户是否有密码（防止解绑后无法登录）
    const { data: user } = await client
      .from('users')
      .select('password')
      .eq('id', userId)
      .maybeSingle();

    // 检查其他绑定的账号数量
    const { count } = await client
      .from('user_oauth_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 如果没有密码且只有一个OAuth账号，不允许解绑
    if (!user?.password && (count || 0) <= 1) {
      return NextResponse.json({ 
        error: '這是您唯一的登錄方式，請先設置密碼或綁定其他登錄方式' 
      }, { status: 400 });
    }

    // 解绑账号
    const { error } = await client
      .from('user_oauth_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) {
      console.error('解绑OAuth账号失败:', error);
      return NextResponse.json({ error: '解綁失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '解綁成功' });
  } catch (error) {
    console.error('解绑OAuth账号失败:', error);
    return NextResponse.json({ error: '解綁失敗' }, { status: 500 });
  }
}
