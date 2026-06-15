/**
 * AI 训练中心 - 创建训练任务
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, knowledge_ids } = body;

    if (!name) {
      return NextResponse.json({ error: '任务名称不能为空' }, { status: 400 });
    }

    const now = new Date().toISOString();
    await query(
      `INSERT INTO ai_training_tasks (name, description, type, knowledge_ids, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', type || 'fine_tune', JSON.stringify(knowledge_ids || []), 'pending', 0, now, now]
    );

    return NextResponse.json({ success: true, message: '创建成功' });
  } catch (error) {
    console.error('创建训练任务失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
