/**
 * @fileoverview 充值 API
 * @description 处理用户余额充值
 * @module app/api/recharge/route
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

/**
 * 生成充值单号
 * @returns 充值单号
 */
function generateRechargeNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RC${timestamp}${random}`;
}

/**
 * 充值金额赠送规则
 */
const BONUS_RULES = [
  { minAmount: 500, bonusRate: 0.05 },   // 充值500+ 送5%
  { minAmount: 1000, bonusRate: 0.10 },  // 充值1000+ 送10%
  { minAmount: 2000, bonusRate: 0.15 },  // 充值2000+ 送15%
  { minAmount: 5000, bonusRate: 0.20 },  // 充值5000+ 送20%
];

/**
 * 计算赠送金额
 * @param amount - 充值金额
 * @returns 赠送金额
 */
function calculateBonus(amount: number): number {
  for (let i = BONUS_RULES.length - 1; i >= 0; i--) {
    if (amount >= BONUS_RULES[i].minAmount) {
      return Math.floor(amount * BONUS_RULES[i].bonusRate);
    }
  }
  return 0;
}

/**
 * 获取充值记录列表
 * @param request - 请求对象
 * @returns 充值记录列表
 */
export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let query = client
      .from('recharge_records')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 获取赠送规则
    const bonusRules = BONUS_RULES.map(rule => ({
      minAmount: rule.minAmount,
      bonusRate: rule.bonusRate,
      bonusAmount: Math.floor(rule.minAmount * rule.bonusRate),
    }));

    return NextResponse.json({
      data,
      bonusRules,
      page,
      limit,
      total: count || 0,
    });
  } catch (error) {
    console.error('获取充值记录失败:', error);
    return NextResponse.json({ error: '獲取充值記錄失敗' }, { status: 500 });
  }
}

/**
 * 创建充值订单
 * @param request - 请求对象
 * @returns 充值订单信息
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, payment_method } = body;

    // 参数验证
    if (!amount || amount < 10) {
      return NextResponse.json({ error: '充值金額不能少於HK$10' }, { status: 400 });
    }

    if (amount > 50000) {
      return NextResponse.json({ error: '單次充值金額不能超過HK$50,000' }, { status: 400 });
    }

    const validPaymentMethods = ['alipay', 'wechat', 'paypal'];
    if (!payment_method || !validPaymentMethods.includes(payment_method)) {
      return NextResponse.json({ error: '請選擇有效的支付方式' }, { status: 400 });
    }

    // 计算赠送金额
    const bonusAmount = calculateBonus(amount);

    // 生成充值单号
    const rechargeNo = generateRechargeNo();

    // 创建充值记录
    const { data: recharge, error } = await client
      .from('recharge_records')
      .insert({
        recharge_no: rechargeNo,
        user_id: userId,
        amount,
        payment_method,
        status: 'pending',
        bonus_amount: bonusAmount,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '創建充值訂單失敗' }, { status: 500 });
    }

    // 创建支付记录
    const paymentId = `PAY${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    await client
      .from('payments')
      .insert({
        payment_id: paymentId,
        user_id: userId,
        amount,
        payment_method,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      message: '充值訂單創建成功',
      data: {
        recharge,
        payment_id: paymentId,
        bonus_amount: bonusAmount,
        total_amount: amount + bonusAmount,
      },
    });
  } catch (error) {
    console.error('创建充值订单失败:', error);
    return NextResponse.json({ error: '創建充值訂單失敗' }, { status: 500 });
  }
}

/**
 * 充值回调（支付成功后调用）
 * @param request - 请求对象
 * @returns 处理结果
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { recharge_no, transaction_id } = body;

    if (!recharge_no) {
      return NextResponse.json({ error: '缺少充值單號' }, { status: 400 });
    }

    // 查询充值记录
    const { data: recharge, error: fetchError } = await client
      .from('recharge_records')
      .select('*')
      .eq('recharge_no', recharge_no)
      .eq('user_id', userId)
      .single();

    if (fetchError || !recharge) {
      return NextResponse.json({ error: '充值記錄不存在' }, { status: 404 });
    }

    if (recharge.status !== 'pending') {
      return NextResponse.json({ error: '充值已處理' }, { status: 400 });
    }

    // 获取用户当前余额
    const { data: userBalance } = await client
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentBalance = userBalance?.balance || 0;
    const totalAmount = recharge.amount + recharge.bonus_amount;
    const newBalance = currentBalance + totalAmount;

    // 开始事务处理
    // 1. 更新充值记录状态
    await client
      .from('recharge_records')
      .update({
        status: 'success',
        transaction_id,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', recharge.id);

    // 2. 更新或创建用户余额
    if (userBalance) {
      await client
        .from('user_balances')
        .update({
          balance: newBalance,
          total_recharge: (userBalance.total_recharge || 0) + recharge.amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      await client
        .from('user_balances')
        .insert({
          user_id: userId,
          balance: newBalance,
          total_recharge: recharge.amount,
        });
    }

    // 3. 记录余额流水
    await client
      .from('balance_transactions')
      .insert({
        user_id: userId,
        type: 'recharge',
        amount: recharge.amount,
        balance_before: currentBalance,
        balance_after: newBalance,
        related_id: recharge_no,
        remark: `餘額充值${recharge.bonus_amount > 0 ? `，贈送HK$${recharge.bonus_amount}` : ''}`,
      });

    // 如果有赠送金额，记录赠送流水
    if (recharge.bonus_amount > 0) {
      await client
        .from('balance_transactions')
        .insert({
          user_id: userId,
          type: 'bonus',
          amount: recharge.bonus_amount,
          balance_before: newBalance - recharge.bonus_amount,
          balance_after: newBalance,
          related_id: recharge_no,
          remark: '充值贈送',
        });
    }

    return NextResponse.json({
      message: '充值成功',
      data: {
        recharge_no,
        amount: recharge.amount,
        bonus_amount: recharge.bonus_amount,
        total_amount: totalAmount,
        new_balance: newBalance,
      },
    });
  } catch (error) {
    console.error('充值回调处理失败:', error);
    return NextResponse.json({ error: '充值處理失敗' }, { status: 500 });
  }
}
