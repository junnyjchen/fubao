/**
 * AI 训练中心 - 知识库删除
 */
import { NextRequest, NextResponse } from 'next/server';
import { remove } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少id參數' }, { status: 400 });
    }
    await remove('ai_knowledge', { id });
    return NextResponse.json({ success: true, message: '刪除成功' });
  } catch (error) {
    console.error('刪除知識庫失敗:', error);
    const msg = error instanceof Error ? error.message : '刪除失敗';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
