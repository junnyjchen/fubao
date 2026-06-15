/**
 * AI 训练中心 - 更新问答对
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, question, answer, category, keywords, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少id参数' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [now];

    if (question !== undefined) { updates.push('question = ?'); params.push(question); }
    if (answer !== undefined) { updates.push('answer = ?'); params.push(answer); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (keywords !== undefined) { updates.push('keywords = ?'); params.push(JSON.stringify(keywords)); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

    params.push(id);
    await query(`UPDATE ai_qa SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新问答对失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
