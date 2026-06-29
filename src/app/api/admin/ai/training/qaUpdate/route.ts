/**
 * AI 训练中心 - 更新问答对
 */
import { NextRequest, NextResponse } from 'next/server';
import { update } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, question, answer, category, keywords, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少id參數' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (category !== undefined) updateData.category = category;
    if (keywords !== undefined) updateData.keywords = JSON.stringify(keywords);
    if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: '沒有需要更新的欄位' }, { status: 400 });
    }

    await update('ai_qa', updateData, { id });
    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新問答對失敗:', error);
    const msg = error instanceof Error ? error.message : '更新失敗';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
