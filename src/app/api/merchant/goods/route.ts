/**
 * @fileoverview 商户商品API路由
 * @description 商户商品的增删改查接口，支持数据隔离
 * @module app/api/merchant/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

// 验证商户身份中间件
async function verifyMerchant(request: NextRequest): Promise<{ userId: string; merchantId: string } | null> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // 查询用户关联的商户信息
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('id, user_id')
      .eq('user_id', decoded.userId)
      .eq('status', 1)
      .single();

    if (error || !merchant) {
      return null;
    }

    return { userId: decoded.userId, merchantId: merchant.id };
  } catch {
    return null;
  }
}

/**
 * GET /api/merchant/goods - 获取商户商品列表
 */
export async function GET(request: NextRequest) {
  const merchant = await verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const keyword = searchParams.get('keyword') || '';
  const status = searchParams.get('status');
  const categoryId = searchParams.get('categoryId');

  try {
    // 构建查询条件
    let query = supabase
      .from('goods')
      .select(`
        id,
        name,
        category_id,
        price,
        original_price,
        stock,
        sales,
        status,
        images,
        has_cert,
        created_at,
        categories (id, name)
      `, { count: 'exact' })
      .eq('merchant_id', merchant.merchantId);

    // 关键词搜索
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,keywords.ilike.%${keyword}%`);
    }

    // 状态筛选
    if (status !== null && status !== undefined) {
      query = query.eq('status', parseInt(status));
    }

    // 分类筛选
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }

    // 排序和分页
    const { data: goods, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取商品列表失败:', error);
      return NextResponse.json({ error: '獲取商品列表失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        list: goods || [],
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * POST /api/merchant/goods - 创建商品
 */
export async function POST(request: NextRequest) {
  const merchant = await verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      category_id,
      price,
      original_price,
      stock,
      unit = '件',
      description,
      content,
      images = [],
      video_url,
      has_cert = false,
      cert_type,
      keywords,
    } = body;

    // 表单验证
    if (!name || !name.trim()) {
      return NextResponse.json({ error: '請填寫商品名稱' }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ error: '請選擇商品分類' }, { status: 400 });
    }
    if (!price || price <= 0) {
      return NextResponse.json({ error: '請填寫有效的售價' }, { status: 400 });
    }

    // 创建商品
    const { data: goods, error } = await supabase
      .from('goods')
      .insert({
        merchant_id: merchant.merchantId,
        name: name.trim(),
        category_id,
        price,
        original_price: original_price || price,
        stock: stock || 0,
        unit,
        description: description?.trim() || '',
        content: content?.trim() || '',
        images,
        video_url: video_url?.trim() || '',
        has_cert,
        cert_type: has_cert ? cert_type : null,
        keywords: keywords?.trim() || '',
        status: 0, // 默认草稿状态
        sales: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('创建商品失败:', error);
      return NextResponse.json({ error: '創建商品失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: goods,
      message: '商品創建成功',
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
