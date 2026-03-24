/**
 * @fileoverview 优惠券验证 API
 * @description 验证优惠券是否可用并计算折扣金额
 * @module app/api/coupons/validate/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 验证并计算优惠券折扣
 * POST /api/coupons/validate
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { userId, userCouponId, orderAmount, goodsId, categoryId } = body;

    if (!userId || !userCouponId || !orderAmount) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // 查询用户优惠券
    const { data: userCoupon, error: ucError } = await client
      .from('user_coupons')
      .select(`
        *,
        coupons (*)
      `)
      .eq('id', userCouponId)
      .eq('user_id', userId)
      .eq('status', 'unused')
      .single();

    if (ucError || !userCoupon) {
      return NextResponse.json({ error: '優惠券不可用' }, { status: 400 });
    }

    const coupon = userCoupon.coupons;
    if (!coupon) {
      return NextResponse.json({ error: '優惠券信息不存在' }, { status: 400 });
    }

    // 检查优惠券有效期
    const now = new Date();
    if (new Date(coupon.start_time) > now || new Date(coupon.end_time) < now) {
      return NextResponse.json({ error: '優惠券已過期' }, { status: 400 });
    }

    // 检查最低消费金额
    if (orderAmount < coupon.min_amount) {
      return NextResponse.json({ 
        error: `訂單金額需滿HK$${coupon.min_amount}才可使用` 
      }, { status: 400 });
    }

    // 检查适用范围
    if (coupon.scope === 'goods' && goodsId) {
      const scopeIds = JSON.parse(coupon.scope_ids || '[]');
      if (!scopeIds.includes(goodsId)) {
        return NextResponse.json({ error: '該商品不適用此優惠券' }, { status: 400 });
      }
    }

    if (coupon.scope === 'category' && categoryId) {
      const scopeIds = JSON.parse(coupon.scope_ids || '[]');
      if (!scopeIds.includes(categoryId)) {
        return NextResponse.json({ error: '該分類不適用此優惠券' }, { status: 400 });
      }
    }

    // 计算折扣金额
    let discountAmount = 0;

    switch (coupon.discount_type) {
      case 'fixed':
        // 固定金额折扣
        discountAmount = Math.min(coupon.discount_value, orderAmount);
        break;
      
      case 'percent':
        // 百分比折扣
        const percentDiscount = orderAmount * (coupon.discount_value / 100);
        discountAmount = coupon.max_discount 
          ? Math.min(percentDiscount, coupon.max_discount)
          : percentDiscount;
        break;
      
      case 'shipping':
        // 免运费券，折扣金额为运费（这里简化处理）
        discountAmount = coupon.discount_value;
        break;
    }

    // 四舍五入到小数点后两位
    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      success: true,
      data: {
        couponId: coupon.id,
        userCouponId: userCoupon.id,
        couponName: coupon.name,
        couponType: coupon.type,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount,
        finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
        minAmount: coupon.min_amount,
        maxDiscount: coupon.max_discount,
        endTime: coupon.end_time,
      },
    });
  } catch (error) {
    console.error('验证优惠券错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
