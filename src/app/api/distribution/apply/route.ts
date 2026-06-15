/**
 * @fileoverview 分销员申请API
 * @description 用户申请成为分销员
 * @module app/api/distribution/apply/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

function getUserFromToken(request: NextRequest): { userId: string } | null {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FB';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * GET /api/distribution/apply - 获取申请状态
 */
export async function GET(request: NextRequest) {
  const user = getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  try {
    // 检查是否已是分销员
    const existing = await queryOne('SELECT * FROM user_distribution WHERE user_id = ?', [user.userId]);
    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'distributor',
          distributor: existing,
          message: '您已是分銷員',
        },
      });
    }

    // 检查是否有待审核的申请
    const application = await queryOne('SELECT * FROM distribution_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [user.userId]);
    if (application) {
      return NextResponse.json({
        success: true,
        data: {
          status: application.status === 0 ? 'pending' : application.status === 1 ? 'approved' : 'rejected',
          application,
          message: application.status === 0 ? '申請審核中' : application.status === 1 ? '申請已通過' : '申請已被拒絕，可重新申請',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'none',
        message: '尚未申請',
      },
    });
  } catch (error) {
    console.error('[Distribution Apply] 获取状态失败:', error);
    return NextResponse.json({ success: true, data: { status: 'none' } });
  }
}

/**
 * POST /api/distribution/apply - 提交分销申请
 */
export async function POST(request: NextRequest) {
  const user = getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { real_name, phone, wechat, reason, social_followers, social_platform } = body;

    if (!real_name || !phone) {
      return NextResponse.json({ error: '請填寫真實姓名和手機號碼' }, { status: 400 });
    }

    // 检查是否已是分销员
    const existing = await queryOne('SELECT * FROM user_distribution WHERE user_id = ?', [user.userId]);
    if (existing && existing.status === 1) {
      return NextResponse.json({ error: '您已是分銷員，無需重複申請' }, { status: 400 });
    }

    // 检查是否有待审核的申请
    const pendingApp = await queryOne("SELECT * FROM distribution_applications WHERE user_id = ? AND status = 0", [user.userId]);
    if (pendingApp) {
      return NextResponse.json({ error: '您已有待審核的申請，請耐心等待' }, { status: 400 });
    }

    // 创建申请
    const application = await insert('distribution_applications', {
      user_id: user.userId,
      real_name,
      phone,
      wechat: wechat || '',
      reason: reason || '',
      social_followers: social_followers || 0,
      social_platform: social_platform || '',
      invite_code: generateInviteCode(),
      status: 0, // 待审核
      review_note: '',
      created_at: new Date().toISOString(),
      reviewed_at: null,
    });

    return NextResponse.json({
      success: true,
      data: application,
      message: '申請已提交，我們將盡快審核',
    });
  } catch (error) {
    console.error('[Distribution Apply] 提交申请失败:', error);
    return NextResponse.json({ error: '申請提交失敗，請稍後重試' }, { status: 500 });
  }
}
