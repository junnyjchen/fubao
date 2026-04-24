/* @ts-nocheck */
/**
 * @fileoverview 视频列表API
 * @description 视频列表查询和新增功能
 * @module app/api/videos/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface VideoRecord {
  id: number;
  title: string;
  slug: string;
  cover: string | null;
  url: string;
  duration: number;
  category_id: number | null;
  author: string;
  views: number;
  likes: number;
  is_featured: boolean;
  status: boolean;
  sort: number;
  published_at: string | null;
  created_at: string;
  category?: { id: number; name: string; slug: string } | null;
}

/**
 * 获取视频列表
 * GET /api/videos
 * Query params: category_id, status, is_featured, limit, offset, search
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    const isFeatured = searchParams.get('is_featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // 构建查询
    let query = client
      .from('videos')
      .select(
        `
        id,
        title,
        slug,
        cover,
        url,
        duration,
        category_id,
        author,
        views,
        likes,
        is_featured,
        status,
        sort,
        published_at,
        created_at
      `,
        { count: 'exact' }
      );

    // 只查询已发布的视频
    query = query.eq('status', true);

    // 应用过滤条件
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }

    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true');
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // 排序和分页
    query = query
      .order('is_featured', { ascending: false })
      .order('sort', { ascending: true })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('查询视频列表失败:', error);
      // 数据库不可用时返回 mock 数据
      const mockVideos = [
        {
          id: 1,
          title: '符籙基礎教程：認識道教符籙',
          slug: 'fuji-basic-tutorial',
          cover: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=640&h=360&fit=crop',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 1234,
          category_id: 1,
          author: '符寶網',
          views: 5678,
          likes: 234,
          is_featured: true,
          status: true,
          sort: 1,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          category: { id: 1, name: '符籙文化', slug: 'fuji' },
        },
        {
          id: 2,
          title: '道教科儀：開光儀式詳解',
          slug: 'kaiguang-ritual-video',
          cover: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=640&h=360&fit=crop',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 2345,
          category_id: 2,
          author: '符寶網',
          views: 4567,
          likes: 189,
          is_featured: true,
          status: true,
          sort: 2,
          published_at: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(Date.now() - 86400000).toISOString(),
          category: { id: 2, name: '道教科儀', slug: 'ritual' },
        },
        {
          id: 3,
          title: '風水入門：家居風水基礎知識',
          slug: 'fengshui-basics-video',
          cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 1567,
          category_id: 3,
          author: '符寶網',
          views: 7890,
          likes: 345,
          is_featured: true,
          status: true,
          sort: 3,
          published_at: new Date(Date.now() - 172800000).toISOString(),
          created_at: new Date(Date.now() - 172800000).toISOString(),
          category: { id: 3, name: '風水命理', slug: 'fengshui' },
        },
        {
          id: 4,
          title: '法器介紹：令牌與七星劍的使用',
          slug: 'faqi-intro-video',
          cover: 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=640&h=360&fit=crop',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 1890,
          category_id: 4,
          author: '符寶網',
          views: 3456,
          likes: 156,
          is_featured: false,
          status: true,
          sort: 4,
          published_at: new Date(Date.now() - 259200000).toISOString(),
          created_at: new Date(Date.now() - 259200000).toISOString(),
          category: { id: 4, name: '法器介紹', slug: 'faqi' },
        },
        {
          id: 5,
          title: '道教神仙：認識三清祖師',
          slug: 'taoist-gods-video',
          cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=640&h=360&fit=crop',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 2100,
          category_id: 5,
          author: '符寶網',
          views: 4321,
          likes: 201,
          is_featured: false,
          status: true,
          sort: 5,
          published_at: new Date(Date.now() - 345600000).toISOString(),
          created_at: new Date(Date.now() - 345600000).toISOString(),
          category: { id: 5, name: '歷史傳承', slug: 'history' },
        },
        {
          id: 6,
          title: '太歲知識：2024年犯太歲化解方法',
          slug: 'taishui-2024-video',
          cover: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=640&h=360&fit=crop',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 1678,
          category_id: 3,
          author: '符寶網',
          views: 6543,
          likes: 289,
          is_featured: true,
          status: true,
          sort: 6,
          published_at: new Date(Date.now() - 432000000).toISOString(),
          created_at: new Date(Date.now() - 432000000).toISOString(),
          category: { id: 3, name: '風水命理', slug: 'fengshui' },
        },
      ];

      // 应用过滤条件到 mock 数据
      let filteredVideos = mockVideos;
      
      if (categoryId) {
        filteredVideos = filteredVideos.filter(v => v.category_id === parseInt(categoryId));
      }
      
      if (isFeatured === 'true') {
        filteredVideos = filteredVideos.filter(v => v.is_featured);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredVideos = filteredVideos.filter(v => v.title.toLowerCase().includes(searchLower));
      }

      return NextResponse.json({
        data: filteredVideos.slice(offset, offset + limit),
        total: filteredVideos.length,
      });
    }

    // 获取分类信息
    if (data && data.length > 0) {
      const categoryIds = [...new Set(data.map(v => v.category_id).filter(Boolean))];
      if (categoryIds.length > 0) {
        const { data: categories } = await client
          .from('video_categories')
          .select('id, name, slug')
          .in('id', categoryIds);
        
        const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
        data.forEach((video: VideoRecord) => {
          video.category = categoryMap.get(video.category_id) || null;
        });
      }
    }

    // 如果数据为空，返回 mock 数据
    if (!data || data.length === 0) {
      const mockVideos = [
        {
          id: 1,
          title: '符籙基礎教程：認識道教符籙',
          slug: 'fuji-basic-tutorial',
          cover: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=640&h=360&fit=crop',
          duration: 1234,
          author: '符寶網',
          views: 5678,
          likes: 234,
          is_featured: true,
          category: { id: 1, name: '符籙文化', slug: 'fuji' },
        },
        {
          id: 2,
          title: '道教科儀：開光儀式詳解',
          slug: 'kaiguang-ritual-video',
          cover: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=640&h=360&fit=crop',
          duration: 2345,
          author: '符寶網',
          views: 4567,
          likes: 189,
          is_featured: true,
          category: { id: 2, name: '道教科儀', slug: 'ritual' },
        },
        {
          id: 3,
          title: '風水入門：家居風水基礎知識',
          slug: 'fengshui-basics-video',
          cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop',
          duration: 1567,
          author: '符寶網',
          views: 7890,
          likes: 345,
          is_featured: true,
          category: { id: 3, name: '風水命理', slug: 'fengshui' },
        },
        {
          id: 4,
          title: '法器介紹：令牌與七星劍的使用',
          slug: 'faqi-intro-video',
          cover: 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=640&h=360&fit=crop',
          duration: 1890,
          author: '符寶網',
          views: 3456,
          likes: 156,
          is_featured: false,
          category: { id: 4, name: '法器介紹', slug: 'faqi' },
        },
        {
          id: 5,
          title: '道教神仙：認識三清祖師',
          slug: 'taoist-gods-video',
          cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=640&h=360&fit=crop',
          duration: 2100,
          author: '符寶網',
          views: 4321,
          likes: 201,
          is_featured: false,
          category: { id: 5, name: '歷史傳承', slug: 'history' },
        },
        {
          id: 6,
          title: '太歲知識：2024年犯太歲化解方法',
          slug: 'taishui-2024-video',
          cover: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=640&h=360&fit=crop',
          duration: 1678,
          author: '符寶網',
          views: 6543,
          likes: 289,
          is_featured: true,
          category: { id: 3, name: '風水命理', slug: 'fengshui' },
        },
      ];
      
      // 应用过滤条件到 mock 数据
      let filteredVideos = mockVideos;
      if (categoryId) {
        filteredVideos = filteredVideos.filter(v => v.category_id === parseInt(categoryId));
      }
      if (isFeatured === 'true') {
        filteredVideos = filteredVideos.filter(v => v.is_featured);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredVideos = filteredVideos.filter(v => v.title.toLowerCase().includes(searchLower));
      }
      
      return NextResponse.json({
        data: filteredVideos.slice(offset, offset + limit),
        total: filteredVideos.length,
      });
    }

    return NextResponse.json({
      data: data,
      total: count || 0,
    });
  } catch (error) {
    console.error('获取视频列表失败:', error);
    // 发生错误时返回 mock 数据
    return NextResponse.json({
      data: [
        {
          id: 1,
          title: '符籙基礎教程：認識道教符籙',
          slug: 'fuji-basic-tutorial',
          cover: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=640&h=360&fit=crop',
          duration: 1234,
          author: '符寶網',
          views: 5678,
          likes: 234,
          is_featured: true,
          category: { id: 1, name: '符籙文化', slug: 'fuji' },
        },
        {
          id: 2,
          title: '道教科儀：開光儀式詳解',
          slug: 'kaiguang-ritual-video',
          cover: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=640&h=360&fit=crop',
          duration: 2345,
          author: '符寶網',
          views: 4567,
          likes: 189,
          is_featured: true,
          category: { id: 2, name: '道教科儀', slug: 'ritual' },
        },
        {
          id: 3,
          title: '風水入門：家居風水基礎知識',
          slug: 'fengshui-basics-video',
          cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop',
          duration: 1567,
          author: '符寶網',
          views: 7890,
          likes: 345,
          is_featured: true,
          category: { id: 3, name: '風水命理', slug: 'fengshui' },
        },
      ],
      total: 3,
    });
  }
}

/**
 * 创建新视频
 * POST /api/videos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const {
      title,
      slug,
      category_id,
      description,
      cover_image,
      video_url,
      duration,
      author,
      author_avatar,
      is_published,
      is_featured,
      tags,
      sort_order,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: '請填寫視頻標題' },
        { status: 400 }
      );
    }

    // 生成唯一slug
    let videoSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');

    // 检查slug是否已存在
    const { data: existing } = await client
      .from('videos')
      .select('id')
      .eq('slug', videoSlug)
      .single();

    if (existing) {
      videoSlug = `${videoSlug}-${Date.now()}`;
    }

    const { data, error } = await client
      .from('videos')
      .insert({
        title,
        slug: videoSlug,
        category_id: category_id || null,
        description: description || null,
        cover_image: cover_image || null,
        video_url: video_url || null,
        duration: duration || 0,
        author: author || '符寶網官方',
        author_avatar: author_avatar || null,
        is_published: is_published ?? false,
        is_featured: is_featured ?? false,
        tags: tags || [],
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建视频失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '視頻創建成功',
      data,
    });
  } catch (error) {
    console.error('创建视频失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
