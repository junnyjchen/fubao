/**
 * @fileoverview 订单详情 API
 * @description 处理单个订单的查询和更新
 * @module app/api/orders/[id]/route
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

/**
 * 获取当前用户ID
 * @returns 用户ID或null
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const payload = verifyToken(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取订单详情
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 订单详情
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const client = getSupabaseClient();
    
    // 获取当前用户ID
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }
    
    const { id } = await params;

    // 获取订单
    const { data: order, error } = await client
      .from('orders')
      .select('*')
      .eq('id', parseInt(id))
      .eq('user_id', userId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 获取订单项
    const { data: orderItems } = await client
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    return NextResponse.json({
      data: {
        ...order,
        items: orderItems || [],
      },
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return NextResponse.json({ error: '獲取訂單詳情失敗' }, { status: 500 });
  }
}

/**
 * 更新订单状态
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 更新结果
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const client = getSupabaseClient();
    
    // 获取当前用户ID
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();

    // 获取订单
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', parseInt(id))
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 更新订单状态
    if (body.order_status !== undefined) {
      const currentStatus = order.order_status;
      const newStatus = body.order_status;

      // 状态转换验证
      const validTransitions: Record<number, number[]> = {
        0: [4], // 待付款 -> 已取消
        1: [4], // 待发货 -> 已取消
        2: [3], // 已发货 -> 已完成
      };

      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return NextResponse.json({ error: '無效的狀態轉換' }, { status: 400 });
      }

      updateData.order_status = newStatus;

      // 取消订单时恢复库存
      if (newStatus === 4 && currentStatus !== 4) {
        const { data: orderItems } = await client
          .from('order_items')
          .select('goods_id, quantity')
          .eq('order_id', order.id);

        if (orderItems) {
          for (const item of orderItems) {
            const { data: goods } = await client
              .from('goods')
              .select('stock, sales')
              .eq('id', item.goods_id)
              .single();

            if (goods) {
              await client
                .from('goods')
                .update({
                  stock: goods.stock + item.quantity,
                  sales: Math.max(0, goods.sales - item.quantity),
                })
                .eq('id', item.goods_id);
            }
          }
        }
      }
    }

    // 更新收货时间
    if (body.receive_time) {
      updateData.receive_time = body.receive_time;
    }

    // 更新支付信息
    if (body.pay_status !== undefined) {
      updateData.pay_status = body.pay_status;
      if (body.pay_method) {
        updateData.pay_method = body.pay_method;
      }
      if (body.pay_time) {
        updateData.pay_time = body.pay_time;
      }
      if (body.pay_status === 1) {
        updateData.order_status = 1; // 支付成功后改为待发货
      }
    }

    const { error } = await client
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
