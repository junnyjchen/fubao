/**
 * @fileoverview 商户评价详情API
 * @description 回复评价
 * @module app/api/merchant/reviews/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT - 回复评价
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reply } = body;

    if (!reply?.trim()) {
      return NextResponse.json(
        { error: '請填寫回復內容' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 更新评价回复
    const { data, error } = await client
      .from('reviews')
      .update({
        reply: reply.trim(),
        reply_time: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('回复评价失败:', error);
      return NextResponse.json({ error: '回復失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '回復成功',
      data,
    });
  } catch (error) {
    console.error('回复评价失败:', error);
    return NextResponse.json({ error: '回復失敗' }, { status: 500 });
  }
}
