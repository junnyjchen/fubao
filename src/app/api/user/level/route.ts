/**
 * @fileoverview 用户等级API
 * @description 获取所有等级配置
 * @module app/api/user/level/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取等级列表
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('user_levels')
      .select('*')
      .order('level', { ascending: true });

    if (error) {
      console.error('查询等级失败:', error);
      // 返回默认等级配置
      return NextResponse.json({
        data: [
          { level: 1, name: '善信初學', min_points: 0, max_points: 99, discount: 100, color: '#9CA3AF' },
          { level: 2, name: '入門信士', min_points: 100, max_points: 499, discount: 99, color: '#60A5FA' },
          { level: 3, name: '虔誠信士', min_points: 500, max_points: 1999, discount: 98, color: '#34D399' },
          { level: 4, name: '資深信士', min_points: 2000, max_points: 4999, discount: 97, color: '#F59E0B' },
          { level: 5, name: '大道高士', min_points: 5000, max_points: 9999, discount: 95, color: '#EC4899' },
          { level: 6, name: '護法尊者', min_points: 10000, max_points: 29999, discount: 93, color: '#8B5CF6' },
          { level: 7, name: '天師護法', min_points: 30000, max_points: null, discount: 90, color: '#EF4444' },
        ],
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('获取等级列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
