/**
 * @fileoverview 移动端底部导航
 * @description 移动端主底部导航栏组件，支持安全区域适配
 * @module components/MobileNav
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  ArrowUp,
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

// 不显示移动端导航的页面（沉浸式页面）
const HIDDEN_PATHS = [
  '/admin',
  '/merchant',
  '/checkout',
  '/auth',
  '/login',
  '/register',
  '/payment',
  '/shop/',  // 商品详情页
  '/free-gifts/',  // 免费领详情页
  '/activity/seckill',  // 秒杀活动
  '/activity/new-user',  // 新人专享
  '/activity/discount',  // 满减优惠
  '/points-mall',  // 积分商城
  '/distribution',  // 分销中心
  '/ai-assistant',  // AI助手
];

export function MobileNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false); // 默认隐藏
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const tickingRef = useRef(false);

  // 检查是否在隐藏路径中 - 使用 useMemo 避免重复计算
  const shouldHide = useMemo(() => {
    return HIDDEN_PATHS.some(p => {
      if (p.endsWith('/')) {
        return pathname.startsWith(p) || pathname === p.slice(0, -1);
      }
      return pathname === p || pathname.startsWith(p + '/');
    });
  }, [pathname]);

  // 滚动处理函数
  const handleScroll = useCallback(() => {
    if (shouldHide) return; // 如果隐藏则不处理
    
    if (!tickingRef.current) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // 计算距离底部的距离
        const distanceToBottom = documentHeight - currentScrollY - windowHeight;
        
        // 判断是否接近底部（200px以内）
        const nearBottom = distanceToBottom < 200;
        setIsAtBottom(nearBottom);
        
        // 向上滚动时显示
        const scrollingUp = currentScrollY < lastScrollY;
        
        // 在顶部时隐藏
        const atTop = currentScrollY < 50;
        
        if (atTop) {
          // 在顶部时隐藏，让用户看到更多内容
          setIsVisible(false);
        } else if (nearBottom || scrollingUp) {
          // 接近底部或向上滚动时显示
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY) {
          // 向下滚动时隐藏
          setIsVisible(false);
        }
        
        setLastScrollY(currentScrollY);
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  }, [lastScrollY, shouldHide]);

  // 滚动监听
  useEffect(() => {
    if (shouldHide) return; // 如果隐藏则不添加监听
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, shouldHide]);

  // 页面加载时检查是否需要显示
  useEffect(() => {
    if (shouldHide) return; // 如果隐藏则跳过
    
    // 初始状态：检查页面高度，如果页面很短则显示导航
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (documentHeight <= windowHeight + 100) {
      // 页面很短，直接显示导航
      setIsVisible(true);
    }
  }, [pathname, shouldHide]);

  // 获取购物车数量和通知数量
  useEffect(() => {
    if (shouldHide) return; // 如果隐藏则跳过
    
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
  }, [pathname, shouldHide]);

  // 如果在隐藏路径中，返回 null
  if (shouldHide) {
    return null;
  }

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

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 回到顶部按钮 */}
      <button
        onClick={scrollToTop}
        className={cn(
          'fixed right-4 z-40 md:hidden',
          'w-10 h-10 rounded-full bg-background/95 border shadow-lg',
          'flex items-center justify-center',
          'transition-all duration-300 ease-out',
          'hover:bg-muted active:scale-95',
          isAtBottom && isVisible 
            ? 'bottom-20 opacity-100 pointer-events-auto' 
            : 'bottom-4 opacity-0 pointer-events-none'
        )}
        aria-label="回到頂部"
      >
        <ArrowUp className="w-5 h-5 text-muted-foreground" />
      </button>

      <nav 
        className={cn(
          'mobile-bottom-bar md:hidden mobile-nav safe-area-bottom',
          'transition-transform duration-300 ease-out',
          'backdrop-blur-lg bg-background/95 border-t border-border/50',
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
                'mobile-nav-item flex-1 flex flex-col items-center justify-center py-2 gap-1',
                'transition-colors duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 安全区域底部占位 - 仅在导航可见时占据空间 */}
      <div className={cn(
        'h-16 md:hidden transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )} />
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
