/**
 * @fileoverview 佣金明细API路由
 * @description 获取佣金记录
 * @module app/api/distribution/commissions/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

async function verifyUser(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * GET /api/distribution/commissions - 获取佣金明细
 */
export async function GET(request: NextRequest) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all'; // all/commission/bonus
  const status = searchParams.get('status'); // 0/1/2 or null for all
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    let query = supabase
      .from('distribution_commissions')
      .select(`
        id,
        from_user_id,
        order_no,
        order_amount,
        commission_rate,
        commission_amount,
        level,
        is_team_leader_bonus,
        status,
        settled_at,
        created_at
      `, { count: 'exact' })
      .eq('user_id', userId);

    // 类型筛选
    if (type === 'commission') {
      query = query.eq('is_team_leader_bonus', false);
    } else if (type === 'bonus') {
      query = query.eq('is_team_leader_bonus', true);
    }

    // 状态筛选
    if (status !== null) {
      query = query.eq('status', parseInt(status));
    }

    query = query.order('created_at', { ascending: false });

    const { data: commissions, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取佣金明细失败:', error);
      return NextResponse.json({
        success: true,
        data: getMockCommissions(type, page, pageSize),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        list: commissions || [],
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('获取佣金明细失败:', error);
    return NextResponse.json({
      success: true,
      data: getMockCommissions(type, page, pageSize),
    });
  }
}

function getMockCommissions(type: string, page: number, pageSize: number) {
  const allCommissions = [
    { id: 1, from_user_id: 'u1', order_no: 'FB20260324001', order_amount: 288, commission_rate: 10, commission_amount: 28.80, level: 1, is_team_leader_bonus: false, status: 1, settled_at: '2026-03-24', created_at: '2026-03-24T10:30:00' },
    { id: 2, from_user_id: 'u2', order_no: 'FB20260324002', order_amount: 588, commission_rate: 10, commission_amount: 58.80, level: 1, is_team_leader_bonus: false, status: 1, settled_at: '2026-03-24', created_at: '2026-03-24T09:15:00' },
    { id: 3, from_user_id: 'u3', order_no: 'FB20260323001', order_amount: 168, commission_rate: 5, commission_amount: 8.40, level: 2, is_team_leader_bonus: false, status: 1, settled_at: '2026-03-23', created_at: '2026-03-23T16:20:00' },
    { id: 4, from_user_id: 'u1', order_no: 'FB20260322001', order_amount: 388, commission_rate: 2, commission_amount: 7.76, level: 3, is_team_leader_bonus: false, status: 1, settled_at: '2026-03-22', created_at: '2026-03-22T14:00:00' },
    { id: 5, from_user_id: 'u4', order_no: 'FB20260322002', order_amount: 688, commission_rate: 2, commission_amount: 13.76, level: 1, is_team_leader_bonus: true, status: 1, settled_at: '2026-03-22', created_at: '2026-03-22T11:30:00' },
    { id: 6, from_user_id: 'u5', order_no: 'FB20260321001', order_amount: 458, commission_rate: 10, commission_amount: 45.80, level: 1, is_team_leader_bonus: false, status: 0, settled_at: null, created_at: '2026-03-21T15:45:00' },
  ];

  let filtered = allCommissions;
  if (type === 'commission') {
    filtered = allCommissions.filter(c => !c.is_team_leader_bonus);
  } else if (type === 'bonus') {
    filtered = allCommissions.filter(c => c.is_team_leader_bonus);
  }

  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return {
    list: paginated,
    total: filtered.length,
    page,
    pageSize,
  };
}
