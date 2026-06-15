/**
 * AI 训练中心 - 知识库删除
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: '缺少id参数' }, { status: 400 });
    }
    await query('DELETE FROM ai_knowledge WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除知识库失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
