/**
 * @fileoverview 用户积分API
 * @description 积分查询和操作
 * @module app/api/user/points/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取用户积分信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    // 获取用户积分信息（从user_profiles表）
    const { data: user, error: userError } = await client
      .from('user_profiles')
      .select('points, level, total_points')
      .eq('user_id', userId)
      .single();

    // 如果用户不存在，创建默认数据
    if (userError || !user) {
      // 尝试创建用户资料
      await client
        .from('user_profiles')
        .insert({ user_id: userId, points: 0, total_points: 0, level: 1 });
      
      return NextResponse.json({
        points: 0,
        level: 1,
        total_points: 0,
        levelInfo: null,
        nextLevel: null,
        progress: 0,
        records: [],
        total: 0,
        page,
        limit,
      });
    }

    // 获取用户等级信息
    const { data: levelInfo } = await client
      .from('user_levels')
      .select('*')
      .eq('level', user?.level || 1)
      .single();

    // 获取下一等级信息
    const { data: nextLevel } = await client
      .from('user_levels')
      .select('*')
      .eq('level', (user?.level || 1) + 1)
      .single();

    // 获取积分记录
    const { data: records, error, count } = await client
      .from('user_points')
      .select('*', { count: 'exact' })
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询积分记录失败:', error);
    }

    // 计算升级进度
    const currentPoints = user?.total_points || 0;
    const currentLevelMin = levelInfo?.min_points || 0;
    const nextLevelMin = nextLevel?.min_points || currentLevelMin;
    const progress = nextLevel
      ? Math.min(
          100,
          Math.round(
            ((currentPoints - currentLevelMin) /
              (nextLevelMin - currentLevelMin)) *
              100
          )
        )
      : 100;

    return NextResponse.json({
      points: user?.points || 0,
      level: user?.level || 1,
      total_points: currentPoints,
      levelInfo,
      nextLevel,
      progress,
      records: records || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取积分信息失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 增加或减少积分（内部调用）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, points, type, source, source_id, description } = body;

    if (!user_id || !points || !type) {
      return NextResponse.json(
        { error: '參數不完整' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取当前积分
    const { data: user } = await client
      .from('users')
      .select('points, total_points')
      .eq('id', user_id)
      .single();

    const currentPoints = user?.points || 0;
    const currentTotal = user?.total_points || 0;
    const newPoints = currentPoints + points;
    const newTotal = type === 'earn' ? currentTotal + points : currentTotal;

    // 更新用户积分
    const { error: updateError } = await client
      .from('users')
      .update({
        points: Math.max(0, newPoints),
        total_points: Math.max(0, newTotal),
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('更新积分失败:', updateError);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    // 记录积分变动
    const { data: record, error } = await client
      .from('user_points')
      .insert({
        user_id,
        points,
        type,
        source: source || null,
        source_id: source_id || null,
        description: description || null,
        balance_after: Math.max(0, newPoints),
      })
      .select()
      .single();

    if (error) {
      console.error('记录积分失败:', error);
    }

    return NextResponse.json({
      message: '積分更新成功',
      data: {
        points: Math.max(0, newPoints),
        total_points: Math.max(0, newTotal),
      },
    });
  } catch (error) {
    console.error('更新积分失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
