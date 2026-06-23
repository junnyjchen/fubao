/**
 * @fileoverview 优惠券 API
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 获取可用优惠券列表 */
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    
    // 获取所有有效优惠券
    const coupons = await query(
      'SELECT * FROM coupons WHERE status = 1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC'
    );

    // 如果用户已登录，标记已领取状态
    if (userId) {
      try {
        const userCoupons = await query(
          'SELECT coupon_id FROM user_coupons WHERE user_id = ?',
          [userId]
        );
        const claimedIds = new Set(
          Array.isArray(userCoupons) ? userCoupons.map((uc: any) => uc.coupon_id) : []
        );
        
        const result = Array.isArray(coupons) ? coupons.map((c: any) => ({
          ...c,
          claimed: claimedIds.has(c.id),
        })) : [];
        
        return NextResponse.json({ success: true, data: result });
      } catch {
        // user_coupons 表不存在时直接返回
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.isArray(coupons) ? coupons.map((c: any) => ({ ...c, claimed: false })) : [],
    });
  } catch (error) {
    console.error('获取优惠券失败:', error);
    return NextResponse.json({ success: false, error: '獲取優惠券失敗' }, { status: 500 });
  }
}

/** 领取优惠券 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json({ success: false, error: '缺少優惠券ID' }, { status: 400 });
    }

    // 简单实现：记录用户领取
    const { insert } = await import('@/lib/db');
    await insert('user_coupons', {
      user_id: userId,
      coupon_id: Number(couponId),
      status: 'active',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ success: true, message: '領取成功' });
  } catch (error) {
    console.error('领取优惠券失败:', error);
    return NextResponse.json({ success: false, error: '領取失敗' }, { status: 500 });
  }
}
