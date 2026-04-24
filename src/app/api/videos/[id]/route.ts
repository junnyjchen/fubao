/**
 * @fileoverview 视频详情API
 * @description 提供视频的查询、更新和删除接口
 * @module app/api/videos/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Mock 视频数据
const mockVideos: Record<string, any> = {
  '1': {
    id: 1,
    title: '符籙基礎教程：認識道教符籙',
    slug: 'fuji-basic-tutorial',
    description: `<h2>符籙基礎教程</h2>
<p>本視頻為大家詳細介紹道教符籙的基礎知識，包括符籙的種類、製作方法和使用注意事項。</p>
<h3>主要內容</h3>
<ul>
<li>什麼是符籙</li>
<li>符籙的歷史起源</li>
<li>常見符籙種類介紹</li>
<li>符籙的使用方法</li>
<li>注意事項與禁忌</li>
</ul>`,
    cover: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=1280&h=720&fit=crop',
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
  '2': {
    id: 2,
    title: '道教科儀：開光儀式詳解',
    slug: 'kaiguang-ritual-video',
    description: `<h2>道教科儀：開光儀式</h2>
<p>開光是道教傳統儀式，本視頻為大家詳細講解開光儀式的流程和注意事項。</p>
<h3>主要內容</h3>
<ul>
<li>開光儀式的意義</li>
<li>開光前的準備工作</li>
<li>開光流程演示</li>
<li>開光後的注意事項</li>
</ul>`,
    cover: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1280&h=720&fit=crop',
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
  '3': {
    id: 3,
    title: '風水入門：家居風水基礎知識',
    slug: 'fengshui-basics-video',
    description: `<h2>風水入門課程</h2>
<p>本視頻為風水愛好者介紹家居風水的基礎知識，幫助大家改善居住環境。</p>
<h3>主要內容</h3>
<ul>
<li>風水的基本概念</li>
<li>家居風水佈局原則</li>
<li>常見風水問題解決</li>
<li>風水吉祥物介紹</li>
</ul>`,
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop',
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
  '4': {
    id: 4,
    title: '法器介紹：令牌與七星劍的使用',
    slug: 'faqi-intro-video',
    description: `<h2>法器介紹課程</h2>
<p>本視頻為大家介紹道教常用的法器，包括令牌、七星劍、鈴鐺等。</p>
<h3>主要內容</h3>
<ul>
<li>法器的種類與功能</li>
<li>令牌的使用方法</li>
<li>七星劍的象徵意義</li>
<li>法器的開光與保養</li>
</ul>`,
    cover: 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=1280&h=720&fit=crop',
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
  '5': {
    id: 5,
    title: '道教神仙：認識三清祖師',
    slug: 'taoist-gods-video',
    description: `<h2>道教神仙譜系</h2>
<p>本視頻為大家介紹道教的主要神仙，特別是最高神三清：元始天尊、靈寶天尊、道德天尊。</p>
<h3>主要內容</h3>
<ul>
<li>三清祖師介紹</li>
<li>玉皇大帝</li>
<li>太上老君</li>
<li>其他重要神明</li>
</ul>`,
    cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1280&h=720&fit=crop',
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
  '6': {
    id: 6,
    title: '太歲知識：2024年犯太歲化解方法',
    slug: 'taishui-2024-video',
    description: `<h2>太歲知識詳解</h2>
<p>本視頻為大家詳細講解什麼是太歲，2024年哪些生肖犯太歲，以及如何化解。</p>
<h3>主要內容</h3>
<ul>
<li>什麼是太歲</li>
<li>2024年犯太歲生肖</li>
<li>化解方法介紹</li>
<li>拜太歲的注意事項</li>
</ul>`,
    cover: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1280&h=720&fit=crop',
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
};

/**
 * 获取视频详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = getSupabaseClient();

    let query = client
      .from('videos')
      .select('*');

    const isNumericId = /^\d+$/.test(id);
    
    if (isNumericId) {
      query = query.eq('id', parseInt(id));
    } else {
      query = query.eq('slug', id);
    }

    const { data: video, error } = await query.maybeSingle();

    if (error || !video) {
      // 尝试从 mock 数据获取
      const mockVideo = mockVideos[id] || Object.values(mockVideos).find(v => v.slug === id);
      if (mockVideo) {
        // 获取相关视频
        const relatedVideos = Object.values(mockVideos)
          .filter((v: any) => v.id !== mockVideo.id && v.category_id === mockVideo.category_id)
          .slice(0, 4);
        
        return NextResponse.json({
          data: {
            ...mockVideo,
            relatedVideos,
          },
        });
      }
      return NextResponse.json({ error: '視頻不存在' }, { status: 404 });
    }

    // 获取相关视频
    const { data: relatedVideos } = await client
      .from('videos')
      .select('id, title, cover, duration, views, category_id')
      .eq('status', true)
      .eq('category_id', video.category_id)
      .neq('id', video.id)
      .limit(4);

    // 增加浏览量
    await client
      .from('videos')
      .update({ views: video.views + 1 })
      .eq('id', video.id);

    return NextResponse.json({
      data: {
        ...video,
        relatedVideos: relatedVideos || [],
      },
    });
  } catch (error) {
    console.error('获取视频详情失败:', error);
    // 从 mock 数据获取
    const mockVideo = mockVideos[id] || Object.values(mockVideos).find((v: any) => v.slug === id);
    if (mockVideo) {
      return NextResponse.json({
        data: {
          ...mockVideo,
          relatedVideos: Object.values(mockVideos)
            .filter((v: any) => v.id !== mockVideo.id)
            .slice(0, 4),
        },
      });
    }
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 更新视频
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.cover !== undefined) updateData.cover = body.cover;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.sort !== undefined) updateData.sort = body.sort;

    const { data, error } = await client
      .from('videos')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: '視頻更新成功' });
  } catch (error) {
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * 删除视频
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('videos')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
