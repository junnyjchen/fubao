/**
 * AI 训练中心 - 训练任务列表
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const status = searchParams.get('status') || '';

    let where = '1=1';
    const params: any[] = [];

    if (status) {
      where += ` AND status = ?`;
      params.push(status);
    }

    const total = await count('ai_training_tasks', where, params);
    const list = await query(
      `SELECT * FROM ai_training_tasks WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );

    return NextResponse.json({
      data: {
        list: list || [],
        total,
        page,
        page_size: pageSize,
      }
    });
  } catch (error) {
    console.error('获取训练任务列表失败:', error);
    return NextResponse.json({ data: { list: [], total: 0, page: 1, page_size: 10 } });
  }
}
