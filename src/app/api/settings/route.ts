/**
 * @fileoverview 系统设置 API
 * @description 提供系统设置的查询和更新接口
 * @module app/api/settings/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取系统设置
 * @param request - 请求对象
 * @returns 系统设置响应
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  try {
    const client = getSupabaseClient();

    if (key) {
      // 获取单个设置
      const { data, error } = await client
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } else {
      // 获取所有设置
      const { data, error } = await client
        .from('settings')
        .select('*')
        .order('group', { ascending: true })
        .order('sort', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // 按组分类
      const groupedData = (data || []).reduce(
        (acc, item) => {
          const group = item.group || 'general';
          if (!acc[group]) {
            acc[group] = [];
          }
          acc[group].push(item);
          return acc;
        },
        {} as Record<string, typeof data>
      );

      return NextResponse.json({ data: groupedData });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * 更新系统设置
 * @param request - 请求对象
 * @returns 更新结果
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 批量更新
    const updates = Object.entries(body).map(async ([key, value]) => {
      // 检查是否存在
      const { data: existing } = await client
        .from('settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        // 更新
        return client
          .from('settings')
          .update({
            value: String(value),
            updated_at: new Date().toISOString(),
          })
          .eq('key', key);
      } else {
        // 新增
        return client.from('settings').insert({
          key,
          value: String(value),
          group: 'general',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    });

    await Promise.all(updates);

    return NextResponse.json({ message: '設置保存成功' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
