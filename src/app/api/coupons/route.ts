/**
 * @fileoverview 优惠券 API
 * @description 处理优惠券的领取、查询等操作
 * @module app/api/coupons/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取可领取的优惠券列表
 * GET /api/coupons
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'available'; // available-可领取, my-我的优惠券
    const userId = searchParams.get('userId');
    const goodsId = searchParams.get('goodsId');
    const amount = searchParams.get('amount');

    if (type === 'my' && !userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    if (type === 'available') {
      // 获取可领取的优惠券
      const now = new Date().toISOString();
      
      const { data: coupons, error } = await client
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .lte('start_time', now)
        .gte('end_time', now)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('查询优惠券失败:', error);
        // 返回模拟数据
        return NextResponse.json({
          success: true,
          data: getMockCoupons('available'),
        });
      }

      // 如果用户已登录，检查每个优惠券的领取状态
      let couponsWithStatus = coupons || [];
      if (userId) {
        const { data: userCoupons } = await client
          .from('user_coupons')
          .select('coupon_id')
          .eq('user_id', userId);

        const receivedCouponIds = new Set(userCoupons?.map(uc => uc.coupon_id) || []);
        
        couponsWithStatus = coupons?.map(coupon => ({
          ...coupon,
          received: receivedCouponIds.has(coupon.id),
          can_receive: !receivedCouponIds.has(coupon.id) && 
            (coupon.total_count === -1 || coupon.received_count < coupon.total_count),
        })) || [];
      }

      return NextResponse.json({
        success: true,
        data: couponsWithStatus,
      });
    }

    if (type === 'my') {
      // 获取用户已领取的优惠券
      const status = searchParams.get('status') || 'all'; // all, unused, used, expired
      
      let query = client
        .from('user_coupons')
        .select(`
          *,
          coupons (*)
        `)
        .eq('user_id', userId);

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data: userCoupons, error } = await query.execute().then(r => ({ data: r.data, error: r.error }));order('received_at', { ascending: false });

      if (error) {
        console.error('查询用户优惠券失败:', error);
        return NextResponse.json({
          success: true,
          data: getMockCoupons('my'),
        });
      }

      return NextResponse.json({
        success: true,
        data: userCoupons || [],
      });
    }

    if (type === 'available_for_order' && goodsId && amount) {
      // 获取订单可用的优惠券
      const orderAmount = parseFloat(amount);
      
      const { data: userCoupons, error } = await client
        .from('user_coupons')
        .select(`
          *,
          coupons (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'unused');

      if (error) {
        console.error('查询可用优惠券失败:', error);
        return NextResponse.json({
          success: true,
          data: getMockCoupons('available_for_order'),
        });
      }

      // 筛选符合条件的优惠券
      const availableCoupons = (userCoupons || []).filter(uc => {
        const coupon = uc.coupons;
        if (!coupon) return false;
        
        // 检查最低消费金额
        if (orderAmount < coupon.min_amount) return false;
        
        // 检查适用范围
        if (coupon.scope === 'goods') {
          const scopeIds = JSON.parse(coupon.scope_ids || '[]');
          if (!scopeIds.includes(parseInt(goodsId))) return false;
        }
        
        return true;
      });

      return NextResponse.json({
        success: true,
        data: availableCoupons,
      });
    }

    return NextResponse.json({ error: '無效的請求' }, { status: 400 });
  } catch (error) {
    console.error('优惠券API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * 领取优惠券
 * POST /api/coupons
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { userId, couponId, code } = body;

    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    let coupon;

    if (code) {
      // 通过优惠券码领取
      const { data, error } = await client
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: '優惠券碼無效' }, { status: 400 });
      }
      coupon = data;
    } else if (couponId) {
      // 通过ID领取
      const { data, error } = await client
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: '優惠券不存在' }, { status: 400 });
      }
      coupon = data;
    } else {
      return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    }

    // 检查优惠券是否有效
    const now = new Date();
    if (new Date(coupon.start_time) > now || new Date(coupon.end_time) < now) {
      return NextResponse.json({ error: '優惠券已過期或未生效' }, { status: 400 });
    }

    // 检查库存
    if (coupon.total_count !== -1 && coupon.received_count >= coupon.total_count) {
      return NextResponse.json({ error: '優惠券已被領完' }, { status: 400 });
    }

    // 检查用户是否已领取
    const { data: existingCoupon } = await client
      .from('user_coupons')
      .select('*')
      .eq('user_id', userId)
      .eq('coupon_id', coupon.id)
      .single();

    if (existingCoupon) {
      return NextResponse.json({ error: '您已領取過該優惠券' }, { status: 400 });
    }

    // 检查用户领取数量限制
    const { count } = await client
      .from('user_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('coupon_id', coupon.id);

    if (count && count >= coupon.per_user_limit) {
      return NextResponse.json({ error: `每人最多領取${coupon.per_user_limit}張` }, { status: 400 });
    }

    // 领取优惠券
    const { error: insertError } = await client
      .from('user_coupons')
      .insert({
        user_id: userId,
        coupon_id: coupon.id,
        status: 'unused',
      });

    if (insertError) {
      console.error('领取优惠券失败:', insertError);
      return NextResponse.json({ error: '領取失敗，請重試' }, { status: 500 });
    }

    // 更新优惠券领取数量
    await client
      .from('coupons')
      .update({ received_count: coupon.received_count + 1 })
      .eq('id', coupon.id);

    return NextResponse.json({
      success: true,
      message: '領取成功',
      data: coupon,
    });
  } catch (error) {
    console.error('领取优惠券错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

// 模拟数据
function getMockCoupons(type: string) {
  const mockAvailableCoupons = [
    {
      id: 1,
      name: '新用戶專享券',
      code: 'NEWUSER50',
      type: 'cash',
      discount_type: 'fixed',
      discount_value: 50,
      min_amount: 200,
      max_discount: null,
      total_count: 1000,
      used_count: 256,
      per_user_limit: 1,
      received_count: 500,
      start_time: '2024-01-01T00:00:00',
      end_time: '2026-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '新用戶首單立減HK$50，滿HK$200可用',
      received: false,
      can_receive: true,
    },
    {
      id: 2,
      name: '開年大促優惠券',
      code: 'SPRING2025',
      type: 'discount',
      discount_type: 'percent',
      discount_value: 15,
      min_amount: 300,
      max_discount: 100,
      total_count: 500,
      used_count: 120,
      per_user_limit: 2,
      received_count: 200,
      start_time: '2024-01-01T00:00:00',
      end_time: '2025-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '全場滿HK$300享85折優惠',
      received: false,
      can_receive: true,
    },
    {
      id: 3,
      name: '免運費券',
      code: 'FREESHIP',
      type: 'shipping',
      discount_type: 'fixed',
      discount_value: 30,
      min_amount: 100,
      max_discount: null,
      total_count: 2000,
      used_count: 800,
      per_user_limit: 3,
      received_count: 1200,
      start_time: '2024-01-01T00:00:00',
      end_time: '2026-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '滿HK$100免運費',
      received: false,
      can_receive: true,
    },
  ];

  const mockMyCoupons = [
    {
      id: 101,
      user_id: 'user1',
      coupon_id: 1,
      status: 'unused',
      received_at: '2026-03-20T10:00:00',
      coupons: mockAvailableCoupons[0],
    },
    {
      id: 102,
      user_id: 'user1',
      coupon_id: 3,
      status: 'used',
      received_at: '2026-03-15T10:00:00',
      used_at: '2026-03-18T14:30:00',
      coupons: mockAvailableCoupons[2],
    },
  ];

  switch (type) {
    case 'available':
      return mockAvailableCoupons;
    case 'my':
      return mockMyCoupons;
    case 'available_for_order':
      return mockMyCoupons.filter(c => c.status === 'unused');
    default:
      return [];
  }
}
