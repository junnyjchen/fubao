/**
 * @fileoverview 面包屑导航组件
 * @description 网站面包屑导航，支持SEO结构化数据
 * @module components/ui/Breadcrumb
 */

'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

export function Breadcrumb({
  items,
  className,
  showHome = true,
  separator = <ChevronRight className="w-4 h-4" />,
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: '首頁', href: '/', icon: <Home className="w-4 h-4" /> }, ...items]
    : items;

  // 生成结构化数据
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href
        ? item.href.startsWith('http')
          ? item.href
          : `https://fubao.ltd${item.href}`
        : undefined,
    })),
  };

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 面包屑导航 */}
      <nav
        aria-label="麵包屑導航"
        className={cn('flex items-center text-sm text-muted-foreground', className)}
      >
        <ol className="flex items-center flex-wrap gap-1">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={index} className="flex items-center">
                {/* 分隔符 */}
                {!isFirst && (
                  <span className="mx-1.5 text-muted-foreground/50">
                    {separator}
                  </span>
                )}

                {/* 链接或文本 */}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 hover:text-foreground transition-colors',
                      isFirst && 'text-muted-foreground hover:text-primary'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'flex items-center gap-1',
                      isLast ? 'text-foreground font-medium' : ''
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

// 简化版面包屑
export function BreadcrumbSimple({
  items,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  return (
    <Breadcrumb
      items={items}
      className={className}
      separator={<ChevronRight className="w-3 h-3" />}
    />
  );
}

// 商品面包屑
export function BreadcrumbGoods({
  categoryName,
  categorySlug,
  goodsName,
}: {
  categoryName: string;
  categorySlug: string;
  goodsName: string;
}) {
  return (
    <Breadcrumb
      items={[
        { label: '商品中心', href: '/shop' },
        { label: categoryName, href: `/shop?category=${categorySlug}` },
        { label: goodsName },
      ]}
    />
  );
}

// 文章面包屑
export function BreadcrumbArticle({
  categoryName,
  categorySlug,
  articleTitle,
}: {
  categoryName: string;
  categorySlug: string;
  articleTitle: string;
}) {
  return (
    <Breadcrumb
      items={[
        { label: '玄門百科', href: '/wiki' },
        { label: categoryName, href: `/wiki?category=${categorySlug}` },
        { label: articleTitle },
      ]}
    />
  );
}

// 用户中心面包屑
export function BreadcrumbUser({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <Breadcrumb
      items={[{ label: '用戶中心', href: '/user' }, ...items]}
      showHome={true}
    />
  );
}

// 管理后台面包屑
export function BreadcrumbAdmin({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <Breadcrumb
      items={[{ label: '管理後台', href: '/admin' }, ...items]}
      showHome={true}
    />
  );
}
