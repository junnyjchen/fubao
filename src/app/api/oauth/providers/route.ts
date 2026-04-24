/**
 * @fileoverview 获取启用的OAuth提供商列表
 * @description 用于前端登录页面展示可用的第三方登录选项
 * @module app/api/oauth/providers/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * OAuth提供商信息（公开）
 */
interface PublicOAuthProvider {
  provider: string;
  display_name: string;
  icon_url: string | null;
}

/**
 * 获取已启用的OAuth提供商列表
 */
export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('oauth_providers')
      .select('provider, display_name, icon_url')
      .eq('enabled', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取OAuth提供商列表失败:', error);
      return NextResponse.json({ error: '獲取配置失敗' }, { status: 500 });
    }

    return NextResponse.json({ providers: data as PublicOAuthProvider[] });
  } catch (error) {
    console.error('获取OAuth提供商列表失败:', error);
    return NextResponse.json({ providers: [] });
  }
}
