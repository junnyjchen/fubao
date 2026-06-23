/**
 * @fileoverview 用户签到 API
 */

import { NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 获取签到状态 */
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);
    
    let todaySigned = false;
    let streak = 0;
    
    try {
      const todayRecord = await query(
        'SELECT id FROM user_signins WHERE user_id = ? AND signin_date = ?',
        [userId, today]
      );
      todaySigned = Array.isArray(todayRecord) && todayRecord.length > 0;

      // 计算连续签到天数
      const recentSignins = await query(
        'SELECT signin_date FROM user_signins WHERE user_id = ? ORDER BY signin_date DESC LIMIT 30',
        [userId]
      );
      
      if (Array.isArray(recentSignins)) {
        const dates = recentSignins.map((r: any) => r.signin_date);
        streak = 0;
        const todayDate = new Date();
        for (let i = 0; i < dates.length; i++) {
          const expected = new Date(todayDate);
          expected.setDate(expected.getDate() - i);
          const expectedStr = expected.toISOString().slice(0, 10);
          if (dates.includes(expectedStr)) {
            streak++;
          } else {
            break;
          }
        }
      }
    } catch {
      // user_signins 表不存在
    }

    return NextResponse.json({
      success: true,
      data: { todaySigned, streak },
    });
  } catch (error) {
    console.error('获取签到状态失败:', error);
    return NextResponse.json({ success: true, data: { todaySigned: false, streak: 0 } });
  }
}

/** 执行签到 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);

    try {
      // 检查今天是否已签到
      const existing = await query(
        'SELECT id FROM user_signins WHERE user_id = ? AND signin_date = ?',
        [userId, today]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json({ success: false, error: '今天已簽到過了' }, { status: 400 });
      }

      await insert('user_signins', {
        user_id: userId,
        signin_date: today,
        reward_points: 10,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });

      return NextResponse.json({
        success: true,
        message: '簽到成功，獲得10積分',
        data: { rewardPoints: 10 },
      });
    } catch {
      // 表不存在
      return NextResponse.json({ success: false, error: '簽到功能暫不可用' }, { status: 501 });
    }
  } catch (error) {
    console.error('签到失败:', error);
    return NextResponse.json({ success: false, error: '簽到失敗' }, { status: 500 });
  }
}
