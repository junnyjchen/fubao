import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update, remove, count } from '@/lib/db';

// GET /api/baike - 百科列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    // 按slug查单条
    if (slug) {
      const article = await queryOne('SELECT * FROM baike_articles WHERE slug = ?', [slug]);
      if (!article) {
        return NextResponse.json({ error: '文章不存在' }, { status: 404 });
      }
      return NextResponse.json({ data: article });
    }

    // 列表查询
    let where = '1=1';
    const params: unknown[] = [];

    if (search) {
      where += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where += ' AND category = ?';
      params.push(category);
    }

    const total = await count('baike_articles', where, params);
    const articles = await query(
      `SELECT * FROM baike_articles WHERE ${where} ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );

    // 获取所有分类
    const categories = await query('SELECT DISTINCT category FROM baike_articles WHERE category IS NOT NULL AND category != "" ORDER BY category');

    return NextResponse.json({
      data: articles,
      categories: categories.map((c: Record<string, unknown>) => c.category),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[Baike] 查询错误:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}

// POST /api/baike - 创建百科
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, category, cover_image, sort_order, status } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: '标题和slug必填' }, { status: 400 });
    }

    // 检查slug唯一性
    const existing = await queryOne('SELECT id FROM baike_articles WHERE slug = ?', [slug]);
    if (existing) {
      return NextResponse.json({ error: 'slug已存在' }, { status: 400 });
    }

    const id = await insert('baike_articles', {
      title,
      slug,
      content: content || '',
      category: category || '',
      cover_image: cover_image || '',
      sort_order: sort_order || 0,
      status: status !== undefined ? status : 1,
      views: 0,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ data: { id }, message: '创建成功' });
  } catch (error) {
    console.error('[Baike] 创建错误:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// PUT /api/baike - 更新百科
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID必填' }, { status: 400 });
    }

    data.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await update('baike_articles', data, { id });

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('[Baike] 更新错误:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// DELETE /api/baike - 删除百科
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID必填' }, { status: 400 });
    }

    await remove('baike_articles', { id: parseInt(id) });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('[Baike] 删除错误:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
