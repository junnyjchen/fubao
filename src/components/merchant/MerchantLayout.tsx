/**
 * @fileoverview 商户后台布局组件
 * @description 提供统一的商户后台页面布局
 * @module components/merchant/MerchantLayout
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  LogOut,
  Store,
  FileText,
  BarChart3,
  Bell,
  Loader2,
  MessageSquare,
  RotateCcw,
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
  { key: 'dashboard', label: '儀表盤', icon: LayoutDashboard, href: '/merchant/dashboard' },
  { key: 'goods', label: '商品管理', icon: Package, href: '/merchant/dashboard/goods' },
  { key: 'orders', label: '訂單管理', icon: ShoppingCart, href: '/merchant/dashboard/orders' },
  { key: 'refunds', label: '售後管理', icon: RotateCcw, href: '/merchant/dashboard/refunds' },
  { key: 'reviews', label: '評價管理', icon: MessageSquare, href: '/merchant/dashboard/reviews' },
  { key: 'finance', label: '財務對賬', icon: DollarSign, href: '/merchant/dashboard/finance' },
  { key: 'certificates', label: '證書管理', icon: FileText, href: '/merchant/dashboard/certificates' },
  { key: 'statistics', label: '數據統計', icon: BarChart3, href: '/merchant/dashboard/statistics' },
  { key: 'settings', label: '店鋪設置', icon: Settings, href: '/merchant/dashboard/settings' },
];

/** MerchantLayout 组件属性 */
interface MerchantLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

/**
 * 商户后台布局组件
 * @param props - 组件属性
 * @returns 商户后台页面布局
 */
export function MerchantLayout({ children, title, description }: MerchantLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [merchantInfo, setMerchantInfo] = useState<{
    id: number;
    name: string;
    type: number;
    status: boolean;
  } | null>(null);

  // 检查用户登录状态
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthDialog(true);
    } else if (user) {
      // 加载商户信息
      loadMerchantInfo();
    }
  }, [user, loading]);

  const loadMerchantInfo = async () => {
    try {
      // TODO: 根据用户ID获取商户信息
      // 暂时使用模拟数据
      setMerchantInfo({
        id: 1,
        name: '武當山道觀官方店',
        type: 1,
        status: true,
      });
    } catch (error) {
      console.error('加载商户信息失败:', error);
    }
  };

  /**
   * 判断菜单项是否激活
   */
  const isActive = (href: string): boolean => {
    return pathname?.startsWith(href) ?? false;
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  /**
   * 获取用户显示名称
   */
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.email?.split('@')[0] || '用戶';
  };

  /**
   * 获取商户类型标签
   */
  const getMerchantTypeLabel = (type: number) => {
    const types: Record<number, string> = {
      1: '個人商戶',
      2: '企業商戶',
      3: '認證商戶',
    };
    return types[type] || '商戶';
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
      <div className="min-h-screen bg-muted/20 flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-background border-r flex-shrink-0 hidden md:flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                符
              </div>
              <div>
                <span className="text-lg font-semibold">商戶後台</span>
                <p className="text-xs text-muted-foreground">符寶網</p>
              </div>
            </Link>
          </div>

          {/* 商户信息 */}
          {merchantInfo && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Store className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{merchantInfo.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getMerchantTypeLabel(merchantInfo.type)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 导航菜单 */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
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
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 底部操作 */}
          <div className="p-2 border-t space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Store className="w-5 h-5" />
              <span>店鋪首頁</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>退出登錄</span>
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* 顶部导航 */}
          <header className="bg-background border-b sticky top-0 z-10">
            <div className="px-4 py-3 flex items-center justify-between">
              {/* 移动端菜单按钮 */}
              <div className="md:hidden flex items-center gap-2">
                <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
                  符
                </Link>
              </div>

              {/* 标题 */}
              {(title || description) && (
                <div className="hidden md:block">
                  {title && <h1 className="text-lg font-semibold">{title}</h1>}
                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
              )}

              {/* 右侧操作 */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {user ? getUserDisplayName().charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">
                    {user ? getUserDisplayName() : '用戶'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* 页面内容 */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
