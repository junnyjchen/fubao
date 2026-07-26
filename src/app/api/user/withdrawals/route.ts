/**
 * @fileoverview 用户提现API
 * @description 用户余额提现申请和记录查询
 * @module app/api/user/withdrawals/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 获取用户提现记录 */
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
  }

  try {
    const withdrawals = await query(
      'SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: Array.isArray(withdrawals) ? withdrawals : [],
    });
  } catch (error) {
    console.error('[Withdrawals] 获取记录失败:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

/** 提交提现申请 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, method, address } = body;

    // 验证金额
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: '請輸入有效的提現金額' }, { status: 400 });
    }

    if (amount < 10) {
      return NextResponse.json({ success: false, error: '最低提現金額為 HK$10' }, { status: 400 });
    }

    // 验证SOL地址
    if (method === 'sol') {
      if (!address || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        return NextResponse.json({ success: false, error: 'SOL錢包地址格式不正確' }, { status: 400 });
      }
    }

    // 获取用户余额
    const user = await queryOne('SELECT balance FROM users WHERE id = ?', [userId]);
    if (!user) {
      return NextResponse.json({ success: false, error: '用戶不存在' }, { status: 404 });
    }

    const balance = (user as { balance: number }).balance || 0;
    if (amount > balance) {
      return NextResponse.json({ success: false, error: '提現金額超過可用餘額' }, { status: 400 });
    }

    // 计算手续费和实际到账金额
    const fee = Math.round(amount * 0.01 * 100) / 100; // 1%手续费
    const actualAmount = Math.round((amount - fee) * 100) / 100;

    // 创建提现记录
    const withdrawNo = `WD${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await insert('withdrawals', {
      user_id: userId,
      withdraw_no: withdrawNo,
      amount,
      fee,
      actual_amount: actualAmount,
      method: method || 'sol',
      address: address || '',
      status: 'pending',
      remark: '',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    // 冻结余额
    await query(
      'UPDATE users SET balance = balance - ?, frozen_balance = frozen_balance + ? WHERE id = ?',
      [amount, amount, userId]
    );

    // 记录余额变动
    await insert('balance_logs', {
      user_id: userId,
      type: 'withdraw',
      amount: -amount,
      balance_before: balance,
      balance_after: balance - amount,
      remark: `提現申請 ${withdrawNo}`,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({
      success: true,
      message: '提現申請已提交，請等待審核',
      data: { withdraw_no: withdrawNo },
    });
  } catch (error) {
    console.error('[Withdrawals] 提交失败:', error);
    return NextResponse.json({ success: false, error: '提現申請失敗，請稍後再試' }, { status: 500 });
  }
}
