/**
 * @fileoverview 商户详情 API - MySQL 实现
 * @module app/api/merchants/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query, update as dbUpdate } from '@/lib/db';

/**
 * GET - 获取商户详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchantId = parseInt(id);

    if (isNaN(merchantId)) {
      return NextResponse.json({ error: '無效的商戶ID' }, { status: 400 });
    }

    const merchant = await queryOne('SELECT * FROM merchants WHERE id = ?', [merchantId]);

    if (!merchant) {
      return NextResponse.json({ error: '商戶不存在' }, { status: 404 });
    }

    // 查询商户的商品
    const goods = await query(
      'SELECT id, name, price, main_image FROM goods WHERE merchant_id = ? AND status = 1 LIMIT 10',
      [merchantId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...merchant,
        goods: goods || [],
      },
    });
  } catch (error) {
    console.error('获取商户详情失败:', error);
    return NextResponse.json({ error: '獲取商戶詳情失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新商户
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchantId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.contact_name !== undefined) updateData.contact_name = body.contact_name;
    if (body.contact_phone !== undefined) updateData.contact_phone = body.contact_phone;
    if (body.contact_email !== undefined) updateData.contact_email = body.contact_email;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.verified !== undefined) updateData.verified = body.verified ? 1 : 0;
    if (body.status !== undefined) updateData.status = body.status ? 1 : 0;

    await dbUpdate('merchants', updateData, { id: merchantId });

    return NextResponse.json({ success: true, message: '商戶更新成功' });
  } catch (error) {
    console.error('更新商户失败:', error);
    return NextResponse.json({ error: '更新商戶失敗' }, { status: 500 });
  }
}
