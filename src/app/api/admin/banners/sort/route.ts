/**
 * @fileoverview 管理后台轮播图排序API
 * @description 更新轮播图排序
 * @module app/api/admin/banners/sort/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, direction } = body;

    if (!id || !direction) {
      return NextResponse.json({ error: '參數錯誤' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取当前轮播图
    const { data: currentBanner, error: fetchError } = await client
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentBanner) {
      return NextResponse.json({ error: '找不到輪播圖' }, { status: 404 });
    }

    // 获取相邻的轮播图
    const operator = direction === 'up' ? 'lt' : 'gt';
    const orderDirection = direction === 'up' ? { ascending: false } : { ascending: true };

    const { data: adjacentBanner } = await client
      .from('banners')
      .select('*')
      .eq('position', currentBanner.position)
      [operator]('sort', currentBanner.sort)
      .order('sort', orderDirection)
      .limit(1)
      .single();

    if (!adjacentBanner) {
      return NextResponse.json({ error: '無法移動' }, { status: 400 });
    }

    // 交换排序值
    const currentSort = currentBanner.sort;
    const adjacentSort = adjacentBanner.sort;

    await client
      .from('banners')
      .update({ sort: adjacentSort })
      .eq('id', currentBanner.id);

    await client
      .from('banners')
      .update({ sort: currentSort })
      .eq('id', adjacentBanner.id);

    return NextResponse.json({ message: '排序更新成功' });
  } catch (error) {
    console.error('更新排序失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
