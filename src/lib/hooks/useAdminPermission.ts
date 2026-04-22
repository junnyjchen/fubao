/**
 * @fileoverview 管理员权限 Hook
 * @description 用于前端验证管理员权限
 * @module lib/hooks/useAdminPermission
 */

'use client';

import { useCallback } from 'react';

/** 权限上下文类型 */
interface AdminPermissions {
  admin: {
    id: number;
    username: string;
    name: string;
    role: {
      id: number;
      name: string;
      code: string;
    };
    permissions: string[];
  } | null;
}

/**
 * 权限验证 Hook
 */
export function useAdminPermission() {
  /**
   * 检查是否有指定权限
   */
  const hasPermission = useCallback((permission: string, admin: AdminPermissions['admin'] | null): boolean => {
    if (!admin) return false;
    
    // 超级管理员拥有所有权限
    if (admin.permissions.includes('*')) return true;
    
    // 检查精确匹配
    if (admin.permissions.includes(permission)) return true;
    
    // 检查分组权限（如 content.news 应该包含 content.view）
    const [group] = permission.split('.');
    if (group && admin.permissions.includes(`${group}.view`)) return true;
    
    return false;
  }, []);

  /**
   * 检查是否有任意一个权限
   */
  const hasAnyPermission = useCallback((permissions: string[], admin: AdminPermissions['admin'] | null): boolean => {
    if (!admin) return false;
    return permissions.some(p => hasPermission(p, admin));
  }, [hasPermission]);

  /**
   * 检查是否有所有权限
   */
  const hasAllPermissions = useCallback((permissions: string[], admin: AdminPermissions['admin'] | null): boolean => {
    if (!admin) return false;
    return permissions.every(p => hasPermission(p, admin));
  }, [hasPermission]);

  /**
   * 获取权限列表
   */
  const getPermissions = useCallback((admin: AdminPermissions['admin'] | null): string[] => {
    if (!admin) return [];
    if (admin.permissions.includes('*')) {
      return ['*']; // 超级管理员返回 * 表示全部
    }
    return admin.permissions;
  }, []);

  /**
   * 检查是否是超级管理员
   */
  const isSuperAdmin = useCallback((admin: AdminPermissions['admin'] | null): boolean => {
    if (!admin) return false;
    return admin.role.code === 'super_admin' || admin.permissions.includes('*');
  }, []);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    isSuperAdmin,
  };
}

/** 权限代码常量 */
export const PERMISSION_CODES = {
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

/** 菜单权限映射 */
export const MENU_PERMISSION_MAP: Record<string, string> = {
  '/admin/settings': PERMISSION_CODES.SYSTEM_SETTINGS,
  '/admin/roles': PERMISSION_CODES.SYSTEM_ROLES,
  '/admin/admins': PERMISSION_CODES.SYSTEM_ADMINS,
  '/admin/news': PERMISSION_CODES.CONTENT_NEWS,
  '/admin/wiki': PERMISSION_CODES.CONTENT_WIKI,
  '/admin/videos': PERMISSION_CODES.CONTENT_VIDEO,
  '/admin/banners': PERMISSION_CODES.OPERATION_BANNER,
  '/admin/page-builder': PERMISSION_CODES.OPERATION_PAGE,
  '/admin/orders': PERMISSION_CODES.ORDER_VIEW,
  '/admin/users': PERMISSION_CODES.USER_VIEW,
  '/admin/goods': PERMISSION_CODES.GOODS_VIEW,
  '/admin/merchants': PERMISSION_CODES.MERCHANT_VIEW,
  '/admin/coupons': PERMISSION_CODES.OPERATION_COUPON,
  '/admin/finance': PERMISSION_CODES.DATA_STATS,
  '/admin/ai-content': PERMISSION_CODES.CONTENT_NEWS,
  '/admin/ai-training': PERMISSION_CODES.SYSTEM_SETTINGS,
};
