/**
 * AI 训练中心 - 批量导入知识库
 */
import { NextRequest, NextResponse } from 'next/server';
import { insert } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, category } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ success: false, error: '導入數據不能為空' }, { status: 400 });
    }

    let imported = 0;
    let failed = 0;

    for (const item of data) {
      if (!item.title || !item.content) { failed++; continue; }
      try {
        const id = await insert('ai_knowledge', {
          title: item.title,
          content: item.content,
          category: item.category || category || 'general',
          source_type: 'import',
          tags: JSON.stringify(item.tags || []),
          status: 'active',
        });
        if (id && Number(id) > 0) { imported++; } else { failed++; }
      } catch { failed++; }
    }

    return NextResponse.json({ success: true, data: { imported, failed } });
  } catch (error) {
    console.error('批量導入知識庫失敗:', error);
    return NextResponse.json({ success: false, error: '導入失敗' }, { status: 500 });
  }
}
