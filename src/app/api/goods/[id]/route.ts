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
