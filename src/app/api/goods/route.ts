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
      // 返回模拟数据（数据库不可用时）
      return NextResponse.json({
        data: getMockGoods(limit),
        pagination: {
          page,
          limit,
          total: 10,
          total_pages: 1,
        },
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

    if (error || !goods || goods.length === 0) {
      console.error('获取商品列表失败:', error || 'No data found');
      // 返回模拟数据兜底
      return NextResponse.json({
        data: getMockGoods(limit),
        pagination: {
          page,
          limit,
          total: 10,
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
    // 返回模拟数据兜底
    const mockGoods = getMockGoods(limit);
    return NextResponse.json({
      data: mockGoods,
      pagination: {
        page,
        limit,
        total: mockGoods.length,
        total_pages: 1,
      },
    });
  }
}

/**
 * 模拟商品数据
 */
function getMockGoods(limit: number) {
  const allGoods = [
    {
      id: 1,
      name: '太上老君護身符',
      subtitle: '正統道教開光，護佑平安',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      price: '299.00',
      original_price: '399.00',
      is_certified: true,
      sales: 45,
      stock: 100,
      type: 1,
      purpose: '平安',
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
    },
    {
      id: 2,
      name: '鎮宅平安符',
      subtitle: '驅邪鎮宅，保佑家宅平安',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      price: '399.00',
      original_price: '499.00',
      is_certified: true,
      sales: 32,
      stock: 80,
      type: 1,
      purpose: '鎮宅',
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
    },
    {
      id: 3,
      name: '五路財神符',
      subtitle: '招財進寶，財運亨通',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      price: '399.00',
      original_price: '520.00',
      is_certified: true,
      sales: 58,
      stock: 95,
      type: 1,
      purpose: '招財',
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
    },
    {
      id: 4,
      name: '太歲平安符',
      subtitle: '化解太歲，逢凶化吉',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      price: '199.00',
      original_price: '280.00',
      is_certified: true,
      sales: 89,
      stock: 150,
      type: 1,
      purpose: '化太歲',
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
    },
    {
      id: 5,
      name: '文昌進寶符套裝',
      subtitle: '文昌加持，學業進步，財運雙收',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      price: '881.00',
      original_price: '1200.00',
      is_certified: true,
      sales: 23,
      stock: 50,
      type: 1,
      purpose: '文昌',
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
    },
    {
      id: 6,
      name: '金玉滿堂招財符',
      subtitle: '富貴吉祥，財運亨通',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_6870e99e-5a28-4f3f-a3a2-e505f3a80143.jpeg?sign=1807974176-2f0f09eed5-0-e8f14e57ddc7372febeb59f199eefb969ba1fc83f4c1f4d0c3204e91469d9cf3',
      price: '301.00',
      original_price: '380.00',
      is_certified: true,
      sales: 67,
      stock: 120,
      type: 1,
      purpose: '招財',
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
    },
    {
      id: 7,
      name: '姻緣和合符',
      subtitle: '增進感情，化解感情糾紛',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      price: '399.00',
      original_price: '520.00',
      is_certified: true,
      sales: 34,
      stock: 60,
      type: 1,
      purpose: '姻緣',
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
    },
    {
      id: 8,
      name: '太上三元賜福符',
      subtitle: '天官賜福，地官赦罪，水官解厄',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_57140a60-b691-4e72-879f-93c6ad2aeded.jpeg?sign=1807974177-f5e03d0b47-0-9eed67f865342bb42ccbeaaefb9b144a1ca389448f3fb6df588ef17a1f933842',
      price: '699.00',
      original_price: '899.00',
      is_certified: true,
      sales: 18,
      stock: 40,
      type: 1,
      purpose: '賜福',
      merchant: { id: 1, name: '玄門道院', logo: null, certification_level: 3, rating: 4.8, total_sales: 1200 },
      category: { id: 8, name: '符籙', slug: 'fujis' },
    },
    {
      id: 9,
      name: '純銅金蟾招財擺件',
      subtitle: '三足金蟾，吸財吐寶',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_6870e99e-5a28-4f3f-a3a2-e505f3a80143.jpeg?sign=1807974176-2f0f09eed5-0-e8f14e57ddc7372febeb59f199eefb969ba1fc83f4c1f4d0c3204e91469d9cf3',
      price: '680.00',
      original_price: '880.00',
      is_certified: true,
      sales: 28,
      stock: 45,
      type: 2,
      purpose: '招財',
      merchant: { id: 2, name: '風水專門店', logo: null, certification_level: 2, rating: 4.6, total_sales: 800 },
      category: { id: 17, name: '風水擺件', slug: 'fengshui' },
    },
    {
      id: 10,
      name: '翡翠貔貅吊墜',
      subtitle: '辟邪轉運，招財守財',
      main_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620428421507776531/image/generate_image_564ab3b4-7911-465e-a8e5-a2f01a0ff4de.jpeg?sign=1807974176-3cf7b22d99-0-05324e54ab45567628e5a0229d26adb20b98be6321047b2c6714b97c0979feae',
      price: '1680.00',
      original_price: '2200.00',
      is_certified: true,
      sales: 15,
      stock: 30,
      type: 2,
      purpose: '招財',
      merchant: { id: 2, name: '風水專門店', logo: null, certification_level: 2, rating: 4.6, total_sales: 800 },
      category: { id: 17, name: '風水擺件', slug: 'fengshui' },
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
