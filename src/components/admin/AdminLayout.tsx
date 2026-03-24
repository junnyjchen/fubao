/**
 * @fileoverview 后台管理布局组件
 * @description 提供统一的后台管理页面布局，包含侧边栏导航和内容区域
 * @module components/admin/AdminLayout
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Database,
  Shield,
  TrendingUp,
  Wallet,
  Ticket,
} from 'lucide-react';

/** 导航菜单项配置 */
interface NavItem {
  /** 菜单项标识 */
  key: string;
  /** 菜单标题 */
  label: string;
  /** 菜单图标 */
  icon: React.ComponentType<{ className?: string }>;
  /** 跳转路径 */
  href: string;
}

/** 导航菜单配置 */
const navItems: NavItem[] = [
  { key: 'dashboard', label: '控制台', icon: LayoutDashboard, href: '/admin' },
  { key: 'products', label: '商品管理', icon: Package, href: '/admin/products' },
  { key: 'orders', label: '訂單管理', icon: ShoppingCart, href: '/admin/orders' },
  { key: 'merchants', label: '商戶管理', icon: Users, href: '/admin/merchants' },
  { key: 'certificates', label: '證書管理', icon: Shield, href: '/admin/certificates' },
  { key: 'coupons', label: '優惠券管理', icon: Ticket, href: '/admin/coupons' },
  { key: 'distribution', label: '分銷管理', icon: TrendingUp, href: '/admin/distribution' },
  { key: 'withdrawals', label: '提現審核', icon: Wallet, href: '/admin/withdrawals' },
  { key: 'wiki', label: '百科管理', icon: FileText, href: '/admin/wiki' },
  { key: 'content', label: '內容管理', icon: FileText, href: '/admin/content' },
  { key: 'database', label: '數據管理', icon: Database, href: '/admin/database' },
  { key: 'settings', label: '系統設置', icon: Settings, href: '/admin/settings' },
];

/** AdminLayout 组件属性 */
interface AdminLayoutProps {
  /** 页面内容 */
  children: ReactNode;
  /** 页面标题 */
  title?: string;
  /** 页面描述 */
  description?: string;
  /** 操作按钮区域 */
  actions?: ReactNode;
}

/**
 * 后台管理布局组件
 * @param props - 组件属性
 * @returns 后台管理页面布局
 */
export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const pathname = usePathname();

  /**
   * 判断菜单项是否激活
   * @param href - 菜单链接
   * @returns 是否激活
   */
  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-background border-r flex-shrink-0 hidden md:flex md:flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            符
          </div>
          <span className="font-semibold">符寶網後台</span>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 底部信息 */}
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            符寶網 v1.0.0
          </p>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 顶部栏 */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        {/* 内容区域 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
