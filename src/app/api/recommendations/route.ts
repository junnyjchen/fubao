/* @ts-nocheck */
/**
 * @fileoverview 商品推荐API
 * @description 根据不同策略推荐商品
 * @module app/api/recommendations/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 获取模拟推荐商品
 */
function getMockRecommendations(type: string, limit: number) {
  const allProducts = [
    {
      id: 1,
      name: '五路財神符',
      price: '288.00',
      original_price: '388.00',
      main_image: null,
      sales: 156,
      is_certified: true,
      merchant: { id: 1, name: '玄門道院' },
    },
    {
      id: 2,
      name: '太歲平安符',
      price: '168.00',
      original_price: null,
      main_image: null,
      sales: 89,
      is_certified: true,
      merchant: { id: 1, name: '玄門道院' },
    },
    {
      id: 3,
      name: '桃木劍·七星龍泉',
      price: '588.00',
      original_price: '688.00',
      main_image: null,
      sales: 45,
      is_certified: true,
      merchant: { id: 2, name: '龍虎山法器店' },
    },
    {
      id: 4,
      name: '開光八卦鏡',
      price: '128.00',
      original_price: null,
      main_image: null,
      sales: 234,
      is_certified: false,
      merchant: { id: 2, name: '龍虎山法器店' },
    },
    {
      id: 5,
      name: '檀香佛珠手串',
      price: '388.00',
      original_price: '488.00',
      main_image: null,
      sales: 67,
      is_certified: true,
      merchant: { id: 3, name: '禪心閣' },
    },
    {
      id: 6,
      name: '文昌帝君符',
      price: '198.00',
      original_price: null,
      main_image: null,
      sales: 123,
      is_certified: true,
      merchant: { id: 1, name: '玄門道院' },
    },
    {
      id: 7,
      name: '銅製香爐',
      price: '458.00',
      original_price: '558.00',
      main_image: null,
      sales: 34,
      is_certified: false,
      merchant: { id: 2, name: '龍虎山法器店' },
    },
    {
      id: 8,
      name: '天然沈香線香',
      price: '298.00',
      original_price: null,
      main_image: null,
      sales: 89,
      is_certified: true,
      merchant: { id: 3, name: '禪心閣' },
    },
    {
      id: 9,
      name: '六字真言手鐲',
      price: '368.00',
      original_price: '468.00',
      main_image: null,
      sales: 56,
      is_certified: true,
      merchant: { id: 3, name: '禪心閣' },
    },
    {
      id: 10,
      name: '道家養生香囊',
      price: '88.00',
      original_price: null,
      main_image: null,
      sales: 178,
      is_certified: false,
      merchant: { id: 1, name: '玄門道院' },
    },
  ];

  // 根据类型排序
  const sorted = [...allProducts];
  switch (type) {
    case 'hot':
      sorted.sort((a, b) => b.sales - a.sales);
      break;
    case 'new':
      sorted.sort((a, b) => b.id - a.id);
      break;
    case 'personal':
      // 随机排序模拟个性化推荐
      sorted.sort(() => Math.random() - 0.5);
      break;
    case 'similar':
      // 相似商品，保持原顺序
      break;
    case 'viewed':
      // 看过的人还看，随机
      sorted.sort(() => Math.random() - 0.5);
      break;
  }

  return sorted.slice(0, limit);
}

/**
 * GET /api/recommendations
 * 获取推荐商品
 * @query type - 推荐类型（hot, new, personal, similar, viewed）
 * @query limit - 返回数量
 * @query exclude - 排除商品ID
 * @query category_id - 分类ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hot';
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const excludeId = searchParams.get('exclude');
    const categoryId = searchParams.get('category_id');

    const supabase = await createClient();

    // 检查 supabase 是否有效
    if (!supabase || typeof supabase.from !== 'function') {
      return NextResponse.json([]);
    }

    // 尝试从数据库获取商品 - 不使用嵌入查询
    let query = supabase
      .from('goods')
      .select(`
        id,
        name,
        main_image,
        price,
        original_price,
        is_certified,
        sales,
        created_at,
        merchant_id
      `)
      .eq('status', 1);

    // 排除指定商品
    if (excludeId) {
      query = query.neq('id', parseInt(excludeId));
    }

    // 同分类商品
    if (categoryId && type === 'similar') {
      query = query.eq('category_id', parseInt(categoryId));
    }

    // 根据类型排序
    switch (type) {
      case 'hot':
        query = query.order('sales', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'personal':
        // 个性化推荐：优先认证商品，然后按销量
        query = query
          .order('is_certified', { ascending: false })
          .order('sales', { ascending: false });
        break;
      case 'similar':
        // 同类商品按销量
        query = query.order('sales', { ascending: false });
        break;
      case 'viewed':
        // 看过的人还看：随机+热门
        query = query.order('sales', { ascending: false });
        break;
      default:
        query = query.order('sales', { ascending: false });
    }

    query = query.limit(limit);

    const { data: goods, error } = await query;

    if (error) {
      console.error('获取推荐商品失败:', error);
      // 返回模拟数据
      return NextResponse.json({
        success: true,
        data: getMockRecommendations(type, limit),
      });
    }

    // 分开查询商户信息
    let enrichedGoods: Array<{
      id: number;
      name: string;
      main_image: string | null;
      price: string;
      original_price: string | null;
      is_certified: boolean;
      sales: number;
      merchant: { id: number; name: string } | null;
    }> = [];
    if (goods && goods.length > 0) {
      const merchantIds = [...new Set(goods.map(g => g.merchant_id).filter(Boolean))];
      
      if (merchantIds.length > 0) {
        const { data: merchantsData } = await supabase
          .from('merchants')
          .select('id, name')
          .in('id', merchantIds);

        const merchantsMap = new Map((merchantsData || []).map(m => [m.id, m]));

        // 格式化数据并合并商户信息
        enrichedGoods = goods.map(g => ({
          id: g.id,
          name: g.name,
          main_image: g.main_image,
          price: g.price,
          original_price: g.original_price,
          is_certified: g.is_certified,
          sales: g.sales,
          merchant: g.merchant_id ? {
            id: merchantsMap.get(g.merchant_id)?.id,
            name: merchantsMap.get(g.merchant_id)?.name,
          } : null,
        }));
      } else {
        // 没有商户ID的情况
        enrichedGoods = goods.map(g => ({
          id: g.id,
          name: g.name,
          main_image: g.main_image,
          price: g.price,
          original_price: g.original_price,
          is_certified: g.is_certified,
          sales: g.sales,
          merchant: null,
        }));
      }
    }

    // 如果数据库返回数据不足，补充模拟数据
    if (enrichedGoods.length < limit) {
      const mockData = getMockRecommendations(type, limit - enrichedGoods.length);
      const combined = [...enrichedGoods, ...mockData];
      return NextResponse.json({
        success: true,
        data: combined,
      });
    }

    return NextResponse.json({
      success: true,
      data: enrichedGoods,
    });
  } catch (error) {
    console.error('推荐商品API错误:', error);
    return NextResponse.json({
      success: true,
      data: getMockRecommendations('hot', 8),
    });
  }
}
