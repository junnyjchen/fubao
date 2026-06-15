/**
 * AI 训练中心 - 从知识库生成问答对
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { knowledge_id } = await request.json();
    if (!knowledge_id) {
      return NextResponse.json({ error: '缺少knowledge_id参数' }, { status: 400 });
    }

    const knowledge = await queryOne('SELECT * FROM ai_knowledge WHERE id = ?', [knowledge_id]);
    if (!knowledge) {
      return NextResponse.json({ error: '知识库不存在' }, { status: 404 });
    }

    // 简单模拟生成问答对：从知识库内容自动提取
    const content = (knowledge as any).content || '';
    const title = (knowledge as any).title || '';
    const now = new Date().toISOString();

    // 生成基本问答对
    await query(
      `INSERT INTO ai_qa (question, answer, category, knowledge_id, keywords, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [`关于${title}的问题`, content, (knowledge as any).category || 'general', knowledge_id, JSON.stringify([title]), true, now, now]
    );

    return NextResponse.json({ data: { success: true, count: 1 } });
  } catch (error) {
    console.error('生成问答对失败:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
