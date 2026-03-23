import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET: 获取订单详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: '无效的订单ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取订单信息
    const { data: order, error } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    // 获取订单商品明细
    const { data: items } = await client
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    return NextResponse.json({ data: { ...order, items: items || [] } });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return NextResponse.json({ error: '获取订单详情失败' }, { status: 500 });
  }
}

// PUT: 更新订单状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json();
    const { action, payMethod } = body;

    if (isNaN(orderId)) {
      return NextResponse.json({ error: '无效的订单ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取订单信息
    const { data: order, error: fetchError } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'pay':
        updateData = {
          pay_status: 1,
          order_status: 1,
          pay_method: payMethod,
          pay_time: new Date().toISOString(),
        };
        break;
      case 'ship':
        updateData = {
          order_status: 2,
          shipping_time: new Date().toISOString(),
        };
        break;
      case 'receive':
        updateData = {
          order_status: 3,
          receive_time: new Date().toISOString(),
        };
        break;
      case 'cancel':
        updateData = {
          order_status: -1,
        };
        break;
      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

    const { data: updatedOrder, error: updateError } = await client
      .from('orders')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data: updatedOrder });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return NextResponse.json({ error: '更新订单状态失败' }, { status: 500 });
  }
}
