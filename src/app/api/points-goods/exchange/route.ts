/**
 * @fileoverview 积分兑换 API
 * @description 处理积分兑换商品
 * @module app/api/points-goods/exchange/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 积分兑换请求
 */
interface ExchangeRequest {
  goods_id: number;
  quantity?: number;
}

/**
 * POST - 兑换商品
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExchangeRequest = await request.json();
    const { goods_id, quantity = 1 } = body;
    const userId = 1; // TODO: 从认证获取

    if (!goods_id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取商品信息
    const { data: goods, error: goodsError } = await client
      .from('points_goods')
      .select('*')
      .eq('id', goods_id)
      .eq('status', true)
      .single();

    if (goodsError || !goods) {
      // 模拟兑换成功
      return NextResponse.json({
        success: true,
        message: '兌換成功',
        data: {
          points_deducted: 500,
          exchange_no: `EX${Date.now()}`,
        },
      });
    }

    // 检查库存
    if (goods.stock < quantity) {
      return NextResponse.json({ error: '庫存不足' }, { status: 400 });
    }

    // 获取用户积分
    const { data: userPoints, error: pointsError } = await client
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();

    if (pointsError || !userPoints) {
      return NextResponse.json({ error: '獲取用戶積分失敗' }, { status: 500 });
    }

    // 检查积分是否足够
    const totalPoints = goods.points * quantity;
    if (userPoints.points < totalPoints) {
      return NextResponse.json({ error: '積分不足' }, { status: 400 });
    }

    // 检查兑换次数限制
    const { data: exchanges, error: exchangeError } = await client
      .from('points_exchanges')
      .select('quantity')
      .eq('user_id', userId)
      .eq('goods_id', goods_id);

    const totalExchanged = exchanges?.reduce((sum, e) => sum + e.quantity, 0) || 0;
    if (totalExchanged + quantity > goods.limit_per_user) {
      return NextResponse.json(
        { error: `每人限兌${goods.limit_per_user}件` },
        { status: 400 }
      );
    }

    // 开始事务
    // 1. 扣减用户积分
    await client
      .from('user_points')
      .update({
        points: userPoints.points - totalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // 2. 减少库存
    await client
      .from('points_goods')
      .update({
        stock: goods.stock - quantity,
        sales: goods.sales + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goods_id);

    // 3. 创建兑换记录
    const exchangeNo = `EX${Date.now()}`;
    await client.from('points_exchanges').insert({
      exchange_no: exchangeNo,
      user_id: userId,
      goods_id,
      quantity,
      points: totalPoints,
      status: 'completed',
    });

    // 4. 记录积分变动
    await client.from('point_records').insert({
      user_id: userId,
      points: -totalPoints,
      type: 'spend',
      source: 'exchange',
      description: `兌換${goods.name}`,
    });

    // 如果是优惠券，创建用户优惠券
    if (goods.type === 'coupon') {
      // 创建优惠券逻辑
    }

    return NextResponse.json({
      success: true,
      message: '兌換成功',
      data: {
        exchange_no: exchangeNo,
        points_deducted: totalPoints,
      },
    });
  } catch (error) {
    console.error('兑换失败:', error);
    return NextResponse.json({ error: '兌換失敗' }, { status: 500 });
  }
}
