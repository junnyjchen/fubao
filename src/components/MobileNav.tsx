/**
 * @fileoverview 移动端底部导航
 * @description 移动端主底部导航栏组件
 * @module components/MobileNav
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ShoppingBag,
  User,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  badge?: number;
}

export function MobileNav() {
  const pathname = usePathname();

  // 不显示移动端导航的页面
  const hiddenPaths = [
    '/admin',
    '/merchant',
    '/checkout',
    '/auth',
  ];
  
  if (hiddenPaths.some(p => pathname.startsWith(p))) {
    return null;
  }

  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: '首頁' },
    { href: '/search', icon: Search, label: '搜索' },
    { href: '/cart', icon: ShoppingBag, label: '購物車' },
    { href: '/notifications', icon: Bell, label: '消息' },
    { href: '/user', icon: User, label: '我的' },
  ];

  return (
    <nav className="mobile-bottom-bar md:hidden mobile-nav safe-area-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'mobile-nav-item',
              isActive && 'active'
            )}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
