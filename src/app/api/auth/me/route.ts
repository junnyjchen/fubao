/**
 * @fileoverview 获取当前用户信息 API
 * @description 获取当前登录用户的详细信息
 * @module app/api/auth/me/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { mockUsers } from '@/lib/auth/mockStore';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

/**
 * 获取当前用户信息
 */
export async function GET(request: NextRequest) {
  try {
    // 优先从 Authorization Header 获取 token
    const authHeader = request.headers.get('Authorization');
    let token = authHeader?.replace('Bearer ', '');

    // 如果没有 header token，尝试从 cookie 获取
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value;
    }

    if (!token) {
      // 没有登录，返回访客
      return NextResponse.json({
        user: {
          id: 'guest-user-001',
          email: 'guest@fubao.ltd',
          name: '訪客用戶',
          language: 'zh-TW',
          isGuest: true,
        },
      });
    }

    try {
      // 验证 JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
      
      // 使用 mockStore 查找用户
      const mockUser = mockUsers.find(decoded.email);
      if (mockUser) {
        const { password: _, ...userWithoutPassword } = mockUser;
        return NextResponse.json({
          user: {
            ...userWithoutPassword,
            isGuest: false,
          },
        });
      }

      // 使用 token 中的信息直接返回
      return NextResponse.json({
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.email.split('@')[0],
          language: 'zh-TW',
          isGuest: false,
        },
      });

    } catch (jwtError) {
      // Token 无效或过期
      console.error('JWT 验证失败:', jwtError);
      return NextResponse.json({
        user: {
          id: 'guest-user-001',
          email: 'guest@fubao.ltd',
          name: '訪客用戶',
          language: 'zh-TW',
          isGuest: true,
        },
      });
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({
      user: {
        id: 'guest-user-001',
        email: 'guest@fubao.ltd',
        name: '訪客用戶',
        language: 'zh-TW',
        isGuest: true,
      },
    });
  }
}
