/**
 * @fileoverview 文章详情 API
 * @description 提供文章的查询、更新和删除接口
 * @module app/api/articles/[slug]/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取文章详情
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 文章详情响应
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();
    
    // 先尝试通过 slug 查找
    let query = client
      .from('articles')
      .select('*');

    // 判断是否为数字 ID
    const isNumericId = /^\d+$/.test(slug);
    
    if (isNumericId) {
      query = query.eq('id', parseInt(slug));
    } else {
      query = query.eq('slug', slug);
    }

    const { data: article, error } = await query.execute().then(r => ({ data: r.data, error: r.error }));single();

    if (error || !article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 更新阅读量（仅前台访问时）
    const referer = request.headers.get('referer') || '';
    if (!referer.includes('/admin')) {
      await client
        .from('articles')
        .update({ views: article.views + 1 })
        .eq('id', article.id);
    }

    // 获取相关文章
    const { data: relatedArticles } = await client
      .from('articles')
      .select('id, title, slug, cover, summary, views')
      .eq('status', true)
      .eq('category_id', article.category_id)
      .neq('id', article.id)
      .limit(4);

    return NextResponse.json({
      data: {
        ...article,
        relatedArticles: relatedArticles || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '獲取文章失敗' },
      { status: 500 }
    );
  }
}

/**
 * 更新文章
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 更新结果
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const isNumericId = /^\d+$/.test(slug);
    const id = isNumericId ? parseInt(slug) : null;

    if (!id) {
      return NextResponse.json({ error: '無效的文章ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 只更新提供的字段
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.cover !== undefined) updateData.cover = body.cover;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.sort !== undefined) updateData.sort = body.sort;

    const { data, error } = await client
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: '文章更新成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '更新文章失敗' },
      { status: 500 }
    );
  }
}

/**
 * 删除文章
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 删除结果
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();

    const isNumericId = /^\d+$/.test(slug);
    const id = isNumericId ? parseInt(slug) : null;

    if (!id) {
      return NextResponse.json({ error: '無效的文章ID' }, { status: 400 });
    }

    const { error } = await client
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '文章刪除成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '刪除文章失敗' },
      { status: 500 }
    );
  }
}
