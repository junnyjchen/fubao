/**
 * @fileoverview 面包屑导航组件
 * @description 统一的面包屑导航组件，支持自动生成和自定义配置
 * @module components/ui/Breadcrumb
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  /** 显示文本 */
  label: string;
  /** 链接地址（可选，无链接则为纯文本） */
  href?: string;
  /** 图标 */
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  /** 面包屑项列表 */
  items?: BreadcrumbItem[];
  /** 是否显示首页 */
  showHome?: boolean;
  /** 首页文本 */
  homeLabel?: string;
  /** 容器类名 */
  className?: string;
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 分隔符 */
  separator?: React.ReactNode;
}

/**
 * 路径段名称映射（用于自动生成面包屑）
 */
const pathNameMap: Record<string, string> = {
  shop: '商城',
  wiki: '玄門百科',
  baike: '玄門百科',
  news: '新聞資訊',
  videos: '視頻學堂',
  user: '用戶中心',
  admin: '管理後台',
  merchant: '商戶中心',
  cart: '購物車',
  checkout: '結算',
  orders: '我的訂單',
  favorites: '我的收藏',
  addresses: '收貨地址',
  coupons: '優惠券',
  settings: '設置',
  notifications: '消息通知',
  goods: '商品管理',
  categories: '分類管理',
  certificates: '證書管理',
  finance: '財務中心',
  statistics: '數據統計',
  reviews: '評價管理',
  refunds: '退款管理',
  tickets: '工單管理',
  feedback: '意見反饋',
  announcements: '公告管理',
  banners: '輪播圖管理',
  content: '內容管理',
  withdraw: '提現管理',
  search: '搜索',
  verify: '證書驗證',
  help: '幫助中心',
  about: '關於我們',
  contact: '聯繫我們',
  terms: '服務條款',
  privacy: '隱私政策',
  vip: 'VIP會員',
  distribution: '分銷中心',
  'ai-assistant': 'AI助手',
  'free-gifts': '免費領取',
  shares: '如願分享',
  points: '積分商城',
  category: '商品分類',
  order: '訂單詳情',
  payment: '支付',
  login: '登錄',
  register: '註冊',
  new: '新建',
};

/**
 * 自动生成面包屑项
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // 跳过动态路由参数（如 [id]）
    if (segment.match(/^\[.*\]$/) || segment.match(/^\d+$/) || segment.length > 20) {
      // 如果是ID类型，显示为"详情"
      if (index === segments.length - 1) {
        items.push({ label: '詳情' });
      }
      return;
    }

    // 获取显示名称
    const label = pathNameMap[segment] || segment;
    const isLast = index === segments.length - 1;

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return items;
}

/**
 * 面包屑导航组件
 * 
 * @example
 * // 自动生成面包屑
 * <Breadcrumb />
 * 
 * @example
 * // 自定义面包屑
 * <Breadcrumb
 *   items={[
 *     { label: '商城', href: '/shop' },
 *     { label: '商品分類', href: '/shop?category=1' },
 *     { label: '商品詳情' },
 *   ]}
 * />
 */
export function Breadcrumb({
  items,
  showHome = true,
  homeLabel = '首頁',
  className,
  compact = false,
  separator = <ChevronRight className="w-4 h-4" />,
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  // 如果没有提供items，自动生成
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav
      aria-label="麵包屑導航"
      className={cn(
        'flex items-center text-sm',
        compact ? 'gap-1' : 'gap-2',
        className
      )}
    >
      {/* 首页 */}
      {showHome && (
        <>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            {!compact && <span>{homeLabel}</span>}
          </Link>
          <span className="text-muted-foreground/50">{separator}</span>
        </>
      )}

      {/* 面包屑项 */}
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1',
                  isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </span>
            )}
            {!isLast && (
              <span className="text-muted-foreground/50">{separator}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/**
 * 页面头部带面包屑的容器
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[] | boolean;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumb = true,
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4 mb-6', className)}>
      {breadcrumb && (
        <Breadcrumb items={breadcrumb === true ? undefined : breadcrumb} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export default Breadcrumb;
