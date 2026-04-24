/**
 * @fileoverview 关于我们布局
 * @description 关于我们页面的布局和元数据配置
 * @module app/about/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '關於我們',
  description: '符寶網是全球玄門文化科普交易平台，以「科普先行、交易放心、一物一證」為核心理念，為修行者提供專業服務。',
  openGraph: {
    title: '關於我們 | 符寶網',
    description: '符寶網是全球玄門文化科普交易平台，為修行者提供專業服務。',
    images: ['/og-about.png'],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
