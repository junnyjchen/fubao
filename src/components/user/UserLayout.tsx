/**
 * @fileoverview 用户中心布局组件
 * @description 提供统一的用户中心页面布局
 * @module components/user/UserLayout
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Heart,
  MapPin,
  Package,
  Settings,
  LogOut,
} from 'lucide-react';

/** 导航菜单项配置 */
interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

/** 导航菜单配置 */
const navItems: NavItem[] = [
  { key: 'orders', label: '我的訂單', icon: Package, href: '/user/orders' },
  { key: 'favorites', label: '我的收藏', icon: Heart, href: '/user/favorites' },
  { key: 'addresses', label: '收貨地址', icon: MapPin, href: '/user/addresses' },
  { key: 'settings', label: '賬戶設置', icon: Settings, href: '/user/settings' },
];

/** UserLayout 组件属性 */
interface UserLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

/**
 * 用户中心布局组件
 * @param props - 组件属性
 * @returns 用户中心页面布局
 */
export function UserLayout({ children, title, description }: UserLayoutProps) {
  const pathname = usePathname();

  /**
   * 判断菜单项是否激活
   * @param href - 菜单链接
   * @returns 是否激活
   */
  const isActive = (href: string): boolean => {
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">用戶中心</h1>
              <p className="text-sm text-primary-foreground/80">
                歡迎回來，善信
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 侧边导航 */}
          <aside className="w-full md:w-48 flex-shrink-0">
            <nav className="bg-background rounded-lg border p-2 space-y-1">
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
              <div className="border-t my-2" />
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>返回首頁</span>
              </Link>
            </nav>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            {(title || description) && (
              <div className="mb-6">
                {title && <h2 className="text-xl font-semibold">{title}</h2>}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
