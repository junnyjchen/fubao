/**
 * @fileoverview 移动端底部导航
 * @description 移动端主底部导航栏组件
 * @module components/MobileNav
 */

'use client';

import { useState, useEffect } from 'react';
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
  badgeKey?: 'cart' | 'notification';
}

export function MobileNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  // 不显示移动端导航的页面
  const hiddenPaths = [
    '/admin',
    '/merchant',
    '/checkout',
    '/auth',
    '/login',
    '/register',
    '/payment',
  ];
  
  if (hiddenPaths.some(p => pathname.startsWith(p))) {
    return null;
  }

  // 获取购物车数量和通知数量
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // 获取购物车数量
        const cartRes = await fetch('/api/cart');
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartCount(cartData.data?.length || 0);
        }
      } catch {
        // 忽略错误
      }
    };

    fetchCounts();
  }, [pathname]);

  const badges = {
    cart: cartCount,
    notification: notificationCount,
  };

  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: '首頁' },
    { href: '/search', icon: Search, label: '搜索' },
    { href: '/cart', icon: ShoppingBag, label: '購物車', badgeKey: 'cart' },
    { href: '/user/notifications', icon: Bell, label: '消息', badgeKey: 'notification' },
    { href: '/user', icon: User, label: '我的' },
  ];

  return (
    <nav className="mobile-bottom-bar md:hidden mobile-nav safe-area-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname.startsWith(item.href));
        const badge = item.badgeKey ? badges[item.badgeKey] : 0;
        
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
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
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
