/**
 * @fileoverview 商户订单发货API
 * @description 处理商户发货操作
 * @module app/api/merchant/orders/ship/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/merchant/orders/ship
 * 商户发货
 * @body order_id - 订单ID
 * @body logistics_company - 物流公司
 * @body logistics_no - 物流单号
 * @body remark - 备注
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, logistics_company, logistics_no, remark } = body;

    // 验证必填字段
    if (!order_id) {
      return NextResponse.json(
        { error: '訂單ID不能為空' },
        { status: 400 }
      );
    }

    if (!logistics_company) {
      return NextResponse.json(
        { error: '請選擇物流公司' },
        { status: 400 }
      );
    }

    if (!logistics_no) {
      return NextResponse.json(
        { error: '請輸入物流單號' },
        { status: 400 }
      );
    }

    // 获取商户信息
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: '您不是商戶' },
        { status: 403 }
      );
    }

    // 获取订单信息
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, merchant_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      );
    }

    // 验证订单归属
    if (order.merchant_id !== merchant.id) {
      return NextResponse.json(
        { error: '無權操作此訂單' },
        { status: 403 }
      );
    }

    // 验证订单状态
    if (order.status !== 1) {
      return NextResponse.json(
        { error: '訂單狀態不允許發貨' },
        { status: 400 }
      );
    }

    // 物流公司映射
    const logisticsNames: Record<string, string> = {
      sf: '順豐速運',
      sto: '申通快遞',
      yto: '圓通速遞',
      zto: '中通快遞',
      ems: 'EMS',
    };

    // 更新订单状态
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 2, // 已发货
        logistics_company: logisticsNames[logistics_company] || logistics_company,
        logistics_no,
        ship_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('更新订单失败:', updateError);
      return NextResponse.json(
        { error: '發貨失敗' },
        { status: 500 }
      );
    }

    // 创建物流记录
    await supabase
      .from('order_logistics')
      .insert({
        order_id,
        company: logisticsNames[logistics_company] || logistics_company,
        tracking_no: logistics_no,
        status: 'shipped',
        traces: [
          {
            time: new Date().toISOString(),
            status: '已發貨',
            context: remark || '賣家已發貨',
          },
        ],
        created_at: new Date().toISOString(),
      });

    // 发送通知给用户
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'order',
        title: '訂單發貨通知',
        content: `您的訂單已發貨，物流公司：${logisticsNames[logistics_company] || logistics_company}，運單號：${logistics_no}`,
        link: `/user/orders/${order_id}`,
        is_read: false,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      message: '發貨成功',
      data: {
        logistics_company: logisticsNames[logistics_company] || logistics_company,
        logistics_no,
      },
    });
  } catch (error) {
    console.error('发货API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
