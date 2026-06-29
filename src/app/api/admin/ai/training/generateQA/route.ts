/**
 * AI 训练中心 - 从知识库生成问答对
 */
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, insert } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { knowledge_id } = await request.json();
    if (!knowledge_id) {
      return NextResponse.json({ success: false, error: '缺少knowledge_id參數' }, { status: 400 });
    }

    const knowledge = await queryOne('SELECT * FROM ai_knowledge WHERE id = ?', [knowledge_id]);
    if (!knowledge) {
      return NextResponse.json({ success: false, error: '知識庫不存在' }, { status: 404 });
    }

    const content = (knowledge as any).content || '';
    const title = (knowledge as any).title || '';
    const category = (knowledge as any).category || 'general';

    // 生成基本问答对
    const insertId = await insert('ai_qa', {
      question: `關於${title}的問題`,
      answer: content,
      category,
      knowledge_id,
      keywords: JSON.stringify([title]),
      is_active: true,
    });

    if (!insertId) {
      return NextResponse.json({ success: false, error: '生成問答對失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { count: 1 } });
  } catch (error) {
    console.error('生成問答對失敗:', error);
    const msg = error instanceof Error ? error.message : '生成失敗';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
