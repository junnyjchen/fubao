/**
 * @fileoverview 用户等级API
 * @description 获取用户会员等级信息
 * @module app/api/user/level/route
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** 会员等级配置 */
const MEMBER_LEVELS = [
  { level: 1, name: '普通會員', min_points: 0, max_points: 99, discount: 100 },
  { level: 2, name: '入門信士', min_points: 100, max_points: 499, discount: 99 },
  { level: 3, name: '虔誠信士', min_points: 500, max_points: 1999, discount: 98 },
  { level: 4, name: '資深信士', min_points: 2000, max_points: 4999, discount: 95 },
  { level: 5, name: '至尊會員', min_points: 5000, max_points: null, discount: 93 },
];

/**
 * GET /api/user/level
 * 获取用户会员等级信息
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // 如果未登录，返回模拟数据
    if (authError || !user) {
      return NextResponse.json({
        level: 1,
        name: '普通會員',
        points: 50,
        total_points: 250,
        discount: 100,
        next_level: {
          level: 2,
          name: '銅牌會員',
          min_points: 100,
        },
        progress: 50,
        member_since: '2024-01-01',
        expiry_date: '2025-12-31',
      });
    }
    
    // 获取用户积分
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('points, total_points')
      .eq('user_id', user.id)
      .single();
    
    if (pointsError && pointsError.code !== 'PGRST116') {
      console.error('获取用户积分失败:', pointsError);
      return NextResponse.json(
        { error: '獲取用戶信息失敗' },
        { status: 500 }
      );
    }
    
    const points = userPoints?.points || 0;
    const totalPoints = userPoints?.total_points || 0;
    
    // 计算会员等级
    let currentLevel = MEMBER_LEVELS[0];
    let nextLevel = MEMBER_LEVELS[1] || null;
    
    for (let i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
      const level = MEMBER_LEVELS[i];
      if (totalPoints >= level.min_points) {
        currentLevel = level;
        nextLevel = MEMBER_LEVELS[i + 1] || null;
        break;
      }
    }
    
    // 计算升级进度
    let progress = 0;
    if (nextLevel) {
      const currentMin = currentLevel.min_points;
      const nextMin = nextLevel.min_points;
      if (nextMin) {
        progress = Math.round(((totalPoints - currentMin) / (nextMin - currentMin)) * 100);
        progress = Math.min(100, Math.max(0, progress));
      }
    } else {
      progress = 100; // 最高等级
    }
    
    return NextResponse.json({
      data: {
        level: currentLevel.level,
        name: currentLevel.name,
        points,
        total_points: totalPoints,
        discount: currentLevel.discount,
        next_level: nextLevel ? {
          level: nextLevel.level,
          name: nextLevel.name,
          min_points: nextLevel.min_points,
        } : null,
        progress,
      },
    });
  } catch (error) {
    console.error('用户等级API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
