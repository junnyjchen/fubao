/* @ts-nocheck */
/**
 * @fileoverview 轮播图 API
 * @description 处理轮播图的增删改查
 * @module app/api/banners/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取轮播图列表
 */
export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    let query = client
      .from('banners')
      .select('*')
      .eq('status', true)
      .order('sort', { ascending: true });

    if (position) {
      query = query.eq('position', position);
    }

    const { data: banners, error } = await query;

    // 如果数据库不可用或有错误，返回 mock 数据
    if (error || !banners || banners.length === 0) {
      const mockBanners = [
        {
          id: 1,
          title: '符寶網正式上線',
          subtitle: '傳承千年智慧，連接全球信眾',
          image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1920&h=600&fit=crop',
          link: '/',
          position: 'home',
          sort: 1,
          status: true,
        },
        {
          id: 2,
          title: '正統符籙 開光加持',
          subtitle: '由資深道士親筆書寫，正統道觀開光',
          image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=1920&h=600&fit=crop',
          link: '/shop?category=1',
          position: 'home',
          sort: 2,
          status: true,
        },
        {
          id: 3,
          title: '道教文化百科',
          subtitle: '探索千年道教的奧秘',
          image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&h=600&fit=crop',
          link: '/wiki',
          position: 'home',
          sort: 3,
          status: true,
        },
        {
          id: 4,
          title: '會員專屬福利',
          subtitle: '加入會員，享更多優惠',
          image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&h=600&fit=crop',
          link: '/user/vip',
          position: 'home',
          sort: 4,
          status: true,
        },
      ];
      return NextResponse.json({ data: position ? mockBanners.filter(b => b.position === position) : mockBanners });
    }

    // 过滤掉不在有效期内的轮播图
    const now = new Date();
    const validBanners = (banners || []).filter((banner: Record<string, unknown>) => {
      if (!banner.start_date && !banner.end_date) return true;
      const startDate = banner.start_date ? new Date(banner.start_date as string) : null;
      const endDate = banner.end_date ? new Date(banner.end_date as string) : null;
      if (startDate && now < startDate) return false;
      if (endDate && now > endDate) return false;
      return true;
    });

    return NextResponse.json({ data: validBanners });
  } catch (error) {
    console.error('獲取輪播圖失敗:', error);
    return NextResponse.json({ error: '獲取輪播圖失敗' }, { status: 500 });
  }
}

/**
 * 创建轮播图
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { title, image, link, position, sort, status, start_date, end_date } = body;

    if (!image) {
      return NextResponse.json({ error: '請上傳輪播圖片' }, { status: 400 });
    }

    const { data, error } = await client
      .from('banners')
      .insert({
        title: title || null,
        image,
        link: link || null,
        position: position || 'home',
        sort: sort || 0,
        status: status !== false,
        start_date: start_date || null,
        end_date: end_date || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('創建輪播圖失敗:', error);
    return NextResponse.json({ error: '創建輪播圖失敗' }, { status: 500 });
  }
}

/**
 * 更新轮播图
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { id, title, image, link, position, sort, status, start_date, end_date } = body;

    if (!id) {
      return NextResponse.json({ error: '輪播圖ID不能為空' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (image !== undefined) updateData.image = image;
    if (link !== undefined) updateData.link = link;
    if (position !== undefined) updateData.position = position;
    if (sort !== undefined) updateData.sort = sort;
    if (status !== undefined) updateData.status = status;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;

    const { error } = await client
      .from('banners')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新輪播圖失敗:', error);
    return NextResponse.json({ error: '更新輪播圖失敗' }, { status: 500 });
  }
}

/**
 * 删除轮播图
 */
export async function DELETE(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '輪播圖ID不能為空' }, { status: 400 });
    }

    const { error } = await client
      .from('banners')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除輪播圖失敗:', error);
    return NextResponse.json({ error: '刪除輪播圖失敗' }, { status: 500 });
  }
}
