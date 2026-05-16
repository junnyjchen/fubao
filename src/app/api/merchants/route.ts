/* @ts-nocheck */
/**
 * @fileoverview 商户 API
 * @description 处理商户的增删改查
 * @module app/api/merchants/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 确保 globalThis 上有 mockMerchants
if (!globalThis.mockMerchants) {
  globalThis.mockMerchants = [];
}

/**
 * 获取商户列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');

    const client = getSupabaseClient();

    let query = client
      .from('merchants')
      .select('*', { count: 'exact' });

    if (keyword && keyword.trim()) {
      query = query.or(`name.ilike.%${keyword.trim()}%,contact_name.ilike.%${keyword.trim()}%`);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status === 'active');
    }

    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1);

    const { data: merchants, error, count } = await query;

    if (error) {
      throw error;
    }

    // 如果数据库有数据则返回，否则返回 mock 数据
    if (merchants && merchants.length > 0) {
      return NextResponse.json({ 
        data: merchants, 
        total: count || merchants.length,
        page,
        limit,
      });
    }

    // 数据库无数据，返回 mock 数据
    let mockData = [...(globalThis.mockMerchants || [])];
    if (keyword && keyword.trim()) {
      mockData = mockData.filter(m => 
        (m.name && m.name.includes(keyword.trim())) || 
        (m.contact_name && m.contact_name.includes(keyword.trim()))
      );
    }
    if (status && status !== 'all') {
      mockData = mockData.filter(m => status === 'active' ? m.status : !m.status);
    }

    return NextResponse.json({ 
      data: mockData, 
      total: mockData.length, 
      page,
      limit,
      mock: true,
    });
  } catch (error) {
    console.error('获取商户失败，使用本地模式:', error);
    // 数据库不可用时返回 mock 数据
    let data = [...(globalThis.mockMerchants || [])];
    
    // 关键字搜索
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');
    
    if (keyword && keyword.trim()) {
      data = data.filter(m => 
        (m.name && m.name.includes(keyword.trim())) || 
        (m.contact_name && m.contact_name.includes(keyword.trim()))
      );
    }
    if (status && status !== 'all') {
      data = data.filter(m => status === 'active' ? m.status : !m.status);
    }
    
    return NextResponse.json({ 
      data, 
      total: data.length, 
      page: parseInt(searchParams.get('page') || '1'), 
      limit: parseInt(searchParams.get('limit') || '20'),
      mock: true,
    });
  }
}

/**
 * 创建商户
 */
export async function POST(request: Request) {
  try {
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

    try {
      const client = getSupabaseClient();
      const result = await client
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

      if (result.error) throw result.error;

      return NextResponse.json({ 
        message: '申請提交成功',
        data: result.data 
      });
    } catch (dbErr) {
      console.error('创建商户数据库错误，使用本地模式:', dbErr);
      // 数据库不可用，保存到 mock
      const mockMerchant = {
        id: Date.now(),
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
      };
      
      if (!globalThis.mockMerchants) globalThis.mockMerchants = [];
      globalThis.mockMerchants.push(mockMerchant);
      
      return NextResponse.json({ 
        message: '申請提交成功（本地模式）',
        data: mockMerchant,
        mock: true,
      });
    }
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
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: '商戶ID不能為空' }, { status: 400 });
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('merchants')
        .update(updateFields)
        .eq('id', id);

      if (error) throw error;

      return NextResponse.json({ message: '更新成功' });
    } catch (dbErr) {
      console.error('更新商户数据库错误，使用本地模式:', dbErr);
      // 数据库不可用，更新 mock 数据
      if (globalThis.mockMerchants) {
        const idx = globalThis.mockMerchants.findIndex((m: any) => m.id == id);
        if (idx >= 0) {
          globalThis.mockMerchants[idx] = { ...globalThis.mockMerchants[idx], ...updateFields };
        }
      }
      return NextResponse.json({ 
        message: '更新成功（本地模式）',
        mock: true,
      });
    }
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '商戶ID不能為空' }, { status: 400 });
    }

    try {
      const client = getSupabaseClient();
      
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

      if (error) throw error;

      return NextResponse.json({ message: '刪除成功' });
    } catch (dbErr) {
      console.error('删除商户数据库错误，使用本地模式:', dbErr);
      // 数据库不可用，从 mock 中删除
      if (globalThis.mockMerchants) {
        globalThis.mockMerchants = globalThis.mockMerchants.filter((m: any) => m.id != id);
      }
      return NextResponse.json({ 
        message: '刪除成功（本地模式）',
        mock: true,
      });
    }
  } catch (error) {
    console.error('删除商户失败:', error);
    return NextResponse.json({ error: '刪除商戶失敗' }, { status: 500 });
  }
}
