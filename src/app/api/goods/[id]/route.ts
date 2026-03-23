/**
 * @fileoverview 商品详情 API
 * @description 获取单个商品详情
 * @module app/api/goods/[id]/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取商品详情
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 商品详情
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    // 获取商品基本信息
    const { data: goods, error } = await client
      .from('goods')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 获取商户信息
    const { data: merchant } = await client
      .from('merchants')
      .select('id, name, type, logo, certification_level, rating, total_sales')
      .eq('id', goods.merchant_id)
      .single();

    // 获取分类信息
    const { data: category } = goods.category_id
      ? await client
          .from('categories')
          .select('id, name, slug')
          .eq('id', goods.category_id)
          .single()
      : { data: null };

    // 获取认证信息
    const { data: certificate } = goods.is_certified
      ? await client
          .from('certificates')
          .select('*')
          .eq('goods_id', goods.id)
          .single()
      : { data: null };

    // 获取关联商品（同分类）
    let relatedGoods: unknown[] = [];
    if (goods.category_id) {
      const { data: related } = await client
        .from('goods')
        .select('id, name, price, main_image, sales')
        .eq('category_id', goods.category_id)
        .eq('status', true)
        .neq('id', goods.id)
        .limit(6);
      relatedGoods = related || [];
    }

    return NextResponse.json({
      data: {
        ...goods,
        merchant,
        category,
        certificate,
        relatedGoods,
      },
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json({ error: '獲取商品詳情失敗' }, { status: 500 });
  }
}
