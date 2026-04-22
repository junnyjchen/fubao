/**
 * @fileoverview 管理后台布局
 * @description 管理后台独立布局，不包含前台导航
 * @module app/admin/layout
 */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
  Store,
  ClipboardCheck,
  Bell,
  MessageSquare,
  Menu,
  X,
  Palette,
  Image,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** 导航菜单项配置 */
interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  children?: NavItem[];
}

/** 导航菜单配置 */
const navItems: NavItem[] = [
  { key: 'dashboard', label: '控制台', icon: LayoutDashboard, href: '/admin' },
  {
    key: 'products',
    label: '商品管理',
    icon: Package,
    href: '/admin/products',
    children: [
      { key: 'products-list', label: '商品列表', icon: Package, href: '/admin/products' },
      { key: 'products-goods', label: '商品管理(舊)', icon: Package, href: '/admin/goods' },
      { key: 'categories', label: '分類管理', icon: Package, href: '/admin/categories' },
    ],
  },
  { key: 'orders', label: '訂單管理', icon: ShoppingCart, href: '/admin/orders' },
  { key: 'merchants', label: '商戶管理', icon: Store, href: '/admin/merchants' },
  { key: 'merchant-applications', label: '商戶審核', icon: ClipboardCheck, href: '/admin/merchant-applications' },
  { key: 'certificates', label: '證書管理', icon: Shield, href: '/admin/certificates' },
  { key: 'coupons', label: '優惠券管理', icon: Ticket, href: '/admin/coupons' },
  {
    key: 'content',
    label: '內容運營',
    icon: Palette,
    href: '/admin/content',
    children: [
      { key: 'content', label: '內容管理', icon: FileText, href: '/admin/content' },
      { key: 'banners', label: '輪播圖管理', icon: Image, href: '/admin/banners' },
      { key: 'announcements', label: '公告管理', icon: Bell, href: '/admin/announcements' },
      { key: 'wiki', label: '百科管理', icon: FileText, href: '/admin/wiki' },
      { key: 'videos', label: '視頻管理', icon: FileText, href: '/admin/videos' },
      { key: 'news', label: '新聞管理', icon: FileText, href: '/admin/news' },
      { key: 'ai-content', label: 'AI內容生成', icon: FileText, href: '/admin/ai-content' },
      { key: 'ai-training', label: 'AI訓練中心', icon: Brain, href: '/admin/ai-training' },
      { key: 'ai-assistant', label: 'AI助手', icon: MessageSquare, href: '/admin/ai-assistant' },
    ],
  },
  { key: 'page-builder', label: '頁面裝修', icon: Palette, href: '/admin/page-builder' },
  { key: 'tickets', label: '客服工單', icon: MessageSquare, href: '/admin/tickets' },
  { key: 'feedback', label: '反饋管理', icon: MessageSquare, href: '/admin/feedback' },
  { key: 'distribution', label: '分銷管理', icon: TrendingUp, href: '/admin/distribution' },
  { key: 'withdrawals', label: '提現審核', icon: Wallet, href: '/admin/withdrawals' },
  { key: 'users', label: '用戶管理', icon: Users, href: '/admin/users' },
  { key: 'finance', label: '財務管理', icon: Wallet, href: '/admin/finance' },
  { key: 'database', label: '數據管理', icon: Database, href: '/admin/database' },
  {
    key: 'system',
    label: '系統管理',
    icon: Settings,
    href: '/admin/settings',
    children: [
      { key: 'settings', label: '系統設置', icon: Settings, href: '/admin/settings' },
      { key: 'roles', label: '角色管理', icon: Shield, href: '/admin/roles' },
      { key: 'admins', label: '管理員管理', icon: Users, href: '/admin/admins' },
    ],
  },
];

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ id: number; username: string; role: string; name?: string; email?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取管理员信息
  useEffect(() => {
    // 跳过登录页面
    if (pathname === '/admin/login') return;
    if (!mounted) return;

    const fetchAdminInfo = async () => {
      try {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('admin_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch('/api/admin/me', { headers });
        const data = await res.json();
        
        if (data.admin) {
          setAdminInfo(data.admin);
          // 保存 token
          if (data.token) {
            localStorage.setItem('admin_token', data.token);
          }
        } else {
          // 未登录，清除 token 并跳转
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('獲取管理員信息失敗:', error);
        localStorage.removeItem('admin_token');
      }
    };

    fetchAdminInfo();
  }, [pathname, mounted, router]);

  // 登出
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch (error) {
      console.error('退出登錄請求失敗:', error);
    } finally {
      localStorage.removeItem('admin_token');
      toast.success('已退出登錄');
      router.push('/admin/login');
    }
  };

  // 判断菜单项是否激活
  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href) ?? false;
  };

  // 切换展开状态
  const toggleExpand = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  // 渲染导航项
  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.key);

    return (
      <div key={item.key}>
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
            level > 0 && 'ml-6 text-sm py-2',
            active && !hasChildren
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpand(item.key);
            } else {
              setMobileMenuOpen(false);
            }
          }}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && (
            <>
              <span className="flex-1">{item.label}</span>
              {hasChildren && (
                <span className="text-muted-foreground">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              )}
            </>
          )}
        </Link>
        {hasChildren && isExpanded && sidebarOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* 桌面端侧边栏 */}
      <aside
        className={cn(
          'bg-background border-r flex-shrink-0 hidden md:flex md:flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
            符
          </div>
          {sidebarOpen && (
            <span className="font-semibold truncate">符寶網後台</span>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* 折叠按钮 */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">收起</span>}
          </Button>
        </div>
      </aside>

      {/* 移动端侧边栏 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-background border-r">
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  符
                </div>
                <span className="font-semibold">符寶網後台</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
              {navItems.map((item) => renderNavItem(item))}
            </nav>
          </aside>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 顶部栏 */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* 快捷入口 */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  訪問前台
                </Button>
              </Link>
              <Link href="/admin/page-builder">
                <Button variant="outline" size="sm">
                  <Palette className="w-4 h-4 mr-2" />
                  頁面裝修
                </Button>
              </Link>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span>{adminInfo?.username || '管理員'}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {adminInfo?.role === 'super_admin' ? '超級管理員' : '管理員'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    系統設置
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut className="w-4 h-4 mr-2" />
                    返回前台
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登錄
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
