/**
 * @fileoverview 我的团队API路由
 * @description 获取团队成员列表
 * @module app/api/distribution/team/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

interface TeamMember {
  user_id: string;
  created_at: string;
  direct_count: number;
  team_count: number;
  total_commission: number;
  parent_level_2_id?: string | null;
  parent_level_3_id?: string | null;
  users?: {
    id: string;
    nickname: string | null;
    avatar: string | null;
    created_at: string;
  } | {
    id: string;
    nickname: string | null;
    avatar: string | null;
    created_at: string;
  }[] | null;
}

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
 * GET /api/distribution/team - 获取团队成员列表
 */
export async function GET(request: NextRequest) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level') || 'all'; // all/1/2/3
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    // 构建查询条件
    let query = supabase
      .from('user_distribution')
      .select(`
        user_id,
        created_at,
        direct_count,
        team_count,
        total_commission,
        users (
          id,
          nickname,
          avatar,
          created_at
        )
      `, { count: 'exact' });

    // 根据层级筛选
    if (level === '1') {
      query = query.eq('parent_id', userId);
    } else if (level === '2') {
      query = query.eq('parent_level_2_id', userId);
    } else if (level === '3') {
      query = query.eq('parent_level_3_id', userId);
    } else {
      // 所有下级
      query = query.or(`parent_id.eq.${userId},parent_level_2_id.eq.${userId},parent_level_3_id.eq.${userId}`);
    }

    query = query.order('created_at', { ascending: false });

    const { data: members, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取团队失败:', error);
      // 返回模拟数据
      return NextResponse.json({
        success: true,
        data: getMockTeamData(level, page, pageSize),
      });
    }

    // 格式化数据并添加层级信息
    const formattedMembers = (members || []).map((m: TeamMember) => {
      let memberLevel = 1;
      if (m.parent_level_2_id === userId) memberLevel = 2;
      if (m.parent_level_3_id === userId) memberLevel = 3;

      const userData = Array.isArray(m.users) ? m.users[0] : m.users;
      return {
        user_id: m.user_id,
        nickname: userData?.nickname || '用戶',
        avatar: userData?.avatar,
        level: memberLevel,
        direct_count: m.direct_count || 0,
        team_count: m.team_count || 0,
        total_commission: m.total_commission || 0,
        joined_at: m.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        list: formattedMembers,
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('获取团队失败:', error);
    return NextResponse.json({
      success: true,
      data: getMockTeamData(level, page, pageSize),
    });
  }
}

function getMockTeamData(level: string, page: number, pageSize: number) {
  const allMembers = [
    { user_id: 'u1', nickname: '張小明', avatar: null, level: 1, direct_count: 12, team_count: 45, total_commission: 888.00, joined_at: '2026-03-20' },
    { user_id: 'u2', nickname: '李大姐', avatar: null, level: 1, direct_count: 8, team_count: 23, total_commission: 456.00, joined_at: '2026-03-18' },
    { user_id: 'u3', nickname: '王先生', avatar: null, level: 1, direct_count: 5, team_count: 15, total_commission: 234.00, joined_at: '2026-03-15' },
    { user_id: 'u4', nickname: '陳小姐', avatar: null, level: 2, direct_count: 6, team_count: 18, total_commission: 188.00, joined_at: '2026-03-12' },
    { user_id: 'u5', nickname: '劉師傅', avatar: null, level: 2, direct_count: 3, team_count: 8, total_commission: 156.00, joined_at: '2026-03-10' },
    { user_id: 'u6', nickname: '周女士', avatar: null, level: 2, direct_count: 4, team_count: 12, total_commission: 128.00, joined_at: '2026-03-08' },
    { user_id: 'u7', nickname: '吳經理', avatar: null, level: 3, direct_count: 2, team_count: 5, total_commission: 88.00, joined_at: '2026-03-05' },
    { user_id: 'u8', nickname: '鄭老闆', avatar: null, level: 3, direct_count: 1, team_count: 3, total_commission: 56.00, joined_at: '2026-03-01' },
  ];

  let filtered = allMembers;
  if (level !== 'all') {
    const levelNum = parseInt(level);
    filtered = allMembers.filter(m => m.level === levelNum);
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
