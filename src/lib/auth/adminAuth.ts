/**
 * @fileoverview 管理员权限验证工具
 * @description 用于 API 层验证管理员权限
 * @module lib/auth/adminAuth
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

/** 管理员 Token 载荷 */
export interface AdminPayload {
  adminId: number;
  username: string;
  roleId: number;
  roleCode: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

/** 验证结果 */
export interface AuthResult {
  success: boolean;
  payload?: AdminPayload;
  error?: string;
}

/**
 * 验证管理员 Token
 */
export function verifyAdminToken(request: NextRequest): AuthResult {
  // 优先从 Authorization Header 获取 token
  const authHeader = request.headers.get('Authorization');
  let token = authHeader?.replace('Bearer ', '');

  // 如果没有 header token，尝试从 cookie 获取
  if (!token) {
    token = request.cookies.get('admin_token')?.value;
  }

  if (!token) {
    return { success: false, error: '未登錄' };
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET + '-admin') as AdminPayload;
    return { success: true, payload };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: '登錄已過期' };
    }
    return { success: false, error: '無效的token' };
  }
}

/**
 * 检查是否有指定权限
 */
export function hasPermission(
  permissions: string[],
  requiredPermission: string
): boolean {
  // 超级管理员拥有所有权限
  if (permissions.includes('*')) return true;

  // 检查精确匹配
  if (permissions.includes(requiredPermission)) return true;

  // 检查分组权限（如 content.news 应该包含 content.view）
  const [group] = requiredPermission.split('.');
  if (group && permissions.includes(`${group}.view`)) return true;

  return false;
}

/**
 * 权限保护装饰器类型
 */
type PermissionHandler<T = unknown> = (
  request: NextRequest,
  context?: T
) => Promise<NextResponse>;

/**
 * 创建需要权限的 API 处理器
 */
export function withPermission(
  requiredPermission: string
) {
  return function <T>(
    handler: (request: NextRequest, context?: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context?: T): Promise<NextResponse> => {
      const authResult = verifyAdminToken(request);

      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error || '未授權' },
          { status: 401 }
        );
      }

      if (!hasPermission(authResult.payload!.permissions, requiredPermission)) {
        return NextResponse.json(
          { error: '沒有許可權' },
          { status: 403 }
        );
      }

      return handler(request, context);
    };
  };
}

/**
 * 预定义的权限常量
 */
export const PERMISSIONS = {
  // 系统管理
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_ROLES: 'system.roles',
  SYSTEM_ADMINS: 'system.admins',

  // 内容管理
  CONTENT_VIEW: 'content.view',
  CONTENT_NEWS: 'content.news',
  CONTENT_WIKI: 'content.wiki',
  CONTENT_VIDEO: 'content.video',

  // 商品管理
  GOODS_VIEW: 'goods.view',
  GOODS_EDIT: 'goods.edit',
  GOODS_STATUS: 'goods.status',
  GOODS_DELETE: 'goods.delete',

  // 商户管理
  MERCHANT_VIEW: 'merchant.view',
  MERCHANT_AUDIT: 'merchant.audit',
  MERCHANT_EDIT: 'merchant.edit',

  // 订单管理
  ORDER_VIEW: 'order.view',
  ORDER_PROCESS: 'order.process',
  ORDER_REFUND: 'order.refund',

  // 用户管理
  USER_VIEW: 'user.view',
  USER_EDIT: 'user.edit',

  // 运营管理
  OPERATION_BANNER: 'operation.banner',
  OPERATION_PAGE: 'operation.page',
  OPERATION_ACTIVITY: 'operation.activity',
  OPERATION_COUPON: 'operation.coupon',

  // 数据统计
  DATA_STATS: 'data.stats',
  DATA_EXPORT: 'data.export',
} as const;
