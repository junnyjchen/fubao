/**
 * @fileoverview 商城布局
 * @description 商城页面的布局和元数据配置
 * @module app/shop/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '寶品商城',
  description: '探索精選符箓、法器等玄門文化產品。正品保障、平台擔保、全球配送。一物一證，溯源可查。',
  openGraph: {
    title: '寶品商城 | 符寶網',
    description: '探索精選符箓、法器等玄門文化產品。正品保障、平台擔保、全球配送。',
    images: ['/og-shop.png'],
  },
  twitter: {
    title: '寶品商城 | 符寶網',
    description: '探索精選符箓、法器等玄門文化產品',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
