/**
 * @fileoverview 第三方登录配置管理API
 * @description 管理OAuth提供商配置
 * @module app/api/admin/oauth-providers/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取所有OAuth提供商配置
 */
export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('oauth_providers')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: '獲取配置失敗' }, { status: 500 });
    }

    // 隐藏敏感信息
    const sanitizedData = data.map(provider => ({
      ...provider,
      client_secret: provider.client_secret ? '******' : null,
    }));

    return NextResponse.json({ data: sanitizedData });
  } catch (error) {
    console.error('获取OAuth配置失败:', error);
    return NextResponse.json({ error: '獲取配置失敗' }, { status: 500 });
  }
}

/**
 * 更新OAuth提供商配置（支持单个或批量更新）
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 支持批量更新
    if (body.providers && Array.isArray(body.providers)) {
      for (const provider of body.providers) {
        if (!provider.id) continue;

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (provider.client_id !== undefined) updateData.client_id = provider.client_id;
        if (provider.client_secret !== undefined && provider.client_secret !== '******') {
          updateData.client_secret = provider.client_secret;
        }
        if (provider.redirect_uri !== undefined) updateData.redirect_uri = provider.redirect_uri;
        if (provider.scopes !== undefined) updateData.scopes = provider.scopes;
        if (provider.enabled !== undefined) updateData.enabled = provider.enabled;

        const { error } = await client
          .from('oauth_providers')
          .update(updateData)
          .eq('id', provider.id);

        if (error) {
          console.error('更新OAuth配置失败:', error);
          return NextResponse.json({ error: '更新配置失敗' }, { status: 500 });
        }
      }
      return NextResponse.json({ message: '批量更新成功' });
    }

    // 单个更新
    const { id, client_id, client_secret, redirect_uri, scopes, enabled } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少配置ID' }, { status: 400 });
    }
    
    // 构建更新数据
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (client_id !== undefined) updateData.client_id = client_id;
    if (client_secret !== undefined && client_secret !== '******') {
      updateData.client_secret = client_secret;
    }
    if (redirect_uri !== undefined) updateData.redirect_uri = redirect_uri;
    if (scopes !== undefined) updateData.scopes = scopes;
    if (enabled !== undefined) updateData.enabled = enabled;

    const { error } = await client
      .from('oauth_providers')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('更新OAuth配置失败:', error);
      return NextResponse.json({ error: '更新配置失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新OAuth配置失败:', error);
    return NextResponse.json({ error: '更新配置失敗' }, { status: 500 });
  }
}
