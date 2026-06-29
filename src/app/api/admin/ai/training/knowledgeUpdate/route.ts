/**
 * AI 训练中心 - 知识库更新
 */
import { NextRequest, NextResponse } from 'next/server';
import { update } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, category, source_type, source_url, tags, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少id參數' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (source_type !== undefined) updateData.source_type = source_type;
    if (source_url !== undefined) updateData.source_url = source_url;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: '沒有需要更新的欄位' }, { status: 400 });
    }

    await update('ai_knowledge', updateData, { id });

    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新知識庫失敗:', error);
    const msg = error instanceof Error ? error.message : '更新失敗';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
