/* @ts-nocheck */
/**
 * @fileoverview 商户审核 API
 * @description 处理商户入驻申请的审核操作
 * @module app/api/admin/merchant-applications/route
 */

import { NextRequest, NextResponse } from 'next/server';

// 确保 globalThis 上有 mock 数据
if (!globalThis.mockMerchantApplications) {
  globalThis.mockMerchantApplications = [
    {
      id: 1,
      user_id: 'user2',
      shop_name: '玄妙閣',
      shop_type: 'individual',
      shop_desc: '專營符籙、法器等玄門用品，傳承道家文化',
      logo: null,
      contact_name: '張道長',
      contact_phone: '+852 1234 5678',
      contact_email: 'xuanmiage@example.com',
      business_license: null,
      categories: 'fulei,faqqi',
      status: 'pending',
      reject_reason: null,
      created_at: '2026-03-24T10:00:00',
      reviewed_at: null,
    },
    {
      id: 2,
      user_id: 'user3',
      shop_name: '龍泉道場',
      shop_type: 'temple',
      shop_desc: '正規宗教場所，提供開光、祈福等服務',
      logo: null,
      contact_name: '李主持',
      contact_phone: '+852 8765 4321',
      contact_email: 'longquan@example.com',
      business_license: null,
      categories: 'fulei,faqqi,shuji',
      status: 'pending',
      reject_reason: null,
      created_at: '2026-03-23T15:00:00',
      reviewed_at: null,
    },
    {
      id: 3,
      user_id: 'user4',
      shop_name: '清風齋',
      shop_type: 'company',
      shop_desc: '企業級玄門文化用品供應商',
      logo: null,
      contact_name: '王經理',
      contact_phone: '+852 2345 6789',
      contact_email: 'qingfeng@example.com',
      business_license: null,
      categories: 'shuji',
      status: 'approved',
      reject_reason: null,
      created_at: '2026-03-22T09:00:00',
      reviewed_at: '2026-03-22T14:00:00',
    },
  ];
}

/**
 * 获取商户申请列表
 * GET /api/admin/merchant-applications
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';

    try {
      const { getSupabaseClient } = await import('@/storage/database/supabase-client');
      const client = getSupabaseClient();
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');

      let query = client
        .from('merchant_applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query.range(
        (page - 1) * pageSize,
        page * pageSize - 1
      );

      if (error) throw error;

      // 如果数据库有数据则返回，否则返回 mock 数据
      if (data && data.length > 0) {
        return NextResponse.json({
          success: true,
          data,
          total: count || data.length,
          page,
          pageSize,
        });
      }

      // 数据库无数据，返回 mock
      let applications = [...(globalThis.mockMerchantApplications || [])];
      if (status !== 'all') {
        applications = applications.filter(a => a.status === status);
      }
      return NextResponse.json({
        success: true,
        data: applications,
        total: applications.length,
        page,
        pageSize,
        mock: true,
      });
    } catch (dbErr) {
      console.error('商户申请数据库错误，使用本地模式:', dbErr);
      // 数据库不可用，返回 mock 数据
      let applications = [...(globalThis.mockMerchantApplications || [])];
      if (status !== 'all') {
        applications = applications.filter(a => a.status === status);
      }

      return NextResponse.json({
        success: true,
        data: applications,
        total: applications.length,
        page: 1,
        pageSize: 20,
        mock: true,
      });
    }
  } catch (error) {
    console.error('商户申请列表API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * 审核商户申请
 * POST /api/admin/merchant-applications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, rejectReason } = body;

    if (!id || !action) {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    }

    try {
      const { getSupabaseClient } = await import('@/storage/database/supabase-client');
      const client = getSupabaseClient();

      // 查询申请
      const { data: application, error: queryError } = await client
        .from('merchant_applications')
        .select('*')
        .eq('id', id)
        .single();

      if (queryError || !application) {
        // 数据库查询失败，尝试 mock
        throw new Error('数据库查询失败');
      }

      if (application.status !== 'pending') {
        return NextResponse.json({ error: '該申請已被審核' }, { status: 400 });
      }

      // 更新申请状态
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const { error: updateError } = await client
        .from('merchant_applications')
        .update({
          status: newStatus,
          reject_reason: action === 'reject' ? rejectReason : null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // 如果通过审核，创建商户
      if (action === 'approve') {
        try {
          await client.from('merchants').insert({
            user_id: application.user_id,
            name: application.shop_name,
            type: application.shop_type === 'individual' ? 1 : 
                  application.shop_type === 'company' ? 2 : 3,
            contact_name: application.contact_name,
            contact_phone: application.contact_phone,
            contact_email: application.contact_email,
            description: application.shop_desc,
            logo: application.logo,
            status: true,
          });
        } catch (merchantErr) {
          console.error('创建商户失败:', merchantErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: action === 'approve' ? '審核通過' : '已拒絕申請',
      });
    } catch (dbErr) {
      console.error('商户审核数据库错误，使用本地模式:', dbErr);
      // 数据库不可用，mock 模式
      const applications = globalThis.mockMerchantApplications || [];
      const appIndex = applications.findIndex(a => a.id === id);
      
      if (appIndex === -1) {
        return NextResponse.json({ error: '申請不存在' }, { status: 404 });
      }

      if (applications[appIndex].status !== 'pending') {
        return NextResponse.json({ error: '該申請已被審核' }, { status: 400 });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      applications[appIndex].status = newStatus;
      applications[appIndex].reviewed_at = new Date().toISOString();
      if (action === 'reject') {
        applications[appIndex].reject_reason = rejectReason;
      }

      // 如果通过审核，添加到 mock 商户列表
      if (action === 'approve') {
        if (!globalThis.mockMerchants) globalThis.mockMerchants = [];
        globalThis.mockMerchants.push({
          id: Date.now(),
          name: applications[appIndex].shop_name,
          type: applications[appIndex].shop_type === 'individual' ? 1 : 2,
          contact_name: applications[appIndex].contact_name,
          contact_phone: applications[appIndex].contact_phone,
          contact_email: applications[appIndex].contact_email,
          description: applications[appIndex].shop_desc,
          logo: applications[appIndex].logo,
          status: true,
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        message: action === 'approve' ? '審核通過（本地模式）' : '已拒絕申請（本地模式）',
        mock: true,
      });
    }
  } catch (error) {
    console.error('审核商户申请API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
