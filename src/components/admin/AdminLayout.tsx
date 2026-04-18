/**
 * @fileoverview 后台管理布局组件
 * @description 简化的后台管理页面包装组件（布局由 admin/layout.tsx 提供）
 * @module components/admin/AdminLayout
 */

'use client';

import { ReactNode } from 'react';

/** AdminLayout 组件属性 */
interface AdminLayoutProps {
  /** 页面内容 */
  children: ReactNode;
  /** 页面标题（已弃用，保留向后兼容） */
  title?: string;
  /** 页面描述（已弃用，保留向后兼容） */
  description?: string;
  /** 操作按钮区域（已弃用，保留向后兼容） */
  actions?: ReactNode;
}

/**
 * 后台管理布局组件（简化版）
 * @description 布局由 admin/layout.tsx 提供，此组件仅作为包装器保持向后兼容
 * @param props - 组件属性
 * @returns 页面内容
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return <>{children}</>;
}
