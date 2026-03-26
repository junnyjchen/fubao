/**
 * @fileoverview 用户中心布局组件
 * @description 提供统一的用户中心页面布局
 * @module components/user/UserLayout
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { SigninDialog } from '@/components/signin/SigninDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Heart,
  MapPin,
  Package,
  Settings,
  LogOut,
  Loader2,
  Star,
  Ticket,
  Bell,
  Award,
  RotateCcw,
  Clock,
  MessageSquare,
  Calendar,
  Gift,
  Flame,
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
  { key: 'free-gifts', label: '免費領取', icon: Gift, href: '/user/free-gifts' },
  { key: 'favorites', label: '我的收藏', icon: Heart, href: '/user/favorites' },
  { key: 'history', label: '瀏覽歷史', icon: Clock, href: '/user/history' },
  { key: 'reviews', label: '我的評價', icon: Star, href: '/user/reviews' },
  { key: 'coupons', label: '我的優惠券', icon: Ticket, href: '/user/coupons' },
  { key: 'points', label: '我的積分', icon: Award, href: '/user/points' },
  { key: 'refunds', label: '售後服務', icon: RotateCcw, href: '/user/refunds' },
  { key: 'tickets', label: '客服工單', icon: MessageSquare, href: '/user/tickets' },
  { key: 'notifications', label: '消息通知', icon: Bell, href: '/user/notifications' },
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
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSigninDialog, setShowSigninDialog] = useState(false);
  const [signinDays, setSigninDays] = useState(0);

  // 检查用户登录状态
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthDialog(true);
    }
  }, [user, loading]);

  // 获取签到信息
  useEffect(() => {
    if (user) {
      fetchSigninInfo();
    }
  }, [user]);

  const fetchSigninInfo = async () => {
    try {
      const res = await fetch('/api/user/signin');
      const data = await res.json();
      if (data.continuousDays !== undefined) {
        setSigninDays(data.continuousDays);
      }
    } catch (error) {
      console.error('获取签到信息失败:', error);
    }
  };

  /**
   * 判断菜单项是否激活
   * @param href - 菜单链接
   * @returns 是否激活
   */
  const isActive = (href: string): boolean => {
    return pathname?.startsWith(href) ?? false;
  };

  /**
   * 获取用户显示名称
   */
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.email?.split('@')[0] || '用戶';
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-muted/20">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 bg-primary-foreground/20">
                  <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-lg">
                    {user ? getUserDisplayName().charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold">
                    {user ? getUserDisplayName() : '用戶中心'}
                  </h1>
                  <p className="text-sm text-primary-foreground/80">
                    {user ? '歡迎回來，善信' : '請先登錄'}
                  </p>
                </div>
              </div>
              
              {/* 签到按钮 */}
              {user && (
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setShowSigninDialog(true)}
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>簽到</span>
                  {signinDays > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-700">
                      {signinDays}天
                    </Badge>
                  )}
                </Button>
              )}
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
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>退出登錄</span>
                </button>
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

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      
      {/* Signin Dialog */}
      <SigninDialog open={showSigninDialog} onOpenChange={setShowSigninDialog} />
    </>
  );
}
