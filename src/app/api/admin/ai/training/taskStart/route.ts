/**
 * AI 训练中心 - 启动训练任务
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: '缺少id参数' }, { status: 400 });
    }

    const now = new Date().toISOString();
    await query(
      `UPDATE ai_training_tasks SET status = ?, started_at = ?, updated_at = ? WHERE id = ?`,
      ['running', now, now, id]
    );

    return NextResponse.json({ success: true, message: '训练任务已启动' });
  } catch (error) {
    console.error('启动训练任务失败:', error);
    return NextResponse.json({ error: '启动失败' }, { status: 500 });
  }
}
