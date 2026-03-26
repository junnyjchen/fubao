/**
 * @fileoverview 推荐商品API
 * @description 获取首页推荐商品数据
 * @module app/api/goods/recommended/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/goods/recommended
 * 获取推荐商品
 * @query limit - 返回数量，默认8
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    
    const supabase = await createClient();
    
    // 获取推荐商品（优先展示已认证的、销量高的商品）
    const { data: goods, error } = await supabase
      .from('goods')
      .select(`
        id,
        name,
        main_image,
        price,
        original_price,
        is_certified,
        sales,
        merchants (
          id,
          name,
          logo
        )
      `)
      .eq('status', 1)
      .order('is_certified', { ascending: false })
      .order('sales', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取推荐商品失败:', error);
      return NextResponse.json(
        { error: '獲取推薦商品失敗' },
        { status: 500 }
      );
    }
    
    // 如果商品数量不足，补充一些数据
    if (goods && goods.length < limit) {
      const { data: moreGoods } = await supabase
        .from('goods')
        .select(`
          id,
          name,
          main_image,
          price,
          original_price,
          is_certified,
          sales,
          merchants (
            id,
            name,
            logo
          )
        `)
        .eq('status', 1)
        .limit(limit - goods.length);
      
      if (moreGoods) {
        goods.push(...moreGoods);
      }
    }
    
    return NextResponse.json({
      data: goods || [],
    });
  } catch (error) {
    console.error('推荐商品API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
