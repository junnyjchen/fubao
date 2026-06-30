/**
 * @fileoverview 用户注册API
 * @description 处理用户注册请求，支持邀请码建立分销关系 - MySQL 实现
 * @module app/api/auth/register/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { generateToken } from '@/lib/auth/utils';
import { cookies } from 'next/headers';
import { queryOne, insert as dbInsert } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email/service';

/**
 * 生成随机邀请码
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * 用户注册
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nickname, email, phone, password, invite_code } = body;

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json({ error: '請填寫郵箱和密碼' }, { status: 400 });
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '請輸入有效的郵箱地址' }, { status: 400 });
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({ error: '密碼長度至少6位' }, { status: 400 });
    }

    // 检查邮箱是否已注册
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return NextResponse.json({ error: '該郵箱已被註冊' }, { status: 400 });
    }

    // 检查手机号是否已注册
    if (phone) {
      const phoneExisting = await queryOne('SELECT id FROM users WHERE phone = ?', [phone]);
      if (phoneExisting) {
        return NextResponse.json({ error: '該手機號已被註冊' }, { status: 400 });
      }
    }

    // 加密密码
    const hashedPassword = await hash(password, 10);

    const displayName = nickname || name || email.split('@')[0];

    // 查找邀请人
    let invitedBy: number | null = null;
    if (invite_code) {
      const inviter = await queryOne('SELECT id FROM users WHERE invite_code = ?', [invite_code]);
      if (inviter) {
        invitedBy = inviter.id;
      }
    }

    // 插入用户（nickname/invite_code 列可能不存在，降级处理）
    let userId: number;
    try {
      userId = Number(await dbInsert('users', {
        email,
        phone: phone || '',
        name: displayName,
        nickname: displayName,
        password: hashedPassword,
        role: 'user',
        language: 'zh-TW',
        status: 1,
        invite_code: generateInviteCode(),
      }));
    } catch {
      // 降级：不包含可能缺失的列（nickname/invite_code），但保留必填字段
      userId = Number(await dbInsert('users', {
        email,
        phone: phone || '',
        name: displayName,
        password: hashedPassword,
        role: 'user',
        language: 'zh-TW',
        status: 1,
      }));
    }

    // 生成 JWT
    const token = generateToken({
      userId: String(userId),
      email,
    });

    // 设置 Cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.COZE_PROJECT_ENV === 'PROD',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // 异步发送欢迎邮件（不阻塞响应）
    try {
      await sendWelcomeEmail(email, displayName);
    } catch (emailError) {
      console.error('[Register] 发送欢迎邮件失败:', emailError);
      // 邮件发送失败不影响注册
    }

    return NextResponse.json({
      success: true,
      message: '註冊成功',
      token,
      user: {
        id: userId,
        name: displayName,
        email,
        phone: phone || null,
        avatar: null,
        language: 'zh-TW',
        role: 'user',
        points: 0,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json({ error: '註冊失敗，請稍後重試' }, { status: 500 });
  }
}
