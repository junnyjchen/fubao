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
 * 计算分销佣金
 * @param orderId - 订单ID
 * @param buyerId - 买家ID
 * @param orderAmount - 订单金额
 * @param orderNo - 订单编号
 */
async function calculateDistributionCommission(
  orderId: number,
  buyerId: string,
  orderAmount: number,
  orderNo: string
): Promise<void> {
  const client = getSupabaseClient();

  try {
    // 获取买家的分销信息
    const { data: buyerDist } = await client
      .from('user_distribution')
      .select('parent_id, parent_level_2_id, parent_level_3_id, team_leader_id')
      .eq('user_id', buyerId)
      .single();

    if (!buyerDist) {
      console.log('买家没有分销信息，跳过佣金计算');
      return;
    }

    // 获取分销配置
    const { data: configs } = await client
      .from('distribution_config')
      .select('*')
      .order('level');

    if (!configs || configs.length === 0) {
      console.log('未配置分销比例，使用默认值');
    }

    const getConfig = (level: number) => {
      return configs?.find(c => c.level === level) || { rate: level === 1 ? 10 : level === 2 ? 5 : 2 };
    };

    const now = new Date().toISOString();
    const settleAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7天后结算

    // 一级分销佣金
    if (buyerDist.parent_id) {
      const config = getConfig(1);
      const commission = orderAmount * config.rate / 100;

      await client.from('distribution_commissions').insert({
        user_id: buyerDist.parent_id,
        from_user_id: buyerId,
        order_id: orderId,
        order_no: orderNo,
        order_amount: orderAmount,
        commission_rate: config.rate,
        commission_amount: commission,
        level: 1,
        is_team_leader_bonus: false,
        status: 0,
        created_at: now,
      });

      // 更新上级佣金统计
      await client
        .from('user_distribution')
        .update({
          total_commission: client.rpc('increment', { x: commission }),
          frozen_commission: client.rpc('increment', { x: commission }),
        })
        .eq('user_id', buyerDist.parent_id);

      console.log(`一级佣金计算完成: 用户 ${buyerDist.parent_id} 获得 HK$${commission.toFixed(2)}`);
    }

    // 二级分销佣金
    if (buyerDist.parent_level_2_id) {
      const config = getConfig(2);
      const commission = orderAmount * config.rate / 100;

      await client.from('distribution_commissions').insert({
        user_id: buyerDist.parent_level_2_id,
        from_user_id: buyerId,
        order_id: orderId,
        order_no: orderNo,
        order_amount: orderAmount,
        commission_rate: config.rate,
        commission_amount: commission,
        level: 2,
        is_team_leader_bonus: false,
        status: 0,
        created_at: now,
      });

      await client
        .from('user_distribution')
        .update({
          total_commission: client.rpc('increment', { x: commission }),
          frozen_commission: client.rpc('increment', { x: commission }),
        })
        .eq('user_id', buyerDist.parent_level_2_id);

      console.log(`二级佣金计算完成: 用户 ${buyerDist.parent_level_2_id} 获得 HK$${commission.toFixed(2)}`);
    }

    // 三级分销佣金
    if (buyerDist.parent_level_3_id) {
      const config = getConfig(3);
      const commission = orderAmount * config.rate / 100;

      await client.from('distribution_commissions').insert({
        user_id: buyerDist.parent_level_3_id,
        from_user_id: buyerId,
        order_id: orderId,
        order_no: orderNo,
        order_amount: orderAmount,
        commission_rate: config.rate,
        commission_amount: commission,
        level: 3,
        is_team_leader_bonus: false,
        status: 0,
        created_at: now,
      });

      await client
        .from('user_distribution')
        .update({
          total_commission: client.rpc('increment', { x: commission }),
          frozen_commission: client.rpc('increment', { x: commission }),
        })
        .eq('user_id', buyerDist.parent_level_3_id);

      console.log(`三级佣金计算完成: 用户 ${buyerDist.parent_level_3_id} 获得 HK$${commission.toFixed(2)}`);
    }

    // 团队长奖励
    if (buyerDist.team_leader_id && buyerDist.team_leader_id !== buyerDist.parent_id) {
      const config = getConfig(1);
      const teamLeaderRate = config.team_leader_rate || 1;
      const commission = orderAmount * teamLeaderRate / 100;

      await client.from('distribution_commissions').insert({
        user_id: buyerDist.team_leader_id,
        from_user_id: buyerId,
        order_id: orderId,
        order_no: orderNo,
        order_amount: orderAmount,
        commission_rate: teamLeaderRate,
        commission_amount: commission,
        level: 1,
        is_team_leader_bonus: true,
        status: 0,
        created_at: now,
      });

      await client
        .from('user_distribution')
        .update({
          total_commission: client.rpc('increment', { x: commission }),
          frozen_commission: client.rpc('increment', { x: commission }),
        })
        .eq('user_id', buyerDist.team_leader_id);

      console.log(`团队长奖励计算完成: 用户 ${buyerDist.team_leader_id} 获得 HK$${commission.toFixed(2)}`);
    }

    // 更新团队总销售额
    const allParents = [buyerDist.parent_id, buyerDist.parent_level_2_id, buyerDist.parent_level_3_id].filter(Boolean);
    for (const parentId of allParents) {
      if (parentId) {
        await client
          .from('user_distribution')
          .update({
            total_team_sales: client.rpc('increment', { x: orderAmount }),
          })
          .eq('user_id', parentId);
      }
    }

    console.log(`订单 ${orderNo} 佣金计算完成`);
  } catch (error) {
    console.error('计算分销佣金失败:', error);
    throw error;
  }
}

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

      // 订单完成时计算分销佣金
      if (newStatus === 3 && currentStatus !== 3) {
        // 异步计算佣金，不阻塞订单更新
        calculateDistributionCommission(order.id, order.user_id, order.pay_amount, order.order_no).catch(err => {
          console.error('计算分销佣金失败:', err);
        });
      }

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
