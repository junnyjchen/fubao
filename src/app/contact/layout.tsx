/**
 * @fileoverview 联系我们布局
 * @description 联系我们页面的布局和元数据配置
 * @module app/contact/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '聯繫我們',
  description: '符寶網客服支持，提供訂單諮詢、售後服務、商戶合作等多種聯繫方式。工作日24小時內回覆。',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
