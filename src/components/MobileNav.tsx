/**
 * @fileoverview 移动端底部导航
 * @description 移动端主底部导航栏组件，支持安全区域适配
 * @module components/MobileNav
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ShoppingBag,
  User,
  Bell,
  Sparkles,
  MoreHorizontal,
  Store,
  Heart,
  Package,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  badgeKey?: 'cart' | 'notification';
}

interface QuickLink {
  href: string;
  icon: typeof Heart;
  label: string;
  badge?: number;
}

export function MobileNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);

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

  // 滚动时隐藏/显示导航
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 向下滚动超过100px时隐藏，向上滚动时显示
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

        // 获取通知数量
        const notifRes = await fetch('/api/notifications?unread=true');
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotificationCount(notifData.unreadCount || 0);
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

  // 快捷链接（更多菜单中）
  const quickLinks: QuickLink[] = [
    { href: '/shop', icon: Store, label: '商城' },
    { href: '/user/favorites', icon: Heart, label: '收藏夾' },
    { href: '/user/orders', icon: Package, label: '我的訂單' },
    { href: '/ai-assistant', icon: Sparkles, label: 'AI助手' },
    { href: '/help', icon: HelpCircle, label: '幫助中心' },
    { href: '/user/settings', icon: Settings, label: '設置' },
  ];

  return (
    <>
      <nav 
        className={cn(
          'mobile-bottom-bar md:hidden mobile-nav safe-area-bottom transition-transform duration-300',
          !isVisible && 'translate-y-full'
        )}
      >
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
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 安全区域底部占位 */}
      <div className="h-16 md:hidden" />
    </>
  );
}

/**
 * 移动端快捷菜单组件
 */
export function MobileQuickMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-primary/10"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-center">快捷菜單</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-4 gap-4 py-6">
          {[
            { href: '/shop', icon: Store, label: '商城' },
            { href: '/user/favorites', icon: Heart, label: '收藏' },
            { href: '/user/orders', icon: Package, label: '訂單' },
            { href: '/ai-assistant', icon: Sparkles, label: 'AI' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
