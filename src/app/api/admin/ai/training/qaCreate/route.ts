/**
 * AI 训练中心 - 创建问答对
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, category, knowledge_id, keywords } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: '问题和答案不能为空' }, { status: 400 });
    }

    const now = new Date().toISOString();
    await query(
      `INSERT INTO ai_qa (question, answer, category, knowledge_id, keywords, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [question, answer, category || 'general', knowledge_id || null, JSON.stringify(keywords || []), true, now, now]
    );

    return NextResponse.json({ success: true, message: '创建成功' });
  } catch (error) {
    console.error('创建问答对失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
