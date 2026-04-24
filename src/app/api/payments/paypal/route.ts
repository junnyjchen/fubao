import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// PayPal 支付创建
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount } = body;

    const client = getSupabaseClient();

    // 验证订单
    const { data: order, error } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (order.pay_status === 1) {
      return NextResponse.json({ error: '订单已支付' }, { status: 400 });
    }

    // 模拟 PayPal 支付链接生成
    const paypalOrderId = 'PAYPAL-' + Date.now() + '-' + orderId;
    
    return NextResponse.json({
      data: {
        paypalOrderId,
        approvalUrl: 'https://www.paypal.com/checkoutnow?token=' + paypalOrderId,
        amount,
        currency: 'HKD',
      }
    });
  } catch (error) {
    console.error('创建PayPal支付失败:', error);
    return NextResponse.json({ error: '创建支付失败' }, { status: 500 });
  }
}

// PayPal 支付回调
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    const client = getSupabaseClient();

    // 验证订单
    const { data: order, error: fetchError } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    // 更新订单状态
    const { data: updatedOrder, error: updateError } = await client
      .from('orders')
      .update({
        pay_status: 1,
        order_status: 1,
        pay_method: 'paypal',
        pay_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: {
        success: true,
        order: updatedOrder,
      }
    });
  } catch (error) {
    console.error('PayPal支付回调失败:', error);
    return NextResponse.json({ error: '支付验证失败' }, { status: 500 });
  }
}
