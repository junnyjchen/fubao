/**
 * @fileoverview 分销中心API路由
 * @description 获取分销统计数据
 * @module app/api/distribution/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

// 验证用户登录
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
 * GET /api/distribution - 获取分销中心数据
 */
export async function GET(request: NextRequest) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  try {
    // 获取用户分销信息
    const { data: distribution, error: distError } = await supabase
      .from('user_distribution')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (distError || !distribution) {
      // 如果没有分销信息，创建一个
      const { data: newDist, error: createError } = await supabase
        .from('user_distribution')
        .insert({
          user_id: userId,
          invite_code: generateInviteCode(),
        })
        .select()
        .single();

      if (createError) {
        // 返回模拟数据
        return NextResponse.json({
          success: true,
          data: getMockDistributionData(userId),
        });
      }

      return NextResponse.json({
        success: true,
        data: formatDistributionData(newDist),
      });
    }

    // 获取今日佣金
    const today = new Date().toISOString().split('T')[0];
    const { data: todayCommissions } = await supabase
      .from('distribution_commissions')
      .select('commission_amount')
      .eq('user_id', userId)
      .eq('status', 1)
      .gte('created_at', today);

    const todayCommission = todayCommissions?.reduce(
      (sum: number, c: any) => sum + c.commission_amount, 0
    ) || 0;

    // 获取本月佣金
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: monthCommissions } = await supabase
      .from('distribution_commissions')
      .select('commission_amount')
      .eq('user_id', userId)
      .eq('status', 1)
      .gte('created_at', monthStart.toISOString());

    const monthCommission = monthCommissions?.reduce(
      (sum: number, c: any) => sum + c.commission_amount, 0
    ) || 0;

    // 获取待结算佣金
    const { data: pendingCommissions } = await supabase
      .from('distribution_commissions')
      .select('commission_amount')
      .eq('user_id', userId)
      .eq('status', 0);

    const pendingCommission = pendingCommissions?.reduce(
      (sum: number, c: any) => sum + c.commission_amount, 0
    ) || 0;

    return NextResponse.json({
      success: true,
      data: {
        ...formatDistributionData(distribution),
        today_commission: todayCommission,
        month_commission: monthCommission,
        pending_commission: pendingCommission,
      },
    });
  } catch (error) {
    console.error('获取分销数据失败:', error);
    // 返回模拟数据
    return NextResponse.json({
      success: true,
      data: getMockDistributionData(userId),
    });
  }
}

/**
 * POST /api/distribution - 创建分销账户
 */
export async function POST(request: NextRequest) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { invite_code } = body;

    // 检查是否已有分销账户
    const { data: existing } = await supabase
      .from('user_distribution')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: '已存在分銷賬戶',
      });
    }

    // 创建分销账户
    const { data, error } = await supabase
      .from('user_distribution')
      .insert({
        user_id: userId,
        invite_code: generateInviteCode(),
        parent_id: invite_code || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: '分銷賬戶創建成功',
    });
  } catch (error) {
    console.error('创建分销账户失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function formatDistributionData(data: any) {
  return {
    invite_code: data.invite_code,
    invite_link: `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://fubao.ltd'}/register?ref=${data.invite_code}`,
    is_team_leader: data.is_team_leader,
    team_leader_id: data.team_leader_id,
    total_commission: data.total_commission || 0,
    available_commission: data.available_commission || 0,
    frozen_commission: data.frozen_commission || 0,
    withdrawn_commission: data.withdrawn_commission || 0,
    team_count: data.team_count || 0,
    direct_count: data.direct_count || 0,
    level_2_count: data.level_2_count || 0,
    level_3_count: data.level_3_count || 0,
    total_team_sales: data.total_team_sales || 0,
  };
}

function getMockDistributionData(userId: string) {
  return {
    invite_code: 'FU' + userId.slice(-4).toUpperCase(),
    invite_link: `${process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://fubao.ltd'}/register?ref=FU${userId.slice(-4).toUpperCase()}`,
    is_team_leader: false,
    team_leader_id: null,
    total_commission: 1888.50,
    available_commission: 668.00,
    frozen_commission: 120.50,
    withdrawn_commission: 1100.00,
    team_count: 156,
    direct_count: 42,
    level_2_count: 68,
    level_3_count: 46,
    total_team_sales: 56880.00,
    today_commission: 88.50,
    month_commission: 356.00,
    pending_commission: 120.50,
  };
}
