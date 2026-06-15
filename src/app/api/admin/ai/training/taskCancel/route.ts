/**
 * AI 训练中心 - 取消训练任务
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
      `UPDATE ai_training_tasks SET status = ?, updated_at = ? WHERE id = ?`,
      ['cancelled', now, now, id]
    );

    return NextResponse.json({ success: true, message: '训练任务已取消' });
  } catch (error) {
    console.error('取消训练任务失败:', error);
    return NextResponse.json({ error: '取消失败' }, { status: 500 });
  }
}
