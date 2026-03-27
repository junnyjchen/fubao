/**
 * @fileoverview 推荐商品API
 * @description 获取首页推荐商品数据
 * @module app/api/goods/recommended/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/goods/recommended
 * 获取推荐商品
 * @query limit - 返回数量，默认8
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    
    const supabase = getSupabaseClient();
    
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
        merchant_id
      `)
      .eq('status', true)
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
    
    // 获取商家信息
    let merchantMap: Record<number, { id: number; name: string; logo: string | null }> = {};
    if (goods && goods.length > 0) {
      const merchantIds = [...new Set(goods.map(g => g.merchant_id).filter(Boolean))];
      if (merchantIds.length > 0) {
        const { data: merchants } = await supabase
          .from('merchants')
          .select('id, name, logo')
          .in('id', merchantIds);
        
        if (merchants) {
          merchantMap = merchants.reduce((acc, m) => {
            acc[m.id] = m;
            return acc;
          }, {} as Record<number, { id: number; name: string; logo: string | null }>);
        }
      }
    }
    
    // 合并商品和商家信息
    const goodsWithMerchant = goods?.map(g => ({
      ...g,
      merchant: merchantMap[g.merchant_id] || null
    })) || [];
    
    return NextResponse.json({
      data: goodsWithMerchant,
    });
  } catch (error) {
    console.error('推荐商品API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
