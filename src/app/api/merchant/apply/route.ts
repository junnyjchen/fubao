/**
 * @fileoverview 商户入驻申请API路由
 * @description 处理商户入驻申请
 * @module app/api/merchant/apply/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

/**
 * POST /api/merchant/apply - 提交商户入驻申请
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const token = request.cookies.get('auth_token')?.value;
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch {
        // Token无效，可能是新用户注册
      }
    }

    const body = await request.json();
    const {
      shop_name,
      shop_type,
      shop_desc,
      logo,
      contact_name,
      contact_phone,
      contact_email,
      business_license,
      id_card_front,
      id_card_back,
      categories,
      remark,
    } = body;

    // 表单验证
    if (!shop_name || !shop_name.trim()) {
      return NextResponse.json({ error: '請填寫店鋪名稱' }, { status: 400 });
    }
    if (!shop_type) {
      return NextResponse.json({ error: '請選擇店鋪類型' }, { status: 400 });
    }
    if (!contact_name || !contact_name.trim()) {
      return NextResponse.json({ error: '請填寫聯繫人姓名' }, { status: 400 });
    }
    if (!contact_phone || !contact_phone.trim()) {
      return NextResponse.json({ error: '請填寫聯繫電話' }, { status: 400 });
    }
    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: '請選擇經營類目' }, { status: 400 });
    }

    // 检查店铺名是否已存在
    const { data: existingShop, error: checkError } = await supabase
      .from('merchants')
      .select('id')
      .eq('shop_name', shop_name.trim())
      .single();

    if (existingShop) {
      return NextResponse.json({ error: '店鋪名稱已被使用' }, { status: 400 });
    }

    // 创建商户申请记录
    const { data: merchant, error } = await supabase
      .from('merchants')
      .insert({
        user_id: userId,
        shop_name: shop_name.trim(),
        shop_type,
        shop_desc: shop_desc?.trim() || '',
        logo: logo?.[0] || '',
        contact_name: contact_name.trim(),
        contact_phone: contact_phone.trim(),
        contact_email: contact_email?.trim() || '',
        business_license: business_license?.[0] || '',
        id_card_front: id_card_front?.[0] || '',
        id_card_back: id_card_back?.[0] || '',
        categories: categories,
        remark: remark?.trim() || '',
        status: 0, // 待审核
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('创建商户申请失败:', error);
      return NextResponse.json({ error: '提交申請失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: merchant,
      message: '申請已提交，我們將在1-3個工作日內審核',
    });
  } catch (error) {
    console.error('商户申请失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * GET /api/merchant/apply - 查询申请状态
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: '未登錄' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !merchant) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '暫無申請記錄',
      });
    }

    return NextResponse.json({
      success: true,
      data: merchant,
    });
  } catch {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
}
