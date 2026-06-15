/**
 * AI 训练中心 - 知识库详情
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, update, remove } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少id参数' }, { status: 400 });
    }
    const item = await queryOne('SELECT * FROM ai_knowledge WHERE id = ?', [parseInt(id)]);
    if (!item) {
      return NextResponse.json({ error: '知识库不存在' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error('获取知识库详情失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
