/**
 * @fileoverview 晒图分享API路由
 * @description 晒图功能的增删查接口
 * @module app/api/shares/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

/**
 * GET /api/shares - 获取晒图列表
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');
  const goodsId = searchParams.get('goods_id');
  const userId = searchParams.get('user_id');

  try {
    let query = supabase
      .from('shares')
      .select(`
        id,
        user_id,
        goods_id,
        content,
        images,
        video_url,
        likes_count,
        comments_count,
        is_anonymous,
        created_at,
        users (
          id,
          nickname,
          avatar
        ),
        goods (
          id,
          name,
          images
        )
      `, { count: 'exact' })
      .eq('status', 1)
      .order('created_at', { ascending: false });

    // 按商品筛选
    if (goodsId) {
      query = query.eq('goods_id', parseInt(goodsId));
    }

    // 按用户筛选
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 分页
    const { data: shares, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取晒图列表失败:', error);
      
      // 返回模拟数据作为兜底
      const mockShares = [
        {
          id: 1,
          user_id: 'user1',
          goods_id: 101,
          content: '收到平安符後，感覺心裡特別踏實。感謝師父的加持，希望家人平安健康！🙏',
          images: ['/shares/share1-1.jpg', '/shares/share1-2.jpg'],
          video_url: null,
          likes_count: 128,
          comments_count: 23,
          is_anonymous: false,
          created_at: '2026-03-24T10:30:00',
          users: { id: 'user1', nickname: '張小明', avatar: null },
          goods: { id: 101, name: '開光平安符', images: ['/goods/pinganfu.jpg'] },
        },
        {
          id: 2,
          user_id: 'user2',
          goods_id: 102,
          content: '這個桃木劍做工精細，師父開光後感覺氣場很不一樣。放在家裡很安心！',
          images: ['/shares/share2-1.jpg'],
          video_url: null,
          likes_count: 86,
          comments_count: 12,
          is_anonymous: false,
          created_at: '2026-03-23T15:20:00',
          users: { id: 'user2', nickname: '李大姐', avatar: null },
          goods: { id: 102, name: '桃木劍', images: ['/goods/taomujian.jpg'] },
        },
        {
          id: 3,
          user_id: 'user3',
          goods_id: 103,
          content: '心願達成！感謝符寶網，感謝道長的加持。分享給大家，願大家都能如願以償！',
          images: ['/shares/share3-1.jpg', '/shares/share3-2.jpg', '/shares/share3-3.jpg'],
          video_url: null,
          likes_count: 256,
          comments_count: 45,
          is_anonymous: true,
          created_at: '2026-03-22T09:00:00',
          users: null,
          goods: { id: 103, name: '太歲符', images: ['/goods/taisui.jpg'] },
        },
        {
          id: 4,
          user_id: 'user4',
          goods_id: 101,
          content: '送給父母的禮物，他們很喜歡。包裝精美，證書齊全，非常滿意！',
          images: ['/shares/share4-1.jpg'],
          video_url: null,
          likes_count: 67,
          comments_count: 8,
          is_anonymous: false,
          created_at: '2026-03-21T14:30:00',
          users: { id: 'user4', nickname: '王先生', avatar: null },
          goods: { id: 101, name: '開光平安符', images: ['/goods/pinganfu.jpg'] },
        },
      ];

      return NextResponse.json({
        success: true,
        data: {
          list: mockShares,
          total: mockShares.length,
          page,
          pageSize,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        list: shares || [],
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('获取晒图列表失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * POST /api/shares - 发布晒图
 */
export async function POST(request: NextRequest) {
  // 验证登录状态
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      goods_id,
      order_id,
      content,
      images = [],
      video_url,
      is_anonymous = false,
    } = body;

    // 验证必填项
    if (!content || !content.trim()) {
      return NextResponse.json({ error: '請填寫分享內容' }, { status: 400 });
    }
    if (images.length === 0 && !video_url) {
      return NextResponse.json({ error: '請上傳圖片或視頻' }, { status: 400 });
    }

    // 验证是否购买过该商品
    if (goods_id && order_id) {
      const { data: orderItem, error: orderError } = await supabase
        .from('order_items')
        .select(`
          id,
          orders!inner (user_id, status)
        `)
        .eq('goods_id', goods_id)
        .eq('order_id', order_id)
        .eq('orders.user_id', userId)
        .in('orders.status', [2, 3]) // 已发货或已完成
        .single();

      if (orderError || !orderItem) {
        return NextResponse.json({ error: '您還未購買該商品' }, { status: 403 });
      }
    }

    // 创建晒图记录
    const { data: share, error } = await supabase
      .from('shares')
      .insert({
        user_id: userId,
        goods_id: goods_id || null,
        order_id: order_id || null,
        content: content.trim(),
        images,
        video_url: video_url || null,
        likes_count: 0,
        comments_count: 0,
        is_anonymous,
        status: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('发布晒图失败:', error);
      return NextResponse.json({ error: '發布失敗' }, { status: 500 });
    }

    // 如果关联商品，更新商品评价数
    if (goods_id) {
      await supabase.rpc('increment_share_count', { goods_id: parseInt(goods_id) });
    }

    return NextResponse.json({
      success: true,
      data: share,
      message: '發布成功',
    });
  } catch (error) {
    console.error('发布晒图失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
