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
    let merchant = null;
    if (goods.merchant_id) {
      const { data: merchantData } = await client
        .from('merchants')
        .select('id, name, logo, certification_level, rating, total_sales')
        .eq('id', goods.merchant_id)
        .single();
      merchant = merchantData;
    }

    // 获取分类信息
    let category = null;
    if (goods.category_id) {
      const { data: categoryData } = await client
        .from('categories')
        .select('id, name, slug')
        .eq('id', goods.category_id)
        .single();
      category = categoryData;
    }

    // 获取认证信息（如果有）
    let certificate = null;
    if (goods.is_certified) {
      const { data: certData } = await client
        .from('certificates')
        .select('certificate_no, issue_date, issued_by')
        .eq('goods_id', goods.id)
        .single();
      certificate = certData;
    }

    // 获取相关商品（同类型或同分类）
    let relatedGoods: Array<{ id: number; name: string; price: string; main_image: string | null; sales: number }> = [];
    if (goods.category_id) {
      const { data: relatedData } = await client
        .from('goods')
        .select('id, name, price, main_image, sales')
        .eq('category_id', goods.category_id)
        .eq('status', true)
        .neq('id', goods.id)
        .limit(6);
      relatedGoods = relatedData || [];
    }

    // 如果同分类商品不足，补充同类型商品
    if (relatedGoods.length < 6 && goods.type) {
      const { data: typeRelated } = await client
        .from('goods')
        .select('id, name, price, main_image, sales')
        .eq('type', goods.type)
        .eq('status', true)
        .neq('id', goods.id)
        .not('id', 'in', `(${relatedGoods.map(g => g.id).join(',') || '0'})`)
        .limit(6 - relatedGoods.length);
      relatedGoods = [...relatedGoods, ...(typeRelated || [])];
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

/**
 * 更新商品
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 更新结果
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    
    // 只更新提供的字段
    if (body.name !== undefined) updateData.name = body.name;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.price !== undefined) updateData.price = String(body.price);
    if (body.original_price !== undefined) updateData.original_price = body.original_price ? String(body.original_price) : null;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.main_image !== undefined) updateData.main_image = body.main_image;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_certified !== undefined) updateData.is_certified = body.is_certified;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.sort !== undefined) updateData.sort = body.sort;

    const { error } = await client
      .from('goods')
      .update(updateData)
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json({ error: '更新商品失敗' }, { status: 500 });
  }
}

/**
 * 删除商品
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 删除结果
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    const { error } = await client
      .from('goods')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json({ error: '刪除商品失敗' }, { status: 500 });
  }
}
