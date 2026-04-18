/**
 * @fileoverview 百科布局
 * @description 百科页面的布局和元数据配置
 * @module app/wiki/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '玄門百科',
  description: '傳承千年道家智慧，弘揚正統玄門文化。探索符箓、法器、道教科儀等玄門知識。',
  openGraph: {
    title: '玄門百科 | 符寶網',
    description: '傳承千年道家智慧，弘揚正統玄門文化。探索符箓、法器、道教科儀等玄門知識。',
    images: ['/og-wiki.png'],
  },
  twitter: {
    title: '玄門百科 | 符寶網',
    description: '傳承千年道家智慧，弘揚正統玄門文化',
  },
};

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
