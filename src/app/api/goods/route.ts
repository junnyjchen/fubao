/**
 * @fileoverview 商品列表 API
 * @description 提供商品列表查询和创建功能
 * @module app/api/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取商品列表
 * @description 支持分页、筛选、排序、搜索
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 解析查询参数
  const type = searchParams.get('type');
  const purpose = searchParams.get('purpose');
  const merchantId = searchParams.get('merchant_id');
  const categoryId = searchParams.get('category_id');
  const keyword = searchParams.get('keyword');
  const isHot = searchParams.get('hot') === 'true';
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');
  const offset = (page - 1) * limit;
  const includeAll = searchParams.get('includeAll') === 'true'; // 后台管理查询所有商品
  const status = searchParams.get('status'); // 状态筛选

  try {
    const client = getSupabaseClient();
    
    // 构建查询
    let query = client
      .from('goods')
      .select('*', { count: 'exact' });

    // 前台只显示上架商品
    if (!includeAll) {
      query = query.eq('status', true);
    } else if (status) {
      // 后台状态筛选
      query = query.eq('status', status === 'active');
    }

    // 关键字搜索
    if (keyword && keyword.trim()) {
      query = query.or(`name.ilike.%${keyword.trim()}%,subtitle.ilike.%${keyword.trim()}%,description.ilike.%${keyword.trim()}%`);
    }

    // 排序
    query = query
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false });

    // 筛选条件
    if (type) {
      query = query.eq('type', parseInt(type));
    }
    if (purpose) {
      query = query.eq('purpose', purpose);
    }
    if (merchantId) {
      query = query.eq('merchant_id', parseInt(merchantId));
    }
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }
    if (isHot) {
      query = query.order('sales', { ascending: false });
    }

    // 分页
    query = query.range(offset, offset + limit - 1);

    const { data: goods, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 查询商户信息
    const merchantMap: Record<number, { id: number; name: string; type: number; logo: string | null; certification_level: number | null }> = {};
    
    if (goods && goods.length > 0) {
      const merchantIds = [...new Set(goods.map((g: { merchant_id: number }) => g.merchant_id))];
      const { data: merchantData } = await client
        .from('merchants')
        .select('id, name, type, logo, certification_level')
        .in('id', merchantIds);
      
      if (merchantData) {
        merchantData.forEach((m: { id: number; name: string; type: number; logo: string | null; certification_level: number | null }) => {
          merchantMap[m.id] = m;
        });
      }
    }

    // 组合数据
    const data = goods?.map((g: { merchant_id: number }) => ({
      ...g,
      merchants: merchantMap[g.merchant_id] || null,
    })) || [];

    return NextResponse.json({ 
      data, 
      page, 
      limit, 
      total: count || 0,
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { error: '獲取商品列表失敗' },
      { status: 500 }
    );
  }
}

/**
 * 创建商品
 * @description 创建新商品
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 验证必填字段
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: '請填寫商品名稱和價格' },
        { status: 400 }
      );
    }

    // 创建商品
    const { data, error } = await client
      .from('goods')
      .insert({
        merchant_id: body.merchant_id || 1, // 默认商户
        category_id: body.category_id || null,
        name: body.name,
        subtitle: body.subtitle || null,
        type: body.type || 1,
        purpose: body.purpose || null,
        price: String(body.price),
        original_price: body.original_price ? String(body.original_price) : null,
        stock: body.stock || 0,
        main_image: body.main_image || null,
        images: body.images || null,
        description: body.description || null,
        is_certified: body.is_certified || false,
        status: body.status !== false,
        sort: body.sort || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { error: '創建商品失敗' },
      { status: 500 }
    );
  }
}
