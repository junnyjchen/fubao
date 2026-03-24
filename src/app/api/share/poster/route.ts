/**
 * @fileoverview 商品分享海报API
 * @description 生成商品分享海报图片
 * @module app/api/share/poster/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取分享信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goodsId = searchParams.get('goods_id');
    const userId = searchParams.get('user_id');

    if (!goodsId) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取商品信息
    const { data: goods, error } = await client
      .from('goods')
      .select(`
        id,
        name,
        price,
        original_price,
        main_image,
        images,
        description,
        sales,
        merchant:merchants (
          id,
          name,
          logo
        )
      `)
      .eq('id', parseInt(goodsId))
      .single();

    if (error || !goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 获取分销信息（如果有推荐人）
    let distributor = null;
    if (userId) {
      const { data: user } = await client
        .from('users')
        .select('id, name, avatar, distributor_code')
        .eq('id', parseInt(userId))
        .single();
      distributor = user;
    }

    return NextResponse.json({
      goods,
      distributor,
      share_url: `/shop/${goodsId}${userId ? `?ref=${userId}` : ''}`,
    });
  } catch (error) {
    console.error('获取分享信息失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
