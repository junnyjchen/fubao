/**
 * @fileoverview 用户提现API
 * @description 处理用户提现申请
 * @module app/api/withdraw/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 生成提现单号
 */
function generateWithdrawNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WD${timestamp}${random}`;
}

/**
 * GET /api/withdraw
 * 获取提现记录
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // 获取提现记录
    const { data: records, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取提现记录失败:', error);
      // 返回空数组而不是错误，因为表可能不存在
      return NextResponse.json({ data: [] });
    }
    
    return NextResponse.json({ data: records || [] });
  } catch (error) {
    console.error('提现记录API错误:', error);
    return NextResponse.json({ data: [] });
  }
}

/**
 * POST /api/withdraw
 * 创建提现申请
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      withdraw_method,
      bank_info,
      alipay_account,
      wechat_account,
    } = body;

    // 验证金额
    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: '最低提現金額為HK$50' },
        { status: 400 }
      );
    }

    // 获取用户余额
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance, frozen_balance')
      .eq('user_id', user.id)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('获取余额失败:', balanceError);
      return NextResponse.json(
        { error: '獲取餘額失敗' },
        { status: 500 }
      );
    }

    const balance = balanceData?.balance || 0;
    if (amount > balance) {
      return NextResponse.json(
        { error: '提現金額不能超過可用餘額' },
        { status: 400 }
      );
    }

    // 计算手续费（暂免）
    const fee = 0;
    const actualAmount = amount - fee;

    // 生成提现单号
    const withdrawNo = generateWithdrawNo();

    // 构建提现信息
    const withdrawData: Record<string, unknown> = {
      user_id: user.id,
      withdraw_no: withdrawNo,
      amount,
      fee,
      actual_amount: actualAmount,
      withdraw_method,
      status: 'pending',
    };

    if (withdraw_method === 'bank' && bank_info) {
      withdrawData.bank_name = bank_info.bank_name;
      withdrawData.bank_branch = bank_info.bank_branch;
      withdrawData.account_name = bank_info.account_name;
      withdrawData.bank_account = bank_info.account_number;
    } else if (withdraw_method === 'alipay') {
      withdrawData.bank_name = '支付寶';
      withdrawData.bank_account = alipay_account;
    } else if (withdraw_method === 'wechat') {
      withdrawData.bank_name = '微信';
      withdrawData.bank_account = wechat_account;
    }

    // 创建提现记录
    const { data: withdraw, error: withdrawError } = await supabase
      .from('withdrawals')
      .insert(withdrawData)
      .select()
      .single();

    if (withdrawError) {
      console.error('创建提现记录失败:', withdrawError);
      return NextResponse.json(
        { error: '提現申請失敗' },
        { status: 500 }
      );
    }

    // 冻结用户余额
    await supabase
      .from('user_balances')
      .upsert({
        user_id: user.id,
        balance: balance - amount,
        frozen_balance: (balanceData?.frozen_balance || 0) + amount,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({
      message: '提現申請已提交',
      data: withdraw,
    });
  } catch (error) {
    console.error('提现API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
