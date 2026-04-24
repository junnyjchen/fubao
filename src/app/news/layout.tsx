/**
 * @fileoverview 新闻布局
 * @description 新闻页面的布局和元数据配置
 * @module app/news/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '玄門動態',
  description: '全球玄門最新資訊、行業動態、平台活動。了解符箓法器文化最新發展。',
  openGraph: {
    title: '玄門動態 | 符寶網',
    description: '全球玄門最新資訊、行業動態、平台活動。',
    images: ['/og-news.png'],
  },
  twitter: {
    title: '玄門動態 | 符寶網',
    description: '全球玄門最新資訊、行業動態、平台活動',
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
