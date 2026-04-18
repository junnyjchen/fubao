/* @ts-nocheck */
/**
 * @fileoverview 用户反馈API
 * @description 接收和处理用户反馈
 * @module app/api/feedback/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取反馈列表（后台）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    let query = client
      .from('feedback')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询反馈失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
      total_pages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error) {
    console.error('获取反馈失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 提交用户反馈
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, contact, user_id, images } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: '請填寫反饋內容' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('feedback')
      .insert({
        type: type || 'other',
        content: content.trim(),
        contact: contact || null,
        user_id: user_id || null,
        images: images || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('提交反馈失败:', error);
      return NextResponse.json({ error: '提交失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '提交成功',
      data,
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    return NextResponse.json({ error: '提交失敗' }, { status: 500 });
  }
}
