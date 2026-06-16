/**
 * @fileoverview 商户申请 API - MySQL 实现
 * @module app/api/merchant/apply/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insert as dbInsert } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';



/**
 * POST - 提交商户入驻申请
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    const body = await request.json();
    const { shop_name, contact_name, contact_phone, contact_email, description, business_license, address } = body;

    if (!shop_name) {
      return NextResponse.json({ error: '請填寫商戶名稱' }, { status: 400 });
    }
    if (!contact_name) {
      return NextResponse.json({ error: '請填寫聯繫人姓名' }, { status: 400 });
    }
    if (!contact_phone) {
      return NextResponse.json({ error: '請填寫聯繫電話' }, { status: 400 });
    }

    const id = await dbInsert('merchant_applications', {
      user_id: userId,
      name: shop_name,
      type: body.shop_type || 'individual',
      contact_name,
      contact_phone,
      contact_email: contact_email || null,
      description: description || null,
      address: address || null,
      license_number: business_license || null,
      status: 'pending',
    });

    return NextResponse.json({ message: '申請提交成功，請等待審核', data: { id } });
  } catch (error) {
    console.error('商户申请失败:', error);
    return NextResponse.json({ error: '申請提交失敗' }, { status: 500 });
  }
}

/**
 * GET - 获取当前用户的商户申请
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const data = await query(
      'SELECT * FROM merchant_applications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error('获取商户申请失败:', error);
    return NextResponse.json({ data: [] });
  }
}
