/**
 * @fileoverview 文章 API
 * @description 提供文章的增删改查接口，支持本地 mock 模式
 * @module app/api/articles/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 确保 mock 数据存储
if (!(globalThis as Record<string, unknown>).mockArticles) {
  (globalThis as Record<string, unknown>).mockArticles = [
    {
      id: 1, title: '風水入門指南', slug: 'fengshui-guide',
      summary: '了解風水的基本概念和原理', content: '<p>風水是中國傳統文化的重要組成部分...</p>',
      cover: '/images/fengshui.jpg', category_id: 1, category: 'fengshui',
      status: true, is_featured: true, sort: 0, views: 256,
      created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-15T00:00:00Z',
    },
    {
      id: 2, title: '道教符咒文化', slug: 'daoist-talisman',
      summary: '探索道教符咒的歷史和意義', content: '<p>符咒是道教文化中的獨特現象...</p>',
      cover: '/images/talisman.jpg', category_id: 2, category: 'daoism',
      status: true, is_featured: false, sort: 0, views: 189,
      created_at: '2025-01-02T00:00:00Z', updated_at: '2025-01-14T00:00:00Z',
    },
    {
      id: 3, title: '八字命理基礎', slug: 'bazi-basics',
      summary: '學習八字命理的基本知識', content: '<p>八字命理是中國古老的命運預測術...</p>',
      cover: '/images/bazi.jpg', category_id: 3, category: 'bazi',
      status: true, is_featured: true, sort: 0, views: 342,
      created_at: '2025-01-03T00:00:00Z', updated_at: '2025-01-13T00:00:00Z',
    },
  ];
}

function getMockArticles() {
  return (globalThis as Record<string, unknown>).mockArticles as Record<string, unknown>[];
}

function setMockArticles(articles: Record<string, unknown>[]) {
  (globalThis as Record<string, unknown>).mockArticles = articles;
}

/**
 * 获取文章列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');

    try {
      const client = getSupabaseClient();
      let query = client.from('articles').select('*').eq('status', true);

      if (category) {
        query = query.eq('category', category);
      }
      if (keyword) {
        query = query.ilike('title', `%${keyword}%`);
      }

      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return NextResponse.json({ data, total: data.length, page, page_size: pageSize });
      }
    } catch {
      // 数据库不可用，使用 mock
    }

    // Mock fallback
    let articles = getMockArticles().filter((a: Record<string, unknown>) => a.status === true);
    if (category) {
      articles = articles.filter((a: Record<string, unknown>) => a.category === category);
    }
    if (keyword) {
      articles = articles.filter((a: Record<string, unknown>) => (a.title as string).includes(keyword));
    }

    return NextResponse.json({ data: articles, total: articles.length, page, page_size: pageSize });
  } catch (error) {
    return NextResponse.json({ error: '獲取文章列表失敗' }, { status: 500 });
  }
}

/**
 * 创建文章
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.title) {
      return NextResponse.json({ error: '文章標題不能為空' }, { status: 400 });
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('articles')
        .insert({
          title: body.title,
          slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
          summary: body.summary || '',
          content: body.content || '',
          cover: body.cover || '',
          category_id: body.category_id || body.category || null,
          category: body.category || null,
          status: body.status !== undefined ? body.status : true,
          is_featured: body.is_featured || false,
          sort: body.sort || 0,
          views: 0,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ data, message: '文章創建成功' }, { status: 201 });
      }
    } catch {
      // 数据库不可用，使用 mock
    }

    // Mock fallback
    const articles = getMockArticles();
    const newArticle = {
      id: articles.length > 0 ? Math.max(...articles.map((a: Record<string, unknown>) => a.id as number)) + 1 : 1,
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
      summary: body.summary || '',
      content: body.content || '',
      cover: body.cover || '',
      category_id: body.category_id || body.category || null,
      category: body.category || null,
      status: body.status !== undefined ? body.status : true,
      is_featured: body.is_featured || false,
      sort: body.sort || 0,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    articles.push(newArticle);
    setMockArticles(articles);

    return NextResponse.json({ data: newArticle, message: '文章創建成功（本地模式）' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '創建文章失敗' }, { status: 500 });
  }
}
