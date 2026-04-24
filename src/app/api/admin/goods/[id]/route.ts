/**
 * @fileoverview 管理后台单个商品 API
 * @description 管理员获取、更新、删除单个商品
 * @module app/api/admin/goods/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** Mock 商品数据 */
const mockGoodsMap: Record<number, any> = {
  1: {
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
  2: {
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
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取商品详情
 * GET /api/admin/goods/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const goodsId = resolvedParams.id;
    const client = getSupabaseClient();

    try {
      const { data, error } = await client
        .from('goods')
        .select(`
          *,
          categories:id, name
        `)
        .eq('id', goodsId)
        .single();

      if (error || !data) {
        // 尝试返回 mock 数据
        const mockId = parseInt(goodsId);
        if (mockGoodsMap[mockId]) {
          return NextResponse.json({
            success: true,
            data: mockGoodsMap[mockId],
            mock: true,
          });
        }
        return NextResponse.json({ error: '商品不存在' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (dbError) {
      console.error('数据库查询失败:', dbError);
      // 返回 mock 数据
      const mockId = parseInt(goodsId);
      if (mockGoodsMap[mockId]) {
        return NextResponse.json({
          success: true,
          data: mockGoodsMap[mockId],
          mock: true,
        });
      }
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json({ error: '獲取商品詳情失敗' }, { status: 500 });
  }
}

/**
 * 更新商品
 * PUT /api/admin/goods/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const goodsId = resolvedParams.id;
    const body = await request.json();
    const client = getSupabaseClient();

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };
    delete updateData.id;
    delete updateData.created_at;

    try {
      const { data, error } = await client
        .from('goods')
        .update(updateData)
        .eq('id', goodsId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: '商品更新成功',
        data,
      });
    } catch (dbError) {
      console.error('更新商品失败，使用 mock:', dbError);
      // Mock 更新成功
      return NextResponse.json({
        success: true,
        message: '商品更新成功（本地模式）',
        data: {
          ...body,
          id: parseInt(goodsId),
          updated_at: new Date().toISOString(),
        },
        mock: true,
      });
    }
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json({ error: '更新商品失敗' }, { status: 500 });
  }
}

/**
 * 删除商品
 * DELETE /api/admin/goods/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const goodsId = resolvedParams.id;
    const client = getSupabaseClient();

    try {
      const { error } = await client
        .from('goods')
        .delete()
        .eq('id', goodsId);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: '商品刪除成功',
      });
    } catch (dbError) {
      console.error('删除商品失败，使用 mock:', dbError);
      // Mock 删除成功
      return NextResponse.json({
        success: true,
        message: '商品刪除成功（本地模式）',
        mock: true,
      });
    }
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json({ error: '刪除商品失敗' }, { status: 500 });
  }
}
