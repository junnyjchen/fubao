/**
 * AI 训练中心 - 创建问答对
 */
import { NextRequest, NextResponse } from 'next/server';
import { insert } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, category, knowledge_id, keywords } = body;

    if (!question || !answer) {
      return NextResponse.json({ success: false, error: '問題和答案不能為空' }, { status: 400 });
    }

    const id = await insert('ai_qa', {
      question,
      answer,
      category: category || 'general',
      knowledge_id: knowledge_id || null,
      keywords: JSON.stringify(keywords || []),
      is_active: 1,
    });

    if (!id || id === 0) {
      return NextResponse.json({ success: false, error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '創建成功', data: { id } });
  } catch (error) {
    console.error('創建問答對失敗:', error);
    const msg = error instanceof Error ? error.message : '創建失敗';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
