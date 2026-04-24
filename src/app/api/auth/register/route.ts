/**
 * @fileoverview 用户注册API
 * @description 处理用户注册请求，支持邀请码建立分销关系
 * @module app/api/auth/register/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hash } from 'bcryptjs';
import { generateToken } from '@/lib/auth/utils';
import { cookies } from 'next/headers';
import { mockUsers } from '@/lib/auth/mockStore';

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
 * @param request - 请求对象
 * @returns 注册结果
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nickname, email, phone, password, invite_code } = body;

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '請填寫郵箱和密碼' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: '請輸入有效的郵箱地址' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密碼長度至少6位' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查邮箱是否已注册
    let existingUser = null;
    try {
      const { data } = await client
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      existingUser = data;
    } catch {
      // 数据库不可用，检查 mock 存储
      existingUser = mockUsers.existsByEmail(email);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: '該郵箱已被註冊' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hash(password, 10);

    let user: any = null;
    let isMockMode = false;

    // 尝试创建用户到数据库
    try {
      const { data, error } = await client
        .from('users')
        .insert({
          name: nickname || name || email.split('@')[0], // 支持nickname和name
          email,
          phone: phone || null,
          password: hashedPassword,
          language: 'zh-TW',
          status: true,
        })
        .select('id, name, email, phone, language, status, created_at')
        .single();

      if (!error && data) {
        user = data;
      } else {
        // 数据库插入失败，使用 mock 模式
        throw new Error('Database insert failed');
      }
    } catch (dbErr) {
      console.log('数据库不可用，使用本地 mock 模式注册');
      isMockMode = true;
      
      // 使用 mock 模式创建用户
      const mockId = mockUsers.getNextId();
      user = mockUsers.add({
        id: mockId,
        name: nickname || name || email.split('@')[0],
        email,
        phone: phone || null,
        password: hashedPassword,
      });
    }

    // 处理邀请码，建立分销关系（仅在非 mock 模式下）
    if (invite_code && user && !isMockMode) {
      try {
        // 查找邀请人
        const { data: inviter } = await client
          .from('user_distribution')
          .select('user_id, parent_id, parent_level_2_id, team_leader_id')
          .eq('invite_code', invite_code.toUpperCase())
          .single();

        if (inviter) {
          // 为新用户生成邀请码
          const newInviteCode = generateInviteCode();

          // 建立分销关系
          await client.from('user_distribution').insert({
            user_id: user.id,
            invite_code: newInviteCode,
            parent_id: inviter.user_id,
            parent_level_2_id: inviter.parent_id || null,
            parent_level_3_id: inviter.parent_level_2_id || null,
            team_leader_id: inviter.team_leader_id || inviter.user_id,
            total_commission: 0,
            available_commission: 0,
            frozen_commission: 0,
            withdrawn_commission: 0,
            team_count: 0,
            direct_count: 0,
            level_2_count: 0,
            level_3_count: 0,
            total_team_sales: 0,
            is_team_leader: false,
          });

          // 更新邀请人的直推人数
          await client
            .from('user_distribution')
            .update({
              direct_count: client.rpc('increment', { x: 1 }),
              team_count: client.rpc('increment', { x: 1 }),
            })
            .eq('user_id', inviter.user_id);

          // 更新上上级的二级人数
          if (inviter.parent_id) {
            await client
              .from('user_distribution')
              .update({
                level_2_count: client.rpc('increment', { x: 1 }),
                team_count: client.rpc('increment', { x: 1 }),
              })
              .eq('user_id', inviter.parent_id);
          }

          // 更新上上上级的三级人数
          if (inviter.parent_level_2_id) {
            await client
              .from('user_distribution')
              .update({
                level_3_count: client.rpc('increment', { x: 1 }),
                team_count: client.rpc('increment', { x: 1 }),
              })
              .eq('user_id', inviter.parent_level_2_id);
          }

          console.log(`分销关系建立成功: 用户 ${user.id} 的上级是 ${inviter.user_id}`);
        }
      } catch (distError) {
        // 分销关系建立失败不影响注册
        console.error('建立分销关系失败:', distError);
      }
    } else if (user) {
      // 没有邀请码，也要为新用户生成邀请码
      try {
        const newInviteCode = generateInviteCode();
        await client.from('user_distribution').insert({
          user_id: user.id,
          invite_code: newInviteCode,
          total_commission: 0,
          available_commission: 0,
          frozen_commission: 0,
          withdrawn_commission: 0,
          team_count: 0,
          direct_count: 0,
          level_2_count: 0,
          level_3_count: 0,
          total_team_sales: 0,
          is_team_leader: false,
        });
      } catch (distError) {
        console.error('创建分销信息失败:', distError);
      }
    }

    // 如果是 mock 模式，自动登录
    if (isMockMode) {
      const token = generateToken({
        userId: user.id,
        email: user.email,
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
      
      return NextResponse.json({
        message: '註冊成功',
        mock: true,
        token,
        user: {
          ...user,
          isGuest: false,
        },
      });
    }

    return NextResponse.json({
      message: '註冊成功',
      user,
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '註冊失敗，請稍後重試' },
      { status: 500 }
    );
  }
}
