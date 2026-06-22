/**
 * AI 训练中心 - 搜索知识库
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    let where = '1=1';
    const params: any[] = [];

    if (q) {
      where += ` AND (title LIKE ? OR content LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      where += ` AND category = ?`;
      params.push(category);
    }

    const list = await query(
      `SELECT * FROM ai_knowledge WHERE ${where} ORDER BY created_at DESC LIMIT ?`,
      [...params, limit]
    );

    return NextResponse.json({ success: true, data: { list: list || [] } });
  } catch (error) {
    console.error('搜索知识库失败:', error);
    return NextResponse.json({ success: true, data: { list: [] } });
  }
}
