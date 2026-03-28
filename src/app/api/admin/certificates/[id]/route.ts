/**
 * @fileoverview 单个证书管理API
 * @description 证书详情、更新、删除操作
 * @module app/api/admin/certificates/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import type { DbRecord } from '@/types/common';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取单个证书详情
 * GET /api/admin/certificates/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('certificates')
      .select(`
        id,
        certificate_no,
        goods_id,
        merchant_id,
        issue_date,
        issued_by,
        valid_until,
        verification_count,
        last_verification,
        details,
        status,
        created_at,
        goods:goods_id (
          id,
          name,
          main_image,
          category:categories (name)
        ),
        merchant:merchant_id (
          id,
          name,
          certification_level
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '證書不存在' }, { status: 404 });
    }

    // 处理关联数据
    const goodsData = Array.isArray(data.goods) ? data.goods[0] : data.goods;
    const merchantData = Array.isArray(data.merchant) ? data.merchant[0] : data.merchant;
    const categoryData = goodsData?.category && Array.isArray(goodsData.category)
      ? goodsData.category[0]
      : goodsData?.category;

    return NextResponse.json({
      data: {
        ...data,
        goods: goodsData ? { ...goodsData, category: categoryData } : null,
        merchant: merchantData,
      },
    });
  } catch (error) {
    console.error('获取证书详情失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 更新证书信息
 * PUT /api/admin/certificates/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = getSupabaseClient();

    const updateData: DbRecord = {};

    // 可更新字段
    if (body.issue_date) updateData.issue_date = body.issue_date;
    if (body.issued_by) updateData.issued_by = body.issued_by;
    if (body.valid_until !== undefined) updateData.valid_until = body.valid_until || null;
    if (body.details) updateData.details = body.details;
    if (body.merchant_id !== undefined) updateData.merchant_id = body.merchant_id || null;
    if (body.status) updateData.status = body.status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '無更新內容' }, { status: 400 });
    }

    const { data, error } = await client
      .from('certificates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新证书失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '證書已更新',
      data,
    });
  } catch (error) {
    console.error('更新证书失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * 删除证书
 * DELETE /api/admin/certificates/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { error } = await client
      .from('certificates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除证书失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '證書已刪除' });
  } catch (error) {
    console.error('删除证书失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
