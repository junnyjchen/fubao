/**
 * @fileoverview 管理后台商品管理 API
 * @description 管理员商品列表、新增、编辑、删除
 * @module app/api/admin/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** Mock 商品数据 */
const mockGoods = [
  {
    id: 1,
    name: '開光平安符',
    description: '由高功法師開光加持，保佑平安順遂',
    price: 299,
    original_price: 399,
    stock: 100,
    sales: 256,
    images: ['/images/products/talisman-1.jpg'],
    category_id: 1,
    category_name: '符籙',
    merchant_id: 1,
    merchant_name: '紫微宮',
    is_certified: true,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
  },
  {
    id: 2,
    name: '桃木劍',
    description: '精選天然桃木，驅邪鎮宅',
    price: 599,
    original_price: 799,
    stock: 50,
    sales: 128,
    images: ['/images/products/sword-1.jpg'],
    category_id: 2,
    category_name: '法器',
    merchant_id: 1,
    merchant_name: '紫微宮',
    is_certified: true,
    status: 'active',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T12:00:00Z',
  },
];

/**
 * 获取商品列表
 * GET /api/admin/goods
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const keyword = searchParams.get('keyword');
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    try {
      let query = client
        .from('goods')
        .select(`
          *,
          categories:id, name
        `, { count: 'exact' });

      if (keyword) {
        query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      query = query.order(sort, { ascending: order === 'asc' });
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data || [],
        total: count || 0,
        page,
        limit,
      });
    } catch (dbError) {
      console.error('数据库查询失败，使用 mock 数据:', dbError);
      // 返回 mock 数据
      let filtered = [...mockGoods];
      if (keyword) {
        filtered = filtered.filter(g => 
          g.name.includes(keyword) || g.description.includes(keyword)
        );
      }
      return NextResponse.json({
        success: true,
        data: filtered,
        total: filtered.length,
        page: 1,
        limit: 20,
        mock: true,
      });
    }
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json({ error: '獲取商品列表失敗' }, { status: 500 });
  }
}

/**
 * 创建商品
 * POST /api/admin/goods
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const goodsData = {
      name: body.name,
      description: body.description || '',
      price: body.price || 0,
      original_price: body.original_price || body.price || 0,
      stock: body.stock || 0,
      images: body.images || [],
      category_id: body.category_id,
      merchant_id: body.merchant_id || 1,
      content: body.content || '',
      specifications: body.specifications || {},
      is_certified: body.is_certified || false,
      status: body.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await client
        .from('goods')
        .insert(goodsData)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: '商品創建成功',
        data,
      });
    } catch (dbError) {
      console.error('创建商品失败，使用 mock:', dbError);
      // Mock 创建成功
      const mockId = Date.now();
      return NextResponse.json({
        success: true,
        message: '商品創建成功（本地模式）',
        data: {
          ...goodsData,
          id: mockId,
        },
        mock: true,
      });
    }
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json({ error: '創建商品失敗' }, { status: 500 });
  }
}
