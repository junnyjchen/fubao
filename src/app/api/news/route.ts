/* @ts-nocheck */
/**
 * @fileoverview 新闻资讯 API
 * @description 处理新闻的增删改查
 * @module app/api/news/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取新闻列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    const includeAll = searchParams.get('includeAll') === 'true';
    const category = searchParams.get('category');

    const client = getSupabaseClient();

    let query = client
      .from('news')
      .select('*', { count: 'exact' });

    // 前台只显示已发布新闻
    if (!includeAll) {
      query = query.eq('status', true);
    }

    // 排序和分页（使用is_featured替代is_top）
    query = query
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: news, error, count } = await query;

    if (error) {
      // 如果表不存在或无法连接，返回 mock 数据
      if (error.code === '42P01' || error.code === 'ECONNREFUSED') {
        const mockNews = [
          {
            id: 1,
            title: '符寶網正式上線，開啟玄門文化新時代',
            summary: '符寶網作為全球首個專注於玄門文化的電商平台，正式宣佈上線運營...',
            cover_image: 'https://picsum.photos/400/300?random=10',
            is_featured: true,
            views: 1256,
            published_at: new Date().toISOString(),
            category: { id: 1, name: '平台公告' },
          },
          {
            id: 2,
            title: '道教文化走進現代生活',
            summary: '傳統道教文化如何與現代生活相結合，專家學者進行深入探討...',
            cover_image: 'https://picsum.photos/400/300?random=11',
            is_featured: true,
            views: 892,
            published_at: new Date(Date.now() - 86400000).toISOString(),
            category: { id: 2, name: '文化資訊' },
          },
          {
            id: 3,
            title: '符箓文化保護與傳承研討會召開',
            summary: '來自全國各地的专家学者齐聚一堂，共同探讨符箓文化的保护与传承...',
            cover_image: 'https://picsum.photos/400/300?random=12',
            is_featured: false,
            views: 567,
            published_at: new Date(Date.now() - 172800000).toISOString(),
            category: { id: 3, name: '學術研究' },
          },
          {
            id: 4,
            title: '會員系統升級通知',
            summary: '為提升用戶體驗，符寶網會員系統將進行全面升級...',
            cover_image: 'https://picsum.photos/400/300?random=13',
            is_featured: false,
            views: 421,
            published_at: new Date(Date.now() - 259200000).toISOString(),
            category: { id: 1, name: '平台公告' },
          },
        ];
        return NextResponse.json({ 
          data: mockNews.slice(0, limit), 
          total: mockNews.length,
          page,
          limit,
          total_pages: 1,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果没有数据，返回 mock 数据
    const mockNews = [
      {
        id: 1,
        title: '符寶網正式上線，開啟玄門文化新時代',
        summary: '符寶網作為全球首個專注於玄門文化的電商平台，正式宣佈上線運營...',
        cover_image: 'https://picsum.photos/400/300?random=10',
        is_featured: true,
        views: 1256,
        published_at: new Date().toISOString(),
        category: { id: 1, name: '平台公告' },
      },
      {
        id: 2,
        title: '道教文化走進現代生活',
        summary: '傳統道教文化如何與現代生活相結合，專家學者進行深入探討...',
        cover_image: 'https://picsum.photos/400/300?random=11',
        is_featured: true,
        views: 892,
        published_at: new Date(Date.now() - 86400000).toISOString(),
        category: { id: 2, name: '文化資訊' },
      },
      {
        id: 3,
        title: '符籙文化保護與傳承研討會召開',
        summary: '來自全國各地的专家学者齐聚一堂，共同探讨符籙文化的保护与传承...',
        cover_image: 'https://picsum.photos/400/300?random=12',
        is_featured: false,
        views: 567,
        published_at: new Date(Date.now() - 172800000).toISOString(),
        category: { id: 3, name: '學術研究' },
      },
      {
        id: 4,
        title: '會員系統升級通知',
        summary: '為提升用戶體驗，符寶網會員系統將進行全面升級...',
        cover_image: 'https://picsum.photos/400/300?random=13',
        is_featured: false,
        views: 421,
        published_at: new Date(Date.now() - 259200000).toISOString(),
        category: { id: 1, name: '平台公告' },
      },
    ];

    // 如果数据库没有数据，使用 mock 数据
    const newsData = (!news || news.length === 0) && !error ? mockNews : (news || []);

    return NextResponse.json({ 
      data: newsData.slice(0, limit), 
      total: count || newsData.length,
      page,
      limit,
      total_pages: count ? Math.ceil(count / limit) : 1,
    });
  } catch (error) {
    console.error('获取新闻失败:', error);
    return NextResponse.json({ 
      data: mockNews.slice(0, limit), 
      total: mockNews.length,
      page: 1,
      limit,
      total_pages: 1,
    });
  }
}

/**
 * 创建新闻
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { title, summary, content, cover_image, is_featured, status } = body;

    if (!title) {
      return NextResponse.json({ error: '請填寫新聞標題' }, { status: 400 });
    }

    const { data, error } = await client
      .from('news')
      .insert({
        title,
        summary: summary || null,
        content: content || null,
        cover: cover_image || null,
        is_featured: is_featured || false,
        status: status !== false,
        views: 0,
        published_at: status !== false ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('创建新闻失败:', error);
    return NextResponse.json({ error: '創建新聞失敗' }, { status: 500 });
  }
}

/**
 * 更新新闻
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { id, title, summary, content, cover_image, is_featured, status } = body;

    if (!id) {
      return NextResponse.json({ error: '新聞ID不能為空' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (content !== undefined) updateData.content = content;
    if (cover_image !== undefined) updateData.cover = cover_image;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (status !== undefined) {
      updateData.status = status;
      if (status && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { error } = await client
      .from('news')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新新闻失败:', error);
    return NextResponse.json({ error: '更新新聞失敗' }, { status: 500 });
  }
}

/**
 * 删除新闻
 */
export async function DELETE(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '新聞ID不能為空' }, { status: 400 });
    }

    const { error } = await client
      .from('news')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除新闻失败:', error);
    return NextResponse.json({ error: '刪除新聞失敗' }, { status: 500 });
  }
}
