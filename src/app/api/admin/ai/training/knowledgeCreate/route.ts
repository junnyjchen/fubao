/**
 * AI 训练中心 - 知识库创建
 */
import { NextRequest, NextResponse } from 'next/server';
import { insert } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, source_type, source_url, tags, status } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: '標題和內容不能為空' }, { status: 400 });
    }

    const id = await insert('ai_knowledge', {
      title,
      content,
      category: category || 'general',
      source_type: source_type || 'manual',
      source_url: source_url || '',
      tags: JSON.stringify(tags || []),
      status: status || 'active',
    });

    if (!id || id === 0) {
      return NextResponse.json({ success: false, error: '創建失敗，請檢查數據格式' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '創建成功', data: { id } });
  } catch (error) {
    console.error('創建知識庫失敗:', error);
    const msg = error instanceof Error ? error.message : '創建失敗';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
