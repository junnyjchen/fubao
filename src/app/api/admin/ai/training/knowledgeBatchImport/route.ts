/**
 * AI 训练中心 - 批量导入知识库
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, category } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: '导入数据不能为空' }, { status: 400 });
    }

    const now = new Date().toISOString();
    let imported = 0;

    for (const item of data) {
      if (!item.title || !item.content) continue;
      await query(
        `INSERT INTO ai_knowledge (title, content, category, source_type, tags, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.title, item.content, item.category || category || 'general', 'import', JSON.stringify(item.tags || []), 'active', now, now]
      );
      imported++;
    }

    return NextResponse.json({ data: { success: true, imported, failed: data.length - imported } });
  } catch (error) {
    console.error('批量导入知识库失败:', error);
    return NextResponse.json({ error: '导入失败' }, { status: 500 });
  }
}
