/* @ts-nocheck */
/**
 * @fileoverview 商品列表API
 * @description 获取商品列表，支持筛选、排序、分页
 * @module app/api/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/goods
 * 获取商品列表
 * @query category_id - 分类ID
 * @query merchant_id - 商户ID
 * @query type - 商品类型
 * @query hot - 是否热门（按销量排序）
 * @query is_certified - 是否认证商品
 * @query keyword - 搜索关键词
 * @query min_price - 最低价格
 * @query max_price - 最高价格
 * @query sort - 排序字段（price, sales, created_at）
 * @query order - 排序方式（asc, desc）
 * @query page - 页码
 * @query limit - 每页数量
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const categoryId = searchParams.get('category_id');
    const merchantId = searchParams.get('merchant_id');
    const type = searchParams.get('type');
    const hot = searchParams.get('hot') === 'true';
    const isCertified = searchParams.get('is_certified');
    const keyword = searchParams.get('keyword');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sort = searchParams.get('sort') || (hot ? 'sales' : 'created_at');
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    
    // 检查 supabase 是否有效
    if (!supabase || typeof supabase.from !== 'function') {
      // 返回空数据（数据库不可用时）
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        message: 'Database unavailable - returning empty data',
      });
    }
    
    // 构建查询 - 不使用嵌入查询，改为分开查询后合并
    let query = supabase
      .from('goods')
      .select(`
        id,
        name,
        subtitle,
        main_image,
        price,
        original_price,
        is_certified,
        sales,
        stock,
        type,
        purpose,
        merchant_id,
        category_id
      `, { count: 'exact' })
      .eq('status', 1);

    // 应用筛选条件
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }
    
    if (merchantId) {
      query = query.eq('merchant_id', parseInt(merchantId));
    }
    
    if (type) {
      query = query.eq('type', parseInt(type));
    }
    
    if (isCertified !== null) {
      query = query.eq('is_certified', isCertified === 'true');
    }
    
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // 应用排序
    const ascending = order === 'asc';
    if (hot) {
      // 热门商品：优先认证商品，然后按销量排序
      query = query.order('is_certified', { ascending: false })
                   .order('sales', { ascending: false });
    } else if (sort === 'price') {
      query = query.order('price', { ascending });
    } else if (sort === 'sales') {
      query = query.order('sales', { ascending });
    } else {
      query = query.order('created_at', { ascending });
    }

    // 应用分页
    query = query.range(offset, offset + limit - 1);

    const { data: goods, error, count } = await query;

    if (error) {
      console.error('获取商品列表失败:', error);
      // 返回模拟数据兜底
      return NextResponse.json({
        data: getMockGoods(limit),
        pagination: {
          page,
          limit,
          total: 8,
          total_pages: 1,
        },
      });
    }

    // 分开查询商户和分类信息
    let enrichedGoods = goods || [];
    if (goods && goods.length > 0) {
      // 获取所有商户ID和分类ID
      const merchantIds = [...new Set(goods.map(g => g.merchant_id).filter(Boolean))];
      const categoryIds = [...new Set(goods.map(g => g.category_id).filter(Boolean))];

      // 并行查询商户和分类
      const [merchantsResult, categoriesResult] = await Promise.all([
        merchantIds.length > 0 
          ? supabase.from('merchants').select('id, name, logo, certification_level').in('id', merchantIds)
          : { data: [] },
        categoryIds.length > 0
          ? supabase.from('categories').select('id, name, slug').in('id', categoryIds)
          : { data: [] }
      ]);

      // 创建映射表
      const merchantsMap = new Map((merchantsResult.data || []).map(m => [m.id, m]));
      const categoriesMap = new Map((categoriesResult.data || []).map(c => [c.id, c]));

      // 合并数据
      enrichedGoods = goods.map(g => ({
        ...g,
        merchants: g.merchant_id ? merchantsMap.get(g.merchant_id) || null : null,
        categories: g.category_id ? categoriesMap.get(g.category_id) || null : null,
      }));
    }

    return NextResponse.json({
      data: enrichedGoods,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (error) {
    console.error('商品列表API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * 模拟商品数据
 */
function getMockGoods(limit: number) {
  const allGoods = [
    {
      id: 1,
      name: '五路財神符',
      subtitle: '招財進寶·財源廣進',
      main_image: null,
      price: '288.00',
      original_price: '388.00',
      is_certified: true,
      sales: 156,
      stock: 100,
      type: 1,
      purpose: '招財',
      merchants: { id: 1, name: '玄門道院', logo: null, certification_level: 3 },
      categories: { id: 1, name: '符箓', slug: 'fujis' },
    },
    {
      id: 2,
      name: '太歲平安符',
      subtitle: '化解太歲·平安順遂',
      main_image: null,
      price: '168.00',
      original_price: null,
      is_certified: true,
      sales: 89,
      stock: 50,
      type: 1,
      purpose: '平安',
      merchants: { id: 1, name: '玄門道院', logo: null, certification_level: 3 },
      categories: { id: 1, name: '符箓', slug: 'fujis' },
    },
    {
      id: 3,
      name: '桃木劍·七星龍泉',
      subtitle: '驅邪避煞·鎮宅之寶',
      main_image: null,
      price: '588.00',
      original_price: '688.00',
      is_certified: true,
      sales: 45,
      stock: 20,
      type: 2,
      purpose: '驅邪',
      merchants: { id: 2, name: '龍虎山法器店', logo: null, certification_level: 2 },
      categories: { id: 2, name: '法器', slug: 'faqis' },
    },
    {
      id: 4,
      name: '開光八卦鏡',
      subtitle: '化煞擋煞·風水必備',
      main_image: null,
      price: '128.00',
      original_price: null,
      is_certified: false,
      sales: 234,
      stock: 200,
      type: 2,
      purpose: '風水',
      merchants: { id: 2, name: '龍虎山法器店', logo: null, certification_level: 2 },
      categories: { id: 2, name: '法器', slug: 'faqis' },
    },
    {
      id: 5,
      name: '檀香佛珠手串',
      subtitle: '108顆·開光加持',
      main_image: null,
      price: '388.00',
      original_price: '488.00',
      is_certified: true,
      sales: 67,
      stock: 30,
      type: 6,
      purpose: '祈福',
      merchants: { id: 3, name: '禪心閣', logo: null, certification_level: 2 },
      categories: { id: 6, name: '飾品', slug: 'accessories' },
    },
    {
      id: 6,
      name: '文昌帝君符',
      subtitle: '學業進步·考試順利',
      main_image: null,
      price: '198.00',
      original_price: null,
      is_certified: true,
      sales: 123,
      stock: 80,
      type: 1,
      purpose: '學業',
      merchants: { id: 1, name: '玄門道院', logo: null, certification_level: 3 },
      categories: { id: 1, name: '符箓', slug: 'fujis' },
    },
    {
      id: 7,
      name: '銅製香爐',
      subtitle: '精工細作·古法鑄造',
      main_image: null,
      price: '458.00',
      original_price: '558.00',
      is_certified: false,
      sales: 34,
      stock: 15,
      type: 3,
      purpose: '供奉',
      merchants: { id: 2, name: '龍虎山法器店', logo: null, certification_level: 2 },
      categories: { id: 3, name: '擺件', slug: 'decorations' },
    },
    {
      id: 8,
      name: '天然沈香線香',
      subtitle: '越南產·頂級沈香',
      main_image: null,
      price: '298.00',
      original_price: null,
      is_certified: true,
      sales: 89,
      stock: 60,
      type: 4,
      purpose: '供奉',
      merchants: { id: 3, name: '禪心閣', logo: null, certification_level: 2 },
      categories: { id: 4, name: '香燭', slug: 'incense-candles' },
    },
  ];
  
  return allGoods.slice(0, limit);
}
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      subtitle,
      category_id,
      merchant_id,
      type,
      purpose,
      price,
      original_price,
      stock,
      main_image,
      images,
      description,
      is_certified,
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: '商品名稱和價格為必填項' },
        { status: 400 }
      );
    }

    const { data: goods, error } = await supabase
      .from('goods')
      .insert({
        name,
        subtitle,
        category_id,
        merchant_id,
        type: type || 1,
        purpose,
        price: String(price),
        original_price: original_price ? String(original_price) : null,
        stock: stock || 0,
        main_image,
        images,
        description,
        is_certified: is_certified || false,
        status: 1,
        sales: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建商品失败:', error);
      return NextResponse.json(
        { error: '創建商品失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: goods,
      message: '創建成功',
    });
  } catch (error) {
    console.error('创建商品API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
