/* @ts-nocheck */
/**
 * @fileoverview 商户 API
 * @description 处理商户的增删改查
 * @module app/api/merchants/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取商户列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');

    const client = getSupabaseClient();

    let query = client
      .from('merchants')
      .select('*', { count: 'exact' });

    // 关键字搜索
    if (keyword && keyword.trim()) {
      query = query.or(`name.ilike.%${keyword.trim()}%,contact_name.ilike.%${keyword.trim()}%`);
    }

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status === 'active');
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: merchants, error, count } = await query;

    if (error) {
      // 如果表不存在，返回空数组
      if (error.code === '42P01') {
        return NextResponse.json({ data: [], total: 0 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: merchants || [], 
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取商户失败:', error);
    return NextResponse.json({ error: '獲取商戶失敗' }, { status: 500 });
  }
}

/**
 * 创建商户
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { 
      name, 
      type, 
      contact_name, 
      contact_phone, 
      contact_email,
      address,
      description,
      logo,
      qualifications,
      status 
    } = body;

    if (!name) {
      return NextResponse.json({ error: '請填寫商戶名稱' }, { status: 400 });
    }

    if (!contact_name) {
      return NextResponse.json({ error: '請填寫聯繫人' }, { status: 400 });
    }

    if (!contact_phone) {
      return NextResponse.json({ error: '請填寫聯繫電話' }, { status: 400 });
    }

    if (!contact_email) {
      return NextResponse.json({ error: '請填寫電子郵箱' }, { status: 400 });
    }

    const { data, error } = await client
      .from('merchants')
      .insert({
        name,
        type: type || 1,
        contact_name: contact_name || null,
        contact_phone: contact_phone || null,
        contact_email: contact_email || null,
        address: address || null,
        description: description || null,
        logo: logo || null,
        qualifications: qualifications || null,
        status: status !== false,
        rating: 5.0,
        total_sales: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('创建商户数据库错误:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: '申請提交成功',
      data 
    });
  } catch (error) {
    console.error('创建商户失败:', error);
    return NextResponse.json({ error: '創建商戶失敗' }, { status: 500 });
  }
}

/**
 * 更新商户
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: '商戶ID不能為空' }, { status: 400 });
    }

    const { error } = await client
      .from('merchants')
      .update(updateFields)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新商户失败:', error);
    return NextResponse.json({ error: '更新商戶失敗' }, { status: 500 });
  }
}

/**
 * 删除商户
 */
export async function DELETE(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '商戶ID不能為空' }, { status: 400 });
    }

    // 检查是否有关联商品
    const { data: goods } = await client
      .from('goods')
      .select('id')
      .eq('merchant_id', parseInt(id))
      .limit(1);

    if (goods && goods.length > 0) {
      return NextResponse.json({ error: '該商戶下有商品，無法刪除' }, { status: 400 });
    }

    const { error } = await client
      .from('merchants')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除商户失败:', error);
    return NextResponse.json({ error: '刪除商戶失敗' }, { status: 500 });
  }
}
