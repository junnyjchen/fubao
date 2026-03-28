/**
 * @fileoverview 用户余额 API
 * @description 处理用户余额查询和流水记录
 * @module app/api/user/balance/route
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
 * 获取用户余额信息
 * @param request - 请求对象
 * @returns 余额信息
 */
export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeTransactions = searchParams.get('transactions') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 获取用户余额
    const balanceResult = await client
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    let balance = balanceResult.data;
    const error = balanceResult.error;

    // 如果余额记录不存在，创建一个
    if (error && error.code === 'PGRST116') {
      const { data: newBalance, error: createError } = await client
        .from('user_balances')
        .insert({
          user_id: userId,
          balance: 0,
          frozen_balance: 0,
          total_recharge: 0,
          total_withdraw: 0,
          total_consumed: 0,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: '初始化餘額失敗' }, { status: 500 });
      }
      balance = newBalance;
    } else if (error) {
      return NextResponse.json({ error: '獲取餘額失敗' }, { status: 500 });
    }

    const result: {
      balance: typeof balance;
      transactions?: unknown[];
      total?: number;
    } = { balance };

    // 获取余额流水
    if (includeTransactions) {
      const offset = (page - 1) * limit;
      
      const { data: transactions, count } = await client
        .from('balance_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      result.transactions = transactions || [];
      result.total = count || 0;
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('获取用户余额失败:', error);
    return NextResponse.json({ error: '獲取餘額失敗' }, { status: 500 });
  }
}
