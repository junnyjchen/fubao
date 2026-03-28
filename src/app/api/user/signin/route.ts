/**
 * @fileoverview 用户签到API
 * @description 处理每日签到和签到记录
 * @module app/api/user/signin/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface SigninRecord {
  sign_date: string;
}

/**
 * GET - 获取签到信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取

    const client = getSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    // 获取今日签到记录
    const { data: todaySignin } = await client
      .from('user_signins')
      .select('*')
      .eq('user_id', parseInt(userId))
      .eq('sign_date', today)
      .single();

    // 获取本月签到记录
    const monthStart = new Date();
    monthStart.setDate(1);
    const { data: monthSignins } = await client
      .from('user_signins')
      .select('sign_date')
      .eq('user_id', parseInt(userId))
      .gte('sign_date', monthStart.toISOString().split('T')[0])
      .order('sign_date', { ascending: true });

    // 获取最近一次签到记录
    const { data: lastSignin } = await client
      .from('user_signins')
      .select('*')
      .eq('user_id', parseInt(userId))
      .order('sign_date', { ascending: false })
      .limit(1)
      .single();

    // 计算连续签到天数
    let continuousDays = 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastSignin) {
      if (lastSignin.sign_date === today) {
        continuousDays = lastSignin.continuous_days;
      } else if (lastSignin.sign_date === yesterdayStr) {
        continuousDays = lastSignin.continuous_days;
      }
    }

    // 获取签到配置
    const { data: config } = await client
      .from('signin_config')
      .select('*')
      .order('day', { ascending: true });

    return NextResponse.json({
      hasSignedToday: !!todaySignin,
      continuousDays,
      monthSignins: monthSignins?.map((s: SigninRecord) => s.sign_date) || [],
      config: config || [
        { day: 1, points: 5, bonus_points: 0 },
        { day: 2, points: 5, bonus_points: 0 },
        { day: 3, points: 5, bonus_points: 0 },
        { day: 4, points: 5, bonus_points: 0 },
        { day: 5, points: 5, bonus_points: 0 },
        { day: 6, points: 5, bonus_points: 0 },
        { day: 7, points: 10, bonus_points: 20 },
      ],
    });
  } catch (error) {
    console.error('获取签到信息失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 执行签到
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id || 1; // TODO: 从认证获取

    const client = getSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    // 检查今日是否已签到
    const { data: existingSignin } = await client
      .from('user_signins')
      .select('id')
      .eq('user_id', userId)
      .eq('sign_date', today)
      .single();

    if (existingSignin) {
      return NextResponse.json(
        { error: '今日已簽到' },
        { status: 400 }
      );
    }

    // 获取昨日签到记录
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdaySignin } = await client
      .from('user_signins')
      .select('continuous_days')
      .eq('user_id', userId)
      .eq('sign_date', yesterdayStr)
      .single();

    // 计算连续签到天数
    const continuousDays = yesterdaySignin
      ? yesterdaySignin.continuous_days + 1
      : 1;

    // 获取签到配置
    const { data: config } = await client
      .from('signin_config')
      .select('*')
      .eq('day', ((continuousDays - 1) % 7) + 1)
      .single();

    const basePoints = config?.points || 5;
    const bonusPoints = continuousDays % 7 === 0 ? (config?.bonus_points || 20) : 0;
    const totalPoints = basePoints + bonusPoints;

    // 创建签到记录
    const { error: signinError } = await client
      .from('user_signins')
      .insert({
        user_id: userId,
        sign_date: today,
        continuous_days: continuousDays,
        points_earned: totalPoints,
      });

    if (signinError) {
      console.error('签到失败:', signinError);
      return NextResponse.json({ error: '簽到失敗' }, { status: 500 });
    }

    // 更新用户积分
    const { data: user } = await client
      .from('users')
      .select('points, total_points')
      .eq('id', userId)
      .single();

    if (user) {
      await client
        .from('users')
        .update({
          points: (user.points || 0) + totalPoints,
          total_points: (user.total_points || 0) + totalPoints,
        })
        .eq('id', userId);

      // 记录积分变动
      await client.from('user_points').insert({
        user_id: userId,
        points: totalPoints,
        type: 'earn',
        source: 'login',
        description: `每日簽到（連續${continuousDays}天）`,
        balance_after: (user.points || 0) + totalPoints,
      });
    }

    return NextResponse.json({
      message: '簽到成功',
      data: {
        points: totalPoints,
        continuousDays,
        isWeekBonus: continuousDays % 7 === 0,
      },
    });
  } catch (error) {
    console.error('签到失败:', error);
    return NextResponse.json({ error: '簽到失敗' }, { status: 500 });
  }
}
