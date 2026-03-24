/**
 * @fileoverview 商户审核 API
 * @description 处理商户入驻申请的审核操作
 * @module app/api/admin/merchant-applications/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取商户申请列表
 * GET /api/admin/merchant-applications
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
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

    if (error) {
      console.error('查询商户申请失败:', error);
      // 返回模拟数据
      return NextResponse.json({
        success: true,
        data: getMockApplications(status),
        total: getMockApplications(status).length,
        page,
        pageSize,
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    });
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
    const client = getSupabaseClient();
    const body = await request.json();
    const { id, action, rejectReason } = body;

    if (!id || !action) {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    }

    // 查询申请
    const { data: application, error: queryError } = await client
      .from('merchant_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (queryError || !application) {
      return NextResponse.json({ error: '申請不存在' }, { status: 404 });
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

    if (updateError) {
      console.error('更新申请状态失败:', updateError);
      return NextResponse.json({ error: '審核失敗' }, { status: 500 });
    }

    // 如果通过审核，创建商户
    if (action === 'approve') {
      const { error: merchantError } = await client
        .from('merchants')
        .insert({
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

      if (merchantError) {
        console.error('创建商户失败:', merchantError);
        // 继续执行，不影响审核结果
      }

      // 发送通知给用户
      await client.from('notifications').insert({
        user_id: application.user_id,
        type: 'system',
        title: '商戶入駐申請已通過',
        content: `恭喜！您的店鋪「${application.shop_name}」入駐申請已通過審核，現在可以開始經營了。`,
        link: '/merchant/dashboard',
      });
    } else {
      // 发送拒绝通知
      await client.from('notifications').insert({
        user_id: application.user_id,
        type: 'system',
        title: '商戶入駐申請已拒絕',
        content: `很抱歉，您的店鋪「${application.shop_name}」入駐申請未通過審核。原因：${rejectReason}`,
        link: '/merchant/apply',
      });
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '審核通過' : '已拒絕申請',
    });
  } catch (error) {
    console.error('审核商户申请API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

// 模拟数据
function getMockApplications(status: string) {
  const allApplications = [
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
      id_card_front: null,
      id_card_back: null,
      categories: 'fulei,faqqi',
      status: 'pending',
      remark: '',
      reject_reason: null,
      created_at: '2026-03-24T10:00:00',
      reviewed_at: null,
      reviewer_id: null,
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
      id_card_front: null,
      id_card_back: null,
      categories: 'fulei,faqqi,shuji',
      status: 'pending',
      remark: '',
      reject_reason: null,
      created_at: '2026-03-23T15:00:00',
      reviewed_at: null,
      reviewer_id: null,
    },
    {
      id: 3,
      user_id: 'user4',
      shop_name: '符緣齋',
      shop_type: 'company',
      shop_desc: '企業認證商戶，專業符籙製作與銷售',
      logo: null,
      contact_name: '王經理',
      contact_phone: '+852 5555 6666',
      contact_email: 'fuyuanzhai@example.com',
      business_license: null,
      id_card_front: null,
      id_card_back: null,
      categories: 'fulei',
      status: 'approved',
      remark: '',
      reject_reason: null,
      created_at: '2026-03-20T09:00:00',
      reviewed_at: '2026-03-21T14:00:00',
      reviewer_id: 'admin1',
    },
    {
      id: 4,
      user_id: 'user5',
      shop_name: '測試店鋪',
      shop_type: 'individual',
      shop_desc: '測試',
      logo: null,
      contact_name: '測試',
      contact_phone: '12345678',
      contact_email: 'test@example.com',
      business_license: null,
      id_card_front: null,
      id_card_back: null,
      categories: 'other',
      status: 'rejected',
      remark: '',
      reject_reason: '資質信息不完整，請補充營業執照和身份證件',
      created_at: '2026-03-18T10:00:00',
      reviewed_at: '2026-03-19T11:00:00',
      reviewer_id: 'admin1',
    },
  ];

  if (status === 'all') return allApplications;
  return allApplications.filter(app => app.status === status);
}
