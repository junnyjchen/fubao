/**
 * AI 训练中心 - 知识库详情
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少id參數' }, { status: 400 });
    }
    const item = await queryOne('SELECT * FROM ai_knowledge WHERE id = ?', [parseInt(id)]) as any;
    if (!item) {
      return NextResponse.json({ success: false, error: '知識庫不存在' }, { status: 404 });
    }
    // 解析 tags JSON
    if (typeof item.tags === 'string') {
      try { item.tags = JSON.parse(item.tags); } catch { item.tags = []; }
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('獲取知識庫詳情失敗:', error);
    return NextResponse.json({ success: false, error: '獲取失敗' }, { status: 500 });
  }
}
