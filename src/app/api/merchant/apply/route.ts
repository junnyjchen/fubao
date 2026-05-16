/* @ts-nocheck */
/**
 * @fileoverview 商户申请 API
 */

import { NextResponse } from 'next/server';

// 确保 globalThis 上有 mockApplications
if (!globalThis.mockMerchantApplications) {
  globalThis.mockMerchantApplications = [];
}

/**
 * 提交商户入驻申请
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      shop_name, 
      contact_name, 
      contact_phone, 
      contact_email,
      description,
      business_license,
      address 
    } = body;

    if (!shop_name) {
      return NextResponse.json({ error: '請填寫商戶名稱' }, { status: 400 });
    }

    if (!contact_name) {
      return NextResponse.json({ error: '請填寫聯繫人姓名' }, { status: 400 });
    }

    if (!contact_phone) {
      return NextResponse.json({ error: '請填寫聯繫電話' }, { status: 400 });
    }

    // 尝试写入数据库
    try {
      const { getSupabaseClient } = await import('@/storage/database/supabase-client');
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('merchant_applications')
        .insert({
          shop_name,
          contact_name,
          contact_phone,
          contact_email: contact_email || null,
          description: description || null,
          business_license: business_license || null,
          address: address || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ 
        message: '申請提交成功，請等待審核',
        data 
      });
    } catch (dbErr) {
      console.error('商户申请数据库错误，使用本地模式:', dbErr);
      // 数据库不可用，保存到 mock
      const mockApplication = {
        id: Date.now(),
        shop_name,
        contact_name,
        contact_phone,
        contact_email: contact_email || null,
        description: description || null,
        business_license: business_license || null,
        address: address || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      
      globalThis.mockMerchantApplications.push(mockApplication);
      
      return NextResponse.json({ 
        message: '申請提交成功，請等待審核（本地模式）',
        data: mockApplication,
        mock: true,
      });
    }
  } catch (error) {
    console.error('商户申请失败:', error);
    return NextResponse.json({ error: '申請提交失敗' }, { status: 500 });
  }
}

/**
 * 获取商户申请列表（当前用户）
 */
export async function GET(request: Request) {
  try {
    const { getSupabaseClient } = await import('@/storage/database/supabase-client');
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('merchant_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('获取商户申请失败，使用本地模式:', error);
    return NextResponse.json({ 
      data: globalThis.mockMerchantApplications || [],
      mock: true,
    });
  }
}
