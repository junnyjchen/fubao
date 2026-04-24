/**
 * @fileoverview 分享API路由
 * @description 生成分享链接和记录分享行为
 * @module app/api/share/route
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
 * GET /api/share - 获取分享信息
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // goods/invite
  const targetId = searchParams.get('target_id'); // 商品ID

  const userId = await verifyUser(request);

  try {
    // 获取用户邀请码
    let inviteCode = 'DEMO00';
    if (userId) {
      const { data: dist } = await supabase
        .from('user_distribution')
        .select('invite_code')
        .eq('user_id', userId)
        .single();
      inviteCode = dist?.invite_code || 'DEMO00';
    }

    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://fubao.ltd';

    if (type === 'goods' && targetId) {
      // 商品分享链接
      const shareUrl = `${baseUrl}/shop/${targetId}?ref=${inviteCode}`;
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'goods',
          share_url: shareUrl,
          invite_code: inviteCode,
          poster_url: `${baseUrl}/api/share/poster?type=goods&id=${targetId}&ref=${inviteCode}`,
        },
      });
    } else {
      // 邀请分享链接
      return NextResponse.json({
        success: true,
        data: {
          type: 'invite',
          share_url: `${baseUrl}/register?ref=${inviteCode}`,
          invite_code: inviteCode,
          poster_url: `${baseUrl}/api/share/poster?type=invite&ref=${inviteCode}`,
        },
      });
    }
  } catch (error) {
    console.error('获取分享信息失败:', error);
    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://fubao.ltd';
    return NextResponse.json({
      success: true,
      data: {
        type: type || 'invite',
        share_url: `${baseUrl}/register?ref=DEMO00`,
        invite_code: 'DEMO00',
        poster_url: `${baseUrl}/api/share/poster?type=${type || 'invite'}&ref=DEMO00`,
      },
    });
  }
}

/**
 * POST /api/share - 记录分享行为
 */
export async function POST(request: NextRequest) {
  const userId = await verifyUser(request);

  try {
    const body = await request.json();
    const { share_type, target_id, channel } = body;

    // 记录分享行为
    if (userId) {
      await supabase
        .from('share_records')
        .insert({
          user_id: userId,
          share_type,
          target_id: target_id || null,
          channel: channel || 'link',
          created_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      success: true,
      message: '分享記錄已保存',
    });
  } catch (error) {
    console.error('记录分享失败:', error);
    return NextResponse.json({ success: true });
  }
}
